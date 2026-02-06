import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fromId = (await ctx.auth.getUserIdentity())?.subject as any;
    return await ctx.db.insert("notifications", {
      initiatedBy: fromId || ("0" as any),
      sentTo: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      isRead: false,
      link: args.link,
    });
  },
});

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_sentTo", (q) => q.eq("sentTo", args.userId))
      .collect();
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});
