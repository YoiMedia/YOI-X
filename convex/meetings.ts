import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { components } from "./_generated/api";
import { R2 } from "@convex-dev/r2";
import type { DataModel } from "./_generated/dataModel";

const r2 = new R2(components.r2, {
  bucket: "convex-files",
  endpoint: "https://a35598b9adcf9d35aeff1bdc162ec979.r2.cloudflarestorage.com",
  accessKeyId: "842705659772b8ce5a553f12ac1d76f2",
  secretAccessKey:
    "ee4cdb8d880ee7e5d329efcb08327028fb07e56624dd30645fec35e08c7ba380",
});

// These must be exported for the useUploadFile hook (or custom implementation) to work
export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>();

export const getFileUrl = query({
  args: { storageKey: v.string() },
  handler: async (ctx, args) => {
    return await r2.getUrl(args.storageKey);
  },
});

export const getFileUrlAction = action({
  args: { storageKey: v.string() },
  handler: async (ctx, args) => {
    return await r2.getUrl(args.storageKey);
  },
});

export const schedule = mutation({
  args: {
    client_id: v.id("clients"),
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    scheduled_at: v.number(),
    duration: v.optional(v.number()),
    meeting_link: v.optional(v.string()),
    attendees: v.optional(v.array(v.id("users"))),
    status: v.string(),
    requirement_id: v.optional(v.id("requirements")),
    document_id: v.optional(v.id("documents")),
    initiated_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("meetings", {
      ...args,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getById = query({
  args: { id: v.id("meetings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const setStatus = mutation({
  args: { id: v.id("meetings"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updated_at: Date.now(),
    });
  },
});

export const listForClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetings")
      .withIndex("by_client_id", (q) => q.eq("client_id", args.client_id))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const meetings = await ctx.db.query("meetings").collect();
    return await Promise.all(
      meetings.map(async (m) => {
        const client = await ctx.db.get(m.client_id);
        const clientUser = client
          ? await ctx.db.get((client as any).user_id)
          : null;
        const attendeesData = m.attendees
          ? await Promise.all(
              m.attendees.map(async (id) => {
                const user = await ctx.db.get(id);
                if (!user) return null;
                const name =
                  (user as any).full_name ||
                  (user as any).fullname ||
                  (user as any).name ||
                  "Unknown";
                return { id, name };
              }),
            )
          : [];

        const clientName =
          (clientUser as any)?.full_name ||
          (clientUser as any)?.fullname ||
          (clientUser as any)?.name ||
          "Unknown Client";

        return {
          ...m,
          clientName,
          attendeesData: attendeesData.filter(
            (a): a is { id: any; name: string } => a !== null,
          ),
        };
      }),
    );
  },
});

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    let meetings;
    if (user.role === "client") {
      const client = await ctx.db
        .query("clients")
        .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
        .unique();

      if (!client) return [];

      meetings = await ctx.db
        .query("meetings")
        .withIndex("by_client_id", (q) => q.eq("client_id", client._id))
        .collect();
    } else {
      meetings = await ctx.db.query("meetings").collect();
    }

    return await Promise.all(
      meetings.map(async (m) => {
        const client = await ctx.db.get(m.client_id);
        const clientUser = client
          ? await ctx.db.get((client as any).user_id)
          : null;
        const attendeesData = m.attendees
          ? await Promise.all(
              m.attendees.map(async (id) => {
                const userDoc = await ctx.db.get(id);
                if (!userDoc) return null;
                const name =
                  (userDoc as any).full_name ||
                  (userDoc as any).fullname ||
                  (userDoc as any).name ||
                  "Unknown";
                return { id, name };
              }),
            )
          : [];

        const clientName =
          (clientUser as any)?.full_name ||
          (clientUser as any)?.fullname ||
          (clientUser as any)?.name ||
          "Unknown Client";

        return {
          ...m,
          clientName,
          attendeesData: attendeesData.filter(
            (a): a is { id: any; name: string } => a !== null,
          ),
        };
      }),
    );
  },
});

export const addOutcome = mutation({
  args: {
    meeting_id: v.id("meetings"),
    sales_notes: v.optional(v.string()),
    employee_notes: v.optional(v.string()),
    client_notes: v.optional(v.string()),
    admin_notes: v.optional(v.string()),
    recording_url: v.optional(v.string()),
    screenshots: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.string())),
    other_files: v.optional(v.array(v.string())),
    next_steps: v.optional(v.string()),
    recorded_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { meeting_id, ...outcomeDetails } = args;

    const meeting = await ctx.db.get(meeting_id);
    if (!meeting) throw new Error("Meeting not found");

    const existingOutcome = meeting.outcome;

    // Update meeting status to completed and add/update outcome
    await ctx.db.patch(meeting_id, {
      status: "completed",
      updated_at: now,
      outcome: {
        ...outcomeDetails,
        created_at: existingOutcome?.created_at ?? now,
        updated_at: now,
      },
    });

    return meeting_id;
  },
});

export const requestMeeting = mutation({
  args: {
    client_id: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    preferred_time: v.number(),
    duration: v.optional(v.number()),
    requirement_id: v.optional(v.id("requirements")),
    initiated_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("meetings", {
      type: "client_request",
      title: args.title,
      description: args.description,
      scheduled_at: args.preferred_time,
      duration: args.duration || 60,
      client_id: args.client_id,
      requirement_id: args.requirement_id,
      initiated_by: args.initiated_by,
      status: "requested",
      created_at: now,
      updated_at: now,
    });
  },
});

export const reschedule = mutation({
  args: {
    id: v.id("meetings"),
    new_time: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      scheduled_at: args.new_time,
      status: "rescheduled",
      updated_at: Date.now(),
    });
  },
});
