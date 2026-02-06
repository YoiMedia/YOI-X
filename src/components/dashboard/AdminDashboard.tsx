import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderKanban, Clock, UserCheck, AlertTriangle, Plus, ListTodo, CheckCircle, UserPlus, X } from "lucide-react";
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

const activities = [
  { 
    id: 1, 
    user: "Sarah Chen", 
    initials: "SC", 
    action: "sent proposal to", 
    target: "TechStart Inc", 
    time: "10 min ago",
    details: {
      type: "Proposal",
      project: "Website Redesign",
      value: "$15,000",
      status: "Pending Review"
    }
  },
  { 
    id: 2, 
    user: "Mike Johnson", 
    initials: "MJ", 
    action: "closed deal with", 
    target: "Acme Corp", 
    time: "1 hour ago",
    details: {
      type: "Deal",
      project: "Marketing Campaign",
      value: "$42,000",
      status: "Completed"
    }
  },
  { 
    id: 3, 
    user: "Emily Davis", 
    initials: "ED", 
    action: "completed task", 
    target: "Client onboarding", 
    time: "2 hours ago",
    details: {
      type: "Task",
      project: "TechStart Inc Onboarding",
      value: "N/A",
      status: "Completed"
    }
  },
  { 
    id: 4, 
    user: "Alex Rivera", 
    initials: "AR", 
    action: "approved timeline for", 
    target: "Website Redesign", 
    time: "3 hours ago",
    details: {
      type: "Timeline Approval",
      project: "Acme Corp Website",
      value: "$28,000",
      status: "Approved"
    }
  },
];

const employees = [
  { 
    id: "1",
    name: "Sarah Chen", 
    tasks: 8, 
    capacity: 10,
    activeTasks: 5,
    blockedTasks: 1,
    taskList: [
      { title: "Website redesign", status: "In Progress", priority: "High" },
      { title: "Client meeting prep", status: "In Progress", priority: "Medium" },
      { title: "Proposal review", status: "Blocked", priority: "High" },
      { title: "Analytics setup", status: "Not Started", priority: "Low" },
      { title: "Content review", status: "In Progress", priority: "Medium" },
    ]
  },
  { 
    id: "2",
    name: "Mike Johnson", 
    tasks: 6, 
    capacity: 10,
    activeTasks: 4,
    blockedTasks: 0,
    taskList: [
      { title: "Sales presentation", status: "In Progress", priority: "High" },
      { title: "Contract negotiation", status: "In Progress", priority: "High" },
      { title: "Lead follow-up", status: "Not Started", priority: "Medium" },
      { title: "CRM update", status: "In Progress", priority: "Low" },
    ]
  },
  { 
    id: "3",
    name: "Emily Davis", 
    tasks: 9, 
    capacity: 10,
    activeTasks: 6,
    blockedTasks: 2,
    taskList: [
      { title: "Onboarding docs", status: "In Progress", priority: "High" },
      { title: "Training materials", status: "Blocked", priority: "Medium" },
      { title: "Process documentation", status: "Blocked", priority: "High" },
      { title: "Client communication", status: "In Progress", priority: "Medium" },
      { title: "Report generation", status: "In Progress", priority: "Low" },
      { title: "Data migration", status: "In Progress", priority: "High" },
    ]
  },
  { 
    id: "4",
    name: "Alex Rivera", 
    tasks: 4, 
    capacity: 10,
    activeTasks: 3,
    blockedTasks: 0,
    taskList: [
      { title: "Timeline review", status: "In Progress", priority: "High" },
      { title: "Budget approval", status: "In Progress", priority: "Medium" },
      { title: "Resource allocation", status: "Not Started", priority: "Low" },
    ]
  },
];

type Employee = typeof employees[0];
type Activity = typeof activities[0];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Create Sales Account Modal State
  const [isCreateSalesOpen, setIsCreateSalesOpen] = useState(false);
  const [salesForm, setSalesForm] = useState({
    name: "",
    email: "",
  });

  // Employee Workload Sidebar State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeSidebarOpen, setIsEmployeeSidebarOpen] = useState(false);

  // Activity Details Modal State
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const handleCreateSalesAccount = () => {
    setIsCreateSalesOpen(false);
    toast({
      title: "Sales account created successfully",
      description: `Account for ${salesForm.name} has been created`,
    });
    setSalesForm({ name: "", email: "" });
  };

  const handleCancelCreate = () => {
    setIsCreateSalesOpen(false);
    setSalesForm({ name: "", email: "" });
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeSidebarOpen(true);
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
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
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateSalesOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Sales Account
          </Button>
          <Button variant="outline" onClick={() => navigate("/task-assignment")}>
            <ListTodo size={16} className="mr-2" />
            Assign Tasks
          </Button>
          <Button variant="outline" onClick={() => navigate("/approvals-queue")}>
            <CheckCircle size={16} className="mr-2" />
            Approve Timelines
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Clients"
          value="248"
          change="+12 this month"
          changeType="positive"
          icon={Users}
          onClick={() => navigate("/clients")}
        />
        <StatsCard
          title="Active Projects"
          value="42"
          change="8 near deadline"
          changeType="neutral"
          icon={FolderKanban}
        />
        <StatsCard
          title="Pending Approvals"
          value="7"
          change="3 urgent"
          changeType="negative"
          icon={Clock}
          onClick={() => navigate("/approvals-queue")}
        />
        <StatsCard
          title="Active Employees"
          value="24"
          change="2 on leave"
          changeType="neutral"
          icon={UserCheck}
          onClick={() => navigate("/employees")}
        />
        <StatsCard
          title="Tasks at Risk"
          value="5"
          change="3 overdue, 2 blocked"
          changeType="negative"
          icon={AlertTriangle}
          onClick={() => navigate("/tasks?filter=at-risk")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Employee Workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.name}
                onClick={() => handleEmployeeClick(employee)}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{employee.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={(employee.tasks / employee.capacity) * 100} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {employee.tasks}/{employee.capacity} tasks
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {activity.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Create Sales Account Modal */}
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

            <div className="space-y-2">
              <Label htmlFor="sales-role">Role</Label>
              <Input
                id="sales-role"
                value="Sales"
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreateSalesAccount} disabled={!salesForm.name || !salesForm.email}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Workload Sidebar */}
      <Sheet open={isEmployeeSidebarOpen} onOpenChange={setIsEmployeeSidebarOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedEmployee?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{selectedEmployee?.name}</p>
                <p className="text-sm text-muted-foreground font-normal">Employee Workload</p>
              </div>
            </SheetTitle>
          </SheetHeader>

          {selectedEmployee && (
            <div className="mt-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedEmployee.tasks}</p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-2xl font-bold text-blue-700">{selectedEmployee.activeTasks}</p>
                  <p className="text-xs text-blue-600">Active Tasks</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 text-center">
                  <p className="text-2xl font-bold text-red-700">{selectedEmployee.blockedTasks}</p>
                  <p className="text-xs text-red-600">Blocked Tasks</p>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.tasks}/{selectedEmployee.capacity} tasks
                  </p>
                </div>
                <Progress 
                  value={(selectedEmployee.tasks / selectedEmployee.capacity) * 100} 
                  className="h-3"
                />
              </div>

              {/* Task List */}
              <div>
                <p className="text-sm font-medium mb-3">Tasks</p>
                <div className="space-y-2">
                  {selectedEmployee.taskList.map((task, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Activity Details Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedActivity.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedActivity.user}</p>
                  <p className="text-sm text-muted-foreground">{selectedActivity.time}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">{selectedActivity.details.type}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Project</span>
                  <span className="text-sm font-medium">{selectedActivity.details.project}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <span className="text-sm font-medium">{selectedActivity.details.value}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={
                    selectedActivity.details.status === "Completed" ? "bg-green-100 text-green-700" :
                    selectedActivity.details.status === "Approved" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }>
                    {selectedActivity.details.status}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-foreground pt-2">
                <span className="font-medium">{selectedActivity.user}</span>{" "}
                <span className="text-muted-foreground">{selectedActivity.action}</span>{" "}
                <span className="font-medium">{selectedActivity.target}</span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
