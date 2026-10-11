// Free eleven, no. 9 (docs/free-ten.md): "Make ChatGPT and Claude do your boring work", planned by hand in the shape
// of HOLD_A_ROOM (convex/showcasePlans.ts): one running example person, one step a day, then "Your turn".
// Every title and line here is (agent) copy until Prateek rewrites it.
// Teaches safe, everyday workflows that hold in any assistant: a three-part prompt, checking the answer, and what never
// to paste. Names ChatGPT and Claude only generally; no buttons, menus, plans or model versions, since those change.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example. An invented person at an invented company, so her hours and her thread are an example, never a
// measured result. Her facts stay fixed so the seven chapters read as one person's week getting lighter.
const SNEHA = "Sneha, 28, a sales coordinator at a biscuit and snacks distributor in Ahmedabad (an invented example person)";
const FACTS = `Her fixed facts, the same in every chapter (an invented person: her hours and every number are an example, never a measured result): she coordinates orders between 40 retail shops, the company's warehouse and her manager, Mr Desai. Three tasks eat about 6 hours of her week: (1) catching up on long email threads, like the 38-email thread about a delayed Diwali stock shipment; (2) the Friday status update to Mr Desai, written from notes scattered across WhatsApp, a notebook and her inbox; (3) cleaning the weekly orders sheet, where shops type the same product five ways ("Glucose bisc 100g", "glucose biscuit 100 gm", "GLUCOSE 100G"). Once a month she also prepares for the sales review with Mr Desai. Her company's policy allows the AI assistant it approves for internal text, and forbids pasting customer details, prices or margins into any chat tool. Before she pastes anything she swaps shop names, people's names, phone numbers and prices for placeholders ("Shop A", "Person 1", "₹X").`;
const STEP = `Show this chapter's step done on the running example: ${SNEHA}. ${FACTS} Show her prompt and what came back, before and after this chapter's step, short enough for a phone card and consistent with earlier chapters. Her prompts and answers are written for the example with placeholders in place of names and prices, never presented as a real tool's exact output.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps or drags and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): the same step on one of the reader's own boring tasks, using text with nothing confidential in it (or with names and numbers swapped for placeholders), within their employer's rules, in under 2 minutes. Optional: say so.`;
const CARE = `Name the tools generally ("ChatGPT, Claude, or the assistant your company approves"); never name a button, menu, plan, model version or feature, since those change, and never say one tool is better. Never promise the AI is always right or that it saves a set number of hours; every answer is a draft the reader checks and owns. Wherever pasting comes up, the rule is the employer's AI policy first. Indian office settings: Indian names, rupees, Indian English as people really write it at work.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, CARE, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH = ["picture", "teach", "example", "exercise", "try", "breath"];
const TEACH_TRY = ["picture", "teach", "tryit", "example", "exercise", "try", "breath"];
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];

export const PLAN = {
  topic: "Make ChatGPT and Claude do your boring work",
  mode: "skill",
  body: false,
  format: "course",
  caution: "none",
  goal: "Use ChatGPT or Claude to do the boring parts of my office work safely: long email threads, replies, status updates, messy spreadsheet text and meeting prep",
  outcome7: "By day 7 you'll have five saved prompts that do your boring weekly work (thread summaries, replies in your tone, status updates, messy spreadsheet text, meeting prep), and you'll know what to check and what never to paste.",
  picture: null,
  pictureWhyNot: "a running example (Sneha's boring week: the long thread, the Friday update, the messy orders sheet) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${SNEHA}. Each chapter teaches one step, shows it done on her real-feeling work (with placeholders, never real data), then hands the reader "Your turn" on one of their own tasks. Value comes early: in chapter 1 the reader taps which of three prompts gets a useful answer, sees why, and leaves with a thread-summary prompt to use tomorrow. Each chapter is under 5 minutes.`,
  sources: [
    { who: "OpenAI", what: "Prompt engineering guide (OpenAI's documentation)", why: "give clear instructions, the context, the steps and the format you want back" },
    { who: "Anthropic", what: "Prompt engineering overview (Claude's documentation)", why: "be clear and direct, and show examples of the output you want" },
    { who: "Anthropic", what: "Reduce hallucinations (Claude's documentation)", why: "asking for quotes from the source and letting the model say it doesn't know" },
  ],
  next: ["Make Excel do your work", "Write emails people answer", "Run a meeting people don't dread"],
  chapters: [
    day({ title: "38 emails, 5 lines", readMinutes: 2, covers: "The one change that turns a vague AI answer into a useful one: say who you are, what you need back, and what shape it should take.", outcome: "You can get a 5-line summary of a long email thread: what was decided, what's still open, and who owes what by when.",
      hook: "Same email thread, same AI, three prompts. Only one answer was worth forwarding.",
      needs: [
        "The aha by card 3, through the Try it card (card 3, type \"tryit\"): three prompts for Sneha's 38-email shipment thread: \"Summarise this\"; \"Summarise this for my manager\"; and one with context, task and format (\"I coordinate orders for a snacks distributor. This thread is about a delayed shipment. List what was decided, what is still open, and who owes what by when, in 5 bullets under 15 words each.\"). The reader taps the one they think gets the useful answer; the page then shows all three answers side by side (the first long and vague, the second shorter but still vague, the third 5 lines she can act on). Cards 1 and 2 set up the question without answering it.",
        "Card 2 names the three parts, one line each: context (who you are and what this text is), task (exactly what you want back), format (the shape: bullets, length, headings). Say once that this works the same in ChatGPT, Claude or the assistant your company approves.",
        "The example card: her actual prompt and the 5 lines that came back, with names and prices already swapped for placeholders (\"Shop A\", \"Person 1\"; chapter 2 says why), and the one date she checked against the thread before forwarding it to Mr Desai.",
        "Close the In one breath card with an optional one-line \"Your turn\": try the three-part prompt on one long thread tomorrow, one with nothing confidential in it or with names swapped for placeholders, within your company's rules. The Next: line points to what never goes in the chat box.",
      ],
      blocks: ["picture", "teach", "tryit", "example", "breath"], proof: "retell" }, { turn: false }),
    day({ title: "What never goes in the box", covers: "What's safe to paste, what never is (personal details, passwords, confidential numbers), and the placeholder habit that lets you use AI on real work.", outcome: "You can tell in 10 seconds whether text is safe to paste, and make it safe with placeholders.",
      hook: "Sneha almost pasted 40 shop owners' phone numbers into a chat box. Now she checks first.",
      needs: [
        "Never paste: customers' or colleagues' personal details (names with phone numbers, addresses, ID numbers like Aadhaar or PAN), passwords and login codes, confidential numbers (prices, margins, salaries, results not yet announced), anything under a confidentiality agreement. Why, plainly: what you paste leaves your company's systems and is handled under the tool's own terms, which can change; your employer's policy decides what's allowed, so follow it, and use the tool your company approves if it has one.",
        "The placeholder habit: swap names, numbers and anything that identifies a person or a deal for \"Shop A\", \"Person 1\", \"₹X\" before pasting, then put the real ones back in the answer yourself. Show Sneha's thread before and after the swap.",
        "The 10-second check, three questions: would I be fine if this text were read outside my company? Does my company's policy allow it? What here can I swap for a placeholder?",
        "India's Digital Personal Data Protection Act, 2023 is one reason employers set these rules: mention it in one line only if the research brief confirms it, and give no legal advice.",
      ],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Replies that sound like you", covers: "Draft a reply in your own tone: give it the facts you decided, a sample of how you write, and ask for two versions.", outcome: "You can get a reply draft that sounds like you, needs one quick edit, and says nothing you didn't decide.",
      hook: "AI emails sound like AI when nobody shows it how you write.",
      needs: [
        "Context, task and format again, plus a fourth piece: a sample of your own writing (two short emails you sent before, with placeholders) so it copies your tone, explained in the same sentence as how formal, how long and how warm you sound.",
        "Sneha's case: Shop A's owner asks, annoyed, when the delayed Diwali stock will arrive. She gives the facts she decided (the new delivery date, and one free carton as an apology that Mr Desai approved), two of her old replies as the sample, and asks for two versions under 80 words. Show the bland first draft and the one that sounds like her.",
        "She decides the facts; the AI only words them. A draft must never add a promise, a discount or a date she didn't give it (chapter 4 shows how to catch one). A reply in Hindi or Gujarati works the same way when asked for.",
      ],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Check it before you send it", covers: "Why AI sometimes states made-up things with full confidence, and a 1-minute check for numbers, names, dates and promises.", outcome: "You can check an AI draft against its source in a minute and catch the lines that don't match.",
      hook: "The AI wrote a perfect reply. It also offered a discount nobody had agreed to.",
      needs: [
        "Why it happens, in plain words: these assistants write the most likely-sounding next words; when a fact is missing they can fill the gap with something plausible and untrue (people call this a hallucination). It reads just as confident as the true parts.",
        "The Try it card (card 3): an AI-drafted reply to Shop A sits beside Sneha's notes from the thread; the reader taps each line they think doesn't match (a delivery date one day off, a 10% discount nobody agreed, Person 2's name where Person 1's belongs), and the page reveals the three slips and the line each should have come from.",
        "The 1-minute check: every number, name, date and promise against the source; ask the AI to quote the exact line from the thread behind each claim; ask it to list anything it was unsure of. You send it, so you own it.",
        "The scenario exercise: a new short draft with one slip, asking which line to check first.",
      ],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Friday update in 2 minutes", covers: "Turn scattered notes into the status update a manager actually reads: done, next, and what you need from them.", outcome: "You can turn a page of rough notes into a clear 5-line status update.",
      hook: "Sneha's Friday update took 45 minutes. Her notes were never the slow part.",
      needs: [
        "The format does the work: tell it the shape your manager reads (Done, Next, Need from you; the most important line first; under 80 words) and paste the notes as they are, typos and all.",
        "Sneha's case: her Friday notes from WhatsApp, a notebook and her inbox (with placeholders), the prompt, the update. The instruction that matters most: \"Use only what's in my notes. If something is unclear, ask me instead of guessing.\"",
        "The mistake card: an update padded with \"We are pleased to inform you\" and one piece of progress she never noted, caught with the chapter 4 check.",
      ],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Clean a messy column", covers: "Make AI tidy messy spreadsheet text, like product names typed five ways, without losing or changing a row.", outcome: "You can get a messy text column cleaned into one format and check that no row was lost or changed.",
      hook: "Shops typed the same biscuit five different ways. Her weekly totals didn't add up.",
      needs: [
        "The prompt: a rule list (one standard name per product, in an exact format such as \"Glucose Biscuit 100g\") plus one row done by hand as an example, and the answer as a two-column table, original beside cleaned, in the same order, so it can be checked and pasted back.",
        "The Try it card (card 3): a messy column of 8 product names; the reader taps between three instructions (\"clean this\"; a rule list; a rule list with one example row) and watches the cleaned column change; only the third keeps all 8 rows, each in one format.",
        "Checking: count rows in and rows out; scan the table for any name turned into a different product; for thousands of rows, ask for a spreadsheet formula or the steps instead of pasting the sheet. Paste only the product column, never customer or price columns.",
      ],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Walk in prepared, keep the kit", covers: "Prepare for a meeting in 10 minutes, then save your five prompts as a kit for every boring week.", outcome: "You can prepare for a meeting with AI in 10 minutes and reuse a saved kit of prompts for your weekly tasks.",
      hook: "Mr Desai asks the same kinds of questions every month. Sneha now sees them coming.",
      needs: [
        "Meeting prep: give it the agenda and her notes (with placeholders); ask for the 5 questions her manager is most likely to ask, a one-line answer to each from her notes, and a list of what she still has to look up. The AI suggests; she checks every answer against her own numbers (chapter 4).",
        "The kit: her five prompts (summarise a thread, reply in her tone, Friday update, clean a column, meeting prep), saved in a notes file, each with blanks for the context. Show the kit on one short card.",
        "A checklist (doit, kind checklist): saved my thread-summary prompt; saved my reply prompt with two of my own emails as the sample; saved my status-update prompt; saved my clean-a-column prompt; saved my meeting-prep prompt; read my company's AI policy.",
        "This is the last chapter: the In one breath card ends with what the reader can now do and one next step (pick the most boring task left in your week and write its prompt), with no Next: line.",
      ],
      blocks: ["picture", "teach", "example", "doit", "breath"], proof: "set" }, { turn: false }),
  ],
};
