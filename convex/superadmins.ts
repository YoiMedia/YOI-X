import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword } from "./auth";

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const superadmin = await ctx.db
      .query("superadmins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!superadmin || superadmin.password !== args.password) {
      throw new Error("Invalid username or password");
    }

    return superadmin;
  },
});

export const getById = query({
  args: { id: v.id("superadmins") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createAccount = mutation({
  args: {
    superadminId: v.id("superadmins"),
    fullName: v.string(),
    email: v.string(),
    username: v.string(),
    password: v.string(),
    role: v.string(), // admin, employee, freelancer
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify superadmin exists
    const admin = await ctx.db.get(args.superadminId);
    if (!admin) throw new Error("Unauthorized: Invalid Superadmin session");

    // Check for existing user
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existingEmail) throw new Error("User with this email already exists");

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (existingUsername) throw new Error("Username already taken");

    const hashedPassword = await hashPassword(args.password);
    const now = Date.now();

    return await ctx.db.insert("users", {
      full_name: args.fullName,
      fullname: args.fullName,
      username: args.username,
      email: args.email,
      phone: args.phone,
      role: args.role,
      password: hashedPassword,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  },
});