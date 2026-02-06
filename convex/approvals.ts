import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pendingApprovals").collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    client: v.string(),
    urgent: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pendingApprovals", args);
  },
});

export const remove = mutation({
  args: { id: v.id("pendingApprovals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
