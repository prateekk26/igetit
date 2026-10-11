// Free-ten handbook "Spot what India's past multibaggers had in common" (docs/free-ten.md, pick 7), planned by hand in
// the shape of HOLD_A_ROOM (convex/showcasePlans.ts): one running example through every chapter, a step shown done on
// it, then "Your turn". The riskiest of the ten under SEBI's finfluencer rules: it teaches what past winners shared,
// in hindsight, never how to find the next one. Every title and line here is (agent) copy until Prateek rewrites it.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example. An invented reader and two invented companies, so every number is an example, never real data.
const MEERA = "Meera, 29, a school teacher in Nagpur who opened a demat account last year and keeps seeing \"next multibagger\" posts";
const COMPANY = "Ganga Pumps Ltd (a made-up company)";
// Fixed so the example reads as one company's ten years; the numbers agree with each other
// (profit ₹12 → ₹110 crore ≈ 9.2×, about 25% a year; P/E 20 → about 39 ≈ 2×; 9.2 × 2 ≈ 18×; 6 crore shares × ₹720 = ₹4,320 crore).
const FACTS = `The running example's fixed facts, the same in every chapter. Made-up example, never real data; say so the first time a number appears in the chapter. ${COMPANY} makes water pumps for farms and homes. In 2013: sales ₹150 crore, profit ₹12 crore, 6 crore shares at ₹40 (company value, or market capitalisation, ₹240 crore; P/E 20). In 2023: sales ₹930 crore, profit ₹110 crore, share ₹720 (market capitalisation ₹4,320 crore; P/E about 39). So the share rose 18 times in 10 years, ignoring dividends; profit grew about 25% a year, sales about 20%. Return on capital employed between 22% and 26% every year; debt to equity under 0.2 throughout; cash from operations close to profit most years; the promoters held 60% and pledged none of it. One bad year, 2016 (a drought): sales dipped, profit fell 15%, and the share fell 45% from its high before recovering over the next two years. Its twin, Kaveri Pumps Ltd (also made up), looked similar in 2013 (sales ₹160 crore, profit ₹13 crore, a similar P/E), borrowed to grow sales faster, earned about 9% on its capital, and reached debt to equity of 1.8 by 2017; interest ate its profits in 2018 and 2019, and in 2023 its share was about 70% below its 2013 price.`;
const STEP = `Show this chapter's step done on the running example: ${MEERA}, studying ${COMPANY} and its twin with hindsight, from their annual reports. Show what she finds, in her words, consistent with what earlier chapters showed.`;
const CARE = `Money rules for this chapter: teach what past winners looked like, never how to find the next one. Never name a real company or stock, past or present, as an example or a hint; never give a price or a return for a real share; never predict; never say or hint whether anyone should buy, sell or hold, and never call such a choice a mistake. Patterns are described in general terms and tied only to the works in the plan's sources. Current figures (how many listed companies multiplied, how many demat accounts) come only from the research brief; where it has none, write around it and give no number.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps or drags and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): the same check on a real listed company the reader picks themselves, done from its annual reports (on the company's website or the exchange's filings page), in under 10 minutes. Optional: say so. Never name or suggest a company.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, FACTS, CARE, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}

export const PLAN = {
  topic: "Spot what India's past multibaggers had in common",
  mode: "subject",
  body: false,
  format: "course",
  caution: "money",
  goal: "Understand what India's past multibaggers had in common and check a company's last 10 years for those traits, knowing how rare they are",
  outcome7: "By day 7 you'll check any listed Indian company's last 10 years for the traits past multibaggers shared, and say honestly what that check can and can't tell you.",
  picture: null,
  pictureWhyNot: "a running example (Meera studying the made-up Ganga Pumps and its twin Kaveri Pumps) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${MEERA}, studying ten years of ${COMPANY}, whose share rose 18 times, and its made-up twin Kaveri Pumps, which looked the same in 2013 and sank. Each chapter teaches one trait, shows it in the two companies' numbers, then hands the reader "Your turn" on a real company they pick. Value comes early: in chapter 1 the reader splits an 18-times rise into its two causes. Each chapter is under 5 minutes.`,
  sources: [
    { who: "Saurabh Mukherjea, Rakshit Ranjan and Pranab Uniyal", what: "Coffee Can Investing: The Low-Risk Road to Stupendous Wealth", why: "Indian companies with steady revenue growth and high return on capital, year after year" },
    { who: "Christopher W. Mayer", what: "100 Baggers: Stocks That Return 100-to-1 and How to Find Them", why: "a study of shares that rose 100 times: earnings growth together with a rising P/E, and long holding" },
    { who: "Peter Lynch with John Rothchild", what: "One Up on Wall Street", why: "the word \"tenbagger\", and the idea that over the long run a share price follows the company's earnings" },
  ],
  next: ["Read a company's annual report", "Tell a good IPO from hype", "Why 9 in 10 F&O traders lose money"],
  chapters: [
    day({ title: "Where 18 times came from", readMinutes: 3, covers: "A share that rose 18 times in 10 years did it with two engines: profit growth, and the price the market pays for that profit. See how they multiply.", outcome: "You can split any share's rise into its profit growth and the change in its P/E.",
      hook: "Ganga Pumps' share rose 18 times. Its profit rose 9 times. Where did the rest come from?",
      needs: [
        "Before the Try it card, each word in one plain sentence: multibagger (a share that rises many times its price; the word grew from Peter Lynch's \"tenbagger\", a share that rose ten times), profit (what the company keeps after all costs and tax), P/E (price to earnings: what buyers pay for each ₹1 of a year's profit).",
        "The aha by card 3, through the Try it card (card 3, type \"tryit\"): two sliders on Ganga Pumps' made-up numbers, yearly profit growth (0% to 30%) and the P/E at the end (10 to 60); the page shows how many times the share price grew over 10 years (profit multiple × end P/E ÷ the starting P/E of 20) and marks the moment it passes 10 times. The reader sees that profit growth does most of the work and the P/E can double the result or halve it. Cards 1 and 2 set up the puzzle without solving it.",
        "The example card works Ganga's split: profit ₹12 crore to ₹110 crore (about 9 times) × P/E 20 to about 39 (about 2 times) = about 18 times. Dividends left out.",
        "Close the In one breath card with an optional one-line \"Your turn\": look at a \"multibagger\" post you've saved and ask which of the two engines it talks about (usually neither).",
      ],
      blocks: ["picture", "teach", "tryit", "example", "breath"], proof: "retell" }, { turn: false }),
    day({ title: "Profit that grew year after year", covers: "Steady growth in sales and profit, most years for a decade, is the first trait. How to read 10 years of it.", outcome: "You can read a company's 10-year sales and profit and say how fast and how steadily they grew.",
      hook: "25% a year sounds modest. Over ten years it multiplies profit more than nine times.",
      needs: [
        "Compound annual growth rate or CAGR (the steady yearly rate that gets from the first number to the last) in plain words, with the rule of 72 as a quick check (72 ÷ the yearly rate ≈ years to double: at 25%, about 3 years). Ganga: sales about 20% a year, profit about 25%.",
        "Steady beats lumpy: Ganga had one bad year (2016, a drought), yet sales grew in 9 of 10 years. The trait is growth in most years, not every single year. Sales growing alongside profit is a sturdier sign than profit growing alone, because cost cuts run out.",
        "Where the 10 years live: the company's annual reports, on its website and on the exchange's filings page; many carry a five- or ten-year summary. The mistake card: someone who reads one great year as a trend. The two exercises each give a new set of yearly numbers and ask how fast or how steadily they grew.",
      ],
      blocks: ["picture", "teach", "example", "exercise", "mistake", "exercise", "try", "breath"], proof: "predict" }),
    day({ title: "Return on capital, the engine", readMinutes: 4, covers: "How much profit each ₹100 in the business earns in a year, and why a high figure, put back in, turns growth into compounding.", outcome: "You can read a company's return on capital and say why it limits how fast profit can grow.",
      hook: "Two companies each earn ₹24 crore a year. One needed twice as much money to do it.",
      needs: [
        "Return on capital employed or ROCE (profit before interest and tax ÷ the money tied up in the business: shareholders' money plus borrowings), in plain words: what each ₹100 in the business earns a year. Ganga: 22% to 26% every year; Kaveri: about 9%. Name return on equity or ROE (profit ÷ shareholders' money) once, as its cousin.",
        "Why it compounds: a company earning 24% on its capital that puts its profit back in can grow about 24% a year without borrowing; one earning 8% can't. The Try it after the first teach: the reader picks a return on capital (8%, 15% or 24%) and drags how much of each year's profit is put back in (0 to 100%); the page grows ₹100 for 10 years, so 24% fully reinvested reaches about ₹860 while 8% reaches about ₹216.",
        "Saurabh Mukherjea's Coffee Can Investing looks for Indian companies with steady revenue growth and a high return on capital, year after year, for a decade; give its exact thresholds only if the research brief confirms them.",
      ],
      blocks: ["picture", "teach", "tryit", "example", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "Little debt, clean books", covers: "Why growth bought with borrowed money can stop in one bad year, and three quick checks: debt, cash against profit, and promoter pledges.", outcome: "You can check a company's debt, its cash against its profit, and whether its promoters have pledged shares.",
      hook: "Kaveri Pumps grew faster than Ganga for four years. Then the interest bill came due.",
      needs: [
        "Debt to equity (borrowings ÷ shareholders' money) and interest cover (profit before interest and tax ÷ interest), one line each. Kaveri's story in numbers: borrowed to grow fast, earned about 9% on its capital, debt to equity 1.8 by 2017, interest ate its profits in 2018 and 2019. Ganga stayed under 0.2 and rode out 2016.",
        "Cash from operations (the cash the business actually brought in) against reported profit over several years: when profit keeps rising and cash doesn't, ask why. Ganga's cash stayed close to its profit.",
        "Promoter pledge: when the owners borrow against their own shares, the lender can sell those shares if the price falls, which can push it down further. Where to see it: the shareholding pattern every listed company files with the exchange each quarter. The mistake card: someone who checks profit growth and never looks at the debt.",
      ],
      blocks: ["picture", "teach", "example", "mistake", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "Small start, sensible price", covers: "Room to grow and the price you start from. Why both mattered, and how a high starting P/E can turn 18 times into 6.", outcome: "You can say how much room a company has to grow and how its starting P/E changes the result.",
      hook: "Same company, same profits. Paying three times the P/E turned 18 times into 6.",
      needs: [
        "Small starting size: market capitalisation (share price × number of shares) was ₹240 crore for Ganga in 2013, so it could grow many times before running out of customers; a very large company has to become far larger to do the same. Small also cuts the other way: small companies can fall further and can be hard to sell in a hurry, because fewer people trade them.",
        "The starting P/E as a what-if on the made-up numbers: Ganga bought at P/E 20 in 2013 rose 18 times; the same company with the same profits, bought at P/E 60 (₹120 a share) and ending at the same P/E of about 39, would have risen about 6 times. P/E can also fall: had Ganga's ended at 15, 18 times becomes about 7.",
        "The two exercises each give a new starting P/E, ending P/E or profit multiple and ask what happens to the result.",
      ],
      blocks: ["picture", "teach", "example", "exercise", "teach", "exercise", "try", "breath"], proof: "predict" }),
    day({ title: "The ones nobody lists", readMinutes: 4, covers: "Every list of past multibaggers leaves out the companies that looked the same and went nowhere. Survivorship bias, how rare multibaggers are, and the falls the winners went through.", outcome: "You can spot survivorship bias in a multibagger list and say what a pattern can and can't promise.",
      hook: "Lists of past multibaggers leave out the companies that looked identical and sank.",
      needs: [
        "Survivorship bias (judging only by what survived, because the failures dropped out of sight): a list of past multibaggers is picked after the fact; companies with the same traits that went nowhere, merged or were delisted aren't on it. In 2013 Kaveri looked much like Ganga. How rare multibaggers are: the current figure from the research brief if it has one; if not, say plainly that most listed companies never rise many times, with no number.",
        "The traits describe past winners; they are not a recipe. Companies with strong growth, high return on capital and low debt can still go nowhere for years, because growth slows or the price paid was too high.",
        "The ride: Ganga's share fell 45% in 2016 before the rest of its rise, and in 2016 nobody knew it would recover. The 18 times went only to those who held through that fall; long holding is itself a trait the books report.",
        "The mistake card: a post selling a past pattern as a forecast (\"the next multibagger\"). Anyone paid to give investment advice in India must be registered with SEBI, and registration can be checked on SEBI's website.",
      ],
      blocks: ["picture", "teach", "example", "mistake", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "Your 10-year check", covers: "Six questions on a company's last 10 years, answered from its annual reports, and one honest line on what the answers can't tell you.", outcome: "You can run a 10-year check on any listed Indian company and say what it shows and what it doesn't.",
      hook: "Six questions, ten years of numbers, and one honest line at the end.",
      needs: [
        "The six questions as a checklist (doit, kind checklist): How fast did sales and profit grow over 10 years, and in how many years did they grow? What was the return on capital each year? What are the debt to equity and the interest cover? Has cash from operations kept up with profit? Have the promoters pledged shares? How big is the company today, and how does its P/E compare with its own past?",
        "Meera's check on Ganga using only what was known in 2013, then what it couldn't have shown her: the drought of 2016 and the P/E doubling. Her honest line: \"This shows what the company has done, not what its share will do.\"",
        "Who to ask before acting, in one line: a SEBI-registered investment adviser. Where the numbers are: annual reports on the company's website and the exchange's filings page; the shareholding pattern on the exchange.",
        "On this last chapter, end with what the reader can now do and one next step (reading one annual report end to end); no \"Next:\" line.",
      ],
      blocks: ["picture", "teach", "example", "doit", "try", "breath"], proof: "set" }),
  ],
};
