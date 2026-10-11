// Free-ten handbook "Speak English without translating in your head" (docs/free-ten.md, pick 4), planned by hand in
// the shape of HOLD_A_ROOM (convex/showcasePlans.ts): one running example the reader follows, a step a chapter, then
// "Your turn". Every title and line here is (agent) copy until Prateek rewrites it.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example every chapter shows done. An invented person, so everything about her is an example, never a
// measured result.
const POOJA = "Pooja, 23, a junior accountant at a textile exporter in Surat, whose first language is Gujarati";
// Her facts stay the same in every chapter, so the example reads as one person's English growing, not seven people.
const POOJA_FACTS = `Her fixed facts, the same in every chapter: she studied in Gujarati medium until class 12, then did her B.Com in English; she reads and writes English emails easily, but when she speaks she builds the sentence in Gujarati first and translates it, so she stops mid-sentence; every Monday her company has a video call with its buyer's team in the UK, and her manager gives the 2-minute payment update because Pooja freezes; her goal is to give that update herself; she practises for 10 minutes on her terrace after dinner and thinks in English on her 20-minute bus ride home. Her five chunks (from chapter 1): "Quick update on payments", "We've received...", "...is still pending", "Could you confirm...?", "I'll check and get back to you". Never show her using a step before the chapter that teaches it. Show her Gujarati thoughts as a word-by-word English gloss in quotes, never in Gujarati or Hindi script. Where it fits, say once that the same happens from Hindi, Tamil, Bengali or any first language.`;
const STEP = `Show this chapter's step done on the running example: ${POOJA}. ${POOJA_FACTS} Show what she said before and after this step, in her words, consistent with what earlier chapters showed.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): the same step for a conversation the reader will really have this week (work, college, family, a call they usually avoid), done out loud in under 2 minutes. Optional: say so.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];
const GIVE_IT = ["picture", "teach", "example", "doit", "teach", "breath"];

export const PLAN = {
  topic: "Speak English without translating in your head",
  mode: "skill",
  body: false,
  format: "course",
  caution: "none",
  goal: "Speak English without translating in my head: say what I mean in ready-made phrases, practise alone on my phone, and have my first real conversations",
  outcome7: "By day 7 you'll have a 10-minute speaking routine you can do alone every day, and you'll have had a real 2-minute conversation in English, built from phrases instead of translation.",
  picture: null,
  pictureWhyNot: "a running example (Pooja getting ready to give her Monday payment update in English) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${POOJA}. Each chapter teaches one drill that works alone on a phone, shows Pooja doing it, then hands the reader "Your turn". Value comes in chapter 1: the reader says five English phrases out loud for a conversation they'll have this week. Each chapter is under 5 minutes. Honest about pace: 7 days build the habit and the first real conversation; fluency grows over months of the daily 10 minutes.`,
  sources: [
    { who: "Alison Wray", what: "Formulaic Language and the Lexicon (2002)", why: "fluent speakers store and say many phrases whole instead of building them word by word" },
    { who: "I. S. P. Nation and Jonathan Newton", what: "Teaching ESL/EFL Listening and Speaking (2009)", why: "fluency practice by repeating the same talk in less time (the 4/3/2 activity)" },
    { who: "Shuhei Kadota", what: "Shadowing as a Practice in Second Language Acquisition (2019)", why: "speaking along with a recording to build listening and smoother speech" },
  ],
  next: ["Speak up in meetings", "Small talk that doesn't fizzle out", "Hold a room for 10 minutes"],
  chapters: [
    day({ title: "Speak in chunks, not words", readMinutes: 3, covers: "Fluent speakers say ready-made groups of words, not one word at a time. Start with five for this week.", outcome: "You can say five ready-made English phrases out loud for a conversation you'll have this week.",
      hook: "Fluent speakers aren't faster at translating. For most of a sentence, they aren't translating at all.",
      needs: ["The aha by card 3, through the Try it card (card 3, type \"tryit\"): one thought Pooja wants to say on her Monday call (a payment is still pending and she'll find out why). On the page the reader taps \"Word by word\" and watches the sentence built one translated word at a time, with a counter going up for every choice she has to make; then taps \"In chunks\" and the same thought comes out as two ready-made phrases (\"...is still pending\", \"I'll check and get back to you\") with far fewer choices. The counter is an illustration, not a measurement. Cards 1 and 2 name the problem (the pause while you translate) without giving the fix.",
        "Teach the idea plainly: a chunk is a group of words that fluent speakers store and say as one piece (\"Could you...?\", \"The thing is...\", \"I'll get back to you\"). Language researchers call these formulaic sequences (Alison Wray's work), explained in the same sentence. Never give a number or a percentage for how much of speech they make up.",
        "Give 10 everyday chunks the reader can borrow (work, college, shops, phone calls), then Pooja's five for her Monday call. Then a timer (doit, kind timer, 60 seconds): pick five chunks for a conversation you'll have this week and say each one out loud three times. That is the win: before minute 4, the reader has spoken English without building it word by word.",
        "No grammar terms in this chapter. Close the In one breath card with an optional one-line \"Your turn\": write your five chunks on your phone's notes."],
      blocks: ["picture", "teach", "tryit", "doit", "breath"], proof: "set" }, { turn: false }),
    day({ title: "Shadow a voice for two minutes", covers: "Speak along with a short English clip, half a second behind, to borrow its rhythm.", outcome: "You can shadow a one-minute English clip out loud, keeping up with most of it.",
      hook: "You learnt film songs by singing along, not by studying them. Speaking works the same way.",
      needs: ["How to shadow: pick a clip of 30 to 60 seconds with subtitles (an English news anchor, a talk, a podcast you like); listen once; then play it again and speak along about half a second behind, copying the speed, the pauses and the stressed words. Keeping up matters more than every word. Name no specific video, channel or link.",
        "Why it helps, honestly: research on shadowing (much of it with Japanese learners of English, brought together by Shuhei Kadota) links it to better listening and smoother speech. It trains rhythm and chunks, not grammar rules. An Indian accent is fine; the aim is to be easy to follow, not to sound British or American.",
        "Pooja shadows a one-minute business news clip on her terrace after dinner: on the first try she falls behind and laughs; by the third she keeps up with most of it and notices \"I'll get back to you\" said as one quick piece.",
        "A timer (doit, kind timer, 120 seconds): shadow one clip, twice."],
      blocks: ["picture", "teach", "example", "doit", "try", "breath"], proof: "set" }),
    day({ title: "Think in English for two minutes", covers: "Narrate what you're doing in simple English, and talk around any word you don't have.", outcome: "You can talk to yourself in English for 2 minutes without stopping for a missing word.",
      hook: "When the English word won't come, the worst thing you can do is stop and go looking for it.",
      needs: ["Narrating: say what you're doing or seeing in short, simple English (\"I'm boiling milk. The bus is late again.\"). Short sentences are the point: there is no time to translate, so the thought starts in English.",
        "Talking around a missing word, three ways: describe it (\"the paper that shows what they owe\" for invoice), use a simpler word, or say the word in your own language and keep going. Note the word and look it up afterwards, never mid-flow.",
        "Pooja narrates her bus ride home in her head, then out loud on the terrace; she can't find \"reconcile\" and says \"match the two lists\" instead, and keeps going.",
        "The mistake card: stopping mid-sentence to translate the missing word; the silence grows and the listener loses the thread. A described word keeps them with you.",
        "A timer (doit, kind timer, 120 seconds): narrate the room you're in, out loud."],
      blocks: ["picture", "teach", "example", "mistake", "doit", "try", "breath"], proof: "set" }),
    day({ title: "Phrases that come from translating", readMinutes: 4, covers: "Five common Indian English phrases a listener outside India may misread, and the version anyone follows.", outcome: "You can spot five translated phrases in your own speech and swap each for one any listener follows.",
      hook: "In India, \"I have a doubt\" means a question. In the UK, it can sound like you don't believe them.",
      needs: ["Kindly: these are Indian English, used and understood across India, never mistakes. They matter only when the listener grew up somewhere else, like Pooja's buyers in the UK. Never call them errors or bad English, and never mock them.",
        "The five, each with the version any listener follows and one line on why a listener elsewhere may misread it: \"Myself Pooja\" becomes \"I'm Pooja\"; \"I have a doubt\" becomes \"I have a question\"; \"Please revert\" becomes \"Please reply\" or \"Let me know\" (elsewhere, revert usually means go back to an earlier state); \"I am having two years experience\" becomes \"I have two years' experience\"; \"Please do the needful\" becomes the exact thing you need. Say where they come from only in general terms (often a direct translation, or older formal letter English), never as a fact about one language.",
        "The Try it card (type \"tryit\"): five lines from Pooja's Monday update; the reader first taps the ones a UK listener might misread, then taps each to flip it to the version anyone follows, with its one-line reason.",
        "The mistake card: trying to fix every phrase at once, which brings back the pause from chapter 1. Swap one a week.",
        "One scenario exercise with a new line from Pooja's week: which version a UK listener follows easily."],
      blocks: ["picture", "teach", "tryit", "mistake", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "Same story, less time", covers: "Tell the same short story three times, each time faster, so the words come without searching.", outcome: "You can tell a one-minute story about your day three times, faster each time.",
      hook: "Saying the same thing three times sounds boring. It's how the pauses start to disappear.",
      needs: ["The drill comes from the 4/3/2 activity Paul Nation describes: learners tell the same talk to three listeners in 4, then 3, then 2 minutes. Adapted for one person and a phone timer: 90 seconds, then 60, then 45. Because what you say stays the same, your mind stops searching for what to say and works on how it flows. Honest: the research was done in classrooms, with listeners; alone, this is a practice version.",
        "Pooja's story: what happened at work today (a payment from the UK buyer came a week late, and she matched it to three invoices). Round one has long pauses; by round three she uses her chunks from chapter 1 and finishes inside 45 seconds.",
        "A timer (doit, kind timer, 90 seconds) for round one; then tell it again in 60 and in 45. Recording the last round on the phone is optional; so is listening back."],
      blocks: ["picture", "teach", "example", "doit", "try", "breath"], proof: "set" }),
    day({ title: "When you don't follow", covers: "Phrases that ask again or buy you time, and the three answers to get ready before a real conversation.", outcome: "You can ask someone to repeat or slow down, and buy a few seconds to think, in English.",
      hook: "Nodding when you didn't follow feels safer. It's what makes the next minute harder.",
      needs: ["Rescue phrases, ready as chunks: to ask again (\"Sorry, could you say that again?\", \"Could you slow down a little?\"), to check (\"So you mean...?\", \"Just to confirm...\"), to buy time (\"Good question, let me think\", \"Give me a second to check\"). Fluent speakers use these too; asking is normal, not a sign of weak English.",
        "Get ready for a real conversation: write the three questions you're most likely to be asked and a first chunk for each answer. Pooja's three: \"Has our last payment reached you?\", \"Why is this invoice still open?\", \"When is the next shipment going out?\" (not her team's work, so her chunk is \"I'll check with dispatch and get back to you\").",
        "The mistake card: nodding along when you didn't follow, then answering a question nobody asked.",
        "One scenario exercise: the buyer's team lead says something fast on the call; which phrase Pooja uses next."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Your first real conversation", covers: "Two minutes in English with a real person, then the 10-minute daily routine that keeps it growing.", outcome: "You can hold a 2-minute conversation in English and keep a 10-minute daily routine going.",
      hook: "Today the drills meet a real person. Two minutes is enough.",
      needs: ["Who to talk to: a colleague, a cousin abroad on a voice note, a customer-care call you'd usually make in another language, the meeting you usually stay quiet in. Pooja gives the 2-minute payment update on Monday's call herself: she pauses twice, uses \"Give me a second to check\" once, and answers the team lead's follow-up. Her manager doesn't step in.",
        "A timer (doit, kind timer, 120 seconds): a run-through out loud just before, from your five chunks and your three prepared answers.",
        "The daily 10 minutes, as a routine to keep: 3 minutes on chunks for tomorrow's conversation, 5 minutes of shadowing, 2 minutes thinking in English, at one fixed time (Pooja: the terrace after dinner). Honest: fluency grows over months of this, not in a week; what changes in 7 days is that starting to speak feels normal.",
        "On this last chapter, end with what the reader can now do and one next step (one new English conversation a week, with someone new)."],
      blocks: GIVE_IT, proof: "set" }, { turn: false }),
  ],
};
