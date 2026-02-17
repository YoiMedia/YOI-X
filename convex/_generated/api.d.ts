/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as files from "../files.js";
import type * as lib_r2 from "../lib/r2.js";
import type * as meetingOutcomes from "../meetingOutcomes.js";
import type * as meetings from "../meetings.js";
import type * as projects from "../projects.js";
import type * as requirements from "../requirements.js";
import type * as taskQueries from "../taskQueries.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clients: typeof clients;
  files: typeof files;
  "lib/r2": typeof lib_r2;
  meetingOutcomes: typeof meetingOutcomes;
  meetings: typeof meetings;
  projects: typeof projects;
  requirements: typeof requirements;
  taskQueries: typeof taskQueries;
  tasks: typeof tasks;
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
