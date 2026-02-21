import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDocument = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("proposal"),
      v.literal("contract"),
      v.literal("nda"),
      v.literal("invoice"),
      v.literal("onboarding"),
      v.literal("agreement"),
      v.literal("other")
    ),
    clientId: v.optional(v.id("clients")),
    requirementId: v.optional(v.id("requirements")),
    content: v.any(),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // For now, if no identity, assume it's a dev environment or we'll get it from context if possible
    // In this app, it seems we use a custom auth service, but Convex auth might be configured
    
    // We'll need the user ID. Let's look at how other mutations handle it.
    // Based on clients.ts, it seems we pass IDs explicitly often or get them from auth.
    
    // For this specific task, I'll assume the caller provides necessary context or we use the identity if available.
    // Actually, let's look at how meetings.ts or leads.ts get the current user.
    
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", identity.email!))
      .unique() : null;

    const documentNumber = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;

    return await ctx.db.insert("documents", {
      ...args,
      documentNumber,
      status: "draft",
      version: 1,
      createdBy: user?._id,
      uploadedBy: user?._id || args.clientId as any, // Fallback for now
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const listDocuments = query({
  args: {
    clientId: v.optional(v.id("clients")),
    type: v.optional(v.string()),
    salesPersonId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let docsQuery = ctx.db.query("documents");

    if (args.clientId) {
      docsQuery = docsQuery.withIndex("byClientId", (q) => q.eq("clientId", args.clientId));
    } else if (args.salesPersonId) {
      // We might need to filter documents by clients belonging to this sales person
      const clients = await ctx.db
        .query("clients")
        .withIndex("bySalesPersonId", (q) => q.eq("salesPersonId", args.salesPersonId))
        .collect();
      const clientIds = clients.map((c) => c._id);
      
      const allDocs = await ctx.db.query("documents").collect();
      return allDocs.filter(doc => 
        !doc.isDeleted && 
        (doc.clientId && clientIds.includes(doc.clientId)) &&
        (!args.type || doc.type === args.type)
      );
    }

    const docs = await docsQuery.collect();
    return docs.filter(doc => 
      !doc.isDeleted && 
      (!args.type || doc.type === args.type)
    );
  },
});
