import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    clientId: v.id("users"),
    items: v.array(v.object({
      title: v.string(),
      description: v.string(),
      dueDate: v.string(),
    })),
    assignedEmployeeIds: v.array(v.id("users")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject as any;
    return await ctx.db.insert("requirements", {
      ...args,
      salesPersonId: userId || ("0" as any),
    } as any);
  },
});

export const listForClient = query({
  args: { clientId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("requirements")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("requirements")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const setStatus = mutation({
  args: { id: v.id("requirements"), status: v.union(v.literal("approved"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
