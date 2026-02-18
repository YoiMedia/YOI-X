import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const listRequirements = query({
    args: {
        userId: v.optional(v.id("users")),
        role: v.optional(v.string()),
        assignedOnly: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        let requirements: any[];

        if (args.role === "sales" && args.userId) {
            requirements = await ctx.db
                .query("requirements")
                .withIndex("bySalesPersonId", (q) => q.eq("salesPersonId", args.userId!))
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .order("desc")
                .collect();
        } else if (args.role === "employee" && args.userId && args.assignedOnly) {
            // Employees see requirements they are assigned to IF assignedOnly is true
            const allReqs = await ctx.db
                .query("requirements")
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .order("desc")
                .collect();

            requirements = allReqs.filter(req =>
                req.assignedEmployees?.includes(args.userId as any)
            );
        } else if (args.role === "employee") {
            // Employees see all requirements by default now
            requirements = await ctx.db
                .query("requirements")
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .order("desc")
                .collect();
        } else if (args.role === "client" && args.userId) {
            // Clients see requirements associated with their client record
            const client = await ctx.db
                .query("clients")
                .withIndex("byUserId", (q) => q.eq("userId", args.userId!))
                .unique();

            if (client) {
                requirements = await ctx.db
                    .query("requirements")
                    .withIndex("byClientId", (q) => q.eq("clientId", client._id))
                    .filter((q) => q.eq(q.field("isDeleted"), false))
                    .order("desc")
                    .collect();
            } else {
                requirements = [];
            }
        } else if (args.role === "admin" || args.role === "superadmin") {
            // Admin and Superadmin see all
            requirements = await ctx.db
                .query("requirements")
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .order("desc")
                .collect();
        } else {
            // Others (e.g., unauthenticated, or roles not explicitly handled) see all
            requirements = await ctx.db
                .query("requirements")
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .order("desc")
                .collect();
        }

        // Fetch related data
        return await Promise.all(
            requirements.map(async (req) => {
                const client = await ctx.db.get(req.clientId) as Doc<"clients"> | null;
                const salesPerson = await ctx.db.get(req.salesPersonId) as Doc<"users"> | null;

                // Get assigned employees details if any
                const assignedEmployees = req.assignedEmployees
                    ? await Promise.all(req.assignedEmployees.map((id: any) => ctx.db.get(id)))
                    : [];

                // Get requester details for naming
                const requesterDetails = req.requestedBy
                    ? await Promise.all(req.requestedBy.map(async (id: any) => {
                        const u = await ctx.db.get(id) as Doc<"users"> | null;
                        return { id: u?._id, name: u?.fullName };
                    }))
                    : [];

                return {
                    ...req,
                    clientName: client?.companyName || "Unknown Client",
                    salesPersonName: salesPerson?.fullName || "N/A",
                    assignedEmployeesDetails: assignedEmployees.map((u: any) => ({ id: u?._id, name: u?.fullName })),
                    requesterDetails,
                };
            })
        );
    },
});

export const assignRequirement = mutation({
    args: {
        requirementId: v.id("requirements"),
        employeeId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const req = await ctx.db.get(args.requirementId);
        if (!req) throw new Error("Requirement not found");

        // We append to the list, avoiding duplicates
        const currentAssignees = req.assignedEmployees || [];
        if (!currentAssignees.includes(args.employeeId)) {
            await ctx.db.patch(args.requirementId, {
                assignedEmployees: [...currentAssignees, args.employeeId],
                updatedAt: Date.now(),
            });
        }
    },
});

export const createRequirement = mutation({
    args: {
        requirementName: v.string(),
        description: v.optional(v.string()),
        clientId: v.id("clients"),
        salesPersonId: v.id("users"),
        priority: v.optional(v.string()),
        estimatedBudget: v.optional(v.number()),
        estimatedHours: v.optional(v.number()),
        // Service & Package fields
        serviceType: v.optional(v.string()),
        packageTier: v.optional(v.string()),
        region: v.optional(v.string()),
        currency: v.optional(v.string()),
        mrp: v.optional(v.number()),
        dealPrice: v.optional(v.number()),
        selectedInclusions: v.optional(v.array(v.string())),
        selectedAddOns: v.optional(
            v.array(v.object({
                id: v.string(),
                name: v.string(),
                price: v.optional(v.number()),
            }))
        ),
        items: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    title: v.string(),
                    description: v.optional(v.string()),
                    priority: v.optional(v.string()),
                    estimatedHours: v.optional(v.number()),
                })
            )
        ),
    },
    handler: async (ctx, args) => {
        // Validate deal price >= MRP
        if (args.dealPrice && args.mrp && args.dealPrice < args.mrp) {
            throw new Error("Deal price cannot be below MRP");
        }

        const requirementNumber = `REQ-${Date.now().toString().slice(-6)}`;

        return await ctx.db.insert("requirements", {
            ...args,
            requirementNumber,
            status: "draft",
            isDeleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const getRequirementById = query({
    args: { requirementId: v.id("requirements") },
    handler: async (ctx, args) => {
        const req = await ctx.db.get(args.requirementId);
        if (!req || req.isDeleted) return null;

        const client = await ctx.db.get(req.clientId) as Doc<"clients"> | null;
        const salesPerson = await ctx.db.get(req.salesPersonId) as Doc<"users"> | null;

        // Get assigned employees details if any
        const assignedEmployees = req.assignedEmployees
            ? await Promise.all(req.assignedEmployees.map(id => ctx.db.get(id)))
            : [];

        // Get requester details
        const requesterDetails = req.requestedBy
            ? await Promise.all(req.requestedBy.map(async (id: any) => {
                const u = await ctx.db.get(id) as Doc<"users"> | null;
                return { id: u?._id, name: u?.fullName };
            }))
            : [];

        return {
            ...req,
            clientName: client?.companyName || "Unknown Client",
            salesPersonName: salesPerson?.fullName || "N/A",
            assignedEmployeesDetails: assignedEmployees.map(u => ({ id: u?._id, name: u?.fullName })),
            requesterDetails,
        };
    },
});

export const requestRequirementAssignment = mutation({
    args: {
        requirementId: v.id("requirements"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const req = await ctx.db.get(args.requirementId);
        if (!req) throw new Error("Requirement not found");

        const requestedBy = req.requestedBy || [];
        if (!requestedBy.includes(args.userId)) {
            await ctx.db.patch(args.requirementId, {
                requestedBy: [...requestedBy, args.userId],
                updatedAt: Date.now(),
            });
        }
    },
});

export const updateRequirement = mutation({
    args: {
        requirementId: v.id("requirements"),
        requirementName: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("submitted"),
            v.literal("approved"),
            v.literal("rejected"),
            v.literal("in-progress"),
            v.literal("completed")
        )),
        // Service & Package fields
        serviceType: v.optional(v.string()),
        packageTier: v.optional(v.string()),
        region: v.optional(v.string()),
        currency: v.optional(v.string()),
        mrp: v.optional(v.number()),
        dealPrice: v.optional(v.number()),
        selectedInclusions: v.optional(v.array(v.string())),
        selectedAddOns: v.optional(
            v.array(v.object({
                id: v.string(),
                name: v.string(),
                price: v.optional(v.number()),
            }))
        ),
        items: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    title: v.string(),
                    description: v.optional(v.string()),
                    priority: v.optional(v.string()),
                    estimatedHours: v.optional(v.number()),
                })
            )
        ),
        estimatedBudget: v.optional(v.number()),
        estimatedHours: v.optional(v.number()),
        actualHours: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { requirementId, ...updateData } = args;

        // Validate deal price >= MRP
        if (updateData.dealPrice && updateData.mrp && updateData.dealPrice < updateData.mrp) {
            throw new Error("Deal price cannot be below MRP");
        }

        await ctx.db.patch(requirementId, {
            ...updateData,
            updatedAt: Date.now(),
        });
    },
});
