// A book's short name, for the homepage chips and the chapter's running head ("Moon · Chapter 3", the C boards).
// Pure: imported by Convex functions and by the app. Copy (agent).
export const CHIP: Record<string, string> = {
  "Hold a room for 10 minutes": "Public speaking",
  "Build a system that lands your next job": "Finding a job",
  "Ask for a raise and get it": "Asking for a raise",
  "Speak English without translating in your head": "Speaking English",
  "Tell a good IPO from hype": "How IPOs work",
  "Start the thing you keep putting off": "Putting things off",
  "Spot what India's past multibaggers had in common": "Multibagger stocks",
  "Why 9 in 10 F&O traders lose money": "F&O trading",
  "Make ChatGPT and Claude do your boring work": "AI for boring work",
  "Make your credit card pay you back": "Credit card points",
  "Plan to buy your next car": "Buying a car",
};

// A listed name, else the topic itself when short, else its first words up to 22 characters (26 when it is the whole name) (never ending on a small
// word like "for" or "the").
const SMALL = new Set(["a", "an", "the", "for", "of", "to", "in", "on", "and", "or", "with", "your", "my", "how", "why", "what"]);
export function shortName(topic: string): string {
  const t = topic.trim();
  if (CHIP[t]) return CHIP[t];
  if (t.length <= 26) return t;
  const words = t.split(/\s+/);
  const out: string[] = [];
  for (const w of words) { if ([...out, w].join(" ").length > 22) break; out.push(w); }
  while (out.length > 1 && SMALL.has(out[out.length - 1].toLowerCase().replace(/[^a-z]/g, ""))) out.pop();
  return out.length ? out.join(" ").replace(/[,:;·-]+$/, "") : t.slice(0, 22);
}

// The chapter's running head has room for about 18 characters before " · Chapter 3" (390 px phone, with Ask and the page
// number beside it). Ready books get a hand-picked name; a typed topic drops a leading "Why the" or "How" and keeps its
// first words. Copy (agent).
const HEAD: Record<string, string> = {
  "Ask for a raise and get it": "A raise",
  "Avengers story before Doomsday": "Avengers",
  "Build a system that lands your next job": "Your next job",
  "Building a competitor-tracking agent": "Competitor agent",
  "Calm your child's meltdown without losing yours": "Meltdowns",
  "Choreographing your own dance Reel": "Your dance Reel",
  "Field hockey and India's legacy": "Field hockey",
  "Get your child reading for fun": "Reading for fun",
  "Hold a room for 10 minutes": "Public speaking",
  "Homer's Iliad and Odyssey": "Iliad and Odyssey",
  "How foldable phones work": "Foldable phones",
  "Indian stock market basics": "Indian stocks",
  "Investing in US stocks from India": "US stocks",
  "Know before you go: a Europe trip on a Schengen visa": "Europe trip",
  "Know before you go: the USA": "The USA",
  "Make ChatGPT and Claude do your boring work": "AI for boring work",
  "Make your credit card pay you back": "Credit card points",
  "Phone screens and chips": "Screens and chips",
  "Plan to buy your next car": "Your next car",
  "Reading a balance sheet": "Balance sheets",
  "Smartphone batteries and fast charging": "Phone batteries",
  "Speak English without translating in your head": "Speaking English",
  "Spot what India's past multibaggers had in common": "Multibaggers",
  "Start the thing you keep putting off": "Putting things off",
  "Taste coffee like a barista": "Tasting coffee",
  "Teach your child money with their pocket money": "Pocket money",
  "Tell a good IPO from hype": "IPOs",
  "The Asian Games and India": "Asian Games",
  "The Drishyam film franchise": "Drishyam",
  "Understand Formula 1 in a week": "Formula 1",
  "Vibe coding with Claude Code": "Vibe coding",
  "Why 9 in 10 F&O traders lose money": "F&O trading",
  "World War II, 1939 to 1945": "World War II",
  "Wrestling scoring and India's champions": "Wrestling",
  "n8n workflow automation": "n8n",
};
export function runningHead(topic: string): string {
  const t = topic.trim();
  if (HEAD[t]) return HEAD[t];
  const trip = /^know before you go:\s*(.+)$/i.exec(t);
  if (trip && trip[1].length <= 18) return trip[1];
  if (t.length <= 18) return t;
  const words = t.replace(/^(why|how|what|when|where)\s+(?:(?:do|does|did|is|are|the|a|an)\s+)?/i, "").replace(/^(the|a|an)\s+/i, "").split(/\s+/);
  const out: string[] = [];
  for (const w of words) { if ([...out, w].join(" ").length > 18) break; out.push(w); }
  while (out.length > 1 && (SMALL.has(out[out.length - 1].toLowerCase().replace(/[^a-z]/g, "")) || /^(like|small|big|own)$/i.test(out[out.length - 1]))) out.pop();
  const s = out.join(" ").replace(/[,:;·-]+$/, "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : t.slice(0, 18);
}
