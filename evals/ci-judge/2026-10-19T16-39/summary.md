# Shelf judge: Anthropic direct vs Cheaper Inference (19 Oct, dev)

Same request both ways: JUDGE prompt (evalModels.ts), Opus 5.5, effort high, 16,000 tokens. Script: scripts/ci-judge.mjs. 25 of 25 calls succeeded.

Agreement on 7 chapter 1s (12 yes/no checks each), average checks matching:
- direct vs direct: 11.3 of 12
- direct vs Cheaper Inference: 11.3 and 11.1 of 12
Scores out of 12 (direct, direct, CI): mutual funds 4 4 5; swimming 5 6 5; git 4 4 5; photosynthesis 8 8 7; kubernetes 6 6 5; spanish 6 4 5; income tax 6 6 6.

Planted mistakes (13 in "Indian stock market basics" chapter 1), counted by hand from dubious_claims
(the scorer in results.json missed "8:40" and over-counted the quiz key; fixed in the script after this run):
- direct: 13 and 11 (missed the 8:30 opening time and the 300 - 100 = 400 sum, once)
- Cheaper Inference: 11 and 11 (missed the wrong quiz answer key both times; the 8:30 time once, the 400 sum once)

Per call at list prices (Opus 5.5 $4/$20; CI $2.62/$13.08; Rs 84 a dollar): direct Rs 3.16, CI Rs 1.80.
Median time: direct 17.4 s, CI 14.8 s. Output tokens: direct 1,499 average, CI 1,250 (about 17% fewer).
CI applied no optimisation (x-ci-techniques empty), no cache hits, accepted Anthropic's fallback beta.
