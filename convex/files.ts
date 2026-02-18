import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { R2Client } from "./lib/r2";

const r2 = new R2Client();

export const generateUploadUrl = action({
    args: {
        contentType: v.string(),
        fileName: v.string(),
    },
    handler: async (ctx, args) => {
        // Unique key for the file
        const key = `${Date.now()}-${args.fileName.replace(/\s+/g, '-')}`;
        const uploadUrl = await r2.generateUploadUrl(key, args.contentType);
        return { uploadUrl, key };
    },
});

export const saveFile = mutation({
    args: {
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
        storageKey: v.string(), // This is the file Key in R2
        uploadedBy: v.id("users"),
        entityType: v.optional(
            v.union(
                v.literal("task"),
                v.literal("submission"),
                v.literal("document"),
                v.literal("requirement"),
                v.literal("user"),
                v.literal("client"),
                v.literal("comment"),
                v.literal("meeting"),
                v.literal("meetingOutcome"),
                v.literal("taskQuery")
            )
        ),
        entityId: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const fileId = await ctx.db.insert("files", {
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDeleted: false,
        });
        return fileId;
    },
});

export const copyFileToEntity = mutation({
    args: {
        fileId: v.id("files"),
        targetEntityType: v.union(
            v.literal("task"),
            v.literal("submission"),
            v.literal("document"),
            v.literal("requirement"),
            v.literal("user"),
            v.literal("client"),
            v.literal("comment"),
            v.literal("meeting"),
            v.literal("meetingOutcome"),
            v.literal("taskQuery")
        ),
        targetEntityId: v.string(),
        userId: v.id("users"), // who performed the copy
    },
    handler: async (ctx, args) => {
        const originalFile = await ctx.db.get(args.fileId);
        if (!originalFile) throw new Error("File not found");

        const newFileId = await ctx.db.insert("files", {
            fileName: originalFile.fileName,
            fileType: originalFile.fileType,
            fileSize: originalFile.fileSize,
            storageKey: originalFile.storageKey, // reuse same object
            uploadedBy: args.userId,
            entityType: args.targetEntityType,
            entityId: args.targetEntityId,
            description: `Copied from ${originalFile.fileName}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDeleted: false,
        });
        return newFileId;
    }
});

export const getFileUrl = action({
    args: { storageKey: v.string() },
    handler: async (ctx, args) => {
        return await r2.getUrl(args.storageKey);
    },
});

export const getFiles = query({
    args: {
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let files;

        if (args.entityType) {
            // Use the index if entityType is provided
            files = await ctx.db
                .query("files")
                .withIndex("byEntityType", (q) => q.eq("entityType", args.entityType as any))
                .filter((q) => q.eq(q.field("isDeleted"), false))
                .collect();

            // Further filter by entityId if provided
            if (args.entityId) {
                files = files.filter(f => f.entityId === args.entityId);
            }
        } else {
            // Fallback to full scan if no entityType (should be avoided in production for large tables)
            // Or just return empty if no args
            if (!args.entityId) return [];

            files = await ctx.db
                .query("files")
                .filter((q) => q.and(
                    q.eq(q.field("isDeleted"), false),
                    // We can't easily filter by entityId without index, so we scan
                    // ideally we should have an index for entityId too or compound
                ))
                .collect();

            if (args.entityId) {
                files = files.filter(f => f.entityId === args.entityId);
            }
        }

        // Fetch uploader info
        return await Promise.all(files.map(async (file) => {
            const uploader = await ctx.db.get(file.uploadedBy);

            return {
                ...file,
                uploaderName: uploader?.fullName || "Unknown",
            };
        }));
    },
});

export const deleteFile = mutation({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.fileId, {
            isDeleted: true,
            deletedAt: Date.now(),
        });
    }
});
