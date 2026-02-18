import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// QUERIES - Fetch leads from database
// ============================================

/**
 * Get all leads with optional filtering
 */
export const getAllLeads = query({
    args: {
        status: v.optional(v.string()),
        area: v.optional(v.string()),
        profession: v.optional(v.string()),
        searchQuery: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("leads").filter((q) => q.neq(q.field("isDeleted"), true));

        // Filter by status
        if (args.status && args.status !== "all") {
            query = query.filter((q) => q.eq(q.field("status"), args.status));
        }

        // Filter by area
        if (args.area && args.area !== "all") {
            query = query.filter((q) => q.eq(q.field("area"), args.area));
        }

        // Filter by profession
        if (args.profession && args.profession !== "all") {
            query = query.filter((q) => q.eq(q.field("profession"), args.profession));
        }

        // Filter by search query (name, phone, area, profession)
        if (args.searchQuery) {
            const q = args.searchQuery.toLowerCase();
            const results = await query.collect();
            return results.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(q) ||
                    (lead.formattedPhoneNumber && lead.formattedPhoneNumber.includes(q)) ||
                    (lead.area && lead.area.toLowerCase().includes(q)) ||
                    (lead.profession && lead.profession.toLowerCase().includes(q))
            );
        }

        return await query.collect();
    },
});

/**
 * Get a single lead by ID
 */
export const getLeadById = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.leadId);
    },
});

/**
 * Get leads assigned to a specific salesperson
 */
export const getLeadsForSalesperson = query({
    args: { salesPersonId: v.id("users") },
    handler: async (ctx, args) => {
        const assignments = await ctx.db
            .query("leadAssignments")
            .filter((q) => q.eq(q.field("salesPersonId"), args.salesPersonId))
            .collect();

        const leads = [];
        for (const assignment of assignments) {
            const lead = await ctx.db.get(assignment.leadId);
            if (lead && !lead.isDeleted) {
                leads.push({
                    ...lead,
                    assignmentStatus: assignment.status,
                    assignmentNotes: assignment.notes,
                    lastContactedAt: assignment.lastContactedAt,
                    nextFollowUpAt: assignment.nextFollowUpAt,
                });
            }
        }
        return leads;
    },
});

/**
 * Get unique areas and professions for filters
 */
export const getLeadFilterOptions = query({
    handler: async (ctx) => {
        const leads = await ctx.db
            .query("leads")
            .filter((q) => q.neq(q.field("isDeleted"), true))
            .collect();

        const areas = [...new Set(leads.map((l) => l.area).filter(Boolean))];
        const professions = [...new Set(leads.map((l) => l.profession).filter(Boolean))];

        return { areas: areas.sort(), professions: professions.sort() };
    },
});

/**
 * Get lead statistics
 */
export const getLeadStats = query({
    handler: async (ctx) => {
        const leads = await ctx.db
            .query("leads")
            .filter((q) => q.neq(q.field("isDeleted"), true))
            .collect();

        return {
            total: leads.length,
            new: leads.filter((l) => l.status === "new").length,
            contacted: leads.filter((l) => l.status === "contacted").length,
            interested: leads.filter((l) => l.status === "interested").length,
            notInterested: leads.filter((l) => l.status === "not-interested").length,
            followUp: leads.filter((l) => l.status === "follow-up").length,
            converted: leads.filter((l) => l.status === "converted").length,
            lost: leads.filter((l) => l.status === "lost").length,
        };
    },
});

// ============================================
// MUTATIONS - Create, update, and delete leads
// ============================================

/**
 * Create a single lead
 */
export const createLead = mutation({
    args: {
        name: v.string(),
        formattedPhoneNumber: v.optional(v.string()),
        website: v.optional(v.string()),
        formattedAddress: v.optional(v.string()),
        rating: v.optional(v.number()),
        userRatingsTotal: v.optional(v.number()),
        profession: v.optional(v.string()),
        area: v.optional(v.string()),
        status: v.optional(
            v.union(
                v.literal("new"),
                v.literal("contacted"),
                v.literal("interested"),
                v.literal("not-interested"),
                v.literal("follow-up"),
                v.literal("converted"),
                v.literal("lost")
            )
        ),
        notes: v.optional(v.string()),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Uniqueness check for website
        if (args.website) {
            const existing = await ctx.db
                .query("leads")
                .withIndex("byWebsite", (q) => q.eq("website", args.website))
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .first();
            if (existing) {
                throw new Error(`A lead with website ${args.website} already exists`);
            }
        }

        const leadId = await ctx.db.insert("leads", {
            name: args.name,
            formattedPhoneNumber: args.formattedPhoneNumber,
            website: args.website,
            formattedAddress: args.formattedAddress,
            rating: args.rating,
            userRatingsTotal: args.userRatingsTotal,
            profession: args.profession,
            area: args.area,
            status: args.status || "new",
            notes: args.notes,
            importedBy: args.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return leadId;
    },
});

/**
 * Bulk create leads from CSV import
 */
export const importLeadsFromCSV = mutation({
    args: {
        leads: v.array(
            v.object({
                name: v.string(),
                formattedPhoneNumber: v.optional(v.string()),
                website: v.optional(v.string()),
                formattedAddress: v.optional(v.string()),
                rating: v.optional(v.number()),
                userRatingsTotal: v.optional(v.number()),
                profession: v.optional(v.string()),
                area: v.optional(v.string()),
                notes: v.optional(v.string()),
            })
        ),
        importBatchId: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const createdLeadIds: string[] = [];
        const now = Date.now();
        const seenWebsitesInBatch = new Set<string>();

        for (const lead of args.leads) {
            // Skip if website seen in current batch
            if (lead.website) {
                if (seenWebsitesInBatch.has(lead.website)) continue;
                seenWebsitesInBatch.add(lead.website);

                // Skip if website exists in DB
                const existing = await ctx.db
                    .query("leads")
                    .withIndex("byWebsite", (q) => q.eq("website", lead.website))
                    .filter((q) => q.eq(q.field("isDeleted"), false))
                    .first();
                if (existing) continue;
            }

            const leadId = await ctx.db.insert("leads", {
                name: lead.name,
                formattedPhoneNumber: lead.formattedPhoneNumber,
                website: lead.website,
                formattedAddress: lead.formattedAddress,
                rating: lead.rating,
                userRatingsTotal: lead.userRatingsTotal,
                profession: lead.profession,
                area: lead.area,
                status: "new",
                notes: lead.notes,
                importBatchId: args.importBatchId,
                importedBy: args.userId,
                createdAt: now,
                updatedAt: now,
            });
            createdLeadIds.push(leadId);
        }

        return {
            totalImported: createdLeadIds.length,
            leadIds: createdLeadIds,
            batchId: args.importBatchId,
        };
    },
});

/**
 * Update a lead
 */
export const updateLead = mutation({
    args: {
        leadId: v.id("leads"),
        status: v.optional(
            v.union(
                v.literal("new"),
                v.literal("contacted"),
                v.literal("interested"),
                v.literal("not-interested"),
                v.literal("follow-up"),
                v.literal("converted"),
                v.literal("lost")
            )
        ),
        formattedPhoneNumber: v.optional(v.string()),
        website: v.optional(v.string()),
        formattedAddress: v.optional(v.string()),
        notes: v.optional(v.string()),
        convertedClientId: v.optional(v.id("clients")),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        const updates: any = {
            updatedAt: Date.now(),
        };

        if (args.status !== undefined) {
            updates.status = args.status;
        }
        if (args.formattedPhoneNumber !== undefined) {
            updates.formattedPhoneNumber = args.formattedPhoneNumber;
        }
        if (args.website !== undefined) {
            updates.website = args.website;
        }
        if (args.formattedAddress !== undefined) {
            updates.formattedAddress = args.formattedAddress;
        }
        if (args.notes !== undefined) {
            updates.notes = args.notes;
        }
        if (args.convertedClientId !== undefined) {
            updates.convertedClientId = args.convertedClientId;
            updates.convertedAt = Date.now();
        }

        await ctx.db.patch(args.leadId, updates);
        return await ctx.db.get(args.leadId);
    },
});

/**
 * Delete a lead (soft delete)
 */
export const deleteLead = mutation({
    args: {
        leadId: v.id("leads"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        await ctx.db.patch(args.leadId, {
            isDeleted: true,
            deletedAt: Date.now(),
            deletedBy: args.userId,
        });

        return { success: true, leadId: args.leadId };
    },
});

/**
 * Assign leads to a salesperson
 */
export const assignLeadsToSalesperson = mutation({
    args: {
        leadIds: v.array(v.id("leads")),
        salesPersonId: v.id("users"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const createdAssignments: string[] = [];

        for (const leadId of args.leadIds) {
            // Check if assignment already exists
            const existing = await ctx.db
                .query("leadAssignments")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("leadId"), leadId),
                        q.eq(q.field("salesPersonId"), args.salesPersonId)
                    )
                )
                .first();

            if (!existing) {
                const assignmentId = await ctx.db.insert("leadAssignments", {
                    leadId,
                    salesPersonId: args.salesPersonId,
                    status: "new",
                    assignedBy: args.userId,
                    assignedAt: Date.now(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });
                createdAssignments.push(assignmentId);

                // Log activity
                await ctx.db.insert("leadActivities", {
                    leadId,
                    salesPersonId: args.salesPersonId,
                    type: "assigned",
                    description: `Lead assigned to salesperson`,
                    createdAt: Date.now(),
                });
            }
        }

        return {
            assignedCount: createdAssignments.length,
            assignmentIds: createdAssignments,
        };
    },
});

/**
 * Update lead assignment status
 */
export const updateLeadAssignmentStatus = mutation({
    args: {
        leadId: v.id("leads"),
        salesPersonId: v.id("users"),
        status: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("interested"),
            v.literal("not-interested"),
            v.literal("follow-up"),
            v.literal("converted"),
            v.literal("lost")
        ),
        notes: v.optional(v.string()),
        nextFollowUpAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const assignment = await ctx.db
            .query("leadAssignments")
            .filter((q) =>
                q.and(
                    q.eq(q.field("leadId"), args.leadId),
                    q.eq(q.field("salesPersonId"), args.salesPersonId)
                )
            )
            .first();

        if (!assignment) {
            throw new Error("Lead assignment not found");
        }

        const previousStatus = assignment.status;

        const updates: any = {
            status: args.status,
            updatedAt: Date.now(),
            lastContactedAt: Date.now(),
        };

        if (args.notes !== undefined) {
            updates.notes = args.notes;
        }
        if (args.nextFollowUpAt !== undefined) {
            updates.nextFollowUpAt = args.nextFollowUpAt;
        }

        await ctx.db.patch(assignment._id, updates);

        // Sync back to master lead record
        await ctx.db.patch(args.leadId, {
            status: args.status,
            updatedAt: Date.now(),
        });

        // Log activity
        await ctx.db.insert("leadActivities", {
            leadId: args.leadId,
            salesPersonId: args.salesPersonId,
            type: "status-change",
            description: `Status changed from ${previousStatus} to ${args.status}`,
            previousStatus,
            newStatus: args.status,
            createdAt: Date.now(),
        });

        return await ctx.db.get(assignment._id);
    },
});

/**
 * Get activity history for a lead
 */
export const getLeadActivityHistory = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("leadActivities")
            .filter((q) => q.eq(q.field("leadId"), args.leadId))
            .order("desc")
            .collect();
    },
});

/**
 * Add note to lead activity
 */
export const addLeadNote = mutation({
    args: {
        leadId: v.id("leads"),
        salesPersonId: v.id("users"),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const activity = await ctx.db.insert("leadActivities", {
            leadId: args.leadId,
            salesPersonId: args.salesPersonId,
            type: "note-added",
            description: args.description,
            createdAt: Date.now(),
        });

        return activity;
    },
});

/**
 * Link a lead to a newly created client
 */
export const linkLeadToClient = mutation({
    args: {
        leadId: v.id("leads"),
        clientId: v.id("clients"),
        userId: v.id("users"), // The person performing the action
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        await ctx.db.patch(args.leadId, {
            status: "converted",
            convertedClientId: args.clientId,
            updatedAt: Date.now(),
        });

        // Log activity
        await ctx.db.insert("leadActivities", {
            leadId: args.leadId,
            salesPersonId: args.userId,
            type: "converted",
            description: `Lead converted to formal client`,
            createdAt: Date.now(),
        });

        // Also update assignment status if exists
        const assignment = await ctx.db
            .query("leadAssignments")
            .filter((q) =>
                q.and(
                    q.eq(q.field("leadId"), args.leadId),
                    q.eq(q.field("salesPersonId"), args.userId)
                )
            )
            .first();

        if (assignment) {
            await ctx.db.patch(assignment._id, {
                status: "converted",
                updatedAt: Date.now(),
            });
        }

        return { success: true };
    },
});