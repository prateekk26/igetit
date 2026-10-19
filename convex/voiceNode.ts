"use node";
import { v } from "convex/values";
import { createHash } from "node:crypto";
import { Mp3Encoder } from "@breezystack/lamejs";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { VOICE, VOICE_VERSION } from "./voice";

const TTS = "gemini-3.8-flash-tts";
// 19 Oct (D140, Prateek: "go with option 1"): Flash-Lite speech for plain words, a third cheaper ($6 against $9 a million
// audio tokens) and quicker (5 to 7 s against 8 to 16 s a page on dev). On a page of code lines it skipped 30 of 93 words in
// 1 of 2 runs, so a part with code (backticks or braces) keeps the full model, and never falls back to Lite. Lite has its
// own 100 a day, so a plain part that Lite can't make tries the full model. Clips already made are reused as before.
const TTS_LITE = "gemini-3.8-flash-lite-tts";
const hasCode = (t: string) => /[`{}]/.test(t);
// How it should sound (agent): warm, alive, never a newsreader. The speech model reads any instruction in the text out
// loud (a 2 s line came back as 23 s with a sentence of direction, 15 Oct) and refuses a system instruction, so the tone
// is one bracketed tag before each part, which it follows without speaking: a question curious, a headline warm with
// emphasis, an exclamation delighted, the rest warm and expressive.
function tagged(text: string) {
  const t = text.trim()
  const tag = /\?$/.test(t) ? "curious, inviting" : /!$/.test(t) ? "delighted" : t.split(/\s+/).length <= 9 && !/[.]$/.test(t) ? "warmly, with emphasis" : "warm, expressive, like a favourite teacher";
  return `[${tag}] ${t}`;
}

// Gemini now sends a whole WAV file (mimeType audio/wav), not bare samples: a 44-byte header, the speech, then about
// 6 KB of Google's signed "made by AI" label (C2PA). Fed in whole, the header played as a tick at the start and the
// label as static at the end (15 Oct). Keep only the "data" chunk; bare samples (audio/L16) pass through as before.
function speech(buf: Buffer, mime: string): { pcm: Buffer; rate: number } {
  let rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") return { pcm: buf, rate };
  for (let at = 12; at + 8 <= buf.length; ) {
    const id = buf.toString("ascii", at, at + 4), size = buf.readUInt32LE(at + 4), body = at + 8;
    if (id === "fmt ") rate = buf.readUInt32LE(body + 4);
    if (id === "data") { const d = buf.subarray(body, Math.min(body + size, buf.length)); return { pcm: d.byteOffset % 2 ? Buffer.from(d) : d, rate }; }
    at = body + size + (size % 2);
  }
  return { pcm: Buffer.alloc(0), rate };
}

// One page read aloud: the cached file if this exact text was spoken before, else Gemini speech, encoded to a small MP3
// (48 kbps mono) and stored. Returns its URL and length.
export const page = action({
  args: { handbookId: v.id("handbooks"), chapter: v.number(), parts: v.array(v.string()), deviceToken: v.optional(v.string()), preload: v.optional(v.boolean()) },
  handler: async (ctx, { handbookId, chapter, parts, deviceToken, preload }): Promise<{ ok: true; url: string; ms: number } | { ok: false; code: string }> => {
    const clean = parts.map((p) => p.replace(/\*\*|\*/g, "").trim()).filter(Boolean).slice(0, 8);
    const text = clean.join("\n\n").slice(0, 2400);
    if (!text) return { ok: false, code: "empty" };
    const key = createHash("sha256").update(`${VOICE_VERSION}|${VOICE}|${text}`).digest("hex");
    const hit = await ctx.runQuery(internal.voice.cached, { key });
    if (hit?.url) return { ok: true, url: hit.url, ms: hit.ms };
    const g = await ctx.runMutation(internal.voice.gate, { handbookId, chapter, parts: clean, deviceToken, preload });
    if (!g.ok) return g;
    const started = Date.now();
    const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_BACKUP].filter(Boolean) as string[];
    let body: any = null, err = "no Gemini key", model = TTS;
    for (const m of clean.some(hasCode) ? [TTS] : [TTS_LITE, TTS]) for (const k of keys) {
      if (body) break;
      model = m;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: "POST", signal: AbortSignal.timeout(90000), headers: { "Content-Type": "application/json", "x-goog-api-key": k },
        body: JSON.stringify({ contents: [{ parts: [{ text: clean.map(tagged).join("\n\n") }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } }),
      }).catch((e: any) => ({ ok: false, status: 0, json: async () => ({ error: String(e?.message ?? e) }) }) as any);
      const j = await res.json().catch(() => ({}));
      if (res.ok && j?.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData?.data)) { body = j; break; }
      err = `Gemini speech ${m} ${res.status}: ${JSON.stringify(j).slice(0, 200)}`;
    }
    const part = body?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (!part) {
      await ctx.runMutation(internal.handbooks.logAiCall, { kind: "voice", model, input: text.slice(0, 2000), output: "", ms: Date.now() - started, ok: false, error: err.slice(0, 500) });
      return { ok: false, code: "failed" };
    }
    const { pcm, rate } = speech(Buffer.from(part.inlineData.data, "base64"), part.inlineData.mimeType ?? "");
    const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
    const enc = new Mp3Encoder(1, rate, 48);
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < samples.length; i += 1152) { const b = enc.encodeBuffer(samples.subarray(i, i + 1152)); if (b.length) chunks.push(new Uint8Array(b)); }
    const end = enc.flush(); if (end.length) chunks.push(new Uint8Array(end));
    const ms = Math.round((samples.length / rate) * 1000);
    const storageId = await ctx.storage.store(new Blob(chunks as BlobPart[], { type: "audio/mpeg" }));
    await ctx.runMutation(internal.voice.save, { key, storageId, ms, chars: text.length });
    const u = body.usageMetadata ?? {};
    await ctx.runMutation(internal.handbooks.logAiCall, { kind: "voice", model, input: text.slice(0, 2000), output: `[${ms} ms of audio]`, tokensIn: u.promptTokenCount, tokensOut: u.candidatesTokenCount, ms: Date.now() - started, ok: true, handbookId, chapter });
    const again = await ctx.runQuery(internal.voice.cached, { key });
    return again?.url ? { ok: true, url: again.url, ms: again.ms } : { ok: false, code: "failed" };
  },
});
