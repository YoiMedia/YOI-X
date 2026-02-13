import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword, verifyPassword } from "./auth";

export const create = mutation({
  args: {
    full_name: v.string(),
    username: v.string(),
    email: v.string(),
    phone: v.string(),
    alternate_phone: v.optional(v.string()),
    password: v.string(),
    role: v.string(),
    website: v.optional(v.string()),
    address: v.optional(v.any()),
    profile_image: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    created_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existingUsername) throw new Error("Username already exists");

    // Check if email already exists
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existingEmail) throw new Error("Email already exists");

    const now = Date.now();
    const hashedPassword = await hashPassword(args.password);

    return await ctx.db.insert("users", {
      full_name: args.full_name,
      fullname: args.full_name, // Maintain for legacy compatibility for now
      username: args.username,
      email: args.email,
      phone: args.phone,
      alternate_phone: args.alternate_phone,
      password: hashedPassword,
      role: args.role,
      website: args.website,
      address: args.address,
      profile_image: args.profile_image,
      is_active: args.is_active ?? true,
      created_at: now,
      updated_at: now,
      created_by: args.created_by,
    });
  },
});

export const login = mutation({
  args: {
    email: v.string(), // This serves as the generic identifier (email or username)
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Try finding by email first
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    // If not found, try finding by username
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.email))
        .first();
    }

    if (!user) throw new Error("User not found");
    if (!user.is_active) throw new Error("Account is inactive");

    const isValid = await verifyPassword(args.password, user.password);
    if (!isValid) throw new Error("Invalid password");

    await ctx.db.patch(user._id, { last_login: Date.now() });

    return user;
  },
});

export const list = query({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.role) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role))
        .collect();
    }
    return await ctx.db.query("users").collect();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// For backward compatibility with the DataContext skip pattern during revert
export const viewer = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});
