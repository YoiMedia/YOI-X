import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    clientId: v.id("users"),
    type: v.union(v.literal("proposal"), v.literal("nda"), v.literal("invoice")),
    content: v.string(), // JSON string or text
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject as any; // Simulated
    return await ctx.db.insert("documents", {
      createdBy: userId || ("0" as any), // Fallback for demo
      sentTo: args.clientId,
      type: args.type,
      isSigned: false,
      fileUrl: "simulated_url",
      content: args.content as any, // Adding content to schema in-memory or using metadata
    } as any);
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_sentTo", (q) => q.eq("sentTo", args.userId))
      .collect();
  },
});

export const sign = mutation({
  args: { id: v.id("documents"), signatureDetails: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isSigned: true,
      signatureDetails: args.signatureDetails,
    });
  },
});
