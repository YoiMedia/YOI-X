import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    task_number: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    requirement_id: v.id("requirements"),
    assigned_to: v.optional(v.id("users")),
    subtasks: v.optional(v.any()), // JSON
    priority: v.optional(v.string()),
    status: v.string(),
    progress: v.number(),
    created_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

export const listByRequirement = query({
  args: { requirement_id: v.id("requirements") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_requirement_id", (q) =>
        q.eq("requirement_id", args.requirement_id),
      )
      .collect();
  },
});

export const listForEmployee = query({
  args: { employeeId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_assigned_to", (q) => q.eq("assigned_to", args.employeeId))
      .collect();
  },
});

export const listByProject = query({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    // 1. Get requirements for this project
    // Note: iterating/filtering because no index on project_id yet
    const requirements = await ctx.db
      .query("requirements")
      .filter((q) => q.eq(q.field("project_id"), args.project_id))
      .collect();

    if (requirements.length === 0) return [];

    // 2. Get tasks for each requirement
    const tasks = await Promise.all(
      requirements.map(async (req) => {
        return await ctx.db
          .query("tasks")
          .withIndex("by_requirement_id", (q) =>
            q.eq("requirement_id", req._id),
          )
          .collect();
      }),
    );

    return tasks.flat();
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updated_at: Date.now(),
    });
  },
});

export const askQuestion = mutation({
  args: {
    task_id: v.id("tasks"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    directed_to: v.optional(v.array(v.id("users"))),
    attachments: v.optional(v.array(v.string())),
    asked_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("task_questions", {
      ...args,
      status: "open",
      created_at: now,
      updated_at: now,
    });
  },
});

export const respondToQuestion = mutation({
  args: {
    id: v.id("task_questions"),
    response: v.string(),
    responded_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      response: args.response,
      responded_by: args.responded_by,
      responded_at: Date.now(),
      status: "resolved",
      updated_at: Date.now(),
    });
  },
});
