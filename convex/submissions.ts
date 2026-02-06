import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    clientId: v.id("users"),
    submittedBy: v.id("users"),
    documents: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("submissions", {
      ...args,
      status: "pending",
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
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const listPendingForClient = query({
  args: { clientId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .filter((q) => q.and(
        q.eq(q.field("clientId"), args.clientId),
        q.eq(q.field("status"), "pending")
      ))
      .collect();
  },
});

export const setStatus = mutation({
  args: { 
    id: v.id("submissions"), 
    status: v.union(v.literal("approved"), v.literal("rejected")),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: args.status,
      feedback: args.feedback,
    });
  },
});
