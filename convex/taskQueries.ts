import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ============================================
// QUERIES
// ============================================

/**
 * Get all queries for a specific task
 */
export const getQueriesByTask = query({
    args: { taskId: v.id("tasks") },
    handler: async (ctx, args) => {
        const queries = await ctx.db
            .query("taskQueries")
            .withIndex("byTaskId", (q) => q.eq("taskId", args.taskId))
            .filter((q) => q.eq(q.field("isDeleted"), undefined))
            .collect();

        // Enrich with creator info
        const enrichedQueries = await Promise.all(
            queries.map(async (query) => {
                const creator = await ctx.db.get(query.createdBy);
                const lastMessageSender = query.lastMessageBy
                    ? await ctx.db.get(query.lastMessageBy)
                    : null;

                // Enrich participants
                const participants = await Promise.all(
                    query.participants.map(async (userId) => {
                        const user = await ctx.db.get(userId);
                        return user ? {
                            _id: user._id,
                            fullName: user.fullName,
                            role: user.role,
                            profileImage: user.profileImage,
                        } : null;
                    })
                );

                return {
                    ...query,
                    creator: creator ? {
                        _id: creator._id,
                        fullName: creator.fullName,
                        role: creator.role,
                        profileImage: creator.profileImage,
                    } : null,
                    lastMessageSender: lastMessageSender ? {
                        _id: lastMessageSender._id,
                        fullName: lastMessageSender.fullName,
                        role: lastMessageSender.role,
                    } : null,
                    participants: participants.filter((p): p is NonNullable<typeof p> => p !== null),
                };
            })
        );

        return enrichedQueries.sort((a, b) =>
            (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt)
        );
    },
});

/**
 * Get a specific query by ID
 */
export const getQueryById = query({
    args: { queryId: v.id("taskQueries") },
    handler: async (ctx, args) => {
        const query = await ctx.db.get(args.queryId);

        if (!query || query.isDeleted) {
            return null;
        }

        // Get task info
        const task = await ctx.db.get(query.taskId);

        // Get creator info
        const creator = await ctx.db.get(query.createdBy);

        // Get participants info
        const participants = await Promise.all(
            query.participants.map(async (userId) => {
                const user = await ctx.db.get(userId);
                return user ? {
                    _id: user._id,
                    fullName: user.fullName,
                    role: user.role,
                    profileImage: user.profileImage,
                    email: user.email,
                } : null;
            })
        );

        return {
            ...query,
            task: task ? {
                _id: task._id,
                taskNumber: task.taskNumber,
                title: task.title,
                status: task.status,
            } : null,
            creator: creator ? {
                _id: creator._id,
                fullName: creator.fullName,
                role: creator.role,
                profileImage: creator.profileImage,
            } : null,
            participants: participants.filter(Boolean),
        };
    },
});

/**
 * Get all messages for a specific query
 */
export const getMessagesByQuery = query({
    args: { queryId: v.id("taskQueries") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("queryMessages")
            .withIndex("byQueryId", (q) => q.eq("queryId", args.queryId))
            .filter((q) => q.eq(q.field("isDeleted"), undefined))
            .collect();

        // Enrich with sender info
        const enrichedMessages = await Promise.all(
            messages.map(async (message) => {
                const sender = await ctx.db.get(message.senderId);

                return {
                    ...message,
                    sender: sender ? {
                        _id: sender._id,
                        fullName: sender.fullName,
                        role: sender.role,
                        profileImage: sender.profileImage,
                    } : null,
                };
            })
        );

        return enrichedMessages.sort((a, b) => a.createdAt - b.createdAt);
    },
});

/**
 * Get user's queries (queries they created or are participating in)
 */
export const getUserQueries = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const allQueries = await ctx.db
            .query("taskQueries")
            .filter((q) => q.eq(q.field("isDeleted"), undefined))
            .collect();

        // Filter queries where user is creator or participant
        const userQueries = allQueries.filter(
            (query) =>
                query.createdBy === args.userId ||
                query.participants.includes(args.userId)
        );

        // Enrich with task, requirement, and creator info
        const enrichedQueries = await Promise.all(
            userQueries.map(async (query) => {
                const task = await ctx.db.get(query.taskId);
                const creator = await ctx.db.get(query.createdBy);

                let requirementName = "Unknown Requirement";
                if (task) {
                    const requirement = await ctx.db.get(task.requirementId);
                    if (requirement) {
                        requirementName = requirement.requirementName;
                    }
                }

                // Enrich participants
                const participants = await Promise.all(
                    query.participants.map(async (userId) => {
                        const user = await ctx.db.get(userId);
                        return user ? {
                            _id: user._id,
                            fullName: user.fullName,
                            role: user.role,
                            profileImage: user.profileImage,
                        } : null;
                    })
                );

                return {
                    ...query,
                    task: task ? {
                        _id: task._id,
                        taskNumber: task.taskNumber,
                        title: task.title,
                        status: task.status,
                    } : null,
                    requirementName,
                    creator: creator ? {
                        _id: creator._id,
                        fullName: creator.fullName,
                        role: creator.role,
                        profileImage: creator.profileImage,
                    } : null,
                    participants: participants.filter((p): p is NonNullable<typeof p> => p !== null),
                };
            })
        );

        return enrichedQueries.sort((a, b) =>
            (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt)
        );
    },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new task query (raise a query)
 */
export const createQuery = mutation({
    args: {
        taskId: v.id("tasks"),
        title: v.string(),
        description: v.optional(v.string()),
        createdBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Get task info to find participants
        const task = await ctx.db.get(args.taskId);
        if (!task) {
            throw new Error("Task not found");
        }

        // Get requirement to find client
        const requirement = await ctx.db.get(task.requirementId);
        if (!requirement) {
            throw new Error("Requirement not found");
        }

        // Get client info
        const client = await ctx.db.get(requirement.clientId);
        if (!client) {
            throw new Error("Client not found");
        }

        // Build participants list: admin(s), client, assigned employee
        const participants: Id<"users">[] = [];

        // Add admins and superadmins
        const admins = await ctx.db
            .query("users")
            .withIndex("byRole", (q) => q.eq("role", "admin"))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        const superadmins = await ctx.db
            .query("users")
            .withIndex("byRole", (q) => q.eq("role", "superadmin"))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        [...admins, ...superadmins].forEach((admin) => {
            if (!participants.includes(admin._id)) {
                participants.push(admin._id);
            }
        });

        // Add client user
        if (!participants.includes(client.userId)) {
            participants.push(client.userId);
        }

        // Add assigned employee (freelancer)
        if (task.assignedTo && !participants.includes(task.assignedTo)) {
            participants.push(task.assignedTo);
        }

        // Add creator if not already in participants
        if (!participants.includes(args.createdBy)) {
            participants.push(args.createdBy);
        }

        // Generate query number
        const existingQueries = await ctx.db.query("taskQueries").collect();
        const queryNumber = `QRY-${String(existingQueries.length + 1).padStart(5, "0")}`;

        const now = Date.now();

        const queryId = await ctx.db.insert("taskQueries", {
            queryNumber,
            taskId: args.taskId,
            title: args.title,
            description: args.description,
            createdBy: args.createdBy,
            status: "open",
            participants,
            createdAt: now,
            updatedAt: now,
        });

        return queryId;
    },
});

/**
 * Send a message in a query
 */
export const sendMessage = mutation({
    args: {
        queryId: v.id("taskQueries"),
        senderId: v.id("users"),
        content: v.string(),
        mentions: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    role: v.optional(v.string()),
                })
            )
        ),
        attachments: v.optional(
            v.array(
                v.object({
                    fileId: v.id("files"),
                    storageKey: v.string(),
                    fileName: v.string(),
                    fileType: v.string(),
                    fileSize: v.number(),
                    url: v.optional(v.string()),
                })
            )
        ),
    },
    handler: async (ctx, args) => {
        const query = await ctx.db.get(args.queryId);

        if (!query || query.isDeleted) {
            throw new Error("Query not found");
        }

        // Verify sender is a participant
        if (!query.participants.includes(args.senderId)) {
            throw new Error("You are not a participant in this query");
        }

        const now = Date.now();

        // Create message
        const messageId = await ctx.db.insert("queryMessages", {
            queryId: args.queryId,
            senderId: args.senderId,
            content: args.content,
            mentions: args.mentions,
            attachments: args.attachments,
            createdAt: now,
            updatedAt: now,
        });

        // Update query's last message info
        await ctx.db.patch(args.queryId, {
            lastMessageAt: now,
            lastMessageBy: args.senderId,
            lastMessagePreview: args.content.substring(0, 100),
            status: "active",
            updatedAt: now,
        });

        // TODO: Create notifications for mentioned users
        if (args.mentions && args.mentions.length > 0) {
            for (const mention of args.mentions) {
                // Skip if mentioning self
                if (mention.userId === args.senderId) continue;

                await ctx.db.insert("notifications", {
                    sentTo: mention.userId,
                    title: "You were mentioned in a query",
                    message: `You were mentioned in a query message`,
                    type: "comment-mention",
                    relatedEntityType: "taskQuery",
                    relatedEntityId: args.queryId,
                    initiatedBy: args.senderId,
                    isRead: false,
                    createdAt: now,
                });
            }
        }

        return messageId;
    },
});

/**
 * Update query status
 */
export const updateQueryStatus = mutation({
    args: {
        queryId: v.id("taskQueries"),
        status: v.union(
            v.literal("open"),
            v.literal("active"),
            v.literal("resolved"),
            v.literal("closed")
        ),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const query = await ctx.db.get(args.queryId);

        if (!query || query.isDeleted) {
            throw new Error("Query not found");
        }

        // Verify user is a participant
        if (!query.participants.includes(args.userId)) {
            throw new Error("You are not authorized to update this query");
        }

        await ctx.db.patch(args.queryId, {
            status: args.status,
            updatedAt: Date.now(),
        });

        return args.queryId;
    },
});

/**
 * Delete a query (soft delete)
 */
export const deleteQuery = mutation({
    args: {
        queryId: v.id("taskQueries"),
        deletedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const query = await ctx.db.get(args.queryId);

        if (!query || query.isDeleted) {
            throw new Error("Query not found");
        }

        // Only creator or admin can delete
        const user = await ctx.db.get(args.deletedBy);
        if (!user) {
            throw new Error("User not found");
        }

        if (
            query.createdBy !== args.deletedBy &&
            user.role !== "admin" &&
            user.role !== "superadmin"
        ) {
            throw new Error("You are not authorized to delete this query");
        }

        const now = Date.now();

        await ctx.db.patch(args.queryId, {
            isDeleted: true,
            deletedAt: now,
            deletedBy: args.deletedBy,
            updatedAt: now,
        });

        return args.queryId;
    },
});

/**
 * Edit a message
 */
export const editMessage = mutation({
    args: {
        messageId: v.id("queryMessages"),
        content: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);

        if (!message || message.isDeleted) {
            throw new Error("Message not found");
        }

        // Only sender can edit their message
        if (message.senderId !== args.userId) {
            throw new Error("You can only edit your own messages");
        }

        const now = Date.now();

        await ctx.db.patch(args.messageId, {
            content: args.content,
            isEdited: true,
            editedAt: now,
            updatedAt: now,
        });

        return args.messageId;
    },
});

/**
 * Delete a message (soft delete)
 */
export const deleteMessage = mutation({
    args: {
        messageId: v.id("queryMessages"),
        deletedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);

        if (!message || message.isDeleted) {
            throw new Error("Message not found");
        }

        // Only sender or admin can delete
        const user = await ctx.db.get(args.deletedBy);
        if (!user) {
            throw new Error("User not found");
        }

        if (
            message.senderId !== args.deletedBy &&
            user.role !== "admin" &&
            user.role !== "superadmin"
        ) {
            throw new Error("You are not authorized to delete this message");
        }

        const now = Date.now();

        await ctx.db.patch(args.messageId, {
            isDeleted: true,
            deletedAt: now,
            deletedBy: args.deletedBy,
            updatedAt: now,
        });

        return args.messageId;
    },
});
