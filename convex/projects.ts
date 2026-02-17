import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// PROJECTS
// ============================================

export const listProjects = query({
    args: {
        userId: v.optional(v.id("users")),
        role: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let projects = await ctx.db
            .query("projects")
            .filter((q) => q.eq(q.field("isDeleted"), false))
            .order("desc")
            .collect();

        // Filter for Sales role
        if (args.role === "sales" && args.userId) {
            // Get clients owned by this sales person
            const userClients = await ctx.db
                .query("clients")
                .withIndex("bySalesPersonId", (q) => q.eq("salesPersonId", args.userId!))
                .collect();

            const userClientIds = new Set(userClients.map(c => c._id));

            projects = projects.filter(p =>
                userClientIds.has(p.clientId) || p.projectManagerId === args.userId
            );
        } else if (args.role === "employee" && args.userId) {
            // Employees see projects where they are assigned to a requirement
            const userRequirements = await ctx.db
                .query("requirements")
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .collect();

            const assignedProjectIds = new Set(
                userRequirements
                    .filter(req => req.assignedEmployees?.includes(args.userId as any) && req.projectId)
                    .map(req => req.projectId!)
            );

            projects = projects.filter(p => assignedProjectIds.has(p._id));
        } else if (args.role === "client" && args.userId) {
            // Clients see projects associated with their client record
            const client = await ctx.db
                .query("clients")
                .withIndex("byUserId", (q) => q.eq("userId", args.userId!))
                .unique();

            if (client) {
                projects = projects.filter(p => p.clientId === client._id);
            } else {
                projects = [];
            }
        }

        // Fetch related data
        return await Promise.all(
            projects.map(async (project) => {
                const client = await ctx.db.get(project.clientId);
                const projectManager = await ctx.db.get(project.projectManagerId);
                const requirements = await ctx.db
                    .query("requirements")
                    .withIndex("byProjectId", (q) => q.eq("projectId", project._id))
                    .collect();

                return {
                    ...project,
                    clientName: client?.companyName || "Unknown Client",
                    clientSalesPersonName: client?.salesPersonId ? (await ctx.db.get(client.salesPersonId))?.fullName : "Unassigned",
                    projectManagerName: projectManager?.fullName || "Unassigned",
                    requirementsCount: requirements.length,
                };
            })
        );
    },
});

export const createProject = mutation({
    args: {
        projectName: v.string(),
        description: v.optional(v.string()),
        clientId: v.id("clients"),
        projectManagerId: v.id("users"),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        status: v.union(
            v.literal("planning"),
            v.literal("active"),
            v.literal("on-hold"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const projectNumber = `PROJ-${Date.now().toString().slice(-6)}`;

        return await ctx.db.insert("projects", {
            ...args,
            projectNumber,
            isDeleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const getProjectById = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project || project.isDeleted) return null;

        const client = await ctx.db.get(project.clientId);
        const projectManager = await ctx.db.get(project.projectManagerId);

        return {
            ...project,
            clientName: client?.companyName || "Unknown Client",
            projectManagerName: projectManager?.fullName || "Unassigned",
        };
    },
});

// ============================================
// REQUIREMENTS (Extended)
// ============================================

// listRequirements is already in requirements.ts, but we might want one specifically for a project
export const getRequirementsByProject = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const requirements = await ctx.db
            .query("requirements")
            .withIndex("byProjectId", (q) => q.eq("projectId", args.projectId))
            .filter((q) => q.eq(q.field("isDeleted"), false))
            .collect();

        // Enriched if needed
        return await Promise.all(requirements.map(async (req) => {
            const salesPerson = await ctx.db.get(req.salesPersonId);
            return {
                ...req,
                salesPersonName: salesPerson?.fullName || "Unknown",
            };
        }));
    },
});
