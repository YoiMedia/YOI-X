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

        // Fetch user details and filter out:
        // - soft-deleted clients
        // - clients who haven't completed their profile yet (invisible system-wide)
        const clientsWithUsers = await Promise.all(
            clients
                .filter(client => !client.isDeleted)
                .map(async (client) => {
                    const user = await ctx.db.get(client.userId);
                    return { ...client, user };
                })
        );

        // Only return clients whose user has completed onboarding
        return clientsWithUsers.filter(c => c.user?.profileCompleted === true);
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

        // Treat as non-existent if profile not yet completed
        if (!user || user.profileCompleted !== true) return null;

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
        createdBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", {
            ...args,
            role: "client",
            isActive: true,
            profileCompleted: false,
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
        status: v.optional(v.any()),
        notes: v.optional(v.string()),
        // User details
        fullName: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        phoneNumbers: v.optional(
            v.array(
                v.object({
                    number: v.string(),
                    label: v.string(),
                })
            )
        ),
        website: v.optional(v.string()),
        address: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const client = await ctx.db.get(args.clientId);
        if (!client) throw new Error("Client not found");

        const { clientId, fullName, email, phone, phoneNumbers, website, address, ...clientData } = args;

        // Update client table
        await ctx.db.patch(clientId, {
            ...clientData,
            updatedAt: Date.now(),
        });

        // Update users table
        if (fullName || email || phone || phoneNumbers || website || address) {
            await ctx.db.patch(client.userId, {
                ...(fullName && { fullName }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(phoneNumbers && { phoneNumbers }),
                ...(website && { website }),
                ...(address && { address }),
                updatedAt: Date.now(),
            });
        }
    },
});

export const completeClientProfile = mutation({
    args: {
        userId: v.id("users"),
        phone: v.string(),
        phoneNumbers: v.optional(
            v.array(
                v.object({
                    number: v.string(),
                    label: v.string(),
                })
            )
        ),
        companyName: v.string(),
        industry: v.optional(v.string()),
        website: v.optional(v.string()),
        address: v.optional(
            v.object({
                street: v.string(),
                city: v.string(),
                state: v.string(),
                zipCode: v.string(),
                country: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const { userId, companyName, industry, ...userFields } = args;

        // Update the user's profile fields
        await ctx.db.patch(userId, {
            ...userFields,
            profileCompleted: true,
            updatedAt: Date.now(),
        });

        // Update the client entry's company details
        const client = await ctx.db
            .query("clients")
            .withIndex("byUserId", (q) => q.eq("userId", userId))
            .unique();

        if (client) {
            await ctx.db.patch(client._id, {
                companyName,
                ...(industry && { industry }),
                updatedAt: Date.now(),
            });
        }
    },
});
