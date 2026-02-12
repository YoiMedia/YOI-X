import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activity_log").order("desc").collect();
  },
});

export const add = mutation({
  args: {
    user_id: v.id("users"),
    action: v.string(),
    entity_type: v.optional(v.string()),
    entity_id: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity_log", {
      ...args,
      created_at: Date.now(),
    });
  },
});

