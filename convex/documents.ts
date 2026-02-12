import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";



export const create = mutation({
  args: {
    client_id: v.id("clients"),
    requirement_id: v.optional(v.id("requirements")),
    type: v.string(),
    title: v.string(),
    document_number: v.string(),
    content: v.any(),
    status: v.string(),
    amount: v.optional(v.number()),
    due_date: v.optional(v.string()),
    created_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      ...args,
      is_signed: false,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_client_id", (q) => q.eq("client_id", args.client_id))
      .collect();
  },
});

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    if (user.role === "client") {
      // Find the client record for this user
      const client = await ctx.db
        .query("clients")
        .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
        .unique();
      
      if (!client) return [];

      return await ctx.db
        .query("documents")
        .withIndex("by_client_id", (q) => q.eq("client_id", client._id))
        .collect();
    }

    // For other roles, return documents they created
    return await ctx.db
      .query("documents")
      .withIndex("by_created_by", (q) => q.eq("created_by", args.userId))
      .collect();
  },
});

export const sign = mutation({
  args: { 
    id: v.id("documents"), 
    signed_by: v.id("users"),
    signature_image_url: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      is_signed: true,
      signed_at: Date.now(),
      signed_by: args.signed_by,
      signature_image_url: args.signature_image_url,
      updated_at: Date.now(),
    });
  },
});
