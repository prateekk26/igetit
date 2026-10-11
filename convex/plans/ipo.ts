// Free-ten handbook "Tell a good IPO from hype" (docs/free-ten.md, pick 5), planned by hand in the shape of HOLD_A_ROOM
// (convex/showcasePlans.ts): one running example through every chapter, a step shown done on it, then "Your turn".
// A money topic: it teaches how to read an IPO, never whether to apply. Every title and line here is (agent) copy
// until Prateek rewrites it.

type Day = { title: string; covers: string; outcome: string; hook: string; needs: string[]; blocks: string[]; proof: string; readMinutes?: number };

// The running example. An invented reader and an invented company, so every number is an example, never real data.
const KAVYA = "Kavya, 24, a junior architect in Bengaluru with ₹15,000 saved and a cousin who forwards her grey market screenshots, looking at her first IPO";
const COMPANY = "Masala Mile Foods Ltd (a made-up company)";
// Fixed so the example reads as one IPO examined from seven sides; the numbers agree with each other
// (₹400 × 12 crore shares = ₹4,800 crore; ÷ ₹60 crore profit = P/E 80; ₹900 crore of ₹1,200 crore = 75% OFS).
const FACTS = `The running example's fixed facts, the same in every chapter. Made-up example, never real data; say so the first time a number appears in the chapter. ${COMPANY} runs 140 cafés in 9 Indian cities, started in 2014. Its IPO: price band ₹380 to ₹400 a share; one lot is 37 shares (₹14,800 at ₹400). Issue size ₹1,200 crore: a fresh issue of ₹300 crore and an offer for sale of ₹900 crore (75%). Sellers: Banyan Growth Fund (also made up), a private equity fund that bought in 2017 at an average ₹62 a share, selling ₹600 crore; the two founders, selling ₹300 crore. The fresh money: ₹180 crore to repay loans, ₹80 crore for 60 new cafés, ₹40 crore for general corporate purposes. Portions: 50% for institutions (QIB), 15% for non-institutional investors (NII), 35% for retail. Anchor investors: ₹360 crore from 18 institutions, the day before the issue opens. Shares after the issue: 12 crore, so the company is valued at ₹4,800 crore at ₹400. Restated numbers for FY24, FY25, FY26: revenue ₹820, ₹950, ₹1,080 crore; profit ₹38, ₹44, ₹60 crore; cash from operations ₹110, ₹96, ₹88 crore; borrowings ₹260 crore before the IPO. P/E at ₹400: 80; the two listed peers the RHP names (called Peer A and Peer B here): 45 and 58. The founders (the promoters) hold 68% before the IPO, about 57% after. Risk factors include: 55% of revenue from Mumbai and Pune; every café on rented premises; a ₹42 crore tax demand under appeal; coffee beans bought from a company owned by the founders' family. Grey market premium in chat groups: ₹95 a week before opening, ₹40 on the closing day. Subscription at close: QIB 62 times, NII 28 times, retail 4.1 times, overall about 26 times. A film star appears in its ads.`;
const STEP = `Show this chapter's step done on the running example: ${KAVYA}, reading the IPO of ${COMPANY}. Show what she finds, in her words, consistent with what earlier chapters showed. Never say whether she applies.`;
const CARE = `Money rules for this chapter: teach how to read an IPO, never what to do. Never say or hint whether anyone should apply, buy, sell or hold; never call a choice to apply or skip a mistake; never name a real company, IPO or stock, past or present, as an example; never predict a listing price or a return. Current figures (SEBI rules, timelines, how many IPOs and how much they raised) come only from the research brief; where it has none, write around it and give no number.`;
const TRYIT = `Include the plan's "tryit" block as a card whose type is exactly "tryit" (not "try"): {"type":"tryit","title":"Try it","idea":"<one line: what the reader taps or drags and what they see>"}. The interactive page is built from the idea line afterwards; the card itself gives no answer away.`;
const TURN = `End with a "Your turn" card (type "try", titled "Your turn"): the same check on a real IPO the reader picks themselves (one open now or listed recently), done from its red herring prospectus on SEBI's website or the exchange's IPO page, in under 10 minutes. Optional: say so. Never name or suggest an IPO.`;

function day(d: Day, extra: { turn?: boolean } = {}) {
  return { ...d, needs: [...d.needs, ...(d.blocks.includes("tryit") ? [TRYIT] : []), STEP, FACTS, CARE, ...(extra.turn === false ? [] : [TURN])], minutes: (d.readMinutes ?? 3) + 2, readMinutes: d.readMinutes ?? 3, pieces: [] as string[], assumes: [] as string[] };
}

export const PLAN = {
  topic: "Tell a good IPO from hype",
  mode: "decision",
  body: false,
  format: "course",
  caution: "money",
  goal: "Tell a good IPO from hype: read an IPO's own documents and see past the grey market buzz, without anyone telling me what to buy",
  outcome7: "By day 7 you'll read any Indian IPO's red herring prospectus for the seven things that matter and write a one-page note on it, before the headlines tell you what to think.",
  picture: null,
  pictureWhyNot: "a running example (Kavya reading the made-up IPO of Masala Mile Foods) carries the handbook instead of an analogy",
  framing: null,
  series: `One running example through all 7 chapters: ${KAVYA}, reading the IPO of ${COMPANY} before deciding anything. Each chapter teaches one check, shows it done on Masala Mile's documents, then hands the reader "Your turn" on a real IPO they pick. Value comes early: in chapter 1 the reader sorts buzz from business and leaves with three questions to ask of any IPO. Each chapter is under 5 minutes.`,
  sources: [
    { who: "Securities and Exchange Board of India (SEBI)", what: "SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018", why: "the rules every Indian IPO follows: what the prospectus must disclose, the investor portions, allotment and lock-ins" },
    { who: "National Stock Exchange of India", what: "Public issue (IPO) pages", why: "where an issue's documents and its subscription by category are published" },
  ],
  next: ["Read a company's annual report", "Spot what India's past multibaggers had in common", "Why 9 in 10 F&O traders lose money"],
  chapters: [
    day({ title: "Buzz or business", readMinutes: 3, covers: "IPO headlines tell you how many people want in. The company's own document tells you what you'd own. Learn to tell them apart.", outcome: "You can sort any IPO fact into buzz or business, and ask the three questions that matter.",
      hook: "\"26 times subscribed\" tells you about the crowd. It says nothing about the company.",
      needs: [
        "Before the Try it card, each word the page uses in one plain sentence: IPO (a company selling its shares to the public for the first time), grey market premium or GMP (an unofficial price people quote before the shares list), times subscribed (shares asked for against shares on offer), red herring prospectus or RHP (the company's own offer document, out before the issue opens).",
        "The aha by card 3, through the Try it card (card 3, type \"tryit\"): six facts about Masala Mile's IPO appear as cards (a GMP of ₹95, 26 times subscribed, a film star in the ads, 75% of the money going to people selling their shares, a P/E of 80 against listed peers at 45 and 58, ₹180 crore of the new money repaying loans); the reader drags each into \"Buzz: how many people want it\" or \"Business: what you'd own\"; the page then shows that the first three are what headlines and chat groups carry and the last three come from the RHP. Cards 1 and 2 set up the question without answering it.",
        "By the end, the reader holds three questions, shown asked about Masala Mile in the example card: Who gets my money, the company or people selling? What am I paying compared with similar listed companies? What does the company itself say could hurt it? Each answer is in the RHP; the coming chapters show where.",
        "Close the In one breath card with an optional one-line \"Your turn\": take the next IPO headline you see and ask which of the three questions it answers (usually none).",
      ],
      blocks: ["picture", "teach", "tryit", "example", "breath"], proof: "retell" }, { turn: false }),
    day({ title: "How an IPO actually works", covers: "From a draft filed with SEBI to shares in your demat account: the steps, who gets which part of the issue, and the lottery for retail shares.", outcome: "You can follow an IPO from its draft to listing day and work out your chance of getting shares.",
      hook: "Applying for an IPO isn't buying. It's entering a lottery, and you might not win.",
      needs: [
        "The steps in order, one line each: the company files a draft red herring prospectus (DRHP) with SEBI; SEBI reviews it; the RHP comes out with the price band (the lowest and highest price a share can be sold at) and the lot size (the smallest number of shares you can apply for); bidding stays open for three working days; you apply through your bank or broker app with ASBA (your money is blocked in your account, not taken, until allotment), usually by approving a UPI request; allotment; listing on NSE and BSE. The current timeline from closing to listing comes from the research brief.",
        "The three portions and who bids in each: qualified institutional buyers or QIBs (mutual funds, insurers, banks, foreign funds); non-institutional investors or NIIs (people and companies bidding above ₹2 lakh); retail (individuals bidding up to ₹2 lakh). Masala Mile's split is in the facts; the general rules on the split come from the research brief.",
        "The retail lottery, as SEBI's rules set it (confirm against the research brief): when the retail portion is oversubscribed, as many applicants as possible get one lot each, picked by a computerised draw. The Try it after the first teach: a slider for how many times the retail portion is subscribed (1 to 50); assuming every applicant asks for one lot, the page shows how many of 100 applicants get a lot (100 ÷ times subscribed), so at Masala Mile's 4.1 times about 24 in 100 do.",
      ],
      blocks: ["picture", "teach", "tryit", "example", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "Who gets your money", covers: "Fresh issue or offer for sale: whether your rupees go to the company to grow, or to existing owners selling out, and what those owners paid.", outcome: "You can find how much of an IPO goes to the company, how much to sellers, and what the sellers paid.",
      hook: "Of every ₹100 paid in Masala Mile's IPO, ₹75 never reaches the company.",
      needs: [
        "Fresh issue (new shares; the money goes to the company) against offer for sale or OFS (existing owners sell their shares; the money goes to them). Neither is good or bad by itself: an OFS is how early investors and founders get paid. The question is what the company gets and what it will do with it.",
        "Where to look in the RHP: the cover page and the section called \"The Offer\" give the split; \"Objects of the Offer\" says what the fresh money is for; the selling shareholders' details include what they paid per share (their average cost of acquisition). Masala Mile's private equity fund bought at ₹62 and sells at up to ₹400. Section names can vary a little; confirm against the research brief.",
        "Promoter holding before and after (Masala Mile's founders: 68% to about 57%), and what a lock-in is: a period after listing when some shareholders can't sell. The current lock-in periods for promoters and others come from the research brief.",
        "The mistake card is about skipping the check, never about a choice: someone who sees a big OFS and calls the IPO a scam without reading why, or someone who never looks at the split at all.",
      ],
      blocks: ["picture", "teach", "example", "mistake", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "Price it against its neighbours", readMinutes: 4, covers: "What the price band says the company is worth, worked out as a P/E, and how that compares with similar listed companies.", outcome: "You can work out an IPO's P/E at the top of its band and compare it with listed peers.",
      hook: "At ₹400 a share, Masala Mile asks you to pay 80 years of today's profit.",
      needs: [
        "Two sums in plain words: the company's value (market capitalisation) = price × total shares after the issue (₹400 × 12 crore = ₹4,800 crore); P/E (price to earnings) = that value ÷ last year's profit (₹4,800 crore ÷ ₹60 crore = 80), which is how many years of today's profit the price adds up to. The Try it after the first teach: a slider moves the price across Masala Mile's band (₹380 to ₹400) and on to ₹450 and ₹500 as a what-if; the page shows the company's value and its P/E on ₹60 crore of profit, next to Peer A at 45 and Peer B at 58.",
        "Where the comparison lives: the RHP's \"Basis for Offer Price\" section lists the peers the company chose and their P/E. The company picks its own peers, and their figures are from an earlier date, so check the peers' P/E today on the exchange's website.",
        "A high P/E is a question, not a verdict: it can mean buyers expect fast growth. Ask what profit would bring the price in line with peers (Masala Mile would need about ₹83 crore to sit at Peer B's 58 at ₹400), then look at the growth it has actually shown (₹38 crore to ₹60 crore in two years). The two exercises each give a new price or profit and ask what happens to the P/E.",
      ],
      blocks: ["picture", "teach", "tryit", "example", "exercise", "mistake", "exercise", "try", "breath"], proof: "predict" }),
    day({ title: "Read the pages they hope you skip", covers: "The risk factors, the court cases and three years of numbers: where they are in the RHP and what to look for in 10 minutes.", outcome: "You can pull the three biggest risks and the money trend out of an RHP in 10 minutes.",
      hook: "The most honest pages of an IPO are the ones its ads never mention.",
      needs: [
        "Risk factors: the section near the front where the company lists what could hurt it. Many lines are standard; look for the ones only this business has. Masala Mile's: 55% of revenue from two cities, every café on rented premises, a ₹42 crore tax demand under appeal, and coffee beans bought from a company the founders' family owns (a related-party transaction: a deal with someone connected to the owners).",
        "Outstanding litigation: the section listing court and tax cases against the company, its promoters and directors. Read each amount against a year's profit (₹42 crore against ₹60 crore).",
        "The restated financial statements, three years: revenue, profit, cash from operations (the cash the business actually brought in) and borrowings. Masala Mile's profit rose from ₹38 crore to ₹60 crore while its cash from operations fell from ₹110 crore to ₹88 crore: teach the reader to ask why, and that the RHP's management discussion is where the company explains it.",
        "End on a 10-minute routine for any RHP: the three most specific risk factors, the biggest case against a year's profit, and whether revenue, profit and cash move the same way.",
      ],
      blocks: ["picture", "teach", "example", "mistake", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "What GMP and subscription can't tell you", covers: "The grey market premium, subscription numbers and anchor investors: what each measures, what it misses, and why listing day is one day.", outcome: "You can read GMP, subscription and anchor news for what they measure and what they don't.",
      hook: "The most quoted number of any IPO trades nowhere official.",
      needs: [
        "GMP: an unofficial price quoted outside the exchanges before listing, with no exchange, no regulator and no record behind it, and easy to move with a few trades or messages. SEBI's own warnings on it come from the research brief. Masala Mile's GMP fell from ₹95 to ₹40 in a week while nothing in its RHP changed.",
        "Subscription by portion (Masala Mile: QIB 62 times, NII 28 times, retail 4.1 times, overall about 26 times): each number is how much one group asked for during three days. It measures demand, not the business. Say that NII bids are often made with borrowed money only if the research brief supports it.",
        "Anchor investors: large institutions given shares the day before the issue opens (Masala Mile: ₹360 crore from 18 of them). Their shares are locked in for a while after listing (confirm the current periods against the research brief); the reader can note the dates those lock-ins end, since more shares can be sold after them.",
        "Listing day's price is what buyers paid on one day. The three questions from chapter 1 have the same answers the day after listing as the day before. The mistake card: someone reading a GMP as a promise of the listing price.",
      ],
      blocks: ["picture", "teach", "example", "mistake", "exercise", "try", "breath"], proof: "scenario" }),
    day({ title: "Your one-page IPO note", covers: "Everything in one page: seven questions answered from the RHP and the exchange, before you decide anything.", outcome: "You can write a one-page note on any Indian IPO from its own documents.",
      hook: "Seven questions, one page, and the buzz stops deciding for you.",
      needs: [
        "The seven questions as a checklist (doit, kind checklist): How much is fresh issue and how much OFS? What will the fresh money do? What did the sellers pay? What is the P/E at the top of the band, against peers checked today? Are revenue, profit and cash moving the same way? Which three risk factors are specific to this business? When do the anchor and promoter lock-ins end?",
        "Kavya's finished note on Masala Mile, every answer taken from earlier chapters, ending with what she still doesn't know and would ask. The handbook never says whether she applies; the choice is hers, and no choice is graded.",
        "Who to ask before acting, in one line: a SEBI-registered investment adviser (registration can be checked on SEBI's website). Where a real IPO's RHP is: SEBI's website lists draft and red herring prospectuses, and NSE and BSE have pages for current issues.",
        "On this last chapter, end with what the reader can now do and one next step (reading a company's annual report once it is listed); no \"Next:\" line.",
      ],
      blocks: ["picture", "teach", "example", "doit", "try", "breath"], proof: "set" }),
  ],
};
