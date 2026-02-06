import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const schedule = mutation({
  args: {
    clientId: v.id("users"),
    title: v.string(),
    scheduledAt: v.string(),
    type: v.string(),
    status: v.union(v.literal("scheduled"), v.literal("accepted"), v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject as any;
    return await ctx.db.insert("meetings", {
      title: args.title,
      scheduledAt: args.scheduledAt,
      type: args.type,
      initiatedBy: userId || ("0" as any),
      initiatedFor: args.clientId,
      reason: args.title,
      time: args.scheduledAt,
      notifiedTo: [args.clientId],
      status: args.status,
    });
  },
});

export const getById = query({
  args: { id: v.id("meetings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const setStatus = mutation({
  args: { id: v.id("meetings"), status: v.union(v.literal("accepted"), v.literal("completed"), v.literal("cancelled")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const listForClient = query({
  args: { clientId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetings")
      .withIndex("by_initiatedFor", (q) => q.eq("initiatedFor", args.clientId))
      .collect();
  },
});

export const addOutcome = mutation({
  args: {
    meetingId: v.id("meetings"),
    recordings: v.array(v.string()),
    images: v.array(v.string()),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject as any;
    return await ctx.db.insert("meetingOutcomes", {
      ...args,
      createdBy: userId || ("0" as any),
    });
  },
});
