import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderKanban, Clock, UserCheck, AlertTriangle, Plus, ListTodo, CheckCircle, UserPlus, Inbox, Trash2 } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useData, Employee, Activity } from "@/contexts/DataContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    clients, projects, employees, activities, pendingApprovals, isLoading,
    addClient, addActivity, addEmployee, updateEmployee, addProject, approveTimeline,
    deleteClient, deleteEmployee, deleteProject
  } = useData();

  // States
  const [isCreateSalesOpen, setIsCreateSalesOpen] = useState(false);
  const [salesForm, setSalesForm] = useState({ name: "", email: "" });
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    status: "active" as const,
    tasks_capacity: 10
  });
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ employeeId: "", title: "", priority: "Medium" });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeSidebarOpen, setIsEmployeeSidebarOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isApprovalsOpen, setIsApprovalsOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", email: "", contact: "", value: "" });
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", client: "", deadline: "", value: "" });

  const handleAssignTask = () => {
    const emp = employees.find(e => e.id === taskForm.employeeId);
    if (!emp) return;

    updateEmployee(emp.id, {
      tasks_assigned: emp.tasks_assigned + 1,
      taskList: [...emp.taskList, { id: Math.random().toString(36).substr(2, 9), title: taskForm.title, status: "Not Started", priority: taskForm.priority }]
    });

    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `assigned task "${taskForm.title}" to ${emp.name}`,
      timestamp: "Just now"
    });

    setIsAssignTaskOpen(false);
    toast({ title: "Task Assigned", description: `Task has been assigned to ${emp.name}` });
    setTaskForm({ employeeId: "", title: "", priority: "Medium" });
  };

  // Derived Values
  const total_clients_count = clients.length;
  const active_projects_count = projects.filter(p => p.status === "active").length;
  const pending_approvals_count = pendingApprovals.length;
  const active_employees_count = employees.length;
  const tasks_at_risk_count = projects.filter(p => p.status === "delayed").length +
    employees.filter(e => e.taskList.some(t => t.status === "Blocked" || t.priority === "High")).length;

  const overdue_count = projects.filter(p => p.status === "delayed").length;
  const blocked_count = employees.reduce((acc, emp) => acc + emp.taskList.filter(t => t.status === "Blocked").length, 0);

  const handleCreateSalesAccount = () => {
    addEmployee({
      name: salesForm.name,
      email: salesForm.email,
      role: "Sales Representative",
      department: "Sales",
      phone: "+1 555-0000",
      status: "active",
      tasks_capacity: 10,
    });

    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `created a new sales account for ${salesForm.name}`,
      timestamp: "Just now",
    });

    setIsCreateSalesOpen(false);
    toast({
      title: "Sales account created successfully",
      description: `Account for ${salesForm.name} has been created`,
    });
    setSalesForm({ name: "", email: "" });
  };

  const handleAddEmployee = () => {
    addEmployee(employeeForm);
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `onboarded new employee: ${employeeForm.name}`,
      timestamp: "Just now"
    });
    setIsAddEmployeeOpen(false);
    toast({ title: "Employee Added", description: `${employeeForm.name} has been added to the team.` });
    setEmployeeForm({ name: "", role: "", department: "", email: "", phone: "", status: "active", tasks_capacity: 10 });
  };

  const handleAddClient = () => {
    addClient({
      name: clientForm.name,
      email: clientForm.email,
      contact: clientForm.contact,
      status: "pending",
      value: clientForm.value || "$0"
    });
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `added new client: ${clientForm.name}`,
      timestamp: "Just now"
    });
    setIsAddClientOpen(false);
    toast({ title: "Client Added", description: `${clientForm.name} has been added.` });
    setClientForm({ name: "", email: "", contact: "", value: "" });
  };

  const handleAddProject = () => {
    addProject({
      name: projectForm.name,
      client: projectForm.client,
      deadline: projectForm.deadline,
      value: projectForm.value,
      status: "active"
    });
    addActivity({
      actor_name: "Admin",
      actor_initials: "AD",
      action_text: `started new project: ${projectForm.name}`,
      timestamp: "Just now"
    });
    setIsAddProjectOpen(false);
    toast({ title: "Project Created", description: `${projectForm.name} is now active.` });
    setProjectForm({ name: "", client: "", deadline: "", value: "" });
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeSidebarOpen(true);
    console.log("employee_workload_clicked", employee.id);
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
    console.log("activity_item_clicked", activity.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-700";
      case "Blocked": return "bg-red-100 text-red-700";
      case "Not Started": return "bg-muted text-muted-foreground";
      case "Completed": return "bg-green-100 text-green-700";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Admin Overview</h2>
          <p className="text-muted-foreground">Manage your organization</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button onClick={() => setIsAddEmployeeOpen(true)}>
            <UserPlus size={16} className="mr-2" />
            Add Employee
          </Button>
          <Button variant="outline" onClick={() => setIsAddClientOpen(true)}>
            <Users size={16} className="mr-2" />
            Add Client
          </Button>
          <Button variant="outline" onClick={() => setIsAddProjectOpen(true)}>
            <FolderKanban size={16} className="mr-2" />
            New Project
          </Button>
          <Button variant="outline" onClick={() => setIsAssignTaskOpen(true)}>
            <ListTodo size={16} className="mr-2" />
            Add Task
          </Button>
          <Button variant="outline" onClick={() => setIsCreateSalesOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Sales Account
          </Button>
          <Button variant="outline" onClick={() => setIsApprovalsOpen(true)}>
            <CheckCircle size={16} className="mr-2" />
            Approvals
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Clients"
              value={String(total_clients_count)}
              change="+12 this month"
              changeType="positive"
              icon={Users}
              onClick={() => navigate("/clients")}
            />
            <StatsCard
              title="Active Projects"
              value={String(active_projects_count)}
              change="8 near deadline"
              changeType="neutral"
              icon={FolderKanban}
            />
            <StatsCard
              title="Pending Approvals"
              value={String(pending_approvals_count)}
              change="3 urgent"
              changeType="negative"
              icon={Clock}
              onClick={() => navigate("/approvals-queue")}
            />
            <StatsCard
              title="Active Employees"
              value={String(active_employees_count)}
              change="2 on leave"
              changeType="neutral"
              icon={UserCheck}
              onClick={() => navigate("/employees")}
            />
            <StatsCard
              title="Tasks at Risk"
              value={String(tasks_at_risk_count)}
              change={`${overdue_count} overdue, ${blocked_count} blocked`}
              changeType="negative"
              icon={AlertTriangle}
              onClick={() => navigate("/tasks")}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Employee Workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : employees.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <Users size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No employees onboarded yet.</p>
                <Button variant="link" onClick={() => navigate("/employees")} className="h-auto p-0 text-primary text-xs">Add Team Members</Button>
              </div>
            ) : (
              employees.map((employee) => {
                const workload_percentage = (employee.tasks_assigned / employee.tasks_capacity) * 100;
                const isOverloaded = workload_percentage > 80;
                return (
                  <div
                    key={employee.id}
                    onClick={() => handleEmployeeClick(employee)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{employee.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress
                          value={workload_percentage}
                          className={cn("h-2 flex-1", isOverloaded && "[&>div]:bg-destructive")}
                        />
                        <span className={cn("text-xs whitespace-nowrap", isOverloaded ? "text-destructive font-medium" : "text-muted-foreground")}>
                          {employee.tasks_assigned}/{employee.tasks_capacity} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : activities.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <Inbox size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No recent activity to show.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {activity.actor_initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{activity.actor_name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action_text}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateSalesOpen} onOpenChange={setIsCreateSalesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={20} className="text-primary" />
              Create Sales Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sales-name">Name *</Label>
              <Input
                id="sales-name"
                placeholder="Enter full name"
                value={salesForm.name}
                onChange={(e) => setSalesForm({ ...salesForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-email">Email *</Label>
              <Input
                id="sales-email"
                type="email"
                placeholder="name@company.com"
                value={salesForm.email}
                onChange={(e) => setSalesForm({ ...salesForm, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateSalesOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSalesAccount} disabled={!salesForm.name || !salesForm.email}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isEmployeeSidebarOpen} onOpenChange={setIsEmployeeSidebarOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedEmployee?.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedEmployee?.name}</p>
                  <p className="text-sm text-muted-foreground font-normal">Employee Workload</p>
                </div>
              </div>
              {selectedEmployee && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    deleteEmployee(selectedEmployee.id);
                    setIsEmployeeSidebarOpen(false);
                  }}
                >
                  <Trash2 size={20} />
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Capacity</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEmployee.tasks_assigned}/{selectedEmployee.tasks_capacity} tasks
                </p>
              </div>
              <Progress value={(selectedEmployee.tasks_assigned / selectedEmployee.tasks_capacity) * 100} className="h-3" />
              <div className="space-y-2">
                {selectedEmployee.taskList.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{task.title}</p>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Activity Details</DialogTitle></DialogHeader>
          {selectedActivity && (
            <div className="space-y-4 py-4 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">{selectedActivity.actor_initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedActivity.actor_name}</p>
                  <p className="text-muted-foreground">{selectedActivity.timestamp}</p>
                </div>
              </div>
              <p>{selectedActivity.actor_name} {selectedActivity.action_text}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={20} className="text-primary" />
              Add New Employee
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="Jane Smith"
                value={employeeForm.name}
                onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input
                placeholder="Product Designer"
                value={employeeForm.role}
                onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Input
                placeholder="Design"
                value={employeeForm.department}
                onChange={e => setEmployeeForm({ ...employeeForm, department: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="jane@company.com"
                value={employeeForm.email}
                onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Phone</Label>
              <Input
                placeholder="+1 555-0000"
                value={employeeForm.phone}
                onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddEmployee}
              disabled={!employeeForm.name || !employeeForm.role || !employeeForm.department || !employeeForm.email}
            >
              Add to Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Add New Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Client Name *</Label>
              <Input
                placeholder="Acme Corp"
                value={clientForm.name}
                onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-0.5">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="contact@acme.com"
                value={clientForm.email}
                onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Point of Contact</Label>
                <Input
                  placeholder="John Doe"
                  value={clientForm.contact}
                  onChange={e => setClientForm({ ...clientForm, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Est. Value</Label>
                <Input
                  placeholder="$10,000"
                  value={clientForm.value}
                  onChange={e => setClientForm({ ...clientForm, value: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddClient}
              disabled={!clientForm.name || !clientForm.email}
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban size={20} className="text-primary" />
              Start New Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input
                placeholder="Legacy System Migration"
                value={projectForm.name}
                onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Client *</Label>
              <Select onValueChange={(val) => setProjectForm({ ...projectForm, client: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                  ))}
                  {clients.length === 0 && <p className="p-2 text-xs text-muted-foreground text-center">No clients found</p>}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={projectForm.deadline}
                  onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contract Value</Label>
                <Input
                  placeholder="$5,000"
                  value={projectForm.value}
                  onChange={e => setProjectForm({ ...projectForm, value: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddProject}
              disabled={!projectForm.name || !projectForm.client}
            >
              Start Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo size={20} className="text-primary" />
              Add New Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Employee</Label>
              <Select onValueChange={(val) => setTaskForm({ ...taskForm, employeeId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.department})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="What needs to be done?"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select defaultValue="Medium" onValueChange={(val) => setTaskForm({ ...taskForm, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignTaskOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignTask} disabled={!taskForm.employeeId || !taskForm.title}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={isApprovalsOpen} onOpenChange={setIsApprovalsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-primary" />
              Pending Approvals
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-100px)] mt-6 pr-4">
            <div className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                  <p>All caught up! No pending approvals.</p>
                </div>
              ) : (
                pendingApprovals.map((approval) => (
                  <Card key={approval.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{approval.title}</p>
                            {approval.urgent && <Badge variant="destructive" className="h-5 text-[10px]">URGENT</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">Client: {approval.client}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1 h-8 text-xs" onClick={() => {
                          approveTimeline(approval.id);
                          toast({ title: "Approved", description: `${approval.title} has been approved.` });
                        }}>Approve</Button>
                        <Button variant="outline" className="flex-1 h-8 text-xs">Review</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
