// Hand-made handbook "Calm your child's meltdown without losing yours", planned in the shape of HOLD_A_ROOM
// (convex/showcasePlans.ts) and convex/plans/car.ts: one running example family, one step a chapter, then "Your turn".
// Every title and line here is (agent) copy until Prateek rewrites it.
// Health caution: parenting guidance for a parent of a child aged about 2 to 8, not medical advice. Never suggests or
// excuses hitting, slapping, shaking, threatening, shaming, locking a child in or leaving them alone; never diagnoses
// (autism, ADHD, a sensory issue or anything else); never blames or shames the parent. Current figures, ages and
// warning signs come from the research brief, never invented.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example. An invented family, so every scene and number is an example, never a measured result and never
// a promise of what the reader's child will do. Their facts stay fixed so the seven chapters read as one home learning
// to ride out the storms.
const TARA = "Tara Shah, 4, at a play school in Ahmedabad (an invented example family)";
const FACTS = `Her fixed facts, the same in every chapter (all invented, an example): her mother Nidhi, 33, works from home three days a week; her father Kunal is in sales and travels about two weeks a month; Kunal's parents, Ba and Dada, live with them; her brother Vihaan is 1. They speak Gujarati at home, English at play school. Tara's usual meltdowns: leaving the society park at 7 pm (the big one, about three evenings a week: she drops to the ground at the gate, screams and kicks for about 10 minutes); the tablet going off after her cartoons; the biscuit aisle at the supermarket on Saturdays. They are worse when she skipped her afternoon nap or hasn't eaten since 4 pm. Before the handbook, Nidhi first explains ("Beta, it's dark, the park is closing, we'll come tomorrow"), then shouts ("Stop it right now or no park tomorrow!"), then either carries her home kicking or gives in ("Okay, five more minutes"); afterwards both go quiet and Nidhi feels guilty. Nidhi's own warning sign: her jaw tightens and her voice rises. Ba usually hands Tara a biscuit to stop the crying; Dada says "In our time, one slap and it was over." What Nidhi adds, chapter by chapter: in chapter 1 she stops explaining once the storm peaks; in chapter 2 she notices her jaw, breathes out slowly, crouches, and says to herself "She's having a hard time, not giving me one"; in chapter 3 at the gate she moves Tara off the path onto the grass, stays an arm's length away and keeps Vihaan's pram out of kicking range; in chapter 4 she says "You love the park. You're so cross it's time to go. I'm here," then waits, and drops "no park tomorrow"; in chapter 5, at bath time, a two-minute talk about the park and, the day she did shout, her own sorry; in chapter 6 a snack at 5:30, a five-minute warning, and a choice at the gate ("hop like a frog or race me?"); in chapter 7 a Saturday meltdown in the biscuit aisle, and a Sunday-morning talk with Ba and Dada. Meltdowns become fewer and shorter in the example, never gone, and never as a promise. Never show Nidhi using a step before the chapter that teaches it.`;
const STEP = `Show this chapter's step done in the running example's home: ${TARA}. ${FACTS} Show the moment before and after this step, in their words, consistent with what earlier chapters showed. Any figure (how long meltdowns last, at what age they ease, how often is typical) comes from the research brief, said as typical, or is left out.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps or drags and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): one small thing the parent and child do together at a calm time (never during a meltdown), under 5 minutes, using this chapter's step; this chapter's needs suggest one. Optional: say so. If the child is too young for it, the parent does the grown-up half alone.`;
const CARE = `Health caution, said warmly throughout: this is parenting guidance, not medical advice. Never suggest or excuse hitting, slapping, shaking, pinching, threats ("I'll leave you here", "the police will take you"), shaming ("big girls don't cry"), locking a child in a room or leaving them alone; say plainly, once where it fits, that the American Academy of Pediatrics advises against spanking and harsh words (paraphrase). Never diagnose or hint at a condition. Never blame the parent: every parent loses their temper sometimes, and repair matters more than a perfect record. Meltdowns are common at this age; how common, and at what age they usually ease, only from the research brief. The "In one breath" card names who to ask in one line, the one that fits this chapter: the child's paediatrician if meltdowns are very frequent or very long, if the child hurts themselves or others, holds their breath until they faint, loses skills they had (words, toilet training), or if meltdowns stay frequent past the age the research brief gives as typical (the signs from the research brief, never a diagnosis); for the parent's own stress, Tele-MANAS, India's free mental health helpline (14416), named only if the research brief confirms the number and the service; otherwise the parent's own doctor.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, CARE, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH_STEPS = ["picture", "teach", "steps", "example", "exercise", "try", "breath"];
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];

export const PLAN = {
  topic: "Calm your child's meltdown without losing yours",
  mode: "skill",
  body: false,
  format: "course",
  caution: "health",
  goal: "Calm my child's meltdowns without shouting: know what's happening in them, stay calm myself, say the right few words, keep everyone safe, make up afterwards, and head off the next one, at home, in public and in front of family",
  outcome7: "By day 7 you'll know what's happening in your child's meltdown, have your own calm-down move, a few words to say and a list of what not to say, a way to make up afterwards, three ways to head off the next one, and a plan for meltdowns in public and in front of relatives.",
  picture: null,
  pictureWhyNot: "a running example (Tara at the park gate, and her mother learning to ride out the storm) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${TARA}. Each chapter teaches one step, shows Nidhi doing it with Tara, then hands the reader "Your turn": a few calm minutes with their own child. Value comes early: in chapter 1 the parent learns why explaining doesn't work at the peak of a meltdown, and what to do instead at the very next one. Each chapter is under 5 minutes. Honest throughout: meltdowns are a normal part of growing up; these steps make them shorter and easier to ride out, not gone.`,
  sources: [
    { who: "American Academy of Pediatrics", what: "Parent pages on temper tantrums (healthychildren.org)", why: "why tantrums happen at this age, how to respond, and when to talk to a paediatrician" },
    { who: "American Academy of Pediatrics", what: "Effective Discipline to Raise Healthy Children (policy statement, Pediatrics, 2018)", why: "spanking and harsh words don't work and can harm; calm, consistent discipline instead" },
    { who: "Daniel J. Siegel and Tina Payne Bryson", what: "The Whole-Brain Child (2011)", why: "the \"upstairs and downstairs brain\" picture, and naming a feeling to help calm it" },
    { who: "Ross W. Greene", what: "The Explosive Child", why: "\"kids do well if they can\": a meltdown as a skill not yet learned, not defiance" },
    { who: "UNICEF", what: "Parenting pages on tantrums and staying calm (unicef.org/parenting)", why: "practical steps for parents before, during and after a tantrum" },
  ],
  next: ["Get your child reading for fun", "Screen time your child will accept", "Bedtime without the battle"],
  chapters: [
    day({ title: "What's going on in a meltdown", readMinutes: 3, covers: "A tantrum and a meltdown, in plain words; why a child mid-storm can't hear reasons; what that means for what you do.", outcome: "You can tell when your child is past hearing reasons, and switch from explaining to staying calm and close.",
      hook: "Nidhi explains, perfectly reasonably, why the park is closing. Tara screams louder.",
      needs: ["The aha by card 3, through the Try it card (card 3, type \"tryit\"): the storm meter. The reader slides a meter on Tara at the park gate from 1 to 5 (calm, whiny, upset, crying hard, full meltdown); at each level the page shows what Tara can still take in (a reason, a choice, a few words, only your tone and your being there) and three of Nidhi's lines (\"It's dark, the park is closing, we'll come tomorrow\", \"Two more slides or race me to the gate?\", \"I'm here. You're so cross.\") light up where they can still land and fade where they can't. At 5, only the last one is left. Cards 1 and 2 set up the explaining that doesn't work without giving the turn.",
        "Teach it plainly: many parenting writers separate a tantrum (a child pushing for something they want, who can stop if they get it) from a meltdown (a child so flooded they can't stop even if they get it); with children of 2 to 4 the two blur, and the first response is the same: calm and safe, no lesson. Siegel and Bryson's picture, said as a simplified picture and not anatomy: the \"downstairs\" alarm part of the brain takes over, and the \"upstairs\" thinking part, which still has years to grow, can't run things until the alarm settles. Ross Greene's line, paraphrased: kids do well if they can; a meltdown is a skill not learned yet, not a plan to defy you.",
        "What to do at the next one, the chapter's win within 5 minutes: when your child is past reasons, stop explaining; say less, get low, stay near; the talk comes later (chapter 5).",
        "No quiz in this chapter.",
        "Your turn suggestion: at a calm time, draw a storm face and a calm face together, and ask your child what their storm feels like in their body."],
      blocks: ["picture", "teach", "tryit", "example", "try", "breath"], proof: "retell" }),
    day({ title: "Your calm comes first", covers: "A child borrows the calm of the grown-up nearby. Notice your own warning sign, slow your breath, get low, and say one line to yourself.", outcome: "You can catch your own temper rising and steady yourself in about 30 seconds before you respond.",
      hook: "Tara's storm is loud. Nidhi's jaw tightening is the part she can actually change.",
      needs: ["Why it comes first: a child flooded by a meltdown takes cues from the adult's voice and body; a shouting adult adds fuel, a steady one gives the child something to settle against. Said plainly, no figures.",
        "The move, in four parts: notice your own warning sign (Nidhi's tight jaw and rising voice; others feel heat, clenched fists, fast breath); breathe out slowly, longer than you breathe in, two or three times (a common calming practice, said as such); get low, at or below the child's eye level, voice quieter; say one line to yourself (\"She's having a hard time, not giving me one\").",
        "Then a timer (doit, kind timer, 30 seconds): practise the slow breath out now, so it's there when you need it.",
        "If you're too angry to stay calm, it's fine to step a few feet away while the child is safe and in sight, and come back. Never leave a young child alone to \"teach a lesson\".",
        "One scenario exercise: a new family (not the Shahs), a father whose son melts down while he's on a work call; which first move steadies him.",
        "Your turn suggestion: blow \"birthday candle\" breaths together (smell the flower, blow out the candle) three times, so your child knows the breath too."],
      blocks: ["picture", "teach", "example", "doit", "exercise", "try", "breath"], proof: "set" }),
    day({ title: "Stay close, keep it safe", covers: "During the storm: make the space safe, stay near without crowding, hold only to keep someone from getting hurt, and wait it out.", outcome: "You can keep your child and everyone around them safe through a meltdown without a fight.",
      hook: "At the park gate there's a road, a pram and a hard step. Safety comes before words.",
      needs: ["The steps card, in order: move the child or the hazards (off the path, away from the road or the stairs, hard things out of reach); stay close, within arm's length or within sight if they push you away; hold gently only to stop them hurting themselves or someone else, and let go when they're safe; keep other children out of kicking range; wait, without pleading, bargaining or giving in; when the crying turns to sobs, offer a hug or water.",
        "Some children want to be held, others want space; watch which yours is, and stay near either way. A child who goes stiff or pushes away isn't rejecting you; staying close still helps.",
        "Nidhi at the gate: she moves Tara onto the grass, parks Vihaan's pram behind her, crouches an arm's length away and waits; she holds Tara's leg gently once when it swings toward the pram, then lets go.",
        "One scenario exercise: a new family's daughter melts down on the staircase of their building; what to do first.",
        "Your turn suggestion: at a calm time, make a cosy calm-down corner together (a cushion, a soft toy, a picture book), a place to go to feel better, never a punishment."],
      blocks: TEACH_STEPS, proof: "scenario" }),
    day({ title: "Name the feeling, say less", covers: "What to say during and just after a meltdown (name the feeling, a few calm words) and what not to say (lectures, threats, bribes, shaming).", outcome: "You can say a few words that help a meltdown pass, and leave out the lines that make it worse.",
      hook: "\"No park tomorrow!\" feels like it should work. It makes Tara scream louder.",
      needs: ["The Try it card (type \"tryit\"): Tara screaming at the gate; the reader taps one of six lines Nidhi could say (\"It's dark, the park is closing, we'll come tomorrow\", \"Stop it or no park tomorrow!\", \"I'll leave you here\", \"Big girls don't cry\", \"You're so cross it's time to go\", \"I'm here, I'll wait\") and each is sorted as \"adds fuel\" or \"helps the storm pass\", with one line on why.",
        "Teach it: name the feeling in a few words (\"You're so cross. You wanted more slides.\"); Siegel and Bryson call this \"name it to tame it\" (paraphrase): a feeling put into words often settles a little. Then fewer words, a calm low voice, and waiting. Hold the limit kindly: going home still happens; you can name the feeling and keep the limit at the same time.",
        "What not to say, with why for each: lectures (the thinking part isn't listening yet); threats, including \"I'll leave you here\" (they frighten, and a threat not carried out teaches the child it means nothing); bribes to stop crying (they teach that meltdowns pay); shaming (\"big girls don't cry\", \"everyone is looking at you\"); comparing with a sibling or cousin.",
        "The mistake card: giving in to end it (\"Okay, five more minutes\") after saying no; the next meltdown gets longer. If the limit was off, change it next time, not mid-storm.",
        "One scenario exercise: a new family's son melts down when the TV goes off; which of three lines names the feeling and keeps the limit.",
        "Your turn suggestion: with a picture book, take turns naming how a character feels (cross, sad, scared, excited)."],
      blocks: ["picture", "teach", "tryit", "example", "mistake", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "After the storm: make up and talk", covers: "Reconnect once it's over, keep the talk short and later, and repair when you lost your own temper.", outcome: "You can reconnect after a meltdown and say sorry when you shouted, so you both start fresh.",
      hook: "The meltdown is over. What happens in the next hour is what Tara remembers.",
      needs: ["Reconnect first: a hug, water, a quiet moment, no lecture; the child may feel embarrassed or tired. Leave the talk for later, when you're both calm (bath time, bedtime).",
        "The later talk, under two minutes: say what happened without blame (\"The park was hard today\"), name the feeling, ask one question (\"Next time, what could help?\"), and agree one small thing (a hop to the gate, a goodbye wave to the slide).",
        "Repair when you lost it: every parent shouts sometimes. Say it plainly and briefly (\"I shouted at the park. I'm sorry. I was cross, and I'm working on staying calm.\"), without asking the child to make you feel better. It shows them how to make up after a hard moment.",
        "Nidhi on the day she does shout: at bath time she says sorry; Tara says \"I was cross too\"; they agree on a goodbye wave to the slide.",
        "The mistake card: going cold or silent for hours as punishment; or a long talk about \"why we don't do this\" straight after.",
        "One scenario exercise: a new family's parent who slammed a door during a meltdown; which sorry repairs it.",
        "Your turn suggestion: at bedtime, each say one hard moment and one good moment from the day."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Head off the next one", covers: "Many meltdowns have a pattern: hunger, tiredness, sudden endings. Snacks, rest, warnings before a change, and small choices prevent many of them.", outcome: "You can spot your child's meltdown pattern and change three things that head off the next one.",
      hook: "Tara's park meltdowns had a pattern: no nap, no snack since 4, and a sudden \"time to go\".",
      needs: ["Find the pattern: for a week, note when meltdowns happen, what came just before, and when the child last ate and slept. Common triggers: hunger, tiredness, sudden changes, too much noise or crowds, being told no without warning.",
        "The steps card, the fixes: a snack before the hard part of the day; rest or quiet time when the nap is skipped; a warning before a change (\"five more minutes, then home\"; then \"two more slides\"); a timer or song the child can see or hear end; a small choice inside the limit (\"hop like a frog or race me to the gate?\", \"the red cup or the blue one?\"); a goodbye ritual (wave to the slide).",
        "Nidhi's three changes: a snack at 5:30, a five-minute warning then \"two more slides\", and the frog-or-race choice at the gate. In the example the park meltdowns become fewer and shorter, not gone.",
        "Honest: some meltdowns happen anyway; prevention lowers the number, it doesn't make you a failure when one comes.",
        "One scenario exercise: a new family's daughter melts down every evening at 6; which of three changes to try first.",
        "Your turn suggestion: practise the five-minute warning in a game: set a phone timer together during play and do a goodbye ritual when it rings."],
      blocks: TEACH_STEPS, proof: "scenario" }),
    day({ title: "In public and in front of family", readMinutes: 4, covers: "Meltdowns in a shop, at a wedding or in front of relatives: the same steps, plus one line for onlookers and a calm talk with family about what the house does.", outcome: "You can handle a meltdown in public or in front of relatives with the same calm steps, and agree on them with your family.",
      hook: "The biscuit aisle, ten strangers watching, and Ba holding out a biscuit.",
      needs: ["In public: the same steps (your calm, safety, a few words, wait), with one change: move somewhere quieter if you can (a corner, outside, the car). Onlookers' looks feel loud; one line is enough if anyone speaks (\"She's having a hard time; we're okay\"), or nothing. What other people think matters less than what your child learns. A family wedding or a function: a quiet room, a snack, a shorter stay.",
        "Relatives: grandparents often mean well (a biscuit to stop the crying, \"one slap and it's over\"). In a calm moment, not mid-meltdown, agree on two or three house rules together: no treats to stop a meltdown, no hitting or threats; and give them a helpful job (the one who brings water after). Explain kindly that the American Academy of Pediatrics advises against spanking (paraphrase), and that what they did came from love.",
        "The Shahs: on Saturday Tara melts down in the biscuit aisle; Nidhi moves the trolley to the end of the aisle, crouches, names the feeling, tells a staring shopper \"We're okay\", and waits. On Sunday morning, over tea, she asks Ba and Dada for help with two rules and gives Ba the water job; Dada isn't convinced yet, and that's said honestly.",
        "The mistake card: handling it differently in public than at home (giving in to stop the stares), so the child learns meltdowns work best in shops.",
        "One scenario exercise: a new family's son melts down at a cousin's wedding while an aunt says \"just give him what he wants\"; what to say and do.",
        "This is the last chapter: no \"Next:\" line. End with what the reader can now do (see what's happening in a meltdown, steady themselves, keep it safe, say a few right words and skip the ones that add fuel, make up afterwards, head off the next one, handle it in public and with family) and one next step: write your three prevention changes and your one calming line on a note on the fridge.",
        "Your turn suggestion: play \"shop\" with toys, take turns being the child who wants something and the parent who says no kindly, and practise the frog-or-race choice."],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
  ],
};
