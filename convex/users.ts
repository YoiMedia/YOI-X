import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    fullname: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    altPhone: v.optional(v.string()),
    password: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("sales"), v.literal("employee"), v.literal("client"))),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();
      if (existing) throw new Error("Username already exists");
    }
    
    return await ctx.db.insert("users", args);
  },
});

export const list = query({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.role) {
      return await ctx.db.query("users").filter(q => q.eq(q.field("role"), args.role)).collect();
    }
    return await ctx.db.query("users").collect();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    
    if (!user || user.password !== args.password) {
      throw new Error("Invalid username or password");
    }
    
    return user;
  },
});

export const magicLink = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (!user) throw new Error("No user found with this email");
    
    return user;
  },
});
