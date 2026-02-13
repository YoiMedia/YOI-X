import React, { createContext, useContext, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useAuth } from "./AuthContext";

// Interfaces from Convex Data Model
export type UserDoc = Doc<"users">;
export type DocumentDoc = Doc<"documents">;
export type MeetingDoc = Doc<"meetings">;
export type NotificationDoc = Doc<"notifications">;
export type RequirementDoc = Doc<"requirements">;
export type TaskDoc = Doc<"tasks">;
export type SubmissionDoc = Doc<"submissions">;
export type TaskQuestionDoc = Doc<"task_questions">;

// Activity and Approval Types for Dashboard
export interface Activity {
  id: string;
  actor_name: string;
  actor_initials: string;
  action_text: string;
  timestamp: string;
}

export interface PendingApproval {
  id: string;
  _id: string;
  title: string;
  client: string;
  status: string;
  urgent?: boolean;
  timestamp: string;
}

// Legacy / Compatibility Interfaces
export interface Client {
  id: string;
  name: string;
  fullname: string;
  contact: string;
  email: string;
  status: "active" | "pending" | "inactive";
  value: string;
  phone?: string;
  website?: string;
  address?: string;
  companyName: string;
  industry?: string;
  companySize?: number;
  uniqueClientId: string;
  salesPersonId: string;
  created_at: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "active" | "completed" | "delayed";
  deadline: string;
  value: string;
}

export interface Employee {
  id: string;
  name: string;
  fullname: string;
  initials: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: "active" | "away" | "offline";
  tasks_assigned: number;
  tasks_capacity: number;
  on_leave: boolean;
  taskList: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
  }>;
}

interface DataContextType {
  // Data
  users: UserDoc[];
  documents: DocumentDoc[];
  meetings: MeetingDoc[];
  requirements: RequirementDoc[];
  tasks: TaskDoc[];
  submissions: SubmissionDoc[];
  notifications: NotificationDoc[];
  activities: Activity[];
  pendingApprovals: PendingApproval[];
  employeeUsers: UserDoc[];
  adminUsers: UserDoc[];
  isLoading: boolean;

  // Mutations
  createUser: (args: any) => Promise<Id<"users">>;
  createDocument: (args: any) => Promise<Id<"documents">>;
  signDocument: (id: Id<"documents">, signature: string) => Promise<void>;
  scheduleMeeting: (args: any) => Promise<Id<"meetings">>;
  setMeetingStatus: (
    id: Id<"meetings">,
    status: "accepted" | "completed" | "cancelled" | "scheduled",
  ) => Promise<void>;
  addMeetingOutcome: (args: any) => Promise<Id<"meetings">>;
  generateUploadUrl: () => Promise<{ key: string; url: string }>;
  syncMetadata: (args: { key: string }) => Promise<void>;
  getFileUrl: (storageKey: string) => Promise<string | null>;
  createRequirements: (args: any) => Promise<Id<"requirements">>;
  updateRequirementAssignment: (
    id: Id<"requirements">,
    assigned_employees: Id<"users">[],
  ) => Promise<void>;
  approveRequirements: (
    id: Id<"requirements">,
    status: "approved" | "rejected",
  ) => Promise<void>;
  createTask: (args: any) => Promise<Id<"tasks">>;
  updateTaskProgress: (id: Id<"tasks">, updates: any) => Promise<void>;
  createDoubt: (args: any) => Promise<Id<"task_questions">>;
  resolveDoubt: (id: Id<"task_questions">, response: string) => Promise<void>;
  submitTask: (args: any) => Promise<Id<"submissions">>;
  reviewSubmission: (
    id: Id<"submissions">,
    status: "approved" | "rejected",
    feedback?: string,
  ) => Promise<void>;
  sendNotification: (args: any) => Promise<Id<"notifications">>;
  markNotificationRead: (id: Id<"notifications">) => Promise<void>;

  // Dashboard Mutations
  addClient: (args: any) => Promise<Id<"clients">>;
  addEmployee: (args: any) => Promise<Id<"users">>;
  updateEmployee: (id: string, updates: any) => Promise<void>;
  addProject: (args: any) => Promise<Id<"projects">>;
  addActivity: (args: any) => Promise<Id<"activity_log">>;
  updateClient: (id: Id<"clients">, updates: any) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Legacy (Adapters)
  clients: Client[];
  projects: Project[];
  employees: Employee[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Queries
  const allUsers = useQuery(api.users.list, {});
  const myDocuments = useQuery(
    api.documents.listForUser,
    user ? { userId: user._id } : "skip",
  );
  const meetings = useQuery(
    api.meetings.listForUser,
    user ? { userId: user._id } : "skip",
  );
  const allMeetings = useQuery(api.meetings.list);

  const employeeUsers = useMemo(() => {
    return (allUsers ?? []).filter((u) => u.role === "employee");
  }, [allUsers]);

  const adminUsers = useMemo(() => {
    return (allUsers ?? []).filter(
      (u) => u.role === "admin" || u.role === "superadmin",
    );
  }, [allUsers]);
  const myRequirements = useQuery(
    api.requirements.listForUser,
    user?._id ? { userId: user._id } : "skip",
  );
  const pendingRequirements = useQuery(api.requirements.listPending);
  const myNotifications = useQuery(
    api.notifications.listForUser,
    user ? { userId: user._id } : "skip",
  );
  const myTasks = useQuery(
    api.tasks.listForEmployee,
    user?._id && user.role === "employee" ? { employeeId: user._id } : "skip",
  );

  const convexClientsData = useQuery(api.clients.list);
  const convexProjectsData = useQuery(
    api.projects.listForUser,
    user ? { userId: user._id } : "skip",
  );
  const convexEmployeesData = useQuery(api.employees.list);

  const convexActivitiesData = useQuery(api.activities.list, {});
  const convexApprovalsData = useQuery(api.approvals.list);

  // Mutations
  const registerUser = useMutation(api.users.create);
  const signDocMutation = useMutation(api.documents.sign);
  const scheduleMeetMutation = useMutation(api.meetings.schedule);
  const setMeetStatusMutation = useMutation(api.meetings.setStatus);
  const addOutcomeMutation = useMutation(api.meetings.addOutcome);
  const generateR2UploadUrl = useMutation(api.meetings.generateUploadUrl);
  const syncR2Metadata = useMutation(api.meetings.syncMetadata);
  const getFileUrlAction = useAction(api.meetings.getFileUrlAction);
  const createReqMutation = useMutation(api.requirements.create);
  const updateAssignMutation = useMutation(api.requirements.updateAssignment);
  const setReqStatusMutation = useMutation(api.requirements.setStatus);
  const createTaskMutation = useMutation(api.tasks.create);
  const updateTaskMutation = useMutation(api.tasks.updateTask);
  const createDoubtMutation = useMutation(api.tasks.askQuestion);
  const resolveDoubtMutation = useMutation(api.tasks.respondToQuestion);
  const submitTaskMutation = useMutation(api.submissions.create);
  const reviewSubmissionMutation = useMutation(api.submissions.review);
  const sendNotifMutation = useMutation(api.notifications.send);
  const markReadMutation = useMutation(api.notifications.markAsRead);
  const createDocMutation = useMutation(api.documents.create);

  const scheduleMeeting = async (args: any) => {
    return await scheduleMeetMutation({ ...args, initiated_by: user?._id });
  };
  const addMeetingOutcome = async (args: any) => {
    return await addOutcomeMutation({ ...args, recorded_by: user?._id });
  };

  // Storage helper
  const getFileUrl = async (storageKey: string) => {
    return await getFileUrlAction({ storageKey });
  };
  const createRequirements = async (args: any) => {
    // Map frontend args to backend snake_case args
    return await createReqMutation({
      requirement_name:
        args.requirement_name || args.title || "New Requirement",
      client_id: args.client_id || args.clientId,
      project_id: args.project_id || args.projectId,
      requirements: args.requirements || args.items || [],
      status: args.status || "pending",
      estimated_budget: args.estimated_budget || args.totalBudget,
      sales_person_id: user?._id as Id<"users">,
    });
  };
  const updateRequirementAssignment = async (
    id: Id<"requirements">,
    assigned_employees: Id<"users">[],
  ) => {
    await updateAssignMutation({ id, assigned_employees });
  };
  const createTask = async (args: any) => {
    return await createTaskMutation({ ...args, created_by: user?._id });
  };
  const createDoubt = async (args: any) => {
    return await createDoubtMutation({ ...args, asked_by: user?._id });
  };
  const submitTask = async (args: any) => {
    return await submitTaskMutation({ ...args, submitted_by: user?._id });
  };
  const sendNotification = async (args: any) => {
    // Convex is strict about extra fields, so we destructure only what we need
    const {
      userId,
      user_id,
      sent_to,
      link,
      action_url,
      title,
      message,
      type,
      related_entity_id,
      related_entity_type,
    } = args;

    return await sendNotifMutation({
      sent_to: (sent_to || userId || user_id) as Id<"users">,
      title,
      message,
      type,
      action_url: action_url || link,
      related_entity_id,
      related_entity_type,
      initiated_by: user?._id as Id<"users">,
    });
  };
  const createDocument = async (args: any) => {
    return await createDocMutation({ ...args, created_by: user?._id });
  };

  // Dashboard Mutations
  const addClientMutation = useMutation(api.clients.add);
  const removeClientMutation = useMutation(api.clients.remove);
  const addEmployeeMutation = useMutation(api.employees.add);
  const updateEmployeeMutation = useMutation(api.employees.update);
  const removeEmployeeMutation = useMutation(api.employees.remove);
  const addProjectMutation = useMutation(api.projects.add);
  const removeProjectMutation = useMutation(api.projects.remove);
  const addActivityMutation = useMutation(api.activities.add);
  const removeApprovalMutation = useMutation(api.approvals.remove);

  const isLoading = allUsers === undefined;

  // Wrapper functions
  const signDocument = async (
    id: Id<"documents">,
    signature_image_url: string,
  ) => {
    await signDocMutation({
      id,
      signature_image_url,
      signed_by: user?._id as Id<"users">,
    });
  };
  const setMeetingStatus = async (
    id: Id<"meetings">,
    status: "accepted" | "completed" | "cancelled" | "scheduled",
  ) => {
    await setMeetStatusMutation({ id, status });
  };
  const approveRequirements = async (
    id: Id<"requirements">,
    status: "approved" | "rejected",
  ) => {
    await setReqStatusMutation({ id, status });
  };
  const updateTaskProgress = async (id: Id<"tasks">, updates: any) => {
    await updateTaskMutation({ id, updates });
  };

  // Renamed to avoid alias conflict if necessary, but here we just need to NOT redeclare 'createDoubt'
  // The mutation wrapper 'createDoubt' was declared above.
  // Wait, I see 'createDoubt' declared at line 195 AND line 235
  // The first one (line 195) injects user ID. The second one (line 235) just passes args.
  // I should remove the second one since the first one is what we want (with auth).

  const resolveDoubt = async (id: Id<"task_questions">, response: string) => {
    await resolveDoubtMutation({
      id,
      response,
      responded_by: user?._id as Id<"users">,
    });
  };
  const reviewSubmission = async (
    id: Id<"submissions">,
    status: "approved" | "rejected",
    feedback?: string,
  ) => {
    await reviewSubmissionMutation({ id, status, review_notes: feedback });
  };
  const markNotificationRead = async (id: Id<"notifications">) => {
    await markReadMutation({ id });
  };

  // Dashboard Wrapper functions
  const updateClientMutation = useMutation(api.clients.update);

  const addClient = async (args: any) => {
    return await addClientMutation({
      ...args,
      status: args.status || "active",
    });
  };
  const updateClient = async (id: Id<"clients">, updates: any) => {
    await updateClientMutation({ id, updates });
  };
  const addEmployee = async (args: any) => {
    return await addEmployeeMutation({
      ...args,
      initials: (args.name ?? "User Staff")
        .split(" ")
        .map((n: string) => n[0])
        .join(""),
      taskList: [],
    });
  };
  const updateEmployee = async (id: string, updates: any) => {
    await updateEmployeeMutation({ id: id as Id<"users">, updates });
  };
  const addProject = async (args: any) => {
    return await addProjectMutation(args);
  };
  const addActivity = async (args: any) => {
    return await addActivityMutation(args);
  };
  const deleteClient = async (id: string) => {
    await removeClientMutation({ id: id as Id<"clients"> });
  };
  const deleteEmployee = async (id: string) => {
    await removeEmployeeMutation({ id: id as Id<"users"> });
  };
  const deleteProject = async (id: string) => {
    await removeProjectMutation({ id: id as Id<"projects"> });
  };

  // Adapters - Mapping Convex schema to legacy UI expectations
  const clients: Client[] = useMemo(() => {
    return (convexClientsData ?? []).map((c: any) => ({
      ...c,
      id: c._id,
      name: c.user?.full_name || c.company_name || "Unnamed Client",
      fullname: c.user?.full_name || c.company_name || "Unnamed Client",
      contact: c.user?.phone || "N/A",
      email: c.user?.email || "N/A",
      address: c.user?.address || "N/A",
      website: c.user?.website || "N/A",
      phone: c.user?.phone || "N/A",
      companyName: c.company_name || "N/A",
      industry: c.industry || "N/A",
      companySize: c.company_size || 0,
      uniqueClientId: c.unique_client_id || "N/A",
      salesPersonId: c.sales_person_id || "N/A",
      status: (c.status as any) ?? "pending",
      value: "₹0", // Value might need another source or be added to schema
      created_at: c.created_at || Date.now(),
    }));
  }, [convexClientsData]);

  const projects: Project[] = useMemo(() => {
    return (convexProjectsData ?? []).map((p) => ({
      ...p,
      id: p._id,
      name: p.name ?? "Unnamed Project",
      client: (p as any).client ?? "Unknown Client",
      status: (p.status as any) ?? "active",
      deadline: p.deadline ?? "TBD",
      value: p.value ?? "₹0",
    }));
  }, [convexProjectsData]);

  const employees: Employee[] = useMemo(() => {
    return (convexEmployeesData ?? []).map((e) => ({
      ...e,
      id: e._id,
      name: e.full_name ?? "Unnamed Employee",
      fullname: e.full_name ?? "Unnamed Employee",
      initials: (e.full_name ?? "E")[0],
      role: e.role ?? "Staff",
      department: "General",
      email: e.email ?? "no-email@example.com",
      phone: e.phone ?? "N/A",
      status: "offline",
      tasks_assigned: 0,
      tasks_capacity: 0,
      on_leave: false,
      taskList: [],
    }));
  }, [convexEmployeesData]);

  const activities: Activity[] = useMemo(() => {
    return (convexActivitiesData ?? []).map((a) => ({
      ...a,
      id: a._id,
      actor_name: "System", // Update based on user_id if needed
      actor_initials: "S",
      action_text: a.action,
      timestamp: new Date(a.created_at).toLocaleString(),
    }));
  }, [convexActivitiesData]);

  const pendingApprovals: PendingApproval[] = useMemo(() => {
    return (convexApprovalsData ?? []).map((ap: any) => ({
      id: ap._id,
      _id: ap._id,
      title: ap.requirement_name ?? "Untitled Approval",
      client: "Pending Client", // Link to client name if available
      status: ap.status || "pending",
      urgent: false,
      timestamp: new Date(ap.created_at || Date.now()).toLocaleString(),
    }));
  }, [convexApprovalsData]);

  const value: DataContextType = {
    users: allUsers ?? [],
    documents: myDocuments ?? [],
    meetings: meetings ?? [],
    requirements:
      (user?.role === "client" ? myRequirements : pendingRequirements) ?? [],
    tasks: myTasks ?? [],
    submissions: [],
    notifications: myNotifications ?? [],
    callOutcomes: [], // Removed as outcomes are embedded
    activities,
    pendingApprovals,
    employeeUsers,
    adminUsers,
    isLoading,

    createUser: registerUser,
    createDocument,
    signDocument,
    scheduleMeeting,
    setMeetingStatus,
    addMeetingOutcome,
    generateUploadUrl: generateR2UploadUrl,
    syncMetadata: syncR2Metadata,
    getFileUrl, // Now uses R2 storage keys
    createRequirements,
    updateRequirementAssignment,
    approveRequirements,
    createTask,
    updateTaskProgress,
    createDoubt,
    resolveDoubt,
    submitTask,
    reviewSubmission,
    sendNotification,
    markNotificationRead,

    addClient,
    addEmployee,
    updateEmployee,
    addProject,
    addActivity,
    updateClient,
    deleteClient,
    deleteEmployee,
    deleteProject,

    clients,
    projects,
    employees,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
