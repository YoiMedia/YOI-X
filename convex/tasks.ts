import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    requirementId: v.id("requirements"),
    createdBy: v.id("users"),
    assignedEmployeeId: v.id("users"),
    title: v.string(),
    description: v.string(),
    subtasks: v.array(v.object({
      text: v.string(),
      completed: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
      progress: 0,
    });
  },
});

export const listByRequirement = query({
  args: { requirementId: v.id("requirements") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_requirementId", (q) => q.eq("requirementId", args.requirementId))
      .collect();
  },
});

export const listForEmployee = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assignedEmployeeId", (q) => q.eq("assignedEmployeeId", args.employeeId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateProgress = mutation({
  args: { 
    id: v.id("tasks"), 
    subtasks: v.optional(v.array(v.object({ text: v.string(), completed: v.boolean() }))),
    status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    if (updates.subtasks) {
      const completedCount = updates.subtasks.filter(s => s.completed).length;
      const progress = updates.subtasks.length > 0 ? (completedCount / updates.subtasks.length) * 100 : 0;
      await ctx.db.patch(id, { ...updates, progress });
    } else {
      await ctx.db.patch(id, updates);
    }
  },
});

export const createDoubt = mutation({
  args: {
    taskId: v.id("tasks"),
    sentBy: v.id("users"),
    sentTo: v.id("users"),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("doubts", {
      ...args,
      status: "open",
    });
  },
});

export const resolveDoubt = mutation({
  args: { id: v.id("doubts"), response: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      response: args.response,
      status: "resolved",
    });
  },
});
