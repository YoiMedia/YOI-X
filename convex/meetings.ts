import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

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

        if ((args.role === "employee" || args.role === "sales") && args.userId) {
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
                const clientMeetings = await ctx.db
                    .query("meetings")
                    .withIndex("byClientId", (q) => q.eq("clientId", client._id))
                    .filter((q) => q.eq(q.field("isDeleted"), false))
                    .collect();

                const attendeeMeetings = meetings.filter(m =>
                    m.attendees?.some(a => a.userId === args.userId)
                );

                // Merge and dedup
                const combined = [...clientMeetings];
                for (const m of attendeeMeetings) {
                    if (!combined.some(existing => existing._id === m._id)) {
                        combined.push(m);
                    }
                }
                meetings = combined.sort((a, b) => b.scheduledAt - a.scheduledAt);
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
        requirementId: v.optional(v.id("requirements")),
        attendees: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    status: v.union(v.literal("invited"), v.literal("accepted"), v.literal("declined"), v.literal("tentative")),
                })
            )
        ),
        externalAttendees: v.optional(v.array(v.string())),
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
        attendees: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    status: v.union(v.literal("invited"), v.literal("accepted"), v.literal("declined"), v.literal("tentative")),
                })
            )
        ),
        externalAttendees: v.optional(v.array(v.string())),
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

export const updateAttendees = mutation({
    args: {
        meetingId: v.id("meetings"),
        attendees: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    status: v.union(v.literal("invited"), v.literal("accepted"), v.literal("declined"), v.literal("tentative")),
                })
            )
        ),
        externalAttendees: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { meetingId, ...data } = args;
        await ctx.db.patch(meetingId, {
            ...data,
            updatedAt: Date.now(),
        });
    },
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
    args: {
        clientId: v.optional(v.id("clients")),
        onlyClientMeetings: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        // Fetch meetings with specific Client ID
        let clientMeetings: any[] = [];
        if (args.clientId) {
            clientMeetings = await ctx.db
                .query("meetings")
                .withIndex("byClientId", q => q.eq("clientId", args.clientId!))
                .filter(q => q.eq(q.field("isDeleted"), false))
                .collect();
        }

        if (args.onlyClientMeetings && args.clientId) {
            // Enrich and return only client meetings
            return await Promise.all(
                clientMeetings.map(async (meeting) => {
                    const organizer = await ctx.db.get(meeting.organizer) as Doc<"users"> | null;
                    const client = meeting.clientId ? await ctx.db.get(meeting.clientId) as Doc<"clients"> | null : null;

                    return {
                        ...meeting,
                        organizerName: organizer?.fullName || "Unknown",
                        companyName: client?.companyName || "N/A",
                    };
                })
            );
        }

        const allRecentMeetings = await ctx.db.query("meetings")
            .order("desc") // newest first
            .take(50);

        // Simple filter for fallback/recent context
        const recentMeetings = allRecentMeetings.filter(m => !m.isDeleted);

        // Combine and dedup
        const combined = [...clientMeetings];
        for (const m of recentMeetings) {
            if (!combined.some(existing => existing._id === m._id)) {
                combined.push(m);
            }
        }

        // Enrich
        return await Promise.all(
            combined.map(async (meeting) => {
                const organizer = await ctx.db.get(meeting.organizer) as Doc<"users"> | null;
                const client = meeting.clientId ? await ctx.db.get(meeting.clientId) as Doc<"clients"> | null : null;

                return {
                    ...meeting,
                    organizerName: organizer?.fullName || "Unknown",
                    companyName: client?.companyName || "N/A",
                };
            })
        );
    }
});

export const generateMeetLink = action({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        scheduledAt: v.number(),
        duration: v.number(),
        attendeeEmails: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const response = await fetch("https://n8n.yoimedia.fun/webhook/meet/gen", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: args.title,
                description: args.description || "",
                startTime: new Date(args.scheduledAt).toISOString(),
                endTime: new Date(args.scheduledAt + args.duration * 60000).toISOString(),
                attendees: args.attendeeEmails,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate Meet link: ${errorText}`);
        }

        const data = await response.json();
        // Adjust based on expected webhook response format. 
        // Assuming it returns { meetLink: "..." } or similar.
        // If it returns just the string, data might be different.
        return data.meetLink || data.url || data.link || (typeof data === 'string' ? data : null);
    },
});
