import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// HELPERS - Internal utility functions
// ============================================

/**
 * Normalizes a website URL for comparison (removes protocol, www, and trailing slash)
 */
const normalizeWebsite = (url?: string) => {
    if (!url) return "";
    return url
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "")
        .trim();
};

// ============================================
// QUERIES - Fetch leads from database
// ============================================

/**
 * Get all leads with optional filtering, enhanced with activity data
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

        let leads = await query.collect();

        // Filter by search query (name, phone, area, profession)
        if (args.searchQuery) {
            const q = args.searchQuery.toLowerCase();
            leads = leads.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(q) ||
                    (lead.formattedPhoneNumber && lead.formattedPhoneNumber.includes(q)) ||
                    (lead.area && lead.area.toLowerCase().includes(q)) ||
                    (lead.profession && lead.profession.toLowerCase().includes(q))
            );
        }

        // Enhance with latest activity data
        const enhancedLeads = [];
        for (const lead of leads) {
            const latestStatusChange = await ctx.db
                .query("leadActivities")
                .withIndex("byLeadAndCreatedAt", (q) => q.eq("leadId", lead._id))
                .filter((q) => q.eq(q.field("type"), "status-change"))
                .order("desc")
                .first();

            const latestContact = await ctx.db
                .query("leadActivities")
                .withIndex("byLeadAndCreatedAt", (q) => q.eq("leadId", lead._id))
                .filter((q) =>
                    q.or(
                        q.eq(q.field("type"), "called"),
                        q.eq(q.field("type"), "whatsapp"),
                        q.eq(q.field("type"), "emailed")
                    )
                )
                .order("desc")
                .first();

            let statusChanger = null;
            if (latestStatusChange) {
                statusChanger = await ctx.db.get(latestStatusChange.salesPersonId);
            }

            let lastCaller = null;
            if (latestContact) {
                lastCaller = await ctx.db.get(latestContact.salesPersonId);
            }

            enhancedLeads.push({
                ...lead,
                latestStatusChange: latestStatusChange ? {
                    ...latestStatusChange,
                    userName: statusChanger?.fullName || "System"
                } : null,
                latestContact: latestContact ? {
                    ...latestContact,
                    userName: lastCaller?.fullName || "System"
                } : null,
            });
        }

        return enhancedLeads;
    },
});

/**
 * Get leads grouped by freelancer/salesperson for admin view
 */
export const getFreelancerGroupedLeads = query({
    args: {
        status: v.string(), // Interested, Contacted, etc.
    },
    handler: async (ctx, args) => {
        // 1. Get all freelancers (sales/employee)
        const freelancers = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.or(q.eq(q.field("role"), "sales"), q.eq(q.field("role"), "employee")),
                    q.neq(q.field("isDeleted"), true)
                )
            )
            .collect();

        const result = [];

        for (const freelancer of freelancers) {
            // 2. Get assignments for this freelancer with the specific status
            const assignments = await ctx.db
                .query("leadAssignments")
                .withIndex("bySalesPersonId", (q) => q.eq("salesPersonId", freelancer._id))
                .filter((q) => q.eq(q.field("status"), args.status))
                .collect();

            const freelancerLeads = [];
            for (const assignment of assignments) {
                const lead = await ctx.db.get(assignment.leadId);
                if (lead && !lead.isDeleted) {
                    // Enhance with full activity history
                    const activities = await ctx.db
                        .query("leadActivities")
                        .withIndex("byLeadAndCreatedAt", (q) => q.eq("leadId", lead._id))
                        .order("desc")
                        .take(10); // Get last 10 activities

                    const enhancedActivities = [];
                    for (const activity of activities) {
                        const actor = await ctx.db.get(activity.salesPersonId);
                        enhancedActivities.push({
                            ...activity,
                            userName: actor?.fullName || "System"
                        });
                    }

                    freelancerLeads.push({
                        ...lead,
                        assignmentStatus: assignment.status,
                        assignmentNotes: assignment.notes,
                        activities: enhancedActivities,
                    });
                }
            }

            if (freelancerLeads.length > 0) {
                result.push({
                    freelancerId: freelancer._id,
                    freelancerName: freelancer.fullName,
                    leads: freelancerLeads,
                });
            }
        }

        return result;
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
            pitched: leads.filter((l) => l.status === "pitched").length,
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
                v.literal("pitched"),
                v.literal("converted"),
                v.literal("lost")
            )
        ),
        notes: v.optional(v.string()),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Uniqueness check for website
        let website = args.website;
        if (website) {
            const normalized = normalizeWebsite(website);
            if (normalized) {
                const existing = await ctx.db
                    .query("leads")
                    .withIndex("byWebsite", (q) => q.eq("website", normalized))
                    .filter((q) => q.neq(q.field("isDeleted"), true))
                    .first();

                if (existing) {
                    throw new Error(`A lead with website matching ${normalized} already exists`);
                }
                // Store normalized version for future consistency
                website = normalized;
            } else {
                website = undefined; // Treat as no website if normalization results in empty string
            }
        }

        const leadId = await ctx.db.insert("leads", {
            name: args.name,
            formattedPhoneNumber: args.formattedPhoneNumber,
            website,
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
        const seenPhonesInBatch = new Set<string>();
        const seenNamesInBatch = new Set<string>();

        for (const lead of args.leads) {
            let website = lead.website;

            // ── 1. WEBSITE CHECK ──
            if (website) {
                const normalized = normalizeWebsite(website);
                if (normalized) {
                    if (seenWebsitesInBatch.has(normalized)) continue;
                    seenWebsitesInBatch.add(normalized);

                    const existing = await ctx.db
                        .query("leads")
                        .withIndex("byWebsite", (q) => q.eq("website", normalized))
                        .filter((q) => q.neq(q.field("isDeleted"), true))
                        .first();

                    if (existing) continue;
                    website = normalized;
                } else {
                    website = undefined;
                }
            }

            // ── 2. PHONE CHECK (only if no website) ──
            if (!website && lead.formattedPhoneNumber) {
                if (seenPhonesInBatch.has(lead.formattedPhoneNumber)) continue;
                seenPhonesInBatch.add(lead.formattedPhoneNumber);

                const existing = await ctx.db
                    .query("leads")
                    .filter((q) =>
                        q.and(
                            q.eq(q.field("formattedPhoneNumber"), lead.formattedPhoneNumber),
                            q.neq(q.field("isDeleted"), true)
                        )
                    )
                    .first();

                if (existing) continue;
            }

            // ── 3. NAME CHECK (only if no website and no phone) ──
            if (!website && !lead.formattedPhoneNumber) {
                if (seenNamesInBatch.has(lead.name)) continue;
                seenNamesInBatch.add(lead.name);

                const existing = await ctx.db
                    .query("leads")
                    .filter((q) =>
                        q.and(
                            q.eq(q.field("name"), lead.name),
                            q.neq(q.field("isDeleted"), true)
                        )
                    )
                    .first();

                if (existing) continue;
            }

            const leadId = await ctx.db.insert("leads", {
                name: lead.name,
                formattedPhoneNumber: lead.formattedPhoneNumber,
                website,
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
        status: v.optional(v.string()),
        formattedPhoneNumber: v.optional(v.string()),
        website: v.optional(v.string()),
        formattedAddress: v.optional(v.string()),
        notes: v.optional(v.string()),
        convertedClientId: v.optional(v.id("clients")),
        pitchedServices: v.optional(v.array(v.object({
            serviceId: v.string(),
            packageId: v.string(),
            packageName: v.string(),
            region: v.string(),
            price: v.number(),
        })))
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
        if (args.pitchedServices !== undefined) {
            updates.pitchedServices = args.pitchedServices;
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
        status: v.string(),
        notes: v.optional(v.string()),
        pitchedServices: v.optional(v.array(v.object({
            serviceId: v.string(),
            packageId: v.string(),
            packageName: v.string(),
            region: v.string(),
            price: v.number(),
        })))
    },
    handler: async (ctx, args) => {
        const assignment = await ctx.db
            .query("leadAssignments")
            .withIndex("byLeadAndSales", (q) => q.eq("leadId", args.leadId).eq("salesPersonId", args.salesPersonId))
            .unique();

        if (!assignment) throw new Error("Assignment not found");

        const previousStatus = assignment.status;
        const updates: any = {
            status: args.status,
            updatedAt: Date.now(),
            lastContactedAt: Date.now(),
        };

        if (args.notes !== undefined) {
            updates.notes = args.notes;
        }

        await ctx.db.patch(assignment._id, updates);

        // Sync back to master lead record
        const leadUpdates: any = {
            status: args.status,
            updatedAt: Date.now(),
        };

        if (args.pitchedServices) {
            leadUpdates.pitchedServices = args.pitchedServices;
        }

        await ctx.db.patch(args.leadId, leadUpdates);

        // Log activity
        let description = args.notes ? `${args.notes}` : `Status changed from ${previousStatus} to ${args.status}`;

        if (args.pitchedServices && args.pitchedServices.length > 0) {
            const serviceNames = args.pitchedServices.map(s => s.packageName).join(", ");
            description += `\nServices: ${serviceNames}`;
        }

        await ctx.db.insert("leadActivities", {
            leadId: args.leadId,
            salesPersonId: args.salesPersonId,
            type: "status-change",
            description,
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
 * Get full profile data for a lead (for the Lead Profile page)
 * Includes: lead info, all assignments with salesperson details, all activities with actor info
 */
export const getLeadFullProfile = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) return null;

        // Get all assignments for this lead
        const assignments = await ctx.db
            .query("leadAssignments")
            .filter((q) => q.eq(q.field("leadId"), args.leadId))
            .order("desc")
            .collect();

        const enrichedAssignments = [];
        for (const assignment of assignments) {
            const salesperson = await ctx.db.get(assignment.salesPersonId);
            const assignedByUser = assignment.assignedBy ? await ctx.db.get(assignment.assignedBy) : null;
            enrichedAssignments.push({
                ...assignment,
                salespersonName: salesperson?.fullName || "Unknown",
                salespersonRole: salesperson?.role || "sales",
                assignedByName: assignedByUser?.fullName || "System",
            });
        }

        // Get all activities for this lead
        const activities = await ctx.db
            .query("leadActivities")
            .withIndex("byLeadAndCreatedAt", (q) => q.eq("leadId", args.leadId))
            .order("desc")
            .collect();

        const enrichedActivities = [];
        for (const activity of activities) {
            const actor = await ctx.db.get(activity.salesPersonId);
            enrichedActivities.push({
                ...activity,
                userName: actor?.fullName || "System",
                userRole: actor?.role || "unknown",
            });
        }

        // Get imported by user info
        const importedByUser = lead.importedBy ? await ctx.db.get(lead.importedBy) : null;

        return {
            ...lead,
            importedByName: importedByUser?.fullName || "System",
            assignments: enrichedAssignments,
            activities: enrichedActivities,
        };
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
        pitchedServices: v.optional(
            v.array(
                v.object({
                    serviceId: v.string(),
                    packageId: v.string(),
                    packageName: v.string(),
                    region: v.string(),
                    price: v.number(),
                })
            )
        ),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        await ctx.db.patch(args.leadId, {
            status: "converted",
            convertedClientId: args.clientId,
            pitchedServices: args.pitchedServices,
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

export const logLeadContact = mutation({
    args: {
        leadId: v.id("leads"),
        userId: v.id("users"), // Salesperson or admin logging the contact
        type: v.union(v.literal("called"), v.literal("whatsapp"), v.literal("emailed")),
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) throw new Error("Lead not found");

        const now = Date.now();

        // 1. Update lead master record
        const historyEntry = {
            timestamp: now,
            type: args.type,
            note: args.note,
            salesPersonId: args.userId,
        };

        await ctx.db.patch(args.leadId, {
            contactCount: (lead.contactCount || 0) + 1,
            lastContactedAt: now,
            contactHistory: [...(lead.contactHistory || []), historyEntry],
            updatedAt: now,
        });

        // 2. Add activity log entry
        await ctx.db.insert("leadActivities", {
            leadId: args.leadId,
            salesPersonId: args.userId,
            type: args.type,
            description: args.note || `Contact attempt via ${args.type}`,
            createdAt: now,
        });

        // 3. Update assignment lastContactedAt if it exists
        const assignment = await ctx.db
            .query("leadAssignments")
            .withIndex("byLeadAndSales", (q) =>
                q.eq("leadId", args.leadId).eq("salesPersonId", args.userId)
            )
            .first();

        if (assignment) {
            await ctx.db.patch(assignment._id, {
                lastContactedAt: now,
                updatedAt: now,
            });
        }

        return { success: true, newCount: (lead.contactCount || 0) + 1 };
    },
});

