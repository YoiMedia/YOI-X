import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    submission_id: v.id("submissions"),
    requirement_id: v.id("requirements"),
    client_id: v.id("clients"),
    overall_rating: v.optional(v.number()),
    quality_rating: v.optional(v.number()),
    timeliness_rating: v.optional(v.number()),
    communication_rating: v.optional(v.number()),
    comments: v.optional(v.string()),
    positives: v.optional(v.array(v.string())),
    improvements: v.optional(v.array(v.string())),
    would_recommend: v.optional(v.boolean()),
    testimonial_permission: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("feedback", {
      ...args,
      submitted_at: now,
      created_at: now,
    });
  },
});

export const listForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_client_id", (q) => q.eq("client_id", args.client_id))
      .collect();
  },
});

export const getBySubmission = query({
  args: { submission_id: v.id("submissions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_submission_id", (q) => q.eq("submission_id", args.submission_id))
      .unique();
  },
});
