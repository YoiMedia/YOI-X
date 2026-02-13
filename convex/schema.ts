import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USERS - All system users (admin, sales, employee, client)
  // ============================================
  users: defineTable({
    fullName: v.string(),
    username: v.string(),
    email: v.string(),
    phone: v.string(),
    alternatePhone: v.optional(v.string()),
    password: v.optional(v.string()), // null for clients using magic link
    role: v.union(
      v.literal("admin"),
      v.literal("sales"),
      v.literal("employee"),
      v.literal("client"),
    ),
    website: v.optional(v.string()),
    address: v.optional(v.string()),
    profileImage: v.optional(v.string()), // Cloudflare storage URL
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"]),

  // ============================================
  // CLIENTS - Extended client information
  // ============================================
  clients: defineTable({
    userId: v.id("users"), // Reference to user account
    salesPersonId: v.id("users"), // Managing sales person
    companyName: v.string(),
    industry: v.optional(v.string()),
    companySize: v.optional(v.string()),
    uniqueClientId: v.string(), // Custom client ID (e.g., CLI-001)
    magicLinkToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    status: v.union(
      v.literal("lead"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("churned"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_salesPersonId", ["salesPersonId"])
    .index("by_uniqueClientId", ["uniqueClientId"])
    .index("by_status", ["status"]),

  // ============================================
  // DOCUMENTS - Proposals, NDAs, Invoices
  // ============================================
  documents: defineTable({
    type: v.union(
      v.literal("proposal"),
      v.literal("nda"),
      v.literal("invoice"),
    ),
    title: v.string(),
    documentNumber: v.string(), // e.g., PROP-001, NDA-001, INV-001
    createdBy: v.id("users"), // Sales person
    clientId: v.id("clients"),
    requirementId: v.optional(v.id("requirements")),
    content: v.string(), // JSON stringified content
    fileUrls: v.array(v.string()), // Cloudflare URLs
    isSigned: v.boolean(),
    signedAt: v.optional(v.number()),
    signedBy: v.optional(v.id("users")),
    signatureImageUrl: v.optional(v.string()),
    // Invoice specific fields
    amount: v.optional(v.number()),
    dueDate: v.optional(v.string()), // ISO date string
    // Proposal specific fields
    validUntil: v.optional(v.string()), // ISO date string
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("signed"),
      v.literal("expired"),
      v.literal("cancelled"),
    ),
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_createdBy", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_requirementId", ["requirementId"]),

  // ============================================
  // MEETINGS - Calls and meetings
  // ============================================
  meetings: defineTable({
    type: v.union(
      v.literal("onboarding"),
      v.literal("review"),
      v.literal("change_request"),
      v.literal("general"),
    ),
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    duration: v.number(), // in minutes
    meetingLink: v.optional(v.string()),
    initiatedBy: v.id("users"),
    clientId: v.id("clients"),
    attendees: v.array(v.id("users")),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("rescheduled"),
    ),
    requirementId: v.optional(v.id("requirements")),
    documentId: v.optional(v.id("documents")),
    notificationsSent: v.boolean(),
    reminderSent: v.boolean(),
    // Call outcome embedded
    outcome: v.optional(
      v.object({
        salesNotes: v.optional(v.string()),
        employeeNotes: v.optional(v.string()),
        clientNotes: v.optional(v.string()),
        adminNotes: v.optional(v.string()),
        recordingUrl: v.optional(v.string()),
        screenshots: v.array(v.string()), // Cloudflare URLs
        documents: v.array(v.string()), // Cloudflare URLs
        otherFiles: v.array(v.string()), // Cloudflare URLs
        nextSteps: v.array(v.string()),
        recordedBy: v.id("users"),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_scheduledAt", ["scheduledAt"])
    .index("by_initiatedBy", ["initiatedBy"]),

  // ============================================
  // REQUIREMENTS - Project requirements and timelines
  // ============================================
  requirements: defineTable({
    requirementName: v.string(),
    requirementNumber: v.string(), // e.g., REQ-2024-001
    clientId: v.id("clients"),
    salesPersonId: v.id("users"),
    callOutcomeMeetingId: v.optional(v.id("meetings")), // Reference to onboarding call
    // Requirements array structure
    requirements: v.array(
      v.object({
        id: v.string(),
        description: v.string(),
        priority: v.union(
          v.literal("high"),
          v.literal("medium"),
          v.literal("low"),
        ),
        estimatedHours: v.optional(v.number()),
      }),
    ),
    startDate: v.string(), // ISO date string
    expectedEndDate: v.string(), // ISO date string
    actualEndDate: v.optional(v.string()),
    assignedEmployees: v.array(v.id("users")),
    approvedBy: v.optional(v.id("users")), // Admin who approved
    approvedAt: v.optional(v.number()),
    status: v.union(
      v.literal("pending_approval"),
      v.literal("approved"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("on_hold"),
      v.literal("cancelled"),
    ),
    estimatedBudget: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_salesPersonId", ["salesPersonId"])
    .index("by_status", ["status"])
    .index("by_requirementNumber", ["requirementNumber"]),

  // ============================================
  // TASKS - Individual tasks within requirements
  // ============================================
  tasks: defineTable({
    taskNumber: v.string(), // e.g., TASK-001
    title: v.string(),
    description: v.optional(v.string()),
    requirementId: v.id("requirements"),
    assignedTo: v.id("users"), // Single employee (changed from array)
    createdBy: v.id("users"),
    // Subtasks structure
    subtasks: v.array(
      v.object({
        id: v.string(),
        description: v.string(),
        isCompleted: v.boolean(),
        completedAt: v.optional(v.number()),
        completedBy: v.optional(v.id("users")),
      }),
    ),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("review"),
      v.literal("completed"),
    ),
    progress: v.number(), // 0-100
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requirementId", ["requirementId"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_taskNumber", ["taskNumber"]),

  // ============================================
  // TASK QUESTIONS - Employee doubts/questions
  // ============================================
  taskQuestions: defineTable({
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("urgent"),
      v.literal("high"),
      v.literal("normal"),
      v.literal("low"),
    ),
    askedBy: v.id("users"), // Employee
    directedTo: v.array(v.id("users")), // Client, sales, admin
    attachments: v.array(v.string()), // Cloudflare URLs
    response: v.optional(v.string()),
    respondedBy: v.optional(v.id("users")),
    respondedAt: v.optional(v.number()),
    status: v.union(
      v.literal("open"),
      v.literal("answered"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_taskId", ["taskId"])
    .index("by_askedBy", ["askedBy"])
    .index("by_status", ["status"]),

  // ============================================
  // SUBMISSIONS - Work submissions by employees
  // ============================================
  submissions: defineTable({
    submissionNumber: v.string(), // e.g., SUB-2024-001
    taskId: v.id("tasks"),
    requirementId: v.id("requirements"),
    submittedBy: v.id("users"), // Employee
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    deliverables: v.array(v.string()), // Cloudflare URLs
    status: v.union(
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("changes_requested"),
    ),
    reviewedBy: v.optional(v.id("users")), // Client
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    changeRequestDetails: v.optional(v.string()),
    requestedChanges: v.array(v.string()),
    followUpMeetingId: v.optional(v.id("meetings")),
    isResubmission: v.boolean(),
    originalSubmissionId: v.optional(v.id("submissions")),
    revisionNumber: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_taskId", ["taskId"])
    .index("by_requirementId", ["requirementId"])
    .index("by_submittedBy", ["submittedBy"])
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_submissionNumber", ["submissionNumber"]),

  // ============================================
  // FEEDBACK - Client feedback on completed work
  // ============================================
  feedback: defineTable({
    submissionId: v.id("submissions"),
    requirementId: v.id("requirements"),
    clientId: v.id("clients"),
    overallRating: v.number(), // 1-5
    qualityRating: v.optional(v.number()),
    timelinessRating: v.optional(v.number()),
    communicationRating: v.optional(v.number()),
    comments: v.string(),
    positives: v.array(v.string()),
    improvements: v.array(v.string()),
    wouldRecommend: v.boolean(),
    testimonialPermission: v.boolean(),
    submittedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_requirementId", ["requirementId"])
    .index("by_clientId", ["clientId"]),

  // ============================================
  // NOTIFICATIONS - System notifications
  // ============================================
  notifications: defineTable({
    initiatedBy: v.optional(v.id("users")), // null for system notifications
    sentTo: v.id("users"),
    type: v.union(
      v.literal("document_sent"),
      v.literal("document_signed"),
      v.literal("meeting_scheduled"),
      v.literal("meeting_reminder"),
      v.literal("task_assigned"),
      v.literal("submission_received"),
      v.literal("feedback_requested"),
      v.literal("requirement_approved"),
      v.literal("question_raised"),
      v.literal("question_answered"),
      v.literal("general"),
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()), // Deep link
    relatedEntityType: v.optional(
      v.union(
        v.literal("document"),
        v.literal("meeting"),
        v.literal("task"),
        v.literal("submission"),
        v.literal("requirement"),
      ),
    ),
    relatedEntityId: v.optional(v.string()), // Generic ID
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    emailSent: v.boolean(),
    emailSentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_sentTo", ["sentTo"])
    .index("by_isRead", ["isRead"])
    .index("by_type", ["type"]),

  // ============================================
  // ACTIVITY LOG - Audit trail
  // ============================================
  activityLog: defineTable({
    userId: v.id("users"),
    action: v.string(), // e.g., "created_proposal", "signed_document"
    entityType: v.optional(
      v.union(
        v.literal("user"),
        v.literal("client"),
        v.literal("document"),
        v.literal("meeting"),
        v.literal("requirement"),
        v.literal("task"),
        v.literal("submission"),
      ),
    ),
    entityId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.string()), // JSON stringified
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_entityType", ["entityType"])
    .index("by_createdAt", ["createdAt"]),
});
