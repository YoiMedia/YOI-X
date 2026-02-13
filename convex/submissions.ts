import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    submission_number: v.string(),
    task_id: v.id("tasks"),
    requirement_id: v.id("requirements"),
    client_id: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    deliverables: v.optional(v.array(v.string())),
    status: v.string(),
    submitted_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("submissions", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getById = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByTask = query({
  args: { task_id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_task_id", (q) => q.eq("task_id", args.task_id))
      .collect();
  },
});

export const listPendingForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("client_id"), args.client_id))
      .collect();
  },
});

export const listForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("client_id"), args.client_id))
      .collect();
  },
});

export const review = mutation({
  args: {
    id: v.id("submissions"),
    status: v.string(),
    review_notes: v.optional(v.string()),
    rejection_reason: v.optional(v.string()),
    reviewed_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      review_notes: args.review_notes,
      rejection_reason: args.rejection_reason,
      reviewed_by: args.reviewed_by,
      reviewed_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const requestChanges = mutation({
  args: {
    id: v.id("submissions"),
    change_request_details: v.string(),
    requested_changes: v.optional(v.any()),
    reviewed_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "changes_requested",
      change_request_details: args.change_request_details,
      requested_changes: args.requested_changes,
      reviewed_by: args.reviewed_by,
      reviewed_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});
