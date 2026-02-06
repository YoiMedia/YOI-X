import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fullname: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    altPhone: v.optional(v.string()),
    password: v.string(), // In a real app, hash this!
    role: v.optional(v.union(v.literal("admin"), v.literal("sales"), v.literal("employee"), v.literal("client"))),
    website: v.optional(v.string()),
  }).index("by_username", ["username"]).index("by_email", ["email"]),

  documents: defineTable({
    createdBy: v.id("users"),
    sentTo: v.id("users"),
    type: v.union(v.literal("proposal"), v.literal("nda"), v.literal("invoice")),
    isSigned: v.boolean(),
    signatureDetails: v.optional(v.string()),
    fileUrl: v.string(),
    content: v.optional(v.string()), // Store JSON or text content
    metadata: v.optional(v.any()),
  }).index("by_sentTo", ["sentTo"]),

  meetings: defineTable({
    title: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
    type: v.string(),
    initiatedBy: v.id("users"),
    initiatedFor: v.id("users"), // usually the client
    reason: v.string(),
    time: v.string(),
    notifiedTo: v.array(v.id("users")),
    status: v.union(v.literal("scheduled"), v.literal("accepted"), v.literal("completed"), v.literal("cancelled")),
  }).index("by_initiatedFor", ["initiatedFor"]),

  meetingOutcomes: defineTable({
    meetingId: v.id("meetings"),
    recordings: v.array(v.string()),
    images: v.array(v.string()),
    notes: v.string(),
    createdBy: v.id("users"),
  }).index("by_meetingId", ["meetingId"]),

  notifications: defineTable({
    initiatedBy: v.id("users"),
    sentTo: v.id("users"),
    type: v.string(),
    message: v.string(),
    title: v.string(),
    isRead: v.boolean(),
    link: v.optional(v.string()),
  }).index("by_sentTo", ["sentTo"]),

  requirements: defineTable({
    items: v.array(v.object({
      title: v.string(),
      description: v.string(),
      dueDate: v.string(),
    })),
    meetingOutcomeId: v.optional(v.id("meetingOutcomes")),
    clientId: v.id("users"),
    salesPersonId: v.id("users"),
    assignedEmployeeIds: v.array(v.id("users")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    totalBudget: v.optional(v.number()),
  }).index("by_clientId", ["clientId"]),

  tasks: defineTable({
    requirementId: v.id("requirements"),
    createdBy: v.id("users"),
    assignedEmployeeId: v.id("users"),
    title: v.string(),
    description: v.string(),
    subtasks: v.array(v.object({
      text: v.string(),
      completed: v.boolean(),
    })),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    progress: v.number(),
  }).index("by_requirementId", ["requirementId"])
    .index("by_assignedEmployeeId", ["assignedEmployeeId"]),

  doubts: defineTable({
    taskId: v.id("tasks"),
    sentBy: v.id("users"),
    sentTo: v.id("users"),
    title: v.string(),
    message: v.string(),
    response: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("resolved")),
  }).index("by_taskId", ["taskId"]),

  submissions: defineTable({
    taskId: v.id("tasks"),
    clientId: v.id("users"),
    submittedBy: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    documents: v.array(v.string()),
    feedback: v.optional(v.string()),
  }).index("by_taskId", ["taskId"]),

  activities: defineTable({
    actor_name: v.string(),
    actor_initials: v.string(),
    action_text: v.string(),
    timestamp: v.string(),
    details: v.optional(v.any()),
  }),

  pendingApprovals: defineTable({
    title: v.string(),
    client: v.string(),
    status: v.string(),
    urgent: v.optional(v.boolean()),
    details: v.optional(v.any()),
  }),

  // Keep old tables for reference
  clients: defineTable({
    name: v.string(),
    contact: v.string(),
    email: v.string(),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("inactive")),
    value: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
  }),
  projects: defineTable({
    name: v.string(),
    client: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("delayed")),
    deadline: v.string(),
    value: v.string(),
  }),
  employees: defineTable({
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
  }),
});
