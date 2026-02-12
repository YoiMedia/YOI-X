import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    return await Promise.all(
      clients.map(async (client) => {
        const user = await ctx.db.get(client.user_id);
        return {
          ...client,
          user: user ? {
            full_name: user.full_name,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            website: user.website,
            address: user.address,
          } : null,
        };
      })
    );
  },
});


export const add = mutation({
  args: {
    fullName: v.string(),
    username: v.string(),
    email: v.string(),
    phone: v.string(),
    alternatePhone: v.optional(v.string()),
    password: v.string(),
    website: v.optional(v.string()),
    address: v.optional(v.any()),
    companyName: v.string(),
    industry: v.optional(v.string()),
    companySize: v.optional(v.number()),
    salesPersonId: v.id("users"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Validate that the salesPersonId belongs to a freelancer
    const salesPerson = await ctx.db.get(args.salesPersonId);
    if (!salesPerson || salesPerson.role !== "freelancer") {
      throw new Error("Only freelancers can create clients.");
    }

    // 2. Check for existing user
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existingEmail) throw new Error("A user with this email already exists.");

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (existingUsername) throw new Error("This username is already taken.");

    const hashedPassword = await hashPassword(args.password);
    const now = Date.now();

    // 3. Create the user record
    const userId = await ctx.db.insert("users", {
      full_name: args.fullName,
      fullname: args.fullName, // Legacy support
      username: args.username,
      email: args.email,
      phone: args.phone,
      alternate_phone: args.alternatePhone,
      role: "client",
      password: hashedPassword,
      website: args.website,
      address: args.address,
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    // 4. Create the client record
    const uniqueClientId = `CL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const clientId = await ctx.db.insert("clients", {
      user_id: userId,
      sales_person_id: args.salesPersonId,
      company_name: args.companyName,
      industry: args.industry,
      company_size: args.companySize,
      unique_client_id: uniqueClientId,
      status: args.status,
      created_at: now,
      updated_at: now,
    });

    return clientId;
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    updates: v.object({
      // Client table fields
      company_name: v.optional(v.string()),
      industry: v.optional(v.string()),
      company_size: v.optional(v.number()),
      status: v.optional(v.string()),
      // User table fields (mapped from frontend)
      fullName: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      alternatePhone: v.optional(v.string()),
      website: v.optional(v.string()),
      address: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");

    const now = Date.now();

    // 1. Update Client table
    await ctx.db.patch(args.id, {
      company_name: args.updates.company_name,
      industry: args.updates.industry,
      company_size: args.updates.company_size,
      status: args.updates.status,
      updated_at: now,
    });

    // 2. Update User table
    await ctx.db.patch(client.user_id, {
      full_name: args.updates.fullName,
      fullname: args.updates.fullName, // Legacy support
      email: args.updates.email,
      phone: args.updates.phone,
      alternate_phone: args.updates.alternatePhone,
      website: args.updates.website,
      address: args.updates.address,
      updated_at: now,
    });
  },
});

