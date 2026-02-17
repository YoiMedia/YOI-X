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
        passwordHash: v.optional(v.string()), // Use auth provider instead when possible
        role: v.union(
            v.literal("superadmin"),
            v.literal("admin"),
            v.literal("sales"),
            v.literal("employee"),
            v.literal("client")
        ),
        website: v.optional(v.string()),
        address: v.optional(
            v.object({
                street: v.string(),
                city: v.string(),
                state: v.string(),
                zipCode: v.string(),
                country: v.string(),
            })
        ),
        profileImage: v.optional(v.string()),
        isActive: v.boolean(),
        createdBy: v.optional(v.id("users")),
        lastLogin: v.optional(v.number()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Magic link auth
        magicLinkToken: v.optional(v.string()),
        magicLinkTokenExpires: v.optional(v.number()),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byEmail", ["email"])
        .index("byUsername", ["username"])
        .index("byRole", ["role"])
        .index("byIsActive", ["isActive"])
        .index("byCreatedBy", ["createdBy"]),

    // ============================================
    // CLIENTS - Extended client information
    // ============================================
    clients: defineTable({
        userId: v.id("users"),
        salesPersonId: v.optional(v.id("users")),
        companyName: v.string(),
        industry: v.optional(v.string()),
        companySize: v.optional(
            v.union(
                v.literal("5"),
                v.literal("1-10"),
                v.literal("11-50"),
                v.literal("51-200"),
                v.literal("201-500"),
                v.literal("501+")
            )
        ),
        status: v.union(
            v.literal("lead"),
            v.literal("prospect"),
            v.literal("active"),
            v.literal("inactive"),
            v.literal("churned")
        ),
        uniqueClientId: v.string(), // Auto-generated unique ID
        notes: v.optional(v.string()),
        // Revenue tracking
        totalRevenue: v.optional(v.number()),
        lifetimeValue: v.optional(v.number()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
        lastContactedAt: v.optional(v.number()),
    })
        .index("byUserId", ["userId"])
        .index("bySalesPersonId", ["salesPersonId"])
        .index("byStatus", ["status"])
        .index("byUniqueClientId", ["uniqueClientId"]),

    // ============================================
    // PROJECTS - Grouping multiple requirements
    // ============================================
    projects: defineTable({
        projectNumber: v.string(), // Auto-generated
        projectName: v.string(),
        description: v.optional(v.string()),
        clientId: v.id("clients"),
        status: v.union(
            v.literal("planning"),
            v.literal("active"),
            v.literal("on-hold"),
            v.literal("completed"),
            v.literal("cancelled")
        ),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        estimatedBudget: v.optional(v.number()),
        actualCost: v.optional(v.number()),
        projectManagerId: v.id("users"),
        teamMembers: v.optional(v.array(v.id("users"))),
        tags: v.optional(v.array(v.string())),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byClientId", ["clientId"])
        .index("byProjectManagerId", ["projectManagerId"])
        .index("byStatus", ["status"])
        .index("byPriority", ["priority"])
        .index("byProjectNumber", ["projectNumber"]),

    // ============================================
    // REQUIREMENTS - Project requirements
    // ============================================
    requirements: defineTable({
        requirementNumber: v.string(), // Auto-generated unique ID
        requirementName: v.string(),
        description: v.optional(v.string()),
        projectId: v.optional(v.id("projects")), // Can exist without project
        clientId: v.id("clients"),
        items: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    title: v.string(),
                    description: v.optional(v.string()),
                    priority: v.optional(v.string()),
                    estimatedHours: v.optional(v.number()),
                })
            )
        ),
        status: v.union(
            v.literal("draft"),
            v.literal("submitted"),
            v.literal("approved"),
            v.literal("rejected"),
            v.literal("in-progress"),
            v.literal("completed")
        ),
        estimatedBudget: v.optional(v.number()),
        estimatedHours: v.optional(v.number()),
        actualHours: v.optional(v.number()),
        salesPersonId: v.id("users"),
        assignedEmployees: v.optional(v.array(v.id("users"))),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byProjectId", ["projectId"])
        .index("byClientId", ["clientId"])
        .index("bySalesPersonId", ["salesPersonId"])
        .index("byStatus", ["status"])
        .index("byRequirementNumber", ["requirementNumber"]),

    // ============================================
    // TASKS - Individual tasks within requirements
    // ============================================
    tasks: defineTable({
        taskNumber: v.string(), // Auto-generated
        title: v.string(),
        description: v.optional(v.string()),
        requirementId: v.id("requirements"),
        assignedTo: v.optional(v.id("users")),
        collaborators: v.optional(v.array(v.id("users"))),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
        status: v.union(
            v.literal("todo"),
            v.literal("in-progress"),
            v.literal("review"),
            v.literal("blocked"),
            v.literal("done"),
            v.literal("cancelled")
        ),
        progress: v.number(), // 0-100
        estimatedHours: v.optional(v.number()),
        actualHours: v.optional(v.number()),
        dueDate: v.optional(v.number()),
        startDate: v.optional(v.number()),
        completedDate: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
        // Subtasks as structured data
        subtasks: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    title: v.string(),
                    completed: v.boolean(),
                })
            )
        ),
        // Dependencies
        dependsOn: v.optional(v.array(v.id("tasks"))),
        blockedBy: v.optional(v.array(v.id("tasks"))),
        createdBy: v.id("users"),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byRequirementId", ["requirementId"])
        .index("byAssignedTo", ["assignedTo"])
        .index("byStatus", ["status"])
        .index("byPriority", ["priority"])
        .index("byDueDate", ["dueDate"])
        .index("byTaskNumber", ["taskNumber"]),

    // ============================================
    // TIME TRACKING - Track time spent on tasks
    // ============================================
    timeEntries: defineTable({
        userId: v.id("users"),
        taskId: v.optional(v.id("tasks")),
        requirementId: v.optional(v.id("requirements")),
        projectId: v.optional(v.id("projects")),
        description: v.optional(v.string()),
        startTime: v.number(),
        endTime: v.optional(v.number()),
        duration: v.optional(v.number()), // in minutes
        isBillable: v.boolean(),
        hourlyRate: v.optional(v.number()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byUserId", ["userId"])
        .index("byTaskId", ["taskId"])
        .index("byRequirementId", ["requirementId"])
        .index("byProjectId", ["projectId"])
        .index("byStartTime", ["startTime"]),

    // ============================================
    // TASK QUESTIONS - Employee doubts/questions
    // ============================================
    taskQuestions: defineTable({
        taskId: v.id("tasks"),
        title: v.string(),
        description: v.optional(v.string()),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        directedTo: v.optional(v.array(v.id("users"))),
        askedBy: v.id("users"),
        status: v.union(v.literal("open"), v.literal("answered"), v.literal("resolved"), v.literal("closed")),
        response: v.optional(v.string()),
        respondedBy: v.optional(v.id("users")),
        respondedAt: v.optional(v.number()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byTaskId", ["taskId"])
        .index("byStatus", ["status"])
        .index("byAskedBy", ["askedBy"]),

    // ============================================
    // SUBMISSIONS - Work submissions by employees
    // ============================================
    submissions: defineTable({
        submissionNumber: v.string(), // Auto-generated
        title: v.string(),
        description: v.optional(v.string()),
        taskId: v.id("tasks"),
        requirementId: v.id("requirements"),
        clientId: v.id("clients"),
        submittedBy: v.id("users"),
        submissionDate: v.number(),
        deliverables: v.optional(v.array(v.string())), // File URLs/storage keys
        status: v.union(
            v.literal("pending"),
            v.literal("under-review"),
            v.literal("approved"),
            v.literal("rejected"),
            v.literal("changes-requested")
        ),
        reviewNotes: v.optional(v.string()),
        rejectionReason: v.optional(v.string()),
        requestedChanges: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    description: v.string(),
                    completed: v.optional(v.boolean()),
                })
            )
        ),
        reviewedBy: v.optional(v.id("users")),
        reviewedAt: v.optional(v.number()),
        // Version control
        version: v.number(),
        previousVersionId: v.optional(v.id("submissions")),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byTaskId", ["taskId"])
        .index("byRequirementId", ["requirementId"])
        .index("byClientId", ["clientId"])
        .index("bySubmittedBy", ["submittedBy"])
        .index("byStatus", ["status"])
        .index("bySubmissionDate", ["submissionDate"])
        .index("bySubmissionNumber", ["submissionNumber"]),

    // ============================================
    // DOCUMENTS - Proposals, NDAs, Invoices, Contracts
    // ============================================
    documents: defineTable({
        documentNumber: v.string(), // Auto-generated
        title: v.string(),
        type: v.union(
            v.literal("proposal"),
            v.literal("contract"),
            v.literal("nda"),
            v.literal("invoice"),
            v.literal("agreement"),
            v.literal("other")
        ),
        fileUrl: v.optional(v.string()),
        fileType: v.optional(v.string()), // "pdf", "docx", etc.
        storageKey: v.optional(v.string()),
        uploadedBy: v.id("users"),
        createdBy: v.optional(v.id("users")),
        // Relations
        clientId: v.optional(v.id("clients")),
        projectId: v.optional(v.id("projects")),
        requirementId: v.optional(v.id("requirements")),
        // Document specific fields
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("viewed"),
            v.literal("signed"),
            v.literal("expired"),
            v.literal("void")
        ),
        content: v.optional(v.any()), // Rich text content
        // Signature tracking
        isSigned: v.optional(v.boolean()),
        signedBy: v.optional(v.array(v.id("users"))),
        signedAt: v.optional(v.number()),
        signatureData: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    signatureImageUrl: v.string(),
                    signedAt: v.number(),
                })
            )
        ),
        // Financial fields (for invoices)
        amount: v.optional(v.number()),
        currency: v.optional(v.string()),
        dueDate: v.optional(v.number()),
        paidDate: v.optional(v.number()),
        paymentStatus: v.optional(
            v.union(v.literal("unpaid"), v.literal("partial"), v.literal("paid"), v.literal("overdue"))
        ),
        // Version control
        version: v.number(),
        previousVersionId: v.optional(v.id("documents")),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
        expiresAt: v.optional(v.number()),
    })
        .index("byClientId", ["clientId"])
        .index("byProjectId", ["projectId"])
        .index("byRequirementId", ["requirementId"])
        .index("byUploadedBy", ["uploadedBy"])
        .index("byType", ["type"])
        .index("byStatus", ["status"])
        .index("byDocumentNumber", ["documentNumber"]),

    // ============================================
    // INVOICES - Detailed invoice management
    // ============================================
    invoices: defineTable({
        invoiceNumber: v.string(), // Auto-generated, unique
        clientId: v.id("clients"),
        projectId: v.optional(v.id("projects")),
        documentId: v.optional(v.id("documents")), // Link to PDF document
        // Line items
        lineItems: v.array(
            v.object({
                id: v.string(),
                description: v.string(),
                quantity: v.number(),
                unitPrice: v.number(),
                amount: v.number(),
                taskId: v.optional(v.id("tasks")),
            })
        ),
        // Amounts
        subtotal: v.number(),
        taxRate: v.optional(v.number()),
        taxAmount: v.optional(v.number()),
        discount: v.optional(v.number()),
        totalAmount: v.number(),
        currency: v.string(), // "USD", "EUR", etc.
        // Dates
        issueDate: v.number(),
        dueDate: v.number(),
        paidDate: v.optional(v.number()),
        // Status
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("viewed"),
            v.literal("partial"),
            v.literal("paid"),
            v.literal("overdue"),
            v.literal("cancelled")
        ),
        // Payment tracking
        amountPaid: v.optional(v.number()),
        paymentMethod: v.optional(v.string()),
        paymentNotes: v.optional(v.string()),
        // Relations
        createdBy: v.id("users"),
        sentBy: v.optional(v.id("users")),
        notes: v.optional(v.string()),
        terms: v.optional(v.string()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byClientId", ["clientId"])
        .index("byProjectId", ["projectId"])
        .index("byStatus", ["status"])
        .index("byInvoiceNumber", ["invoiceNumber"])
        .index("byDueDate", ["dueDate"])
        .index("byIssueDate", ["issueDate"]),

    // ============================================
    // PAYMENTS - Track payments received
    // ============================================
    payments: defineTable({
        paymentNumber: v.string(),
        invoiceId: v.id("invoices"),
        clientId: v.id("clients"),
        amount: v.number(),
        currency: v.string(),
        paymentMethod: v.union(
            v.literal("cash"),
            v.literal("check"),
            v.literal("bank-transfer"),
            v.literal("credit-card"),
            v.literal("paypal"),
            v.literal("stripe"),
            v.literal("other")
        ),
        paymentDate: v.number(),
        transactionId: v.optional(v.string()),
        notes: v.optional(v.string()),
        recordedBy: v.id("users"),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byInvoiceId", ["invoiceId"])
        .index("byClientId", ["clientId"])
        .index("byPaymentDate", ["paymentDate"])
        .index("byPaymentNumber", ["paymentNumber"]),

    // ============================================
    // FILES - Centralized file management
    // ============================================
    files: defineTable({
        fileName: v.string(),
        fileType: v.string(), // MIME type
        fileSize: v.number(), // in bytes
        storageKey: v.string(), // Convex storage ID or external URL
        url: v.optional(v.string()),
        // Relations
        uploadedBy: v.id("users"),
        entityType: v.optional(
            v.union(
                v.literal("task"),
                v.literal("submission"),
                v.literal("document"),
                v.literal("requirement"),
                v.literal("project"),
                v.literal("user"),
                v.literal("client"),
                v.literal("comment"),
                v.literal("meeting")
            )
        ),
        entityId: v.optional(v.string()),
        // Metadata
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        isPublic: v.optional(v.boolean()),
        // Version control
        version: v.optional(v.number()),
        previousVersionId: v.optional(v.id("files")),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byUploadedBy", ["uploadedBy"])
        .index("byEntityType", ["entityType"])
        .index("byStorageKey", ["storageKey"]),

    // ============================================
    // COMMENTS - Universal commenting system
    // ============================================
    comments: defineTable({
        content: v.string(),
        entityType: v.union(
            v.literal("task"),
            v.literal("submission"),
            v.literal("requirement"),
            v.literal("project"),
            v.literal("document"),
            v.literal("invoice")
        ),
        entityId: v.string(),
        authorId: v.id("users"),
        // Threading
        parentCommentId: v.optional(v.id("comments")),
        // Mentions
        mentions: v.optional(v.array(v.id("users"))),
        // Attachments
        attachments: v.optional(v.array(v.id("files"))),
        // Editing
        isEdited: v.optional(v.boolean()),
        editedAt: v.optional(v.number()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byEntityType", ["entityType", "entityId"])
        .index("byAuthorId", ["authorId"])
        .index("byParentCommentId", ["parentCommentId"]),

    // ============================================
    // MEETINGS - Calls and meetings
    // ============================================
    meetings: defineTable({
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
        duration: v.optional(v.number()), // in minutes
        endTime: v.optional(v.number()),
        location: v.optional(v.string()), // Zoom/Meet link or physical location
        // Participants
        organizer: v.id("users"),
        attendees: v.optional(
            v.array(
                v.object({
                    userId: v.id("users"),
                    status: v.union(v.literal("invited"), v.literal("accepted"), v.literal("declined"), v.literal("tentative")),
                    attended: v.optional(v.boolean()),
                })
            )
        ),
        // Relations
        clientId: v.optional(v.id("clients")),
        projectId: v.optional(v.id("projects")),
        requirementId: v.optional(v.id("requirements")),
        // Status
        status: v.union(
            v.literal("scheduled"),
            v.literal("in-progress"),
            v.literal("completed"),
            v.literal("cancelled"),
            v.literal("no-show")
        ),
        notes: v.optional(v.string()),
        recordingUrl: v.optional(v.string()),
        // Reminders
        reminderSent: v.optional(v.boolean()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byClientId", ["clientId"])
        .index("byProjectId", ["projectId"])
        .index("byOrganizer", ["organizer"])
        .index("byScheduledAt", ["scheduledAt"])
        .index("byStatus", ["status"]),

    // ============================================
    // FEEDBACK - Client feedback on completed work
    // ============================================
    feedback: defineTable({
        clientId: v.id("clients"),
        submissionId: v.optional(v.id("submissions")),
        projectId: v.optional(v.id("projects")),
        taskId: v.optional(v.id("tasks")),
        rating: v.number(), // 1-5
        category: v.optional(
            v.union(
                v.literal("quality"),
                v.literal("communication"),
                v.literal("timeliness"),
                v.literal("overall"),
                v.literal("other")
            )
        ),
        comments: v.optional(v.string()),
        isPublic: v.optional(v.boolean()), // Can be used as testimonial
        respondedBy: v.optional(v.id("users")),
        response: v.optional(v.string()),
        respondedAt: v.optional(v.number()),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byClientId", ["clientId"])
        .index("bySubmissionId", ["submissionId"])
        .index("byProjectId", ["projectId"])
        .index("byRating", ["rating"]),

    // ============================================
    // TAGS - Universal tagging system
    // ============================================
    tags: defineTable({
        name: v.string(),
        slug: v.string(), // URL-friendly version
        color: v.optional(v.string()), // Hex color
        description: v.optional(v.string()),
        category: v.optional(
            v.union(
                v.literal("project"),
                v.literal("task"),
                v.literal("client"),
                v.literal("skill"),
                v.literal("general")
            )
        ),
        usageCount: v.optional(v.number()),
        createdBy: v.id("users"),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byName", ["name"])
        .index("bySlug", ["slug"])
        .index("byCategory", ["category"]),

    // ============================================
    // NOTIFICATIONS - System notifications
    // ============================================
    notifications: defineTable({
        sentTo: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(
            v.literal("info"),
            v.literal("success"),
            v.literal("warning"),
            v.literal("error"),
            v.literal("task-assigned"),
            v.literal("submission-review"),
            v.literal("meeting-reminder"),
            v.literal("comment-mention"),
            v.literal("deadline-approaching"),
            v.literal("payment-received")
        ),
        priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
        actionUrl: v.optional(v.string()),
        // Related entity
        relatedEntityType: v.optional(v.string()),
        relatedEntityId: v.optional(v.string()),
        initiatedBy: v.optional(v.id("users")),
        // Status
        isRead: v.boolean(),
        readAt: v.optional(v.number()),
        // Email notification
        emailSent: v.optional(v.boolean()),
        emailSentAt: v.optional(v.number()),
        // Soft delete (for user dismissal)
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        // Timestamps
        createdAt: v.number(),
        expiresAt: v.optional(v.number()),
    })
        .index("bySentTo", ["sentTo"])
        .index("byIsRead", ["sentTo", "isRead"])
        .index("byCreatedAt", ["sentTo", "createdAt"])
        .index("byType", ["type"]),

    // ============================================
    // ACTIVITY LOG - Comprehensive audit trail
    // ============================================
    activityLog: defineTable({
        userId: v.id("users"),
        action: v.string(), // "created", "updated", "deleted", "viewed", etc.
        entityType: v.optional(
            v.union(
                v.literal("user"),
                v.literal("client"),
                v.literal("project"),
                v.literal("requirement"),
                v.literal("task"),
                v.literal("submission"),
                v.literal("document"),
                v.literal("invoice"),
                v.literal("meeting")
            )
        ),
        entityId: v.optional(v.string()),
        description: v.string(),
        // Change tracking
        changes: v.optional(
            v.object({
                before: v.optional(v.any()),
                after: v.optional(v.any()),
            })
        ),
        metadata: v.optional(v.any()),
        // Request info
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        // Timestamps
        createdAt: v.number(),
    })
        .index("byUserId", ["userId"])
        .index("byEntityType", ["entityType", "entityId"])
        .index("byAction", ["action"])
        .index("byCreatedAt", ["createdAt"]),

    // ============================================
    // MILESTONES - Project milestones
    // ============================================
    milestones: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        projectId: v.id("projects"),
        requirementId: v.optional(v.id("requirements")),
        dueDate: v.number(),
        completedDate: v.optional(v.number()),
        status: v.union(
            v.literal("pending"),
            v.literal("in-progress"),
            v.literal("completed"),
            v.literal("delayed"),
            v.literal("cancelled")
        ),
        completionPercentage: v.number(), // 0-100
        assignedTo: v.optional(v.id("users")),
        // Soft delete
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byProjectId", ["projectId"])
        .index("byRequirementId", ["requirementId"])
        .index("byStatus", ["status"])
        .index("byDueDate", ["dueDate"]),

    // ============================================
    // EMAIL TEMPLATES - For automated emails
    // ============================================
    emailTemplates: defineTable({
        name: v.string(),
        slug: v.string(),
        subject: v.string(),
        body: v.string(), // HTML or text with placeholders
        type: v.union(
            v.literal("welcome"),
            v.literal("invoice"),
            v.literal("meeting-invite"),
            v.literal("deadline-reminder"),
            v.literal("submission-received"),
            v.literal("custom")
        ),
        variables: v.optional(v.array(v.string())), // List of placeholder variables
        isActive: v.boolean(),
        createdBy: v.id("users"),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("bySlug", ["slug"])
        .index("byType", ["type"])
        .index("byIsActive", ["isActive"]),

    // ============================================
    // MEETING OUTCOMES - Role-specific outcomes/notes
    // ============================================
    meetingOutcomes: defineTable({
        meetingId: v.id("meetings"),
        authorId: v.id("users"),
        role: v.string(), // "sales", "employee", "client", etc.
        summary: v.string(),
        actionItems: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    description: v.string(),
                    assignedTo: v.optional(v.id("users")),
                    dueDate: v.optional(v.number()),
                    completed: v.optional(v.boolean()),
                })
            )
        ),
        sentiment: v.optional(v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative"))),
        nextSteps: v.optional(v.string()),
        isPrivate: v.boolean(), // If true, only visible to the same role/author
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byMeetingId", ["meetingId"])
        .index("byAuthorId", ["authorId"])
        .index("byRole", ["role"]),

    // ============================================
    // SETTINGS - System and user preferences
    // ============================================
    settings: defineTable({
        key: v.string(),
        value: v.any(),
        category: v.union(v.literal("system"), v.literal("user"), v.literal("organization"), v.literal("notification")),
        userId: v.optional(v.id("users")), // For user-specific settings
        description: v.optional(v.string()),
        // Timestamps
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("byKey", ["key"])
        .index("byCategory", ["category"])
        .index("byUserId", ["userId"]),
});
