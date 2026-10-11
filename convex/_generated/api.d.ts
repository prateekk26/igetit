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
import type * as evalModels from "../evalModels.js";
import type * as evalPlanPrompt from "../evalPlanPrompt.js";
import type * as evalResearch from "../evalResearch.js";
import type * as evalResearchPrompt from "../evalResearchPrompt.js";
import type * as evalReview from "../evalReview.js";
import type * as evalShape from "../evalShape.js";
import type * as events from "../events.js";
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
import type * as plans_credit_card from "../plans/credit_card.js";
import type * as plans_english from "../plans/english.js";
import type * as plans_fno from "../plans/fno.js";
import type * as plans_ipo from "../plans/ipo.js";
import type * as plans_lands_your_job from "../plans/lands_your_job.js";
import type * as plans_multibaggers from "../plans/multibaggers.js";
import type * as plans_putting_off from "../plans/putting_off.js";
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
import type * as showcase from "../showcase.js";
import type * as showcasePlans from "../showcasePlans.js";
import type * as social from "../social.js";
import type * as stats from "../stats.js";
import type * as stories from "../stories.js";
import type * as trace from "../trace.js";
import type * as trending from "../trending.js";
import type * as trendingAdmin from "../trendingAdmin.js";
import type * as watch from "../watch.js";
import type * as whyRight from "../whyRight.js";

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
  evalModels: typeof evalModels;
  evalPlanPrompt: typeof evalPlanPrompt;
  evalResearch: typeof evalResearch;
  evalResearchPrompt: typeof evalResearchPrompt;
  evalReview: typeof evalReview;
  evalShape: typeof evalShape;
  events: typeof events;
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
  "plans/credit_card": typeof plans_credit_card;
  "plans/english": typeof plans_english;
  "plans/fno": typeof plans_fno;
  "plans/ipo": typeof plans_ipo;
  "plans/lands_your_job": typeof plans_lands_your_job;
  "plans/multibaggers": typeof plans_multibaggers;
  "plans/putting_off": typeof plans_putting_off;
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
  showcase: typeof showcase;
  showcasePlans: typeof showcasePlans;
  social: typeof social;
  stats: typeof stats;
  stories: typeof stories;
  trace: typeof trace;
  trending: typeof trending;
  trendingAdmin: typeof trendingAdmin;
  watch: typeof watch;
  whyRight: typeof whyRight;
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
