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
        phoneNumbers: v.optional(
            v.array(
                v.object({
                    number: v.string(),
                    label: v.string(),
                })
            )
        ),
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
        phoneNumbers: v.optional(
            v.array(
                v.object({
                    number: v.string(),
                    label: v.string(),
                })
            )
        ),
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
        salesPersonId: v.id("users"),
    },
    handler: async (ctx, args): Promise<string> => {
        const { salesPersonId, ...userData } = args;

        // Check if email already exists
        const existing = await ctx.runQuery(api.users.getUserByEmail, { email: args.email });
        if (existing) throw new Error("A user with this email already exists.");

        // 1. Create the user entry (role client) — minimal data only
        const userId: string = await ctx.runMutation(internal.clients.createUserForClient, {
            fullName: userData.fullName,
            email: userData.email,
            createdBy: salesPersonId,
        });

        // 2. Create the client entry with a placeholder company name
        const clientId: string = await ctx.runMutation(internal.clients.createClientEntry, {
            userId: userId as any,
            salesPersonId,
            companyName: `${userData.fullName}'s Company`,
            status: "active",
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

// Internal mutation to update password hash
export const updatePasswordInternal = internalMutation({
    args: {
        userId: v.id("users"),
        passwordHash: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            passwordHash: args.passwordHash,
            updatedAt: Date.now(),
        });
    },
});

// Action for superadmin to reset staff password
export const resetUserPassword = action({
    args: {
        superadminId: v.id("users"),
        targetUserId: v.id("users"),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Verify superadmin
        const admin = await ctx.runQuery(api.users.getUserById, { userId: args.superadminId });
        if (!admin || admin.role !== "superadmin") {
            throw new Error("Unauthorized: Only superadmins can reset passwords.");
        }

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(args.newPassword, salt);

        // 3. Update password
        await ctx.runMutation(internal.users.updatePasswordInternal, {
            userId: args.targetUserId,
            passwordHash,
        });

        return { success: true };
    },
});

// Mutation to clear password (for clients)
export const clearUserPassword = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("byEmail", (q) => q.eq("email", args.email))
            .first();

        if (!user) throw new Error("Account not found");
        if (user.role !== "client") throw new Error("Only client passwords can be cleared via this flow.");

        await ctx.db.patch(user._id, {
            passwordHash: undefined,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// Simple query to get user by ID
export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
