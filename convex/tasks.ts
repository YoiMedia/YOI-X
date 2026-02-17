import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTask = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        requirementId: v.id("requirements"),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // Since we are using a custom auth service in the frontend, for now we'll assume the userId is passed or we find it.
        // But the user management uses context. Let's see how others do it.
        // Actually, let's just use a userId arg for simplicity if auth isn't fully integrated in Convex yet.
        // Wait, looking at other files... they don't seem to use identity much, they use userId in args.
    },
});

// Let's refine the args to include userId for now or use the identity if available.
// I'll stick to userId in args for consistency with recent changes in requirements.ts/projects.ts.

export const listTasks = query({
    args: { requirementId: v.id("requirements") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("byRequirementId", (q) => q.eq("requirementId", args.requirementId))
            .filter((q) => q.eq(q.field("isDeleted"), false))
            .collect();
    },
});

export const addTask = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        requirementId: v.id("requirements"),
        assignedTo: v.id("users"),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    },
    handler: async (ctx, args) => {
        const lastTask = await ctx.db.query("tasks").order("desc").first();
        const lastNumber = lastTask ? parseInt(lastTask.taskNumber.split('-')[1]) : 0;
        const taskNumber = `TSK-${(lastNumber + 1).toString().padStart(4, '0')}`;

        return await ctx.db.insert("tasks", {
            ...args,
            taskNumber,
            status: "todo",
            progress: 0,
            subtasks: [],
            createdBy: args.assignedTo, // For now, since employee creates it for themselves
            isDeleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const updateTaskStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.union(
            v.literal("todo"),
            v.literal("in-progress"),
            v.literal("review"),
            v.literal("blocked"),
            v.literal("done"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.taskId, {
            status: args.status,
            updatedAt: Date.now(),
            completedDate: args.status === "done" ? Date.now() : undefined,
            progress: args.status === "done" ? 100 : undefined,
        });
    },
});

export const addSubtask = mutation({
    args: {
        taskId: v.id("tasks"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        const subtasks = task.subtasks || [];
        const newSubtask = {
            id: Math.random().toString(36).substring(2, 9),
            title: args.title,
            completed: false,
        };

        await ctx.db.patch(args.taskId, {
            subtasks: [...subtasks, newSubtask],
            updatedAt: Date.now(),
        });
    },
});

export const toggleSubtask = mutation({
    args: {
        taskId: v.id("tasks"),
        subtaskId: v.string(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        const subtasks = task.subtasks?.map(st =>
            st.id === args.subtaskId ? { ...st, completed: !st.completed } : st
        );

        const completedCount = subtasks?.filter(st => st.completed).length || 0;
        const totalCount = subtasks?.length || 0;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        await ctx.db.patch(args.taskId, {
            subtasks,
            progress,
            updatedAt: Date.now(),
            status: progress === 100 ? "done" : (progress > 0 ? "in-progress" : "todo"),
        });
    },
});
