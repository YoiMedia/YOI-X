import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new feedback
 */
export const createFeedback = mutation({
    args: {
        submissionId: v.optional(v.id("submissions")),
        requirementId: v.optional(v.id("requirements")),
        clientId: v.id("clients"),
        authorId: v.id("users"),
        rating: v.number(),
        comment: v.string(),
        sentiment: v.optional(v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative"))),
        isPublic: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const feedbackId = await ctx.db.insert("feedbacks", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });

        return feedbackId;
    },
});

/**
 * List feedbacks with filtering
 */
export const listFeedbacks = query({
    args: {
        clientId: v.optional(v.id("clients")),
        submissionId: v.optional(v.id("submissions")),
    },
    handler: async (ctx, args) => {
        let feedbacks;

        if (args.clientId) {
            feedbacks = await ctx.db
                .query("feedbacks")
                .withIndex("byClientId", (dbQ) => dbQ.eq("clientId", args.clientId!))
                .collect();
        } else if (args.submissionId) {
            feedbacks = await ctx.db
                .query("feedbacks")
                .withIndex("bySubmissionId", (dbQ) => dbQ.eq("submissionId", args.submissionId!))
                .collect();
        } else {
            feedbacks = await ctx.db.query("feedbacks").collect();
        }

        // Enrich with author info
        return await Promise.all(
            feedbacks.map(async (fb) => {
                const author = await ctx.db.get(fb.authorId);

                return {
                    ...fb,
                    authorName: author?.fullName,
                    authorImage: author?.profileImage,
                };
            })
        );
    },
});
