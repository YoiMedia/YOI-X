import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const countSubmissions = query({
    args: {},
    handler: async (ctx) => {
        const total = await ctx.db.query("submissions").collect();
        const active = total.filter(s => !s.isDeleted);

        // Enrich with user names for clarity
        const enriched = await Promise.all(active.map(async (s) => {
            const submitter = await ctx.db.get(s.submittedBy);
            const client = await ctx.db.get(s.clientId);
            return {
                id: s._id,
                title: s.title,
                submittedBy: submitter ? `${submitter.fullName} (${submitter.role})` : s.submittedBy,
                client: client ? client.companyName : s.clientId,
                status: s.status
            };
        }));

        return {
            count: active.length,
            submissions: enriched
        };
    },
});

export const getUserRole = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        return user ? { id: user._id, name: user.fullName, role: user.role, email: user.email } : null;
    },
});

export const listAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.map(u => ({ id: u._id, name: u.fullName, role: u.role, email: u.email }));
    },
});

export const promoteToAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("byEmail", (q) => q.eq("email", args.email))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, { role: "admin" });
        return `Promoted ${user.fullName} (${user.email}) to admin`;
    },
});
