import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Support module using task_questions for client Q&A

export const getClientQuestions = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    // Get all tasks for this client's requirements
    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_client_id", (q) => q.eq("client_id", args.client_id))
      .collect();

    const requirementIds = requirements.map((r) => r._id);

    // Get all tasks for these requirements
    const allQuestions = [];
    for (const reqId of requirementIds) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_requirement_id", (q) => q.eq("requirement_id", reqId))
        .collect();

      for (const task of tasks) {
        const questions = await ctx.db
          .query("task_questions")
          .withIndex("by_task_id", (q) => q.eq("task_id", task._id))
          .collect();

        allQuestions.push(...questions);
      }
    }

    return allQuestions;
  },
});

export const getQuestionById = query({
  args: { id: v.id("task_questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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

export const listOpenQuestions = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    const allQuestions = await ctx.runQuery(
      "support:getClientQuestions" as any,
      {
        client_id: args.client_id,
      },
    );
    return (allQuestions as any[]).filter((q) => q.status === "open");
  },
});

export const listResolvedQuestions = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    const allQuestions = await ctx.runQuery(
      "support:getClientQuestions" as any,
      {
        client_id: args.client_id,
      },
    );
    return (allQuestions as any[]).filter((q) => q.status === "resolved");
  },
});
