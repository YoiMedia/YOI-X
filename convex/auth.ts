import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import bcrypt from "bcryptjs";

const N8N_WEBHOOK_URL = "https://n8n.yoimedia.fun/webhook/magic/link";

/**
 * Check if an email exists and if it's a client. 
 * Also returns whether they have a password set.
 */
export const checkClientAccess = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("byEmail", (q) => q.eq("email", args.email))
            .first();

        if (!user || user.isDeleted || user.role !== "client") {
            return { exists: false, isClient: false, hasPassword: false };
        }

        return {
            exists: true,
            isClient: true,
            hasPassword: !!user.passwordHash,
            fullName: user.fullName,
            userId: user._id
        };
    },
});

/**
 * Request a magic link for a client.
 * Generates a token, saves it, and sends to n8n.
 */
export const requestMagicLink = action({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.auth.checkClientAccess, { email: args.email });

        if (!user.exists || !user.isClient) {
            throw new Error("Only clients can request a magic link from this page.");
        }

        // Generate a random token
        const token = crypto.randomUUID();
        const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Save token to user record
        await ctx.runMutation(internal.auth.saveMagicLinkToken, {
            userId: user.userId as any,
            token,
            expires
        });

        // Construct the link (In production, this should come from an env var or config)
        // Since I don't know the exact base URL, I'll use a placeholder or assume relative to where the app is hosted
        // For now, let's assume the frontend knows how to construct it, or we send a partial path
        const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify?token=${token}`;

        // Send to n8n
        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: args.email,
                    link: verificationLink
                }),
            });

            if (!response.ok) {
                console.error("n8n webhook failed:", await response.text());
                throw new Error("Failed to send magic link. Please try again later.");
            }
        } catch (error) {
            console.error("Error calling n8n:", error);
            throw new Error("Failed to connect to email service.");
        }

        return { success: true };
    },
});

/**
 * Internal mutation to save the token to the user record.
 */
export const saveMagicLinkToken = internalMutation({
    args: {
        userId: v.id("users"),
        token: v.string(),
        expires: v.number()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            magicLinkToken: args.token,
            magicLinkTokenExpires: args.expires
        });
    }
});

/**
 * Verify if a token is valid.
 */
export const verifyMagicLinkToken = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("magicLinkToken"), args.token))
            .first();

        if (!user) {
            return { valid: false, reason: "invalid" };
        }

        if (user.magicLinkTokenExpires && user.magicLinkTokenExpires < Date.now()) {
            return { valid: false, reason: "expired" };
        }

        return {
            valid: true,
            userId: user._id,
            email: user.email,
            fullName: user.fullName
        };
    },
});

/**
 * Set the password for a client and log them in.
 */
export const setClientPassword = action({
    args: {
        token: v.string(),
        password: v.string()
    },
    handler: async (ctx, args) => {
        // 1. Verify token again (to get userId safely)
        const verification = await ctx.runQuery(api.auth.verifyMagicLinkToken, { token: args.token });
        if (!verification.valid) {
            throw new Error(`Cannot set password: Token is ${verification.reason}`);
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(args.password, salt);

        // 3. Update user and clear token
        await ctx.runMutation(internal.auth.completePasswordSetup, {
            userId: verification.userId as any,
            passwordHash
        });

        // 4. Return user info for immediate login
        return {
            id: verification.userId,
            name: verification.fullName,
            email: verification.email,
            role: "client"
        };
    }
});

/**
 * Internal mutation to update password and clear magic link token.
 */
export const completePasswordSetup = internalMutation({
    args: {
        userId: v.id("users"),
        passwordHash: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            passwordHash: args.passwordHash,
            magicLinkToken: undefined,
            magicLinkTokenExpires: undefined,
            updatedAt: Date.now()
        });
    }
});
