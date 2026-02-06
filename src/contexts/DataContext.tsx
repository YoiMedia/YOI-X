import React, { createContext, useContext, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useAuth } from "./AuthContext";

// Interfaces from Convex Data Model
export type UserDoc = Doc<"users">;
export type DocumentDoc = Doc<"documents">;
export type MeetingDoc = Doc<"meetings">;
export type MeetingOutcomeDoc = Doc<"meetingOutcomes">;
export type NotificationDoc = Doc<"notifications">;
export type RequirementDoc = Doc<"requirements">;
export type TaskDoc = Doc<"tasks">;
export type SubmissionDoc = Doc<"submissions">;
export type DoubtDoc = Doc<"doubts">;

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
  title: string;
  client: string;
  status: string;
  urgent?: boolean;
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
  taskList: Array<{ id: string; title: string; status: string; priority: string; dueDate?: string }>;
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
  isLoading: boolean;

  // Mutations
  createUser: (args: any) => Promise<Id<"users">>;
  createDocument: (args: any) => Promise<Id<"documents">>;
  signDocument: (id: Id<"documents">, signature: string) => Promise<void>;
  scheduleMeeting: (args: any) => Promise<Id<"meetings">>;
  setMeetingStatus: (id: Id<"meetings">, status: "accepted" | "completed" | "cancelled") => Promise<void>;
  addMeetingOutcome: (args: any) => Promise<Id<"meetingOutcomes">>;
  createRequirements: (args: any) => Promise<Id<"requirements">>;
  approveRequirements: (id: Id<"requirements">, status: "approved" | "rejected") => Promise<void>;
  createTask: (args: any) => Promise<Id<"tasks">>;
  updateTaskProgress: (id: Id<"tasks">, updates: any) => Promise<void>;
  createDoubt: (args: any) => Promise<Id<"doubts">>;
  resolveDoubt: (id: Id<"doubts">, response: string) => Promise<void>;
  submitTask: (args: any) => Promise<Id<"submissions">>;
  reviewSubmission: (id: Id<"submissions">, status: "approved" | "rejected", feedback?: string) => Promise<void>;
  sendNotification: (args: any) => Promise<Id<"notifications">>;
  markNotificationRead: (id: Id<"notifications">) => Promise<void>;

  // Dashboard Mutations
  addClient: (args: any) => Promise<void>;
  addEmployee: (args: any) => Promise<void>;
  updateEmployee: (id: string, updates: any) => Promise<void>;
  addProject: (args: any) => Promise<void>;
  addActivity: (args: any) => Promise<void>;
  approveTimeline: (id: string) => Promise<void>;
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
  const myDocuments = useQuery(api.documents.listForUser, user ? { userId: user._id } : "skip");
  const myMeetings = useQuery(api.meetings.listForClient, user?._id && user.role === "client" ? { clientId: user._id } : "skip");
  const myRequirements = useQuery(api.requirements.listForClient, user?._id && user.role === "client" ? { clientId: user._id } : "skip");
  const pendingRequirements = useQuery(api.requirements.listPending);
  const myNotifications = useQuery(api.notifications.listForUser, user ? { userId: user._id } : "skip");
  const myTasks = useQuery(api.tasks.listForEmployee, user?._id && user.role === "employee" ? { employeeId: user._id } : "skip");
  
  const convexClientsData = useQuery(api.clients.list);
  const convexProjectsData = useQuery(api.projects.list);
  const convexEmployeesData = useQuery(api.employees.list);
  
  const convexActivitiesData = useQuery(api.activities.list);
  const convexApprovalsData = useQuery(api.approvals.list);

  // Mutations
  const registerUser = useMutation(api.users.create);
  const createDocMutation = useMutation(api.documents.create);
  const signDocMutation = useMutation(api.documents.sign);
  const scheduleMeetMutation = useMutation(api.meetings.schedule);
  const setMeetStatusMutation = useMutation(api.meetings.setStatus);
  const addOutcomeMutation = useMutation(api.meetings.addOutcome);
  const createReqMutation = useMutation(api.requirements.create);
  const setReqStatusMutation = useMutation(api.requirements.setStatus);
  const createTaskMutation = useMutation(api.tasks.create);
  const updateTaskMutation = useMutation(api.tasks.updateProgress);
  const createDoubtMutation = useMutation(api.tasks.createDoubt);
  const resolveDoubtMutation = useMutation(api.tasks.resolveDoubt);
  const submitTaskMutation = useMutation(api.submissions.create);
  const reviewSubmissionMutation = useMutation(api.submissions.setStatus);
  const sendNotifMutation = useMutation(api.notifications.send);
  const markReadMutation = useMutation(api.notifications.markAsRead);

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
  const signDocument = async (id: Id<"documents">, signatureDetails: string) => {
    await signDocMutation({ id, signatureDetails });
  };
  const setMeetingStatus = async (id: Id<"meetings">, status: "accepted" | "completed" | "cancelled") => {
    await setMeetStatusMutation({ id, status });
  };
  const approveRequirements = async (id: Id<"requirements">, status: "approved" | "rejected") => {
    await setReqStatusMutation({ id, status });
  };
  const updateTaskProgress = async (id: Id<"tasks">, updates: any) => {
    await updateTaskMutation({ id, ...updates });
  };
  const resolveDoubt = async (id: Id<"doubts">, response: string) => {
    await resolveDoubtMutation({ id, response });
  };
  const reviewSubmission = async (id: Id<"submissions">, status: "approved" | "rejected", feedback?: string) => {
    await reviewSubmissionMutation({ id, status, feedback });
  };
  const markNotificationRead = async (id: Id<"notifications">) => {
    await markReadMutation({ id });
  };

  // Dashboard Wrapper functions
  const addClient = async (args: any) => { await addClientMutation(args); };
  const addEmployee = async (args: any) => { await addEmployeeMutation({ ...args, initials: (args.name ?? "User Staff").split(" ").map((n: string) => n[0]).join(""), taskList: [] }); };
  const updateEmployee = async (id: string, updates: any) => { await updateEmployeeMutation({ id: id as Id<"employees">, updates }); };
  const addProject = async (args: any) => { await addProjectMutation(args); };
  const addActivity = async (args: any) => { await addActivityMutation(args); };
  const approveTimeline = async (id: string) => { await removeApprovalMutation({ id: id as any }); }; // Logic depends on how approvals work
  const deleteClient = async (id: string) => { await removeClientMutation({ id: id as Id<"clients"> }); };
  const deleteEmployee = async (id: string) => { await removeEmployeeMutation({ id: id as Id<"employees"> }); };
  const deleteProject = async (id: string) => { await removeProjectMutation({ id: id as Id<"projects"> }); };

  // Adapters - Mapping Convex schema to legacy UI expectations
  const clients: Client[] = useMemo(() => {
    return (convexClientsData ?? []).map(c => ({
      ...c,
      id: c._id,
      name: c.name ?? "Unnamed Client",
      fullname: c.name ?? "Unnamed Client",
      contact: c.contact ?? "No contact",
      email: c.email ?? "no-email@example.com",
      status: (c.status as any) ?? "pending",
      value: c.value ?? "₹0",
    }));
  }, [convexClientsData]);

  const projects: Project[] = useMemo(() => {
    return (convexProjectsData ?? []).map(p => ({
      ...p,
      id: p._id,
      name: p.name ?? "Unnamed Project",
      client: p.client ?? "Unknown Client",
      status: (p.status as any) ?? "active",
      deadline: p.deadline ?? "TBD",
      value: p.value ?? "₹0",
    }));
  }, [convexProjectsData]);

  const employees: Employee[] = useMemo(() => {
    return (convexEmployeesData ?? []).map(e => ({
      ...e,
      id: e._id,
      name: e.name ?? "Unnamed Employee",
      fullname: e.name ?? "Unnamed Employee",
      initials: e.initials ?? "E",
      role: e.role ?? "Staff",
      department: e.department ?? "General",
      email: e.email ?? "no-email@example.com",
      phone: e.phone ?? "N/A",
      status: (e.status as any) ?? "offline",
      tasks_assigned: e.tasks_assigned ?? 0,
      tasks_capacity: e.tasks_capacity ?? 0,
      on_leave: e.on_leave ?? false,
      taskList: e.taskList ?? [],
    }));
  }, [convexEmployeesData]);

  const activities: Activity[] = useMemo(() => {
    return (convexActivitiesData ?? []).map(a => ({ ...a, id: a._id }));
  }, [convexActivitiesData]);

  const pendingApprovals: PendingApproval[] = useMemo(() => {
    return (convexApprovalsData ?? []).map(ap => ({ ...ap, id: ap._id, status: ap.status || "pending" }));
  }, [convexApprovalsData]);

  const value: DataContextType = {
    users: allUsers ?? [],
    documents: myDocuments ?? [],
    meetings: myMeetings ?? [],
    requirements: (user?.role === "client" ? myRequirements : pendingRequirements) ?? [],
    tasks: myTasks ?? [],
    submissions: [],
    notifications: myNotifications ?? [],
    activities,
    pendingApprovals,
    isLoading,
    
    createUser: registerUser,
    createDocument: createDocMutation,
    signDocument,
    scheduleMeeting: scheduleMeetMutation,
    setMeetingStatus,
    addMeetingOutcome: addOutcomeMutation,
    createRequirements: createReqMutation,
    approveRequirements,
    createTask: createTaskMutation,
    updateTaskProgress,
    createDoubt: createDoubtMutation,
    resolveDoubt,
    submitTask: submitTaskMutation,
    reviewSubmission,
    sendNotification: sendNotifMutation,
    markNotificationRead,

    addClient,
    addEmployee,
    updateEmployee,
    addProject,
    addActivity,
    approveTimeline,
    deleteClient,
    deleteEmployee,
    deleteProject,
    
    clients, projects, employees,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
