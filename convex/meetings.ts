import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listMeetings = query({
    args: {
        userId: v.optional(v.id("users")),
        role: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let meetings = await ctx.db
            .query("meetings")
            .filter((q) => q.eq(q.field("isDeleted"), false))
            .order("desc")
            .collect();

        if (args.role === "employee" && args.userId) {
            meetings = meetings.filter(m =>
                m.organizer === args.userId ||
                m.attendees?.some(a => a.userId === args.userId)
            );
        } else if (args.role === "client" && args.userId) {
            // Clients see meetings associated with their client record or where they are attendees
            const client = await ctx.db
                .query("clients")
                .withIndex("byUserId", (q) => q.eq("userId", args.userId!))
                .unique();

            if (client) {
                meetings = meetings.filter(m =>
                    m.clientId === client._id ||
                    m.attendees?.some(a => a.userId === args.userId)
                );
            } else {
                meetings = meetings.filter(m =>
                    m.attendees?.some(a => a.userId === args.userId)
                );
            }
        }

        // Fetch related data (client, organizer)
        return await Promise.all(
            meetings.map(async (meeting) => {
                const organizer = await ctx.db.get(meeting.organizer);
                const client = meeting.clientId ? await ctx.db.get(meeting.clientId) : null;
                const project = meeting.projectId ? await ctx.db.get(meeting.projectId) : null;

                // Also fetch names of attendees
                const attendeesWithDetails = await Promise.all(
                    (meeting.attendees || []).map(async (a) => {
                        const u = await ctx.db.get(a.userId);
                        return { ...a, name: u?.fullName };
                    })
                );

                return {
                    ...meeting,
                    organizerName: organizer?.fullName,
                    clientName: client ? (await ctx.db.get(client.userId))?.fullName || "Unknown Client" : "N/A",
                    companyName: client?.companyName || "N/A",
                    projectName: project?.projectName || "N/A",
                    attendeesWithDetails,
                };
            })
        );
    },
});

export const scheduleMeeting = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        agenda: v.optional(v.string()),
        type: v.union(
            v.literal("sales-call"),
            v.literal("project-kickoff"),
            v.literal("status-update"),
            v.literal("review"),
            v.literal("general"),
            v.literal("other")
        ),
        scheduledAt: v.number(),
        duration: v.optional(v.number()),
        location: v.optional(v.string()),
        organizer: v.id("users"),
        clientId: v.optional(v.id("clients")),
        projectId: v.optional(v.id("projects")),
        requirementId: v.optional(v.id("requirements")),
        attendees: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    status: v.union(v.literal("invited"), v.literal("accepted"), v.literal("declined"), v.literal("tentative")),
                })
            )
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("meetings", {
            ...args,
            status: "scheduled",
            isDeleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const getMeetingById = query({
    args: { meetingId: v.id("meetings") },
    handler: async (ctx, args) => {
        const meeting = await ctx.db.get(args.meetingId);
        if (!meeting || meeting.isDeleted) return null;

        const organizer = await ctx.db.get(meeting.organizer);
        const client = meeting.clientId ? await ctx.db.get(meeting.clientId) : null;
        const project = meeting.projectId ? await ctx.db.get(meeting.projectId) : null;

        const attendeesWithDetails = await Promise.all(
            (meeting.attendees || []).map(async (a) => {
                const u = await ctx.db.get(a.userId);
                return { ...a, name: u?.fullName, email: u?.email, role: u?.role };
            })
        );

        return {
            ...meeting,
            organizerName: organizer?.fullName,
            companyName: client?.companyName || "N/A",
            projectName: project?.projectName || "N/A",
            attendeesWithDetails,
        };
    },
});

export const updateMeeting = mutation({
    args: {
        meetingId: v.id("meetings"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.union(
            v.literal("scheduled"),
            v.literal("in-progress"),
            v.literal("completed"),
            v.literal("cancelled"),
            v.literal("no-show")
        )),
        notes: v.optional(v.string()),
        recordingUrl: v.optional(v.string()),
        location: v.optional(v.string()),
        scheduledAt: v.optional(v.number()),
        duration: v.optional(v.number()),
        agenda: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { meetingId, ...updateData } = args;
        await ctx.db.patch(meetingId, {
            ...updateData,
            updatedAt: Date.now(),
        });
    },
});

export const getStaff = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.filter(u =>
            (u.role === "admin" || u.role === "employee" || u.role === "superadmin" || u.role === "sales") &&
            !u.isDeleted &&
            u.isActive
        );
    }
});

export const getProjectsByClient = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projects")
            .withIndex("byClientId", q => q.eq("clientId", args.clientId))
            .filter(q => q.eq(q.field("isDeleted"), false))
            .collect();
    }
});

export const getRequirementsByClient = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("requirements")
            .withIndex("byClientId", q => q.eq("clientId", args.clientId))
            .filter(q => q.eq(q.field("isDeleted"), false))
            .collect();
    }
});

export const getContextMeetings = query({
    args: { projectId: v.optional(v.id("projects")) },
    handler: async (ctx, args) => {
        // Fetch meetings with specific Project ID
        let projectMeetings: any[] = [];
        if (args.projectId) {
            projectMeetings = await ctx.db
                .query("meetings")
                .withIndex("byProjectId", q => q.eq("projectId", args.projectId))
                .filter(q => q.eq(q.field("isDeleted"), false))
                .collect();
        }

        // Fetch "unassigned" meetings (no project ID) - manually filtering as we probably don't have an index for "undefined" or null easily accessible in a simple eq query without scanning,
        // Actually we do have byProjectId index. We can query range or just scan if small.
        // Or better, meetings are time-sorted usually.
        // Let's just scan all recent meetings and filter in code for flexibility for now, optimizing later if needed.
        // Creating an index "byProjectId" allows querying null? Convex sometimes handles null in index.
        // But for mixed fetch, let's grab last 50 meetings and filter.

        const allRecentMeetings = await ctx.db.query("meetings")
            .order("desc") // newest first
            .take(50);

        const unassignedMeetings = allRecentMeetings.filter(m => !m.projectId && !m.isDeleted);

        // Combine and dedup
        const combined = [...projectMeetings];

        // Add unassigned if they aren't already there (they shouldn't be)
        for (const m of unassignedMeetings) {
            if (!combined.some(existing => existing._id === m._id)) {
                combined.push(m);
            }
        }

        // Enrich
        return await Promise.all(
            combined.map(async (meeting) => {
                const organizer: any = await ctx.db.get(meeting.organizer);
                const client: any = meeting.clientId ? await ctx.db.get(meeting.clientId) : null;

                return {
                    ...meeting,
                    organizerName: organizer?.fullName || "Unknown",
                    companyName: client?.companyName || "N/A",
                };
            })
        );
    }
});
