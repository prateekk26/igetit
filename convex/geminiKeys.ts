// The Gemini keys to try, in order, skipping one Google refused in the last 10 minutes (17 Oct). A refused key is one
// out of credit (402) or whose project Google denied (403): from 12 to 16 Oct the main key was refused and every call
// asked it first, then fell to the backup. Kept in this process's memory only; a fresh process tries every key once
// more, which costs one fast refusal.
const REFUSED_FOR = 10 * 60 * 1000;
const refusedAt = new Map<string, number>();

export function geminiKeys(): string[] {
  const all = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_BACKUP].filter(Boolean) as string[];
  const live = all.filter((k) => Date.now() - (refusedAt.get(k) ?? 0) >= REFUSED_FOR);
  return live.length ? live : all;   // every key refused lately: try them anyway, Google may have lifted it
}

export function noteRefused(key: string, status: number) {
  if (status === 402 || status === 403) refusedAt.set(key, Date.now());
}
