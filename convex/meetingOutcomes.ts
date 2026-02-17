import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================== MEETING OUTCOMES QUERIES ====================

export const listMeetingOutcomes = query({
    args: {
        meetingId: v.id("meetings"),
        userId: v.optional(v.id("users")),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const outcomes = await ctx.db
            .query("meetingOutcomes")
            .withIndex("byMeetingId", (q) => q.eq("meetingId", args.meetingId))
            .collect();

        // Filter based on privacy and role
        return outcomes.filter(outcome => {
            // If not private, show to everyone
            if (!outcome.isPrivate) return true;

            // If private, only show to the author or same role
            if (args.userId && outcome.authorId === args.userId) return true;
            if (args.role && outcome.role === args.role) return true;

            return false;
        });
    },
});

export const getMeetingOutcome = query({
    args: {
        outcomeId: v.id("meetingOutcomes"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.outcomeId);
    },
});

// ==================== MEETING OUTCOMES MUTATIONS ====================

export const createMeetingOutcome = mutation({
    args: {
        userId: v.id("users"),
        meetingId: v.id("meetings"),
        summary: v.string(),
        actionItems: v.optional(v.array(v.object({
            id: v.string(),
            description: v.string(),
            assignedTo: v.optional(v.id("users")),
            dueDate: v.optional(v.number()),
            completed: v.optional(v.boolean()),
        }))),
        sentiment: v.optional(v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative"))),
        nextSteps: v.optional(v.string()),
        isPrivate: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Get the user to determine their role
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        return await ctx.db.insert("meetingOutcomes", {
            meetingId: args.meetingId,
            authorId: args.userId,
            role: user.role,
            summary: args.summary,
            actionItems: args.actionItems,
            sentiment: args.sentiment,
            nextSteps: args.nextSteps,
            isPrivate: args.isPrivate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const updateMeetingOutcome = mutation({
    args: {
        userId: v.id("users"),
        outcomeId: v.id("meetingOutcomes"),
        summary: v.optional(v.string()),
        actionItems: v.optional(v.array(v.object({
            id: v.string(),
            description: v.string(),
            assignedTo: v.optional(v.id("users")),
            dueDate: v.optional(v.number()),
            completed: v.optional(v.boolean()),
        }))),
        sentiment: v.optional(v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative"))),
        nextSteps: v.optional(v.string()),
        isPrivate: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const outcome = await ctx.db.get(args.outcomeId);
        if (!outcome) throw new Error("Outcome not found");

        // Verify ownership
        if (outcome.authorId !== args.userId) throw new Error("Not authorized to edit this outcome");

        const { outcomeId, userId, ...updates } = args;

        await ctx.db.patch(outcomeId, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

export const deleteMeetingOutcome = mutation({
    args: {
        userId: v.id("users"),
        outcomeId: v.id("meetingOutcomes"),
    },
    handler: async (ctx, args) => {
        const outcome = await ctx.db.get(args.outcomeId);
        if (!outcome) throw new Error("Outcome not found");

        // Verify ownership
        if (outcome.authorId !== args.userId) throw new Error("Not authorized to delete this outcome");

        await ctx.db.delete(args.outcomeId);
    },
});
