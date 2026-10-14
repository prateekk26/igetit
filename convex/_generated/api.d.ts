/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as abtest from "../abtest.js";
import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as costs from "../costs.js";
import type * as crons from "../crons.js";
import type * as doctor from "../doctor.js";
import type * as evalArtifact from "../evalArtifact.js";
import type * as evalCases from "../evalCases.js";
import type * as evalChapterPrompt from "../evalChapterPrompt.js";
import type * as evalDoOnce from "../evalDoOnce.js";
import type * as evalFigures from "../evalFigures.js";
import type * as evalModels from "../evalModels.js";
import type * as evalPlanPrompt from "../evalPlanPrompt.js";
import type * as evalResearch from "../evalResearch.js";
import type * as evalResearchPrompt from "../evalResearchPrompt.js";
import type * as evalReview from "../evalReview.js";
import type * as evalRuns from "../evalRuns.js";
import type * as evalShape from "../evalShape.js";
import type * as evalWording from "../evalWording.js";
import type * as events from "../events.js";
import type * as figures from "../figures.js";
import type * as freeTen from "../freeTen.js";
import type * as frozen from "../frozen.js";
import type * as handbooks from "../handbooks.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as inkwash from "../inkwash.js";
import type * as landing from "../landing.js";
import type * as langfuse from "../langfuse.js";
import type * as langfuseData from "../langfuseData.js";
import type * as library from "../library.js";
import type * as mail from "../mail.js";
import type * as mailLimits from "../mailLimits.js";
import type * as membership from "../membership.js";
import type * as names from "../names.js";
import type * as nism from "../nism.js";
import type * as observability from "../observability.js";
import type * as payments from "../payments.js";
import type * as pictureCards from "../pictureCards.js";
import type * as pictures from "../pictures.js";
import type * as pipeline from "../pipeline.js";
import type * as plans_ai_work from "../plans/ai_work.js";
import type * as plans_ask_raise from "../plans/ask_raise.js";
import type * as plans_car from "../plans/car.js";
import type * as plans_career_restart from "../plans/career_restart.js";
import type * as plans_child_reading from "../plans/child_reading.js";
import type * as plans_coffee_tasting from "../plans/coffee_tasting.js";
import type * as plans_credit_card from "../plans/credit_card.js";
import type * as plans_english from "../plans/english.js";
import type * as plans_fno from "../plans/fno.js";
import type * as plans_formula_one from "../plans/formula_one.js";
import type * as plans_go_australia from "../plans/go_australia.js";
import type * as plans_go_bali from "../plans/go_bali.js";
import type * as plans_go_dubai from "../plans/go_dubai.js";
import type * as plans_go_japan from "../plans/go_japan.js";
import type * as plans_go_kenya from "../plans/go_kenya.js";
import type * as plans_go_schengen from "../plans/go_schengen.js";
import type * as plans_go_singapore from "../plans/go_singapore.js";
import type * as plans_go_thailand from "../plans/go_thailand.js";
import type * as plans_go_usa from "../plans/go_usa.js";
import type * as plans_go_vietnam from "../plans/go_vietnam.js";
import type * as plans_ipo from "../plans/ipo.js";
import type * as plans_lands_your_job from "../plans/lands_your_job.js";
import type * as plans_meltdown from "../plans/meltdown.js";
import type * as plans_multibaggers from "../plans/multibaggers.js";
import type * as plans_night_sky from "../plans/night_sky.js";
import type * as plans_own_money from "../plans/own_money.js";
import type * as plans_pocket_money from "../plans/pocket_money.js";
import type * as plans_putting_off from "../plans/putting_off.js";
import type * as plans_work_rights from "../plans/work_rights.js";
import type * as polish from "../polish.js";
import type * as posthogAi from "../posthogAi.js";
import type * as pricing from "../pricing.js";
import type * as prompts from "../prompts.js";
import type * as push from "../push.js";
import type * as pushSend from "../pushSend.js";
import type * as ready from "../ready.js";
import type * as repair from "../repair.js";
import type * as repairData from "../repairData.js";
import type * as research from "../research.js";
import type * as rubric from "../rubric.js";
import type * as schemas from "../schemas.js";
import type * as settings from "../settings.js";
import type * as shelf from "../shelf.js";
import type * as shelfSections from "../shelfSections.js";
import type * as shortNames from "../shortNames.js";
import type * as showcase from "../showcase.js";
import type * as showcasePlans from "../showcasePlans.js";
import type * as social from "../social.js";
import type * as stats from "../stats.js";
import type * as stories from "../stories.js";
import type * as trace from "../trace.js";
import type * as trending from "../trending.js";
import type * as trendingAdmin from "../trendingAdmin.js";
import type * as voice from "../voice.js";
import type * as voiceNode from "../voiceNode.js";
import type * as watch from "../watch.js";
import type * as whyRight from "../whyRight.js";
import type * as wordingBackfill from "../wordingBackfill.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  abtest: typeof abtest;
  admin: typeof admin;
  ai: typeof ai;
  analytics: typeof analytics;
  audit: typeof audit;
  auth: typeof auth;
  costs: typeof costs;
  crons: typeof crons;
  doctor: typeof doctor;
  evalArtifact: typeof evalArtifact;
  evalCases: typeof evalCases;
  evalChapterPrompt: typeof evalChapterPrompt;
  evalDoOnce: typeof evalDoOnce;
  evalFigures: typeof evalFigures;
  evalModels: typeof evalModels;
  evalPlanPrompt: typeof evalPlanPrompt;
  evalResearch: typeof evalResearch;
  evalResearchPrompt: typeof evalResearchPrompt;
  evalReview: typeof evalReview;
  evalRuns: typeof evalRuns;
  evalShape: typeof evalShape;
  evalWording: typeof evalWording;
  events: typeof events;
  figures: typeof figures;
  freeTen: typeof freeTen;
  frozen: typeof frozen;
  handbooks: typeof handbooks;
  http: typeof http;
  images: typeof images;
  inkwash: typeof inkwash;
  landing: typeof landing;
  langfuse: typeof langfuse;
  langfuseData: typeof langfuseData;
  library: typeof library;
  mail: typeof mail;
  mailLimits: typeof mailLimits;
  membership: typeof membership;
  names: typeof names;
  nism: typeof nism;
  observability: typeof observability;
  payments: typeof payments;
  pictureCards: typeof pictureCards;
  pictures: typeof pictures;
  pipeline: typeof pipeline;
  "plans/ai_work": typeof plans_ai_work;
  "plans/ask_raise": typeof plans_ask_raise;
  "plans/car": typeof plans_car;
  "plans/career_restart": typeof plans_career_restart;
  "plans/child_reading": typeof plans_child_reading;
  "plans/coffee_tasting": typeof plans_coffee_tasting;
  "plans/credit_card": typeof plans_credit_card;
  "plans/english": typeof plans_english;
  "plans/fno": typeof plans_fno;
  "plans/formula_one": typeof plans_formula_one;
  "plans/go_australia": typeof plans_go_australia;
  "plans/go_bali": typeof plans_go_bali;
  "plans/go_dubai": typeof plans_go_dubai;
  "plans/go_japan": typeof plans_go_japan;
  "plans/go_kenya": typeof plans_go_kenya;
  "plans/go_schengen": typeof plans_go_schengen;
  "plans/go_singapore": typeof plans_go_singapore;
  "plans/go_thailand": typeof plans_go_thailand;
  "plans/go_usa": typeof plans_go_usa;
  "plans/go_vietnam": typeof plans_go_vietnam;
  "plans/ipo": typeof plans_ipo;
  "plans/lands_your_job": typeof plans_lands_your_job;
  "plans/meltdown": typeof plans_meltdown;
  "plans/multibaggers": typeof plans_multibaggers;
  "plans/night_sky": typeof plans_night_sky;
  "plans/own_money": typeof plans_own_money;
  "plans/pocket_money": typeof plans_pocket_money;
  "plans/putting_off": typeof plans_putting_off;
  "plans/work_rights": typeof plans_work_rights;
  polish: typeof polish;
  posthogAi: typeof posthogAi;
  pricing: typeof pricing;
  prompts: typeof prompts;
  push: typeof push;
  pushSend: typeof pushSend;
  ready: typeof ready;
  repair: typeof repair;
  repairData: typeof repairData;
  research: typeof research;
  rubric: typeof rubric;
  schemas: typeof schemas;
  settings: typeof settings;
  shelf: typeof shelf;
  shelfSections: typeof shelfSections;
  shortNames: typeof shortNames;
  showcase: typeof showcase;
  showcasePlans: typeof showcasePlans;
  social: typeof social;
  stats: typeof stats;
  stories: typeof stories;
  trace: typeof trace;
  trending: typeof trending;
  trendingAdmin: typeof trendingAdmin;
  voice: typeof voice;
  voiceNode: typeof voiceNode;
  watch: typeof watch;
  whyRight: typeof whyRight;
  wordingBackfill: typeof wordingBackfill;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
