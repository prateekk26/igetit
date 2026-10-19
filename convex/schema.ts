import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const level = v.union(v.literal("new"), v.literal("some"));

export default defineSchema({
  ...authTables,

  // One generated handbook per topic per person (or per device before sign-in).
  handbooks: defineTable({
    topic: v.string(),            // the line they typed (plus the clarification answer, if any)
    topicKey: v.string(),         // normalised, for the cache lookup
    level,
    language: v.string(),
    voice: v.optional(v.union(v.literal("friend"), v.literal("straight"), v.literal("stories"))),
    status: v.union(
      v.literal("intent"),        // "What's it for?": waiting for the reader to pick a goal (6 Oct)
      v.literal("planning"),
      v.literal("question"),      // the model asked one clarifying question
      v.literal("ready"),
      v.literal("failed"),
      v.literal("declined"),      // we won't teach this (6 Oct, Prateek: be a good person, push back)
    ),
    question: v.optional(v.string()),
    intents: v.optional(v.any()),               // { question, goals: [{ label, mode }] } offered before the plan
    rebuildOf: v.optional(v.id("library")),     // D42: a fresh write of a shared handbook, started from the review queue; its chapter 1 re-enters the queue
    suggested: v.optional(v.any()),             // D40: a ready or shared handbook offered on the goal screen ({ kind, topic, title, libraryId }); never taken for the reader
    goal: v.optional(v.string()),               // the goal the reader tapped or typed
    mode: v.optional(v.string()),               // "skill" | "story" | "subject" | "decision"
    fromLibrary: v.optional(v.id("library")),   // started from another reader's shared plan and chapter 1
    experimentId: v.optional(v.id("experiments")),   // an A/B test on chapter 1 of this ready topic (6 Oct)
    variant: v.optional(v.string()),            // "a" (current) or "b" (the rewrite)
    pushback: v.optional(v.string()),          // one plain, kind sentence: what we won't teach, why, and what instead
    suggestions: v.optional(v.array(v.string())),
    plan: v.optional(v.any()),    // { topic, outcome7, horizon14, horizon28, picture, chapters[7] }
    ownerToken: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    brief: v.optional(v.any()),
    researchStartedAt: v.optional(v.number()),   // research runs while the reader picks a goal (7 Oct)   // research before writing (research.ts, 7 Oct): format, chapter count, facts, sources, plot, recap, NISM
    goalChosenAt: v.optional(v.number()),       // when they picked, typed or skipped a goal (8 Oct, Tanisha): research starts after it
    // Level check (16 Oct, Prateek): an optional 3-question quiz on the goal screen, typed handbooks only (levelCheck.ts).
    levelQuiz: v.optional(v.any()),             // { questions: [{ idea, q, options[3], answer }] }; answers never leave the server
    levelQuizTries: v.optional(v.number()),     // model calls made for it (at most 2 per handbook)
    levelCheck: v.optional(v.any()),            // { right, of, knows: string[], gaps: string[] }, scored in chooseIntent
    source: v.union(v.literal("live"), v.literal("cache")),
    error: v.optional(v.string()),
    hiddenAt: v.optional(v.number()),   // a duplicate topic found when two devices merged at sign-in; kept, not deleted
    // "I want to learn more" (13 Oct, Prateek): a free next handbook made on the last chapter's Done screen. buildsOn sits
    // on the new one (what the finished one taught, sent to research, the plan and the writer); learnMoreId on the
    // finished one, so each finished handbook gives one free next handbook.
    buildsOn: v.optional(v.object({ handbookId: v.id("handbooks"), topic: v.string(), taught: v.string(), advanced: v.boolean() })),
    learnMoreId: v.optional(v.id("handbooks")),
    replacedBy: v.optional(v.id("handbooks")),   // "Change what you typed" on an unread handbook (UX review 9 Oct): hidden, and no longer counts as the reader's typed one
    planSince: v.optional(v.number()),           // when the current plan write started, so a write that died is seen as stuck (UX review 9 Oct)
    writer: v.optional(v.string()),     // a model pinned for this handbook's plan, chapters, versions and check (abtest.ts)
    test: v.optional(v.any()),          // a blind-test handbook (abtest.ts): { label, startedAt, ch1At, ch2At }; never shared
    createdAt: v.number(),
  })
    .index("by_token", ["ownerToken"])
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"])
    .index("by_topicKey", ["topicKey", "level"])   // readers' copies of a ready topic (setCachePictures, 12 Oct)
    .searchIndex("search_topic", { searchField: "topic", filterFields: ["source"] }),   // /admin's book search (20 Oct)

  chapters: defineTable({
    handbookId: v.id("handbooks"),
    n: v.number(),
    status: v.union(v.literal("writing"), v.literal("ready"), v.literal("failed")),
    stale: v.optional(v.boolean()),          // preferences changed after this was written and before it was read
    askedWhileWriting: v.optional(v.boolean()),   // D96: a member answered "what do you want from it?" while this was being written: stale once saved
    model: v.optional(v.string()),
    variants: v.optional(v.any()),            // masked model comparison: [{ key: "A", model, title, cards, outcomeLine }]
    vote: v.optional(v.string()),             // "A" | "B" | "C" once the person has chosen
    svg: v.optional(v.string()),
    scenes: v.optional(v.array(v.object({ card: v.number(), scene: v.string(), real: v.optional(v.string()) }))),   // picture scenes, written by the fact check (8 Oct, Tanisha); images.ts draws from them
    // Runway pictures, one per teaching card (design/style-anchor.md). Drawn after the chapter is ready.
    pictures: v.optional(v.array(v.object({ card: v.number(), scene: v.string(), storageId: v.optional(v.id("_storage")), credit: v.optional(v.string()), source: v.optional(v.string()) }))),
    picturesStatus: v.optional(v.string()),   // "drawing" | "done" | "failed" | "skipped"
    scoreAskedAt: v.optional(v.number()),   // 18 Oct: when the rubric score was asked for (on first open; handbooks.ts ensureScore)
    quizTiers: v.optional(v.any()),     // { easier: [...], harder: [...] }: one per exercise card, in order (7 Oct)
    recallTiers: v.optional(v.any()),   // the same for recallCards
    factCheck: v.optional(v.object({ status: v.string(), fixes: v.number(), notes: v.array(v.string()), model: v.optional(v.string()), at: v.number() })),  // live chapters: "passed" | "fixed" | "unchecked"
    cacheVersion: v.optional(v.number()),
    title: v.optional(v.string()),
    recallCards: v.optional(v.any()),   // 2 fresh quizzes on this chapter's idea, new examples; shown at the start of a later chapter
    cards: v.optional(v.any()),   // array of cards, exercises include answer/whyNot/reteach (never sent raw to the client)
    outcomeLine: v.optional(v.string()),
    error: v.optional(v.string()),
    writingSince: v.optional(v.number()),   // when this write started; past 15 minutes it died without being marked failed, and Try again restarts it (UX review 9 Oct)
    // 9 Oct (writer v6): what this chapter taught, the terms, names, opener and closing line it used, and any fact it
    // needed but did not have. The next chapter's writer gets the earlier chapters' records as "Already taught".
    ledger: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_handbook_n", ["handbookId", "n"]),

  progress: defineTable({
    handbookId: v.id("handbooks"),
    currentChapter: v.number(),
    currentCard: v.number(),
    currentPart: v.optional(v.number()),   // which frame of that card (a long card is 2 or 3 frames), so a reload lands on the same frame
    chaptersPassed: v.array(v.number()),
    passedExercises: v.array(v.string()),   // "chapter:cardIndex"
    missedExercises: v.array(v.string()),   // "chapter:cardIndex" that needed a second go or were shown the answer
    tomorrowAt: v.optional(v.string()),     // "21:00"
    feedback: v.optional(v.record(v.string(), v.string())),   // chapter number -> "too_easy" | "just_right" | "lost_me" (optional, Done screen)
    // D96 (13 Oct): a member's own words for the next chapter, by the chapter they just finished ("Anything else?", 200 characters).
    feedbackNote: v.optional(v.record(v.string(), v.string())),
    opened: v.optional(v.array(v.object({ n: v.number(), day: v.string() }))),   // chapters opened and the IST day, for the daily reading limits (membership.ts, 7 Oct)
    lastOpenedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_handbook", ["handbookId"]).index("by_lastOpened", ["lastOpenedAt"]),   // D98: "read this week" on /admin

  answers: defineTable({
    handbookId: v.id("handbooks"),
    chapter: v.number(),
    cardIndex: v.number(),
    optionId: v.string(),
    correct: v.boolean(),
    attempt: v.number(),
    recall: v.boolean(),
    auto: v.optional(v.boolean()),   // filled in by auto-play (15 Oct), never the reader's own pick
    at: v.number(),
  }).index("by_handbook", ["handbookId"]),

  // Logged sets (8 Oct): a body-skill chapter is passed by doing the move, not by a quiz. count = reps, seconds or ticks.
  sets: defineTable({
    handbookId: v.id("handbooks"),
    chapter: v.number(),
    cardIndex: v.number(),
    count: v.number(),
    feel: v.union(v.literal("easy"), v.literal("right"), v.literal("hard")),
    at: v.number(),
  }).index("by_handbook", ["handbookId"]),

  reports: defineTable({
    handbookId: v.id("handbooks"),
    chapter: v.number(),
    cardIndex: v.number(),
    optionId: v.optional(v.string()),
    at: v.number(),
  }),

  // How this person wants to be taught. One per signed-in user, or per device before sign-in.
  profiles: defineTable({
    userId: v.optional(v.id("users")),
    deviceToken: v.optional(v.string()),
    persona: v.optional(v.string()),          // "a sharp friend", "a patient teacher", "a dry scientist" ...
    tone: v.optional(v.string()),             // free text, their words: "no fluff", "make me laugh once"
    likes: v.optional(v.array(v.string())),   // chips: stories, metaphors, humour, numbers, straight, examples-from-my-work
    examplesFrom: v.optional(v.string()),     // "my job as a PM", "cricket", "cooking"
    avoid: v.optional(v.string()),            // "no sports examples", "don't quiz me on dates"
    preferredModel: v.optional(v.string()),   // set by the masked comparison
    line: v.string(),                          // the compact rendering sent with every call (about 100 tokens)
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_device", ["deviceToken"]),

  // The two-way street: one question about one card, answered from that card and the chapter title only.
  // Teach it back (optional, 6 Oct): the reader explains the chapter's idea in their own words; a short reply.
  teachBacks: defineTable({
    handbookId: v.id("handbooks"),
    chapter: v.number(),
    text: v.string(),
    status: v.union(v.literal("thinking"), v.literal("ready"), v.literal("failed")),
    verdict: v.optional(v.string()),   // "nailed" | "close" | "not yet"
    got: v.optional(v.string()),
    missed: v.optional(v.string()),
    tip: v.optional(v.string()),
    at: v.number(),
  }).index("by_chapter", ["handbookId", "chapter"]),

  // Explainer figures (15 Oct): Sonnet's decision for one page, by the page's words (figures.ts pageKey); spec null means
  // the page keeps its painting.
  cardFigures: defineTable({ key: v.string(), spec: v.any(), why: v.optional(v.string()), model: v.string(), at: v.number() }).index("by_key", ["key"]),
  // 17 Oct: who is deciding a chapter's figures right now (figures.ts decideChapter). Opening a chapter and drawing its
  // pictures both asked Sonnet at the same moment: 13 of 34 live chapters were decided 2 or 3 times, 0 to 8 s apart.
  figureClaims: defineTable({ key: v.string(), until: v.number() }).index("by_key", ["key"]),

  // A page read aloud (15 Oct, Prateek: "a female voice to read out with emotions and intonation"): Gemini's speech,
  // stored once per exact text and voice, so every reader of a shared page plays the same file.
  pageAudio: defineTable({
    key: v.string(),
    storageId: v.id("_storage"),
    ms: v.number(),
    chars: v.number(),
    at: v.number(),
    // Play logging (19 Oct, Prateek: "add play logging for voice clips and we will see how many ahead pages would help"):
    // made "ahead" (k pages ahead of the page being read, 0 = that page) or on a "play" tap; plays counted. No reader data.
    made: v.optional(v.union(v.literal("ahead"), v.literal("play"))),
    ahead: v.optional(v.number()),
    plays: v.optional(v.number()),
    firstPlayAt: v.optional(v.number()),
  }).index("by_key", ["key"]),

  cardQuestions: defineTable({
    handbookId: v.id("handbooks"),
    chapter: v.number(),
    cardIndex: v.number(),
    question: v.string(),
    answer: v.optional(v.string()),
    sources: v.optional(v.array(v.object({ url: v.string(), title: v.string() }))),
    status: v.union(v.literal("thinking"), v.literal("ready"), v.literal("failed")),
    kept: v.optional(v.boolean()),   // C8 "Keep it here" (15 Oct): the answer stays on its page, shown without opening Ask
    at: v.number(),
  }).index("by_card", ["handbookId", "chapter", "cardIndex"]).index("by_chapter", ["handbookId", "chapter"]),

  // Willingness to pay, week 1: no payment taken, just "keep me going at this price".
  // One row per phone per day it opened the app (India time), for the public /stats page.
  visits: defineTable({
    visitor: v.string(),           // the phone's device token
    day: v.string(),               // "2026-10-05", India time
    source: v.optional(v.string()), // utm_source, else the referring site's name
    at: v.number(),
  })
    .index("by_visitor_day", ["visitor", "day"])
    .index("by_day", ["day"]),

  // The shared library (6 Oct): a typed topic's plan and chapter 1, once a privacy check says it's a general subject.
  // Chapters 2 to 7 stay personal (they adapt to each reader). Reused when someone types the same topic and picks
  // the same kind of goal, or starts it from Explore. Never a reader's name. The owner can unpublish on /admin.
  library: defineTable({
    topicKey: v.string(),
    topic: v.string(),
    level: v.union(v.literal("new"), v.literal("some")),
    goal: v.optional(v.string()),
    mode: v.optional(v.string()),
    plan: v.any(),
    chapter1: v.any(),                 // { title, cards, outcomeLine, svg, pictures, recallCards }
    chapters: v.optional(v.any()),     // { "2": {...}, "3": {...} }: later chapters as readers first unlock them (7 Oct)
    sourceHandbookId: v.id("handbooks"),
    published: v.boolean(),
    pick: v.optional(v.boolean()),     // the owner's pick
    starts: v.number(),
    passes: v.number(),
    why: v.optional(v.string()),       // the privacy check's reason
    createdAt: v.number(),
    // D32 (Prateek, 9 Oct 03:5x): nothing typed goes public by itself. "pending" waits for his Approve on /admin;
    // "rejected" came from the automatic filter (reviewWhy says why) or his Reject; "approved" was his tap.
    review: v.optional(v.string()),
    reviewWhy: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    judge: v.optional(v.any()),        // { score, weakest, why, dubious } from the 6 Oct judge on chapter 1
  })
    .index("by_key", ["topicKey", "level"])
    .index("by_source", ["sourceHandbookId"]),

  // Reminders by web push (6 Oct): one row per phone that said "remind me at 9pm". The reader's local time comes from tzOffsetMin.
  pushSubs: defineTable({
    deviceToken: v.string(),
    endpoint: v.string(),
    keys: v.object({ p256dh: v.string(), auth: v.string() }),
    at: v.string(),                     // "21:00", the reader's local time
    tzOffsetMin: v.number(),            // Date.getTimezoneOffset() on their phone (India: -330)
    handbookId: v.optional(v.id("handbooks")),
    lastSentDay: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_endpoint", ["endpoint"])
    .index("by_device", ["deviceToken"]),

  // Self-improving handbooks (6 Oct): when readers quit a ready topic's chapter 1, Claude diagnoses why and writes a new
  // chapter 1 (B); new readers are split between A and B; B replaces A only if it gets clearly more readers through.
  experiments: defineTable({
    topic: v.string(),
    topicKey: v.string(),
    level: v.union(v.literal("new"), v.literal("some")),
    status: v.union(v.literal("running"), v.literal("promoted"), v.literal("stopped")),
    diagnosis: v.string(),
    lesson: v.string(),
    evidence: v.any(),
    b: v.any(),                         // { title, cards, outcomeLine, pictures? }
    aStarts: v.number(), aPasses: v.number(), bStarts: v.number(), bPasses: v.number(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  }).index("by_topic", ["topic", "level"]),

  // Switches the owner flips on /admin (6 Oct): "provider" = "claude" | "inference" (The Inference Company, deepseek-v4-pro).
  // D37 (Prateek, 9 Oct 13:5x: "Enable me to enter and save the fixed cost values"): the owner's fixed costs, for the
  // money section of /admin. Monthly ones run from "from" to "to" (or today); one-offs count once on "from".
  fixedCosts: defineTable({
    name: v.string(),
    amount: v.number(),                       // rupees
    kind: v.union(v.literal("monthly"), v.literal("once")),
    from: v.string(),                         // "2026-10-01"
    to: v.optional(v.string()),
    note: v.optional(v.string()),
    at: v.number(),
  }),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
    at: v.number(),
  }).index("by_key", ["key"]),

  // What people do on the page, for the owner-only /admin funnel (6 Oct): landing seen, sections scrolled into view,
  // box tapped and typed in, how a handbook was started, plan seen, chapter opened. A device token, never a name;
  // typed topics stay in handbooks, never copied here.
  events: defineTable({
    visitor: v.string(),
    name: v.string(),
    props: v.optional(v.record(v.string(), v.union(v.string(), v.number()))),
    day: v.string(),
    at: v.number(),
  })
    .index("by_day", ["day"])
    .index("by_visitor", ["visitor"]),

  // D100 (13 Oct, Prateek): "How was chapter N?", 1 to 5 stars, on the slide after a chapter's last card. One row per
  // copy and chapter (a second tap replaces it). key says which Shelf book it was ("lib:<id>", "topic:<topic>") or
  // "typed"; ours marks our own phones and accounts, left out of every average.
  chapterStars: defineTable({
    handbookId: v.id("handbooks"),
    n: v.number(),
    stars: v.number(),
    key: v.string(),
    ours: v.boolean(),
    at: v.number(),
  })
    .index("by_handbook_n", ["handbookId", "n"])
    .index("by_key", ["key"]),

  // Phones and accounts their owner asked us not to count (Prateek's own). Anyone can only exclude themselves.
  statsExcluded: defineTable({
    deviceToken: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    at: v.number(),
  }),

  // Our Instagram and X accounts' numbers for one day, shown on /stats (8 Oct). Typed in from each app's insights
  // ("typed") until the APIs are connected ("api"). One row per platform per day.
  socialDaily: defineTable({
    day: v.string(),
    platform: v.union(v.literal("instagram"), v.literal("x")),
    posts: v.optional(v.number()),
    views: v.optional(v.number()),          // Instagram views, X impressions
    reach: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),       // Instagram comments, X replies
    shares: v.optional(v.number()),         // Instagram shares (sends), X reposts
    saves: v.optional(v.number()),          // Instagram saves, X bookmarks
    follows: v.optional(v.number()),
    profileVisits: v.optional(v.number()),
    linkClicks: v.optional(v.number()),
    via: v.union(v.literal("typed"), v.literal("api")),
    at: v.number(),
  }).index("by_platform_and_day", ["platform", "day"]),

  priceIntents: defineTable({
    userId: v.optional(v.id("users")),
    deviceToken: v.optional(v.string()),
    handbookId: v.optional(v.id("handbooks")),
    price: v.number(),
    at: v.number(),
    freeMonths: v.optional(v.number()),   // retired 6 Oct (first-25 offer removed); kept so old dev rows still load
    claimedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_device", ["deviceToken"]),

  // Razorpay payments (6 Oct). One row per order; "paid" only after Razorpay's signature checks out.
  // 18 Oct (Prateek: "member, give it 30 days"): membership given without a payment, for a shared test account. Never a
  // payment row, so the early-bird tiers count only people who paid (pricing.ts TIERS). membership.ts memberUntil reads it.
  grants: defineTable({ userId: v.id("users"), until: v.number(), why: v.string(), at: v.number() }).index("by_user", ["userId"]),
  payments: defineTable({
    userId: v.id("users"),
    amount: v.number(),                  // rupees
    month: v.number(),                   // how many payments this person made before this one
    plan: v.optional(v.union(v.literal("month"), v.literal("year"))),   // since 7 Oct; older rows are months
    days: v.optional(v.number()),        // days this payment covers: 30 or 365
    tier: v.optional(v.number()),        // early-bird tier, 0-based (pricing.ts TIERS)
    status: v.union(v.literal("created"), v.literal("paid"), v.literal("failed")),
    mode: v.union(v.literal("test"), v.literal("live")),
    orderId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    via: v.optional(v.string()),         // "checkout" or "webhook": who confirmed it first
    at: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_order", ["orderId"]),

  modelVotes: defineTable({
    handbookId: v.id("handbooks"),
    chapter: v.number(),
    userId: v.optional(v.id("users")),
    deviceToken: v.optional(v.string()),
    picked: v.string(),                        // model id behind the letter they tapped
    options: v.array(v.string()),              // the three model ids, in A/B/C order
    at: v.number(),
  }),

  // Every model call, so the last 100 can be read.
  // The shelf (7 Oct): one light row per ready topic and shared handbook, for the pages every visitor loads (shelf.ts).
  shelf: defineTable({
    kind: v.union(v.literal("ready"), v.literal("shared")),
    topic: v.string(), key: v.string(), title: v.string(), level: v.string(),
    mode: v.optional(v.string()), goal: v.optional(v.string()), outcome: v.string(),
    cover: v.optional(v.id("_storage")),
    trendingWeek: v.optional(v.string()), addedAt: v.number(), improvedAt: v.optional(v.number()),
    stories: v.optional(v.any()),
    libraryId: v.optional(v.id("library")), pick: v.optional(v.boolean()), published: v.boolean(),
    // D34 (Prateek, 9 Oct: "clean up the Shelf, keep only the best"): a ready topic the owner took off the Shelf, and why.
    // A shared handbook is taken off through its library row instead (published false, review "rejected").
    offShelf: v.optional(v.boolean()), offWhy: v.optional(v.string()),
    // D34a (Prateek, 9 Oct: "funny award categories for the creative handbooks people are requesting"): the owner's award,
    // shown in the Awards row of the Shelf. Copy is his; the agent's first set is a placeholder.
    award: v.optional(v.object({ title: v.string(), line: v.string() })),
    section: v.optional(v.string()),   // D35: the subject shelf (shelfSections.ts), set by shelf.classify or the owner
    order: v.optional(v.number()),
    free: v.optional(v.boolean()),   // D99: the owner made this ready handbook free (true) or took it off free (false); unset: freeTen.ts decides
    readWeek: v.optional(v.number()),   // D98: readers' copies opened in the last 7 days, recounted hourly (shelf.countReadWeek)   // 13 Oct: the book's place on its shelf, set by the owner on /admin; unset books follow
    // C12 (14 Oct): "5 chapters · 35 min" under each book: the plan's chapter count and its minutes (the plan's own per
    // chapter, else 5 a chapter, the average). Set by syncReady and syncShared; old rows by shelf.fillLengths.
    chapters: v.optional(v.number()), minutes: v.optional(v.number()),
    starts: v.number(), passes: v.number(),
    // 18 Oct: starts per India day, the last 8 days, so the home page's "this week" reads no handbooks (shelf.countReady).
    startsByDay: v.optional(v.record(v.string(), v.number())),
  }).index("by_topic_kind", ["topic", "kind"]).index("by_library", ["libraryId"]).index("by_kind", ["kind"]),

  // Estimated spend per IST day, model and job (costs.ts, 7 Oct): what /admin's cost view reads.
  costDaily: defineTable({
    day: v.string(),
    provider: v.string(),
    model: v.string(),
    kind: v.string(),
    calls: v.number(),
    failed: v.number(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    inr: v.number(),
  }).index("by_day_model_kind", ["day", "model", "kind"]),

  // D73 (11 Oct): owner alerts on a failure or cost spike (convex/watch.ts), shown on /admin until acknowledged.
  alerts: defineTable({ kind: v.string(), at: v.number(), message: v.string(), value: v.number(), threshold: v.number(), ackedAt: v.optional(v.number()) }).index("by_at", ["at"]),
  // D72 (11 Oct): rubric scores, one row per lever per chapter (convex/rubric.ts). level 1 to 5, or null when the scorer
  // can't tell; quote is the line it scored, so a reader can check it in seconds.
  scores: defineTable({
    handbookId: v.id("handbooks"), n: v.number(), lever: v.string(), level: v.union(v.number(), v.null()),
    quote: v.string(), why: v.string(), model: v.string(), rubric: v.string(), at: v.number(),
  }).index("by_handbook_n", ["handbookId", "n"]).index("by_at", ["at"]),
  // D75 (11 Oct): the owner's own levels on chapters the scorer graded, to check the scorer (Advanced evals, "Check your
  // scorer"): one row per lever per chapter; note is the owner's one line on the first thing that went wrong.
  humanScores: defineTable({
    handbookId: v.id("handbooks"), n: v.number(), lever: v.string(), level: v.union(v.number(), v.null()), note: v.optional(v.string()), by: v.string(), at: v.number(),
  }).index("by_handbook_n", ["handbookId", "n"]),
  // D72: the eval test set. list "fix" (fails today, what we work on) or "keep" (passes today; one failure blocks a release).
  evalCases: defineTable({
    name: v.string(), list: v.union(v.literal("fix"), v.literal("keep")), topic: v.string(), level: v.union(v.literal("new"), v.literal("some")),
    goal: v.optional(v.string()), mode: v.optional(v.string()), expect: v.any(), source: v.string(), note: v.optional(v.string()), createdAt: v.number(),
  }).index("by_name", ["name"]),
  // D82 (11 Oct): each eval run's summary, sent by scripts/eval-run.mjs to prod so /admin Evals shows the last test run.
  // Case names, levels and cost only; the typed lines live in evals/cases.json, never a reader's data.
  evalRuns: defineTable({
    stamp: v.string(), at: v.number(), rubric: v.string(), runs: v.number(), full: v.boolean(), gate: v.union(v.literal("pass"), v.literal("fail"), v.literal("baseline")), inr: v.number(), pooled: v.optional(v.any()),
    cases: v.array(v.object({
      name: v.string(), list: v.string(), floorHeld: v.boolean(), passes: v.number(), runs: v.number(), errored: v.boolean(),
      levels: v.array(v.any()), floor: v.any(), expect: v.any(), failedChecks: v.array(v.string()), before: v.union(v.boolean(), v.null()), failed: v.optional(v.boolean()), unsure: v.optional(v.array(v.string())), base: v.optional(v.any()), avg: v.optional(v.any()), drops: v.optional(v.array(v.string())), crashed: v.optional(v.number()),
    })),
  }).index("by_at", ["at"]).index("by_stamp", ["stamp"]),
  aiCalls: defineTable({
    kind: v.string(),
    model: v.string(),
    input: v.string(),
    output: v.string(),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    ms: v.number(),
    ok: v.boolean(),
    error: v.optional(v.string()),
    at: v.number(),
    // Observability (8 Oct, Tanisha): which handbook and chapter the call was for, and how many tries it took (a broken or
    // off-schema reply is asked again inside the same call). All optional: older rows and one-off tools have none.
    handbookId: v.optional(v.id("handbooks")),
    chapter: v.optional(v.number()),
    attempts: v.optional(v.number()),
    cachedIn: v.optional(v.number()),   // Anthropic prompt-cache hits, when caching is on
  }).index("by_at", ["at"]),

  // One small row per AI call (8 Oct, Tanisha): numbers only, no text, so /admin can compute latency and cost live
  // (the full aiCalls row carries prompt and reply text and is too big to scan).
  callStats: defineTable({
    at: v.number(),
    kind: v.string(),
    model: v.string(),
    ms: v.number(),
    ok: v.boolean(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    cachedIn: v.optional(v.number()),
    attempts: v.optional(v.number()),
    handbookId: v.optional(v.id("handbooks")),
    chapter: v.optional(v.number()),
    inr: v.number(),
    paragraphs: v.optional(v.number()),   // D27 (9 Oct): a chapter write's size, so /admin can see short chapters
    words: v.optional(v.number()),
    floorTries: v.optional(v.number()),   // chapter calls needed to clear the length floor (1 = first try)
    bounced: v.optional(v.boolean()),     // it ended on the Opus backup
    bounce: v.optional(v.string()),       // why: "budget" (Gemini's clock), "floor" (too short twice), "error"
  }).index("by_at", ["at"]).index("by_handbook", ["handbookId", "at"]),

  // Pre-generated handbooks (same prompts, run offline) so the link works
  // for these topics even when the live provider is unavailable.
  cache: defineTable({
    topicKey: v.string(),
    level,
    topic: v.string(),
    plan: v.any(),
    chapters: v.array(v.any()),   // chapter objects for n = 1..k
    version: v.optional(v.number()),
    trendingWeek: v.optional(v.string()),   // "2026-10-05": built that week from what's trending on social media
    improvedAt: v.optional(v.number()),     // chapter 1 replaced by an A/B winner (shows "Just improved")
    addedAt: v.optional(v.number()),
    waitStories: v.optional(v.any()),   // D29 (9 Oct): [{ title, frames[], source, storageId? }], written once per ready topic
  }).index("by_key", ["topicKey", "level"]).index("by_topic", ["topic"]),
});
