import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    full_name: v.string(),
    fullname: v.optional(v.string()), // For legacy data support during transition
    username: v.string(),
    email: v.string(),
    phone: v.string(),
    alternate_phone: v.optional(v.string()),
    password: v.string(),
    role: v.string(),
    website: v.optional(v.string()),
    address: v.optional(v.any()), // jsonb
    profile_image: v.optional(v.string()),
    is_active: v.boolean(),
    last_login: v.optional(v.number()), // timestamptz
    created_by: v.optional(v.id("users")), // FK
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_created_by", ["created_by"]),

  clients: defineTable({
    user_id: v.id("users"),
    sales_person_id: v.id("users"),
    company_name: v.string(),
    industry: v.optional(v.string()),
    company_size: v.optional(v.number()),
    unique_client_id: v.string(),
    magic_link_token: v.optional(v.string()),
    token_expiry: v.optional(v.number()),
    status: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_sales_person_id", ["sales_person_id"])
    .index("by_status", ["status"]),

  documents: defineTable({
    type: v.string(),
    title: v.string(),
    document_number: v.string(),
    created_by: v.id("users"),
    client_id: v.id("clients"),
    requirement_id: v.optional(v.id("requirements")),
    content: v.any(), // jsonb
    file_urls: v.optional(v.array(v.string())),
    is_signed: v.optional(v.boolean()),
    signed_at: v.optional(v.number()),
    signed_by: v.optional(v.id("users")),
    signature_image_url: v.optional(v.string()),
    amount: v.optional(v.number()), // numeric
    due_date: v.optional(v.string()), // date (string format YYYY-MM-DD)
    valid_until: v.optional(v.string()), // date
    status: v.string(),
    sent_at: v.optional(v.number()),
    viewed_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_client_id", ["client_id"])
    .index("by_created_by", ["created_by"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  meetings: defineTable({
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    scheduled_at: v.number(),
    duration: v.optional(v.number()),
    meeting_link: v.optional(v.string()),
    initiated_by: v.id("users"),
    client_id: v.id("clients"),
    attendees: v.optional(v.array(v.id("users"))),
    status: v.string(),
    requirement_id: v.optional(v.id("requirements")),
    document_id: v.optional(v.id("documents")),
    notifications_sent: v.optional(v.boolean()),
    reminder_sent: v.optional(v.boolean()),
    outcome: v.optional(v.object({
      sales_notes: v.optional(v.string()),
      employee_notes: v.optional(v.string()),
      client_notes: v.optional(v.string()),
      admin_notes: v.optional(v.string()),
      recording_url: v.optional(v.string()),
      screenshots: v.optional(v.array(v.string())), // storage IDs
      documents: v.optional(v.array(v.string())), // storage IDs
      other_files: v.optional(v.array(v.string())), // storage IDs
      next_steps: v.optional(v.string()),
      recorded_by: v.id("users"),
      created_at: v.number(),
      updated_at: v.optional(v.number()),
    })),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_client_id", ["client_id"])
    .index("by_status", ["status"])
    .index("by_scheduled_at", ["scheduled_at"]),

  requirements: defineTable({
    requirement_name: v.string(),
    requirement_number: v.string(),
    client_id: v.id("clients"),
    project_id: v.optional(v.id("projects")),
    sales_person_id: v.id("users"),
    requirements: v.any(), // jsonb
    start_date: v.optional(v.string()), // date
    expected_end_date: v.optional(v.string()), // date
    actual_end_date: v.optional(v.string()), // date
    assigned_employees: v.optional(v.array(v.id("users"))),
    approved_by: v.optional(v.id("users")),
    approved_at: v.optional(v.number()),
    status: v.string(),
    estimated_budget: v.optional(v.number()),
    actual_cost: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_client_id", ["client_id"])
    .index("by_status", ["status"])
    .index("by_sales_person_id", ["sales_person_id"]),

  tasks: defineTable({
    task_number: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    requirement_id: v.id("requirements"),
    assigned_to: v.optional(v.id("users")),
    created_by: v.id("users"),
    subtasks: v.optional(v.any()), // jsonb
    priority: v.optional(v.string()),
    status: v.string(),
    progress: v.number(),
    start_date: v.optional(v.string()), // date
    due_date: v.optional(v.string()), // date
    completed_at: v.optional(v.number()),
    estimated_hours: v.optional(v.number()),
    actual_hours: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_requirement_id", ["requirement_id"])
    .index("by_assigned_to", ["assigned_to"])
    .index("by_status", ["status"]),

  task_questions: defineTable({
    task_id: v.id("tasks"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    asked_by: v.id("users"),
    directed_to: v.optional(v.array(v.id("users"))), // uuid[]
    attachments: v.optional(v.array(v.string())),
    response: v.optional(v.string()),
    responded_by: v.optional(v.id("users")),
    responded_at: v.optional(v.number()),
    status: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_task_id", ["task_id"])
    .index("by_status", ["status"]),

  submissions: defineTable({
    submission_number: v.string(),
    task_id: v.id("tasks"),
    requirement_id: v.id("requirements"),
    submitted_by: v.id("users"),
    client_id: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    deliverables: v.optional(v.array(v.string())),
    status: v.string(),
    reviewed_by: v.optional(v.id("users")),
    reviewed_at: v.optional(v.number()),
    review_notes: v.optional(v.string()),
    rejection_reason: v.optional(v.string()),
    change_request_details: v.optional(v.string()),
    requested_changes: v.optional(v.any()), // jsonb
    follow_up_meeting_id: v.optional(v.id("meetings")),
    is_resubmission: v.optional(v.boolean()),
    original_submission_id: v.optional(v.id("submissions")),
    revision_number: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_task_id", ["task_id"])
    .index("by_requirement_id", ["requirement_id"])
    .index("by_status", ["status"]),

  feedback: defineTable({
    submission_id: v.id("submissions"),
    requirement_id: v.id("requirements"),
    client_id: v.id("clients"),
    overall_rating: v.optional(v.number()),
    quality_rating: v.optional(v.number()),
    timeliness_rating: v.optional(v.number()),
    communication_rating: v.optional(v.number()),
    comments: v.optional(v.string()),
    positives: v.optional(v.array(v.string())),
    improvements: v.optional(v.array(v.string())),
    would_recommend: v.optional(v.boolean()),
    testimonial_permission: v.optional(v.boolean()),
    submitted_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_submission_id", ["submission_id"])
    .index("by_client_id", ["client_id"]),

  notifications: defineTable({
    initiated_by: v.id("users"),
    sent_to: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    action_url: v.optional(v.string()),
    related_entity_type: v.optional(v.string()),
    related_entity_id: v.optional(v.string()), // Can't be v.id because it's dynamic
    is_read: v.boolean(),
    read_at: v.optional(v.number()),
    email_sent: v.optional(v.boolean()),
    email_sent_at: v.optional(v.number()),
    created_at: v.number(),
  })
    .index("by_sent_to", ["sent_to"])
    .index("by_is_read", ["is_read"]),

  activity_log: defineTable({
    user_id: v.id("users"),
    action: v.string(),
    entity_type: v.optional(v.string()),
    entity_id: v.optional(v.string()), // Changed to string for flexibility
    description: v.optional(v.string()),
    metadata: v.optional(v.any()), // jsonb
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_user_id", ["user_id"]),

  projects: defineTable({
    name: v.string(),
    client_id: v.id("clients"),
    status: v.string(),
    deadline: v.optional(v.string()),
    value: v.optional(v.string()),
    description: v.optional(v.string()),
    created_by: v.id("users"),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_client_id", ["client_id"])
    .index("by_status", ["status"]),

  superadmins: defineTable({
    username: v.string(),
    password: v.string(),
    created_at: v.number(),
  }).index("by_username", ["username"]),
});

