import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activities").order("desc").collect();
  },
});

export const add = mutation({
  args: {
    actor_name: v.string(),
    actor_initials: v.string(),
    action_text: v.string(),
    timestamp: v.string(),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});
