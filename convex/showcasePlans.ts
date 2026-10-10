// D65 (Prateek, 10 Oct): the showcase handbooks of the free eleven, planned by hand from an outline he approved
// (docs/public-speaking-28.md), so the writer gets each day's delivery spec without the plan prompt's 3-to-7 ceiling.
// Every title and line here is (agent) copy until Prateek rewrites it.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example every day shows done (Prateek: "walk them through a common example of how it can be done and
// they can follow along on their own"). An invented person, so her numbers are an example, never a measured result.
const ANANYA = "Ananya, 26, a data analyst at a delivery company in Pune";
// Her facts stay the same every day, so the example reads as one person's talk growing (the first build drifted:
// shipping delays on day 1, retail checkout data on day 2).
const ANANYA_FACTS = `Her fixed facts, the same on every day: four years in analytics; she builds the reports her company's delivery teams read each morning; her one line is "I help delivery teams spot delays before their customers do"; her proudest result is a late-delivery report that now takes one hour instead of three days; she wants to move to a bigger product team. From week 3 her team talk is "Why we should try a no-meeting Friday morning", built from what she asks 20 colleagues (her numbers are an example, never a measured result).`;
const STEP = `Show this day's step done on the running example: ${ANANYA}. ${ANANYA_FACTS} Weeks 1 and 2 she builds her own introduction (the 60 to 90 second interview answer to "Tell me about yourself" and the 20-second version for a party or a first meeting); weeks 3 and 4, her team talk. Show her draft before and after this step, in her words, consistent with what earlier days showed.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): the same step for the reader's own introduction (or, from week 3, their own talk), done on paper or out loud in under 2 minutes. Optional: say so.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH = ["picture", "teach", "example", "exercise", "try", "breath"];
const TEACH_TRY = ["picture", "teach", "tryit", "example", "exercise", "try", "breath"];
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];
const GIVE_IT = ["picture", "teach", "example", "doit", "teach", "breath"];

export const HOLD_A_ROOM = {
  topic: "Hold a room for 10 minutes",
  mode: "skill",
  body: false,
  format: "course",
  caution: "none",
  goal: "Hold a room for 10 minutes: start with my own introduction for interviews and parties, then give a 10-minute talk people remember",
  outcome7: "By day 28 you'll give a 10-minute talk to a real room, and they'll be able to repeat its one idea afterwards.",
  horizon14: "By day 14: a 3-minute talk, recorded on your phone.",
  horizon28: "By day 28: 10 minutes, in front of people.",
  picture: null,
  pictureWhyNot: "a running example (Ananya's introduction, then her team talk) carries the handbook instead of an analogy",
  framing: null,
  // The path groups the days into weeks (Plan.tsx); only the week the reader is in opens by default.
  weeks: [
    { title: "Your first 2 minutes", from: 1, to: 7 },
    { title: "Body and voice", from: 8, to: 14 },
    { title: "Something worth saying", from: 15, to: 21 },
    { title: "Hold the room for 10", from: 22, to: 28 },
  ],
  series: `One running example through all 28 days: ${ANANYA}. Each day teaches one step, shows it done on her talk, then hands the reader "Your turn". Value comes early: by day 7 the reader has said a real 2-minute introduction to a person. Each day is under 5 minutes.`,
  sources: [
    { who: "Chip Heath and Dan Heath", what: "Made to Stick", why: "why stories are remembered and statistics are not" },
    { who: "Alison Wood Brooks", what: "Get Excited: Reappraising Pre-Performance Anxiety as Excitement (2014)", why: "saying \"I'm excited\" instead of \"I'm calm\" before speaking" },
    { who: "Chris Anderson", what: "TED Talks: The Official TED Guide to Public Speaking", why: "one idea per talk, built up piece by piece" },
  ],
  next: ["Answering questions on the spot", "Telling a story at work", "Ask for a raise and get it"],
  chapters: [
    // Week 1: your first 2 minutes. The value, early.
    day({ title: "One line they'll repeat", readMinutes: 2, covers: "A talk, even a 20-second introduction, is remembered for one line. Find yours.", outcome: "You can write the one line you want a stranger to remember about you.",
      hook: "Most introductions are forgotten before the handshake ends. One line fixes that.",
      needs: ["The aha by card 3, through the Try it card (card 3, type \"tryit\"): three openings for the same introduction; on the page the reader taps the one a listener would repeat to a friend afterwards, and the page shows why it sticks (specific, one idea, about what you do for others). The cards before it set up the question without answering it.", "By the end, Ananya's one line, ready to use, so the reader has a worked line in hand within 5 minutes.", "Close the In one breath card with an optional one-line \"Your turn\": write your own one line tonight."],
      blocks: ["picture", "teach", "tryit", "example", "breath"], proof: "retell" }, { turn: false }),
    day({ title: "Tell me about yourself", covers: "The interview version: present, past, future, in 60 to 90 seconds, built around the one line.", outcome: "You can answer \"Tell me about yourself\" in three parts, under 90 seconds.",
      hook: "\"Tell me about yourself\" is not a question about your life story.",
      needs: ["The three-part shape (what I do now, how I got here, what I want next), each part one or two sentences.", "What to leave out: the full CV, family background, anything the interviewer didn't ask for."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "The 20-second version", covers: "The party or first-meeting introduction: shorter, warmer, ending on a question.", outcome: "You can introduce yourself in 20 seconds and hand the conversation back.",
      hook: "At a party, the best introduction ends with a question, not a job title.",
      needs: ["The 20-second shape: name, one specific thing you do or love, one question back.", "How it differs from the interview version, side by side."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Open with something specific", covers: "The first sentence decides if they listen. Specific beats impressive.", outcome: "You can write a first sentence that makes a listener lean in.",
      hook: "\"I'm a data analyst\" is forgettable. What she says instead isn't.",
      needs: ["Three ways to open specifically: a number from your own work, a small scene, a surprising true thing about you.", "The openings to avoid: apologising, \"So, basically\", reading out your title."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Shaky hands are normal", covers: "Why the body reacts before you speak, and what helps in the next 60 seconds.", outcome: "You can calm your body enough to start speaking, in under a minute.",
      hook: "Telling yourself to calm down before you speak makes it worse.",
      needs: ["Why it happens: the same body response as excitement (racing heart, dry mouth).", "The reframe: say \"I'm excited\", not \"I'm calm\" (Brooks 2014: speakers who said \"I am excited\" were rated more persuasive and confident than those who said \"I am calm\").", "One slow breath out, longer than the breath in, just before the first line.", "If the fear is so strong it stops daily life, say kindly that a doctor or counsellor can help; no diagnosis."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Cues, not a script", covers: "A memorised script falls apart at the first slip. Five cue words don't.", outcome: "You can turn your introduction into five cue words and say it from them.",
      hook: "The people who memorise every word are the ones who freeze.",
      needs: ["Why a script fails (one forgotten word and the rest goes) and why cue words hold.", "Make the cue card: one word per part of the introduction.", "A timer (doit, kind timer, 90 seconds): say the interview introduction out loud from the cue words once."],
      blocks: ["picture", "teach", "example", "doit", "try", "breath"], proof: "set" }),
    day({ title: "Say it to one person", covers: "The first real performance: your introduction, to one person, and one question afterwards.", outcome: "You can give your 2-minute introduction to a person and check what they remember.",
      hook: "Today you say it to a real person. Then you ask them one question.",
      needs: ["Who to pick (a friend, family at dinner, a voice note to a cousin) and how to ask without it being awkward.", "The one question afterwards: \"What's one thing you remember?\" If it matches your one line, it worked.", "A timer (doit, kind timer, 120 seconds) for the run-through just before."],
      blocks: GIVE_IT, proof: "set" }),

    // Week 2: body and voice.
    day({ title: "Stand still, hands free", covers: "What to do with your hands and feet, and why pacing reads as nerves.", outcome: "You can stand and gesture in a way that looks steady.",
      hook: "Your hands aren't the problem. Where you put them is.",
      needs: ["Feet planted about shoulder-width; hands at the waist, free to move with the words.", "What reads as nervous: pacing, gripping a pen, hands in pockets the whole time."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "One person per thought", covers: "Eye contact that works in a room of 5, 50 or 500.", outcome: "You can hold eye contact with one person for a whole thought, then move.",
      hook: "Looking at everyone means looking at no one.",
      needs: ["One person per sentence or thought, then move to someone in another part of the room.", "On a big stage: pick a few friendly faces in different zones."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "The pause is a tool", covers: "Speed, and the two-second pause after the line that matters.", outcome: "You can slow down and place one deliberate pause.",
      hook: "The most powerful thing you'll say in a talk is nothing at all.",
      needs: ["Why nerves speed you up, and a target pace you can feel.", "The pause after your one line: count two in your head."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Reach the back row", covers: "Volume without shouting, in a room or on a video call.", outcome: "You can speak so the last row hears you without straining.",
      hook: "If the back row leans forward, you've already lost them.",
      needs: ["Speak to the back wall, from the belly, not the throat.", "End sentences strong: the last words drop first."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Basically, actually, na", covers: "Filler words, the Indian English ones too, and the swap for a pause.", outcome: "You can spot your filler words and replace them with a pause.",
      hook: "\"Basically\" is doing a lot of work in your sentences. None of it helps.",
      needs: ["The common ones: um, so, basically, actually, like, right, na.", "The swap: when you feel a filler coming, pause instead.", "How to find yours: record 60 seconds and count."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "When you blank", covers: "Losing your place mid-sentence, and the recovery line.", outcome: "You can recover from a blank in under five seconds.",
      hook: "Everyone blanks. The room only notices when you panic about it.",
      needs: ["The recovery line: repeat your last sentence, or say \"Let me put that another way\".", "Glance at the cue card; it is allowed.", "Why the room rarely notices a pause of a few seconds."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Three minutes, recorded", covers: "Your introduction stretched to 3 minutes, recorded on your phone.", outcome: "You can record a 3-minute talk and check it for one thing.",
      hook: "Your phone is the most honest audience you'll ever have.",
      needs: ["Stretch the introduction to 3 minutes: one story about how you got here.", "Record it on the phone's camera or voice recorder. Listening back is optional; if you do, listen for one thing only (fillers, or the pause after your one line).", "A timer (doit, kind timer, 180 seconds)."],
      blocks: GIVE_IT, proof: "set" }),

    // Week 3: something worth saying. Research it, then present it.
    day({ title: "Start with the room", covers: "Pick a topic for what your listeners care about, not what you know.", outcome: "You can choose a talk topic your listeners will care about.",
      hook: "The best topic isn't the one you know most about.",
      needs: ["Three questions to pick a topic: who's listening, what do they worry about, what can you change for them in 10 minutes.", "Ananya moves from her introduction to her team talk here: show why she picks no-meeting Friday mornings."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Research it in 30 minutes", covers: "Three facts and one story, from people first, then reliable sources.", outcome: "You can gather three facts and one story for a talk in 30 minutes.",
      hook: "Your best source is usually a person, not a search engine.",
      needs: ["Ask people first: two or three short conversations give stories and real numbers.", "Then reliable sources for India: government data (PIB, RBI, the ministry for your topic), not forwards.", "Keep only what serves the one idea; park the rest."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "A story beats a statistic", covers: "Why listeners remember stories, and how to turn a number into one.", outcome: "You can turn a fact into a short story people remember.",
      hook: "People forget your numbers within minutes. They keep your stories.",
      needs: ["From Made to Stick (Chip and Dan Heath): in a Stanford class exercise, students remembered the stories from one-minute speeches and almost none of the statistics.", "The shape of a 30-second story: a person, a moment, what changed."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Make numbers land", covers: "Comparisons that make a number feel real.", outcome: "You can compare a number to something your listeners already know.",
      hook: "\"Four hours a week\" means nothing. \"Half a working day\" does.",
      needs: ["Compare to something the room knows: a working day, a cricket match, a Mumbai local at rush hour, a cup of chai.", "One number per point; round it."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Slides that help, or none", covers: "When slides help, and how to keep them from stealing the room.", outcome: "You can decide whether a talk needs slides and make them help.",
      hook: "If people can read your slide, they've stopped listening to you.",
      needs: ["One idea per slide, a picture or a few words, never paragraphs.", "A 10-minute talk can work with no slides at all."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Explain the hard part simply", covers: "One comparison for the hardest idea in your talk.", outcome: "You can explain the hardest part of your talk with one comparison.",
      hook: "If your grandmother wouldn't follow it, neither will the room.",
      needs: ["Find the hardest part; explain it with one thing the room already knows.", "Test it on one person outside the topic."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Five minutes on what you found", covers: "Your researched talk at 5 minutes, to a small group.", outcome: "You can give a 5-minute talk on something you researched.",
      hook: "Five minutes, one idea, and a question for the room at the end.",
      needs: ["Put it together: opening, three stops, the line they'll repeat.", "Give it to a small group (a team meeting, friends, family) and ask what line they remember.", "A timer (doit, kind timer, 300 seconds)."],
      blocks: GIVE_IT, proof: "set" }),

    // Week 4: hold the room for 10.
    day({ title: "The 10-minute shape", covers: "How a 10-minute talk is built: the idea at the start and the end, three parts in between.", outcome: "You can outline a 10-minute talk on one page.",
      hook: "A 10-minute talk is three short talks that point the same way.",
      needs: ["The shape: opening and one line, three parts of about 3 minutes, close on the same line.", "Ananya's one-page outline."],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "Reset attention every 2 minutes", covers: "Small changes that pull a drifting room back.", outcome: "You can plan a reset every 2 minutes in your talk.",
      hook: "Attention drifts. Good speakers plan for it.",
      needs: ["Resets: a question to the room, a story, a show of hands, a change of place, a pause.", "Mark them on the outline."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Questions from the room", covers: "The easy question, the hard one, and the hostile one.", outcome: "You can answer, or honestly not answer, any question from the room.",
      hook: "\"I don't know\" can be the strongest answer you give.",
      needs: ["Repeat the question so everyone hears it, then answer in under 30 seconds.", "When you don't know: say so, and say how you'll find out.", "A hostile question: thank them, answer the fair part, move on."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Different rooms", covers: "The same skills for an interview panel, a team review, a wedding toast, a college fest.", outcome: "You can adjust one talk to four different rooms.",
      hook: "A wedding toast and a team review need the same three things.",
      needs: ["What changes per room: length, tone, how personal; what doesn't: one idea, a specific opening, a clear close.", "A wedding toast in under 2 minutes as one worked case."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "On a video call", covers: "Talking well on Zoom, Meet or Teams.", outcome: "You can give a talk on a video call that feels like you're in the room.",
      hook: "On a call, the camera is the person you're talking to.",
      needs: ["Camera at eye level, light in front, look at the lens for the line that matters.", "Shorter parts and more resets: attention on calls drifts faster."],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Rehearse like it counts", covers: "Three run-throughs that make the real one feel familiar.", outcome: "You can plan and do three rehearsals for a 10-minute talk.",
      hook: "Rehearsing in your head isn't rehearsing.",
      needs: ["Three run-throughs: one alone out loud, one standing as you will, one in front of a person.", "Time each; cut, don't speed up, if it runs long.", "A timer (doit, kind timer, 600 seconds)."],
      blocks: ["picture", "teach", "example", "doit", "try", "breath"], proof: "set" }),
    day({ title: "Hold a room for 10 minutes", covers: "Give the talk, then ask the room what they remember.", outcome: "You can give a 10-minute talk and check that its one idea landed.",
      hook: "Today you give it. Then you find out what stuck.",
      needs: ["The checklist for the day itself: arrive early, one breath out, the first line, the cue card.", "Afterwards ask two or three people: \"What's one thing you remember?\" If it's your one line, you held the room.", "A timer (doit, kind timer, 600 seconds).", "On this last day, end with what the reader can now do and one next step (a bigger room)."],
      blocks: GIVE_IT, proof: "set" }, { turn: false }),
  ],
};
