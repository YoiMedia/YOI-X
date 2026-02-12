import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";



export const send = mutation({
  args: {
    sent_to: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    action_url: v.optional(v.string()),
    related_entity_type: v.optional(v.string()),
    related_entity_id: v.optional(v.string()),
    initiated_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notifications", {
      ...args,
      is_read: false,
      created_at: now,
    });
  },
});

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_sent_to", (q) => q.eq("sent_to", args.userId))
      .collect();
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      is_read: true,
      read_at: Date.now(),
    });
  },
});

