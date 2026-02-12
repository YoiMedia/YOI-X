import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";



export const create = mutation({
  args: {
    requirement_name: v.string(),
    requirement_number: v.optional(v.string()),
    client_id: v.id("clients"),
    project_id: v.optional(v.id("projects")),
    requirements: v.any(), // JSON structure (items)
    status: v.string(),
    estimated_budget: v.optional(v.number()),
    sales_person_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const requirement_number = args.requirement_number || `REQ-${Math.floor(Math.random() * 1000000)}`;
    return await ctx.db.insert("requirements", {
      ...args,
      requirement_number,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getById = query({
  args: { id: v.id("requirements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateAssignment = mutation({
  args: {
    id: v.id("requirements"),
    assigned_employees: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assigned_employees: args.assigned_employees,
      updated_at: Date.now(),
    });
  },
});

export const listForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("requirements")
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
      const client = await ctx.db
        .query("clients")
        .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
        .unique();
      
      if (!client) return [];

      return await ctx.db
        .query("requirements")
        .withIndex("by_client_id", (q) => q.eq("client_id", client._id))
        .collect();
    }

    return await ctx.db
      .query("requirements")
      .collect();
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("requirements")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const setStatus = mutation({
  args: { 
    id: v.id("requirements"), 
    status: v.string(),
    approved_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const patch: any = { 
      status: args.status,
      updated_at: Date.now(),
    };
    if (args.status === "approved" && args.approved_by) {
      patch.approved_by = args.approved_by;
      patch.approved_at = Date.now();
    }
    await ctx.db.patch(args.id, patch);
  },
});
