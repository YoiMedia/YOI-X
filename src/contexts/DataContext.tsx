import React, { createContext, useContext, useState, useEffect } from "react";

export interface Client {
  id: string;
  name: string;
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

export interface Activity {
  id: string;
  actor_name: string;
  actor_initials: string;
  action_text: string;
  timestamp: string;
  details?: any;
}

export interface PendingApproval {
  id: string;
  title: string;
  client: string;
  urgent: boolean;
}

interface DataContextType {
  clients: Client[];
  projects: Project[];
  employees: Employee[];
  activities: Activity[];
  pendingApprovals: PendingApproval[];
  isLoading: boolean;
  addClient: (client: Omit<Client, "id">) => void;
  addActivity: (activity: Omit<Activity, "id">) => void;
  addEmployee: (employee: Omit<Employee, "id" | "initials" | "tasks_assigned" | "on_leave" | "taskList">) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addProject: (project: Omit<Project, "id">) => void;
  approveTimeline: (id: string) => void;
  deleteClient: (id: string) => void;
  deleteEmployee: (id: string) => void;
  deleteProject: (id: string) => void;
  deleteTask: (employeeId: string, taskId: string) => void;
  deleteApproval: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialApprovals: PendingApproval[] = [
  { id: "app-1", title: "Website Redesign Timeline", client: "Acme Corp", urgent: true },
  { id: "app-2", title: "Marketing Strategy Phase 2", client: "TechStart Inc", urgent: false },
  { id: "app-3", title: "Mobile App Beta Release", client: "Innovation Labs", urgent: true },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedClients = localStorage.getItem("ec_clients");
      const storedProjects = localStorage.getItem("ec_projects");
      const storedEmployees = localStorage.getItem("ec_employees");
      const storedActivities = localStorage.getItem("ec_activities");
      const storedApprovals = localStorage.getItem("ec_approvals");

      // Production-ready: Initializing with empty states
      setClients(storedClients ? JSON.parse(storedClients) : []);
      setEmployees(storedEmployees ? JSON.parse(storedEmployees) : []);
      setActivities(storedActivities ? JSON.parse(storedActivities) : []);
      setProjects(storedProjects ? JSON.parse(storedProjects) : []);
      setPendingApprovals(storedApprovals ? JSON.parse(storedApprovals) : initialApprovals);

      setIsLoading(false);
    }, 1000); // Simulate network latency

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("ec_clients", JSON.stringify(clients));
      localStorage.setItem("ec_projects", JSON.stringify(projects));
      localStorage.setItem("ec_employees", JSON.stringify(employees));
      localStorage.setItem("ec_activities", JSON.stringify(activities));
      localStorage.setItem("ec_approvals", JSON.stringify(pendingApprovals));
    }
  }, [clients, projects, employees, activities, pendingApprovals, isLoading]);

  const addClient = (client: Omit<Client, "id">) => {
    const newClient = { ...client, id: Math.random().toString(36).substr(2, 9) };
    setClients(prev => [...prev, newClient]);
  };

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity = { ...activity, id: Math.random().toString(36).substr(2, 9) };
    setActivities(prev => [newActivity, ...prev]);
  };

  const addEmployee = (employeeData: Omit<Employee, "id" | "initials" | "tasks_assigned" | "on_leave" | "taskList">) => {
    const initials = employeeData.name.split(" ").map(n => n[0]).join("").toUpperCase();
    const newEmployee: Employee = {
      ...employeeData,
      id: Math.random().toString(36).substr(2, 9),
      initials,
      tasks_assigned: 0,
      on_leave: false,
      taskList: [
        { id: Math.random().toString(36).substr(2, 9), title: "Complete compliance training", status: "Not Started", priority: "Low", dueDate: "Feb 15" },
        { id: Math.random().toString(36).substr(2, 9), title: "Update bio and profile", status: "In Progress", priority: "Medium", dueDate: "Feb 10" }
      ]
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
  };

  const addProject = (project: Omit<Project, "id">) => {
    const newProject = { ...project, id: Math.random().toString(36).substr(2, 9) };
    setProjects(prev => [...prev, newProject]);
  };

  const approveTimeline = (id: string) => {
    setPendingApprovals(prev => prev.filter(app => app.id !== id));
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `approved timeline for project appraisal`,
      timestamp: "Just now"
    });
  };

  const deleteClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    setClients(prev => prev.filter(c => c.id !== id));
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `deleted client: ${client.name}`,
      timestamp: "Just now"
    });
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;
    setEmployees(prev => prev.filter(e => e.id !== id));
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `removed employee: ${employee.name}`,
      timestamp: "Just now"
    });
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `deleted project: ${project.name}`,
      timestamp: "Just now"
    });
  };

  const deleteTask = (employeeId: string, taskId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;
    const task = emp.taskList.find(t => t.id === taskId);
    if (!task) return;

    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          tasks_assigned: Math.max(0, e.tasks_assigned - 1),
          taskList: e.taskList.filter(t => t.id !== taskId)
        };
      }
      return e;
    }));

    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `deleted task "${task.title}" for ${emp.name}`,
      timestamp: "Just now"
    });
  };

  const deleteApproval = (id: string) => {
    const approval = pendingApprovals.find(a => a.id === id);
    if (!approval) return;
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `dismissed/deleted approval: ${approval.title}`,
      timestamp: "Just now"
    });
  };

  return (
    <DataContext.Provider value={{
      clients, projects, employees, activities, pendingApprovals, isLoading,
      addClient, addActivity, addEmployee, updateEmployee, addProject, approveTimeline,
      deleteClient, deleteEmployee, deleteProject, deleteTask, deleteApproval
    }}>
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
