import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ==================== QUERIES ====================

export const listClients = query({
    args: {
        salesPersonId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        let clients;
        if (args.salesPersonId) {
            clients = await ctx.db
                .query("clients")
                .withIndex("bySalesPersonId", (q) => q.eq("salesPersonId", args.salesPersonId))
                .collect();
        } else {
            clients = await ctx.db.query("clients").collect();
        }

        // Fetch user details for each client
        const clientsWithUsers = await Promise.all(
            clients
                .filter(client => !client.isDeleted)
                .map(async (client) => {
                    const user = await ctx.db.get(client.userId);
                    return { ...client, user };
                })
        );

        return clientsWithUsers;
    },
});

export const getClientByUserId = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("clients")
            .withIndex("byUserId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

export const getClientById = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        const client = await ctx.db.get(args.clientId);
        if (!client || client.isDeleted) return null;

        const user = await ctx.db.get(client.userId);
        return { ...client, user };
    },
});

// ==================== MUTATIONS ====================

export const createClientEntry = internalMutation({
    args: {
        userId: v.id("users"),
        salesPersonId: v.id("users"),
        companyName: v.string(),
        industry: v.optional(v.string()),
        companySize: v.optional(
            v.union(
                v.literal("5"),
                v.literal("1-10"),
                v.literal("11-50"),
                v.literal("51-200"),
                v.literal("201-500"),
                v.literal("501+")
            )
        ),
        status: v.union(
            v.literal("lead"),
            v.literal("prospect"),
            v.literal("active"),
            v.literal("inactive"),
            v.literal("churned")
        ),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const uniqueClientId = `CL-${Math.floor(1000 + Math.random() * 9000)}`;

        return await ctx.db.insert("clients", {
            ...args,
            uniqueClientId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const createUserForClient = internalMutation({
    args: {
        fullName: v.string(),
        email: v.string(),
        phone: v.string(),
        username: v.string(),
        website: v.string(),
        address: v.object({
            street: v.string(),
            city: v.string(),
            state: v.string(),
            zipCode: v.string(),
            country: v.string(),
        }),
        createdBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", {
            ...args,
            role: "client",
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const updateClient = mutation({
    args: {
        clientId: v.id("clients"),
        companyName: v.optional(v.string()),
        industry: v.optional(v.string()),
        status: v.optional(v.any()), // Use any or specific literals
        notes: v.optional(v.string()),
        // User details
        fullName: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        address: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const client = await ctx.db.get(args.clientId);
        if (!client) throw new Error("Client not found");

        const { clientId, fullName, email, phone, website, address, ...clientData } = args;

        // Update client table
        await ctx.db.patch(clientId, {
            ...clientData,
            updatedAt: Date.now(),
        });

        // Update users table
        if (fullName || email || phone || website || address) {
            await ctx.db.patch(client.userId, {
                ...(fullName && { fullName }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(website && { website }),
                ...(address && { address }),
                updatedAt: Date.now(),
            });
        }
    },
});
