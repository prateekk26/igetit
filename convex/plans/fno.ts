// Free eleven, no. 8 (docs/free-ten.md): "Why 9 in 10 F&O traders lose money", planned by hand in the shape of
// HOLD_A_ROOM (convex/showcasePlans.ts): one running example person, one idea a day, then "Your turn".
// Every title and line here is (agent) copy until Prateek rewrites it.
// Money topic: teaches how futures and options work and what SEBI's own studies found. Never tells anyone to trade or
// not, never recommends a strategy, never predicts a market move. Current lot sizes, margins, cost rates, expiry days
// and SEBI's figures come from the research brief; only the example person's numbers are fixed here.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example. An invented person, so every number of his is an example, never a measured result and never a
// recommendation. His facts stay fixed so the seven chapters read as one person's six months, added up the same way.
// The sums: 1% of ₹16,25,000 is ₹16,250, about 9% of the ₹1,80,000 margin; the margin is gone at about an 11% move.
// Costs: 1,200 orders × ₹20 = ₹24,000 brokerage + ₹4,320 GST (18%) + ₹9,680 other = ₹38,000.
// Account: ₹2,00,000 − ₹32,000 trading loss − ₹38,000 costs = ₹1,30,000.
const KARTHIK = "Karthik, 27, a salaried sales executive at an insurance company in Hyderabad (an invented example person)";
const FACTS = `His fixed facts, the same in every chapter (an invented person: every number of his is an example, never a measured result and never a recommendation): take-home pay ₹62,000 a month; he moved ₹2,00,000 of savings into a trading account after a friend posted a screenshot of a ₹40,000 one-day profit; he mostly buys Nifty options on expiry day and now and then holds one Nifty futures lot; about 10 orders a trading day, 1,200 orders in six months. The example's round numbers: Nifty at 25,000 and a lot of 65 units, so one futures lot is worth about ₹16,25,000, and his broker blocks a margin of about ₹1,80,000 for it (real lot sizes and margins change; the current ones come from the research brief). His typical options trade: on an expiry morning, with Nifty at 25,000, he buys 5 lots of the 25,200 call at a premium of ₹20 a unit, ₹6,500 in all. His six months: month 1 up ₹18,000 before costs (one lucky expiry day); month 3 his worst day, down ₹35,000 on one futures lot he held "until it comes back"; after six months his trades had lost ₹32,000 before costs, costs took ₹38,000 more (₹24,000 brokerage at ₹20 an order, ₹4,320 GST on it, about ₹9,680 in STT, exchange charges, stamp duty and SEBI's fee), and his ₹2,00,000 stood at ₹1,30,000.`;
const STEP = `Show this chapter's idea on the running example: ${KARTHIK}. ${FACTS} Work it out with his numbers, in rupees, line by line, consistent with what earlier chapters showed. Describe what happened and what the numbers show; never say whether he should keep trading or stop.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps or drags and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): the same calculation or check on round numbers the reader picks (or, if they already trade, on their own contract note or profit and loss statement, kept to themselves), on paper or a phone calculator, in under 2 minutes. Optional: say so. Never ask the reader to place a trade, open an account or share their numbers.`;
const CARE = `Money topic, every card: teach how it works and what the numbers show; never tell the reader to trade or not to, never recommend a strategy, product, broker, stock or index level, never predict a market move, and never call a reader's own choice a mistake. Warm, never mocking: many readers have lost money this way, or know someone who has. Where a reader might act, say who to ask in one line: a SEBI-registered investment adviser. Lot sizes, margins, cost rates, expiry days and SEBI's figures change: use the current ones from the research brief, each with its date or year; if the brief lacks one, say it changes and leave the number out. Only Karthik's own numbers are fixed, and they are always labelled as an example.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, CARE, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}
const TEACH = ["picture", "teach", "example", "exercise", "try", "breath"];
const TEACH_TRY = ["picture", "teach", "tryit", "example", "exercise", "try", "breath"];
const TEACH_MISTAKE = ["picture", "teach", "example", "mistake", "exercise", "try", "breath"];

export const PLAN = {
  topic: "Why 9 in 10 F&O traders lose money",
  mode: "subject",
  body: false,
  format: "course",
  caution: "money",
  goal: "Understand how futures and options work in India and why most individual traders lose money, from SEBI's own studies",
  outcome7: "By day 7 you'll be able to take any F&O trade, tip or screenshot and work out the leverage, the costs and the odds behind it, using SEBI's own numbers.",
  picture: null,
  pictureWhyNot: "a running example (Karthik's six months of trading, in example numbers) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${KARTHIK}. Each chapter teaches one idea, works it out on his account in rupees (example numbers), then hands the reader "Your turn" on numbers they pick. Value comes early: in chapter 1 the reader drags a slider and sees a 1% move in Nifty become a 9% move in the money Karthik put down. Each chapter is under 5 minutes. It teaches how F&O works and the odds SEBI found, never whether to trade.`,
  sources: [
    { who: "Securities and Exchange Board of India (SEBI)", what: "Analysis of Profit and Loss of Individual Traders dealing in Equity Futures and Options (F&O) Segment (September 2024, FY22 to FY24)", why: "how many individual traders lost money, how much, who was on the other side, and what they spent on costs" },
    { who: "Securities and Exchange Board of India (SEBI)", what: "Measures to strengthen Equity Index Derivatives framework for increased investor protection and market stability (circular, October 2024)", why: "why lots got bigger, weekly expiries fewer and option premiums collected upfront" },
    { who: "Brad M. Barber and Terrance Odean", what: "Trading Is Hazardous to Your Wealth (Journal of Finance, 2000)", why: "households that traded most earned least after costs, and overconfidence as the reason" },
    { who: "Daniel Kahneman and Amos Tversky", what: "Prospect Theory: An Analysis of Decision under Risk (Econometrica, 1979)", why: "loss aversion: why a losing trade is so hard to close" },
  ],
  next: ["How the stock market works", "How mutual funds really work", "Tell a good IPO from hype"],
  chapters: [
    day({ title: "Nifty moves 1%, he moves 9%", readMinutes: 2, covers: "Futures in one idea: a small deposit controls a big contract, so a small move in Nifty becomes a big move in your money.", outcome: "You can work out what one Nifty futures lot gains or loses when Nifty moves 1%.",
      hook: "Nifty moved 1% one morning. The money Karthik had put down moved 9%.",
      needs: [
        "The aha by card 3, through the Try it card (card 3, type \"tryit\"): a slider moves Nifty from −3% to +3%; the page shows one futures lot's gain or loss in rupees and as a share of Karthik's ₹1,80,000 margin (1% is ₹16,250, about 9%; 2% about 18%), and marks the point near −11% where the whole margin is gone. Gains and losses show the same size either way. Cards 1 and 2 set up the question (how does 1% become 9%?) without answering it.",
        "Card 2 teaches only what the slider needs, each term explained in the same sentence it appears: F&O (futures and options, contracts whose price comes from something else, here the Nifty 50 index of India's 50 large companies); a futures contract (a deal to buy or sell Nifty at a fixed level on a set date); a lot (the fixed number of units you must trade at once); margin (the deposit the broker blocks, a small part of the lot's full value); leverage (controlling a big amount with a small one).",
        "The example card: Karthik's first week, the day a 1% rise made him ₹16,250 and it felt like a shortcut; then the same 1% the other way, and the margin call (the broker asking for more money, or closing the trade for him) if losses eat into the deposit. Never hint which way Nifty is likely to go.",
        "Close the In one breath card with an optional one-line \"Your turn\": pick any lot value and deposit, take 1% of the lot value, divide by the deposit. The Next: line points to options, the cheaper-looking way in.",
      ],
      blocks: ["picture", "teach", "tryit", "example", "breath"], proof: "retell" }, { turn: false }),
    day({ title: "Options: ₹20 for a maybe", covers: "Calls, puts, the premium, the strike and expiry: what Karthik actually buys for ₹6,500.", outcome: "You can work out the most an option buyer can lose, and where Nifty must close just to break even.",
      hook: "A ₹20 option can't lose more than ₹20. So how did ₹6,500 vanish in one afternoon?",
      needs: [
        "Each term in the same sentence it appears: a call (the right, not the duty, to buy Nifty at a set level until expiry); a put (the right to sell); the strike (that set level); the premium (the price of the right, per unit, times the lot); expiry (the day the right ends; the current weekly expiry day comes from the research brief).",
        "Karthik's typical trade from his facts: 5 lots of the 25,200 call at ₹20, ₹6,500. Break-even at expiry is 25,220 (strike plus premium), a rise of 220 points, about 0.9%, by 3:30 pm, before costs. If Nifty closes at 25,300 the call is worth ₹100 a unit, ₹32,500 for 5 lots; below 25,200 it is worth nothing and the ₹6,500 is gone. Show both outcomes with equal weight.",
        "Why a cheap option is cheap: the further the strike from today's level, the less likely Nifty gets there in time, so the price is low. Never state what share of options expire worthless.",
        "The scenario exercise: a put with new round numbers (not Karthik's), asking for the break-even or the most the buyer can lose.",
      ],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "The clock eats the premium", readMinutes: 4, covers: "Time decay: why an option loses value every hour Nifty stands still, fastest on expiry day, and what it means for the seller on the other side.", outcome: "You can predict what happens to an option's price as expiry nears and Nifty doesn't move.",
      hook: "Karthik guessed Nifty's direction right and still lost every rupee. The clock beat him.",
      needs: [
        "The premium has two parts, each explained in the same sentence: intrinsic value (what the option would be worth if it ended right now; zero for his 25,200 call while Nifty is below 25,200) and time value (what buyers pay for the chance it gets there). Time value shrinks to zero by expiry; theta is the name for that shrinking, per day, and on expiry day it goes by the hour.",
        "The Try it card (card 3): a clock slider from 9:15 am to 3:30 pm on expiry day; with Nifty held at 25,000 the ₹20 premium drains to ₹0; a second slider moves Nifty up and shows how far, and how early, it must move to beat the drain (at 3:30 pm only a close above 25,220 gets his ₹6,500 back, before costs). The page labels the curve an illustration, not live prices.",
        "The example: the afternoon Nifty rose 150 points to 25,150 and his call still expired worth nothing: right direction, not far enough, not in time.",
        "The other side, described and never recommended: the seller of that call collected the premium and keeps it if Nifty stays below the strike, but if Nifty jumps, the seller's loss has no ceiling. Selling tends to win small and often and lose big and rarely; neither side is free money. Then two predict exercises with new round numbers: what happens to a premium as the clock runs with no move.",
      ],
      blocks: ["picture", "teach", "tryit", "example", "exercise", "exercise", "try", "breath"], proof: "predict" }),
    day({ title: "The toll on every trade", covers: "What each trade costs (brokerage, STT, exchange charges, GST, stamp duty, the spread), and why costs grow with every order.", outcome: "You can add up what a month of trading costs before a single rupee of profit.",
      hook: "Karthik's trades lost ₹32,000. His costs took ₹38,000 more. One of those was certain.",
      needs: [
        "The lines on a contract note (the statement a broker sends after each day's trades), each in plain words: brokerage (the broker's fee per order); STT (securities transaction tax, collected by the government); exchange transaction charges; GST (18% on brokerage and charges); stamp duty; SEBI's fee; and the spread (the gap between the price to buy and the price to sell, a cost that never shows on the note). Current rates come from the research brief; if it lacks one, say the rate changes and leave it out.",
        "The Try it card (card 3): a slider for round trips (a buy and its matching sell) from 1 to 600; Karthik's costs climb to ₹38,000 beside his ₹32,000 trading loss; a toggle sets his trading result to zero and shows he is still down ₹38,000. The idea: whatever the market does, costs are the one result that is certain.",
        "The house edge, in plain words: a casino's games are built so the house keeps a small share of every bet; in F&O, costs play that part: small per trade, certain on every trade, adding up with the number of trades.",
        "The scenario exercise: a new trader with round numbers who breaks even before costs; where do they stand after costs?",
      ],
      blocks: TEACH_TRY, proof: "scenario" }),
    day({ title: "SEBI counted. Here's who lost.", covers: "SEBI's own studies of individual F&O traders: how many lost, how much, who was on the winning side, and why the group as a whole starts below zero.", outcome: "You can explain, with SEBI's numbers, why most individual F&O traders lose money.",
      hook: "SEBI checked the accounts of India's individual F&O traders. About 9 in 10 had lost money.",
      needs: [
        "SEBI's study of individual traders' profits and losses (September 2024, covering FY22 to FY24) and any later update in the research brief: the share who lost, the average loss per person, the total, the share of young traders, the share who kept trading after losing, and how much went on costs. Use only the figures the research brief gives, each with its year; if one is missing, leave it out rather than estimate.",
        "Zero-sum, in plain words: in F&O every rupee one side gains, the other side loses, before costs; after costs, traders as a group get back less than they put in. So the average trader starts below zero.",
        "Who was on the other side in SEBI's data (proprietary traders, meaning firms trading their own money, and foreign investors, many using algorithms, programs that place trades automatically), only as the research brief reports it.",
        "Where Karthik sits: his ₹70,000 down in six months is one example among the many SEBI counted; never claim he is typical by a number.",
      ],
      blocks: TEACH, proof: "scenario" }),
    day({ title: "Why smart people keep trading", covers: "The pulls that keep people trading after losses: the lucky start, holding a loser, trading bigger to win it back, the cheap lottery ticket, other people's screenshots.", outcome: "You can name five pulls that keep people trading after losses, and spot them in a story.",
      hook: "Karthik's best month was his first. It's also why he kept going.",
      needs: [
        "Each pull in plain words, shown on Karthik's months: the lucky start (month 1's ₹18,000 felt like skill; a few dozen trades can't tell skill from luck); loss aversion (a loss hurts more than an equal gain pleases, so he held month 3's losing lot \"until it comes back\"); revenge trading (more lots, to win back a loss fast); the lottery ticket (a ₹20 option feels cheap and the big payoff is vivid; the odds are not); other people's screenshots (people post their wins, rarely their losses).",
        "Name sources only for the ideas they are known for, paraphrased, no quotes and no numbers: Kahneman and Tversky for loss aversion; Barber and Odean for households that traded most earning least after costs (US data).",
        "The mistake card: a thinking trap, told as a short kind scene of another trader (not Karthik) reading one winning week as proof of skill; never mocking, never a judgement of the person.",
        "The chapter only names the pulls so the reader can see them; no advice to stop or keep trading.",
      ],
      blocks: TEACH_MISTAKE, proof: "scenario" }),
    day({ title: "Read any F&O pitch in 2 minutes", covers: "Five questions that show the odds behind any tip, course, screenshot or \"sure-shot\" group.", outcome: "You can run any F&O pitch through five questions and say what odds sit behind it.",
      hook: "\"90% accuracy, ₹40,000 a day.\" Five questions show what that message leaves out.",
      needs: [
        "The five questions, built from chapters 1 to 6: What is one lot's full value, not the deposit? What does a 1% move make or lose, as a share of the money put in? What does a month of orders cost? For an option, how far must Nifty move, and by when, just to break even? What does SEBI's latest study say about people doing this?",
        "Karthik runs them on an invented message from a paid tips group promising \"90% accuracy\": what the numbers show and what the message leaves out. As a fact to confirm in the research brief: SEBI publishes a list of registered investment advisers and research analysts, and anyone selling tips or advice for a fee should be on it.",
        "Who to ask before acting: a SEBI-registered investment adviser. The chapter ends on understanding the odds, never on whether to trade.",
        "This is the last chapter: the In one breath card ends with what the reader can now do and one next step (read SEBI's study itself, or a real contract note), with no Next: line.",
      ],
      blocks: TEACH, proof: "scenario" }),
  ],
};
