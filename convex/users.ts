import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("byEmail", (q) => q.eq("email", args.email))
            .first();
    },
});

export const listUsers = query({
    args: {
        role: v.optional(v.union(v.literal("admin"), v.literal("sales"), v.literal("employee"))),
    },
    handler: async (ctx, args) => {
        let users;
        if (args.role) {
            users = await ctx.db
                .query("users")
                .withIndex("byRole", (q) => q.eq("role", args.role!))
                .collect();
        } else {
            users = await ctx.db.query("users").collect();
        }

        // Always filter out clients from this view
        return users.filter((user) => user.role !== "client" && !user.isDeleted);
    },
});

// Internal mutation to actually insert the user (after hashing)
export const createUserInternal = internalMutation({
    args: {
        fullName: v.string(),
        username: v.string(),
        email: v.string(),
        phone: v.string(),
        alternatePhone: v.optional(v.string()),
        role: v.union(v.literal("admin"), v.literal("sales"), v.literal("employee")),
        passwordHash: v.string(),
    },
    handler: async (ctx, args): Promise<string> => {
        // Double check existence (safety)
        const existingEmail = await ctx.db
            .query("users")
            .withIndex("byEmail", (q) => q.eq("email", args.email))
            .first();
        if (existingEmail) throw new Error("Email already exists");

        const userId = await ctx.db.insert("users", {
            ...args,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return userId;
    },
});

// Public action to handle hashing and then call the mutation
export const createUser = action({
    args: {
        fullName: v.string(),
        username: v.string(),
        email: v.string(),
        phone: v.string(),
        alternatePhone: v.optional(v.string()),
        role: v.union(v.literal("admin"), v.literal("sales"), v.literal("employee")),
        password: v.string(), // Mandatory now
    },
    handler: async (ctx, args): Promise<string> => {
        const { password, ...userData } = args;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Call the internal mutation
        const result = await ctx.runMutation(internal.users.createUserInternal, {
            ...userData,
            passwordHash,
        });

        return result;
    },
});

export const createClient = action({
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
        companyName: v.string(),
        industry: v.optional(v.string()),
        status: v.union(
            v.literal("lead"),
            v.literal("prospect"),
            v.literal("active")
        ),
        salesPersonId: v.id("users"),
    },
    handler: async (ctx, args): Promise<string> => {
        const { companyName, industry, status, salesPersonId, ...userData } = args;

        // 1. Create the user entry (role client)
        const userId: string = await ctx.runMutation(internal.clients.createUserForClient, {
            ...userData,
            createdBy: salesPersonId,
        });

        // 2. Create the client entry
        const clientId: string = await ctx.runMutation(internal.clients.createClientEntry, {
            userId: userId as any,
            salesPersonId,
            companyName,
            industry,
            status,
        });

        return clientId;
    },
});

// Action to verify login
export const verifyLogin = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = (await ctx.runQuery(api.users.getUserByEmail, { email: args.email })) as Doc<"users"> | null;

        if (!user || user.isDeleted || !user.isActive) {
            throw new Error("Invalid credentials or account disabled");
        }

        if (!user.passwordHash) {
            throw new Error("User has no password set. Please contact support.");
        }

        const isValid = await bcrypt.compare(args.password, user.passwordHash);
        if (!isValid) {
            throw new Error("Invalid email or password");
        }

        // Return user details without passwordHash
        return {
            id: user._id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone
        };
    },
});
