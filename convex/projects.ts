import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// List all projects
export const list = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();

    // Enrich projects with client names
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.client_id);
        const user = await ctx.db.get(client?.user_id || ("" as any)); // Check if client exists
        // Wait, client table has company_name?
        // Let's check schema for client.
        // client: { company_name: string ... }
        return {
          ...project,
          client: client?.company_name || "Unknown Client",
        };
      }),
    );

    return enrichedProjects;
  },
});

export const listByClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_client_id", (q) => q.eq("client_id", args.client_id))
      .collect();
  },
});

export const listForUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const userId = args.userId;
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user) return [];

    if (user.role === "client") {
      const client = await ctx.db
        .query("clients")
        .withIndex("by_user_id", (q) => q.eq("user_id", userId))
        .unique();

      if (!client) return [];

      return await ctx.db
        .query("projects")
        .withIndex("by_client_id", (q) => q.eq("client_id", client._id))
        .collect();
    }

    // For admins/employees, return all projects (or filter as needed)
    const projects = await ctx.db.query("projects").collect();

    // Enrich with client names logic (copied from list)
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.client_id);
        return {
          ...project,
          client: client?.company_name || "Unknown Client",
        };
      }),
    );

    return enrichedProjects;
  },
});

// Add a new project
export const add = mutation({
  args: {
    name: v.string(),
    client_id: v.id("clients"),
    status: v.string(),
    deadline: v.optional(v.string()),
    value: v.optional(v.string()),
    description: v.optional(v.string()),
    created_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      name: args.name,
      client_id: args.client_id,
      status: args.status,
      deadline: args.deadline,
      value: args.value,
      description: args.description,
      created_by: args.created_by,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

// Remove a project
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
