import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword } from "./auth";

// List all employees
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "employee"))
      .collect();
  },
});

// Add a new employee
export const add = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingEmail) throw new Error("Email already exists");

    const hashedPassword = await hashPassword("welcome123");
    const now = Date.now();
    
    // Generate a username from email
    const username = args.email.split('@')[0];

    return await ctx.db.insert("users", {
      full_name: args.name,
      fullname: args.name,
      username: username,
      email: args.email,
      phone: args.phone,
      role: "employee", // Enforce role
      password: hashedPassword,
      is_active: true,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update an employee
export const update = mutation({
  args: {
    id: v.id("users"),
    updates: v.any(), 
  },
  handler: async (ctx, args) => {
    // Allow updating fields. 
    // Ideally we should validate 'updates' but for now relying on strict typing in other places or flexible updates.
    // 'updates' comes from DataContext as 'any'.
    
    const { id, updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });
  },
});

// Remove an employee (mark as inactive or delete)
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    // Permanent delete or soft delete?
    // DataContext calls it "deleteEmployee".
    // Let's delete for now to keep it simple, or `is_active: false`?
    // Schema has `is_active`.
    // Let's just delete for cleanup, or strictly follow "remove".
    await ctx.db.delete(args.id);
  },
});
