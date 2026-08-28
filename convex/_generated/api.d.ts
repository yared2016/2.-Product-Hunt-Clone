/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authHelper from "../authHelper.js";
import type * as awards from "../awards.js";
import type * as bookmarks from "../bookmarks.js";
import type * as categories from "../categories.js";
import type * as commentUpvotes from "../commentUpvotes.js";
import type * as comments from "../comments.js";
import type * as cronTasks from "../cronTasks.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as launchSubscriptions from "../launchSubscriptions.js";
import type * as notifications from "../notifications.js";
import type * as productUpdates from "../productUpdates.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as upvotes from "../upvotes.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authHelper: typeof authHelper;
  awards: typeof awards;
  bookmarks: typeof bookmarks;
  categories: typeof categories;
  commentUpvotes: typeof commentUpvotes;
  comments: typeof comments;
  cronTasks: typeof cronTasks;
  crons: typeof crons;
  http: typeof http;
  launchSubscriptions: typeof launchSubscriptions;
  notifications: typeof notifications;
  productUpdates: typeof productUpdates;
  products: typeof products;
  seed: typeof seed;
  upvotes: typeof upvotes;
  users: typeof users;
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

export declare const components: {};
