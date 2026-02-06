/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as approvals from "../approvals.js";
import type * as clients from "../clients.js";
import type * as documents from "../documents.js";
import type * as employees from "../employees.js";
import type * as meetings from "../meetings.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as requirements from "../requirements.js";
import type * as submissions from "../submissions.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  approvals: typeof approvals;
  clients: typeof clients;
  documents: typeof documents;
  employees: typeof employees;
  meetings: typeof meetings;
  notifications: typeof notifications;
  projects: typeof projects;
  requirements: typeof requirements;
  submissions: typeof submissions;
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
