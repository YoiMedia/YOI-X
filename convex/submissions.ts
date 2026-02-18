import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Create a new submission
 */
export const createSubmission = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        taskId: v.id("tasks"),
        requirementId: v.id("requirements"),
        clientId: v.id("clients"),
        submittedBy: v.id("users"),
        deliverables: v.optional(v.array(v.string())), // Storage keys
    },
    handler: async (ctx, args) => {
        // Generate submission number
        const lastSubmission = await ctx.db.query("submissions").order("desc").first();
        const lastNumber = lastSubmission ? parseInt(lastSubmission.submissionNumber.split("-")[1]) : 0;
        const submissionNumber = `SUB-${(lastNumber + 1).toString().padStart(4, "0")}`;

        const now = Date.now();
        const submissionId = await ctx.db.insert("submissions", {
            ...args,
            submissionNumber,
            submissionDate: now,
            status: "pending",
            version: 1,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
        });

        // Update task status to review
        await ctx.db.patch(args.taskId, {
            status: "review",
            updatedAt: now,
        });

        // Get client's user record for notification
        const client = await ctx.db.get(args.clientId);
        if (client) {
            // Create notification for client user
            await ctx.db.insert("notifications", {
                sentTo: client.userId,
                title: "New Submission Received",
                message: `A new work submission "${args.title}" has been uploaded for review.`,
                type: "submission-review",
                relatedEntityType: "submission",
                relatedEntityId: submissionId,
                initiatedBy: args.submittedBy,
                isRead: false,
                createdAt: now,
            });
        }

        return submissionId;
    },
});

/**
 * List submissions with filtering
 */
export const listSubmissions = query({
    args: {
        clientId: v.optional(v.id("clients")),
        requirementId: v.optional(v.id("requirements")),
        status: v.optional(v.string()),
        userId: v.optional(v.id("users")),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log("listSubmissions called with args:", args);
        let submissions: Doc<"submissions">[] = [];

        // Admin and Superadmin see EVERYTHING by default, unless specific filters are applied
        if (args.role === 'admin' || args.role === 'superadmin') {
            console.log("User is admin/superadmin, fetching all submissions");
            // If specific filters are provided, use them. Otherwise, fetch all.
            if (args.clientId) {
                submissions = await ctx.db
                    .query("submissions")
                    .withIndex("byClientId", (dbQ) => dbQ.eq("clientId", args.clientId!))
                    .filter((q) => q.neq(q.field("isDeleted"), true))
                    .collect();
            } else if (args.requirementId) {
                submissions = await ctx.db
                    .query("submissions")
                    .withIndex("byRequirementId", (dbQ) => dbQ.eq("requirementId", args.requirementId!))
                    .filter((q) => q.neq(q.field("isDeleted"), true))
                    .collect();
            } else {
                submissions = await ctx.db
                    .query("submissions")
                    // Using neq(true) handles both false and undefined (legacy data)
                    .filter((q) => q.neq(q.field("isDeleted"), true))
                    .collect();
            }
        }
        // Other roles (employee, client, sales) logic
        else if (args.role === "employee" && args.userId) {
            console.log("User is employee, fetching own submissions");
            submissions = await ctx.db
                .query("submissions")
                .withIndex("bySubmittedBy", (dbQ) => dbQ.eq("submittedBy", args.userId!))
                .filter((q) => q.neq(q.field("isDeleted"), true))
                .collect();
        } else if (args.role === "client" && args.userId) {
            console.log("User is client, fetching client submissions");
            // Clients see submissions for their client record
            const client = await ctx.db
                .query("clients")
                .withIndex("byUserId", (q) => q.eq("userId", args.userId!))
                .unique();
            if (client) {
                submissions = await ctx.db
                    .query("submissions")
                    .withIndex("byClientId", (dbQ) => dbQ.eq("clientId", client._id))
                    .filter((q) => q.neq(q.field("isDeleted"), true))
                    .collect();
            } else {
                submissions = [];
            }
        } else if (args.role === "sales" && args.userId) {
            console.log("User is sales, fetching sales submissions");
            // Sales see submissions for their clients
            const userClients = await ctx.db
                .query("clients")
                .withIndex("bySalesPersonId", (q) => q.eq("salesPersonId", args.userId!))
                .collect();
            const clientIds = userClients.map(c => c._id);

            const allSubmissions = await ctx.db
                .query("submissions")
                .filter((q) => q.neq(q.field("isDeleted"), true))
                .collect();

            submissions = allSubmissions.filter(s => clientIds.includes(s.clientId));
        } else {
            console.log("Unknown role or no user ID, returning empty or limited set");
            // Fallback: If we don't know who they are, maybe they shouldn't see anything?
            // Or if it's a public view? For now, let's be safe and return empty if no role match
            // UNLESS they provided a specific ID to look up (like viewing a public link?)
            // But for this app, we want secure defaults.
            if (args.clientId) {
                // Allow filtering by client ID if explicitly requested (e.g. by system)
                // But wait, is this secure?
                // For now, let's assume if no role is matched, we default to empty to be safe.
                // UNLESS the previous "admin" catch-all was intended for "anyone else".
                // The previous code returned ALL submissions here. That might have been the bug for "why can admin see all"
                // Actually, the previous code worked for admin because it fell through to "else".
                // But now we handle admin explicitly.
                submissions = [];
            } else {
                submissions = [];
            }
        }

        console.log(`Fetched ${submissions.length} submissions`);

        // Enrich with related data
        // Enrich with related data
        // Enrich with related data
        return await Promise.all(
            submissions.map(async (sub) => {
                const task = sub.taskId ? await ctx.db.get(sub.taskId) : null;
                const requirement = sub.requirementId ? await ctx.db.get(sub.requirementId) : null;

                const submitter = sub.submittedBy ? await ctx.db.get(sub.submittedBy) : null;

                return {
                    ...sub,
                    taskName: task?.title,
                    requirementName: requirement?.requirementName,

                    submitterName: submitter?.fullName,
                    submitterRole: submitter?.role,
                };
            })
        );
    },
});

/**
 * Review a submission (Approve, Reject, or Request Changes)
 */
export const reviewSubmission = mutation({
    args: {
        submissionId: v.id("submissions"),
        status: v.union(
            v.literal("approved"),
            v.literal("rejected"),
            v.literal("changes-requested")
        ),
        reviewNotes: v.optional(v.string()),
        requestedChanges: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    description: v.string(),
                    completed: v.optional(v.boolean()),
                })
            )
        ),
        reviewedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const submission = await ctx.db.get(args.submissionId);
        if (!submission) throw new Error("Submission not found");

        const now = Date.now();
        await ctx.db.patch(args.submissionId, {
            status: args.status,
            reviewNotes: args.reviewNotes,
            requestedChanges: args.requestedChanges,
            reviewedBy: args.reviewedBy,
            reviewedAt: now,
            updatedAt: now,
        });

        // If approved, mark the task as done
        if (args.status === "approved") {
            await ctx.db.patch(submission.taskId, {
                status: "done",
                progress: 100,
                updatedAt: now,
            });
        } else if (args.status === "rejected") {
            // If rejected, set back to todo for re-tasking
            await ctx.db.patch(submission.taskId, {
                status: "todo",
                progress: 0,
                updatedAt: now,
            });
        } else if (args.status === "changes-requested") {
            // Set back to in-progress for updates
            await ctx.db.patch(submission.taskId, {
                status: "in-progress",
                updatedAt: now,
            });
        }

        // If rejected or changes requested, notify the submitter
        await ctx.db.insert("notifications", {
            sentTo: submission.submittedBy,
            title: `Submission ${args.status.replace("-", " ")}`,
            message: `Your submission "${submission.title}" has been ${args.status.replace("-", " ")}.`,
            type: "comment-mention", // or a specific type
            relatedEntityType: "submission",
            relatedEntityId: submission._id,
            initiatedBy: args.reviewedBy,
            isRead: false,
            createdAt: now,
        });

        return args.submissionId;
    },
});

/**
 * Get submission by ID with full details
 */
export const getSubmissionById = query({
    args: { submissionId: v.id("submissions") },
    handler: async (ctx, args) => {
        const sub = await ctx.db.get(args.submissionId);
        if (!sub) return null;

        const task = await ctx.db.get(sub.taskId);
        const requirement = await ctx.db.get(sub.requirementId);

        const submitter = await ctx.db.get(sub.submittedBy);
        const reviewer = sub.reviewedBy ? await ctx.db.get(sub.reviewedBy) : null;

        return {
            ...sub,
            task,
            requirement,

            submitter: submitter ? {
                fullName: submitter.fullName,
                role: submitter.role,
                profileImage: submitter.profileImage,
            } : null,
            reviewer: reviewer ? {
                fullName: reviewer.fullName,
                role: reviewer.role,
            } : null,
        };
    },
});
