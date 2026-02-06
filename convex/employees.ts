import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("employees").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    initials: v.string(),
    role: v.string(),
    department: v.string(),
    email: v.string(),
    phone: v.string(),
    status: v.union(v.literal("active"), v.literal("away"), v.literal("offline")),
    tasks_assigned: v.number(),
    tasks_capacity: v.number(),
    on_leave: v.boolean(),
    taskList: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        status: v.string(),
        priority: v.string(),
        dueDate: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("employees", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("employees"),
    updates: v.any(), // Using any for simplicity in updates, though v.partial is better if defined
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
  },
});

export const remove = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const deleteTask = mutation({
  args: {
    employeeId: v.id("employees"),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) return;

    const newTaskList = employee.taskList.filter((t) => t.id !== args.taskId);
    await ctx.db.patch(args.employeeId, {
      taskList: newTaskList,
      tasks_assigned: Math.max(0, employee.tasks_assigned - 1),
    });
  },
});
