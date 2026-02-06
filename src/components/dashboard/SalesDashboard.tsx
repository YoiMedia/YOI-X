import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Handshake, FileText, FileSignature, Phone, CheckSquare, Plus, Calendar as CalendarIcon, Video, Mail, ExternalLink } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AddClientModal } from "@/components/sales/AddClientModal";
import { ScheduleCallModal, CallScheduleData } from "@/components/sales/ScheduleCallModal";
import { TaskItemCard, TaskItem } from "@/components/sales/TaskItemCard";
import { TaskDetailsSidebar } from "@/components/sales/TaskDetailsSidebar";

interface Call {
  id: number;
  client: string;
  contact: string;
  time: string;
  date: string;
  email?: string;
  phone?: string;
  meetingLink?: string;
  notes?: string;
  attendees?: string[];
}

const initialUpcomingCalls: Call[] = [
  { 
    id: 1, 
    client: "Acme Corp", 
    contact: "John Smith", 
    time: "10:00 AM", 
    date: "Today",
    email: "john.smith@acmecorp.com",
    phone: "+1 (555) 123-4567",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "Discuss Q2 expansion plans and budget allocation for new marketing initiatives.",
    attendees: ["Sarah Johnson", "Mike Thompson"]
  },
  { 
    id: 2, 
    client: "TechStart Inc", 
    contact: "Sarah Lee", 
    time: "2:30 PM", 
    date: "Today",
    email: "sarah.lee@techstart.io",
    phone: "+1 (555) 234-5678",
    meetingLink: "https://zoom.us/j/123456789",
    notes: "Initial discovery call to understand their software needs.",
    attendees: ["Emily Chen"]
  },
  { 
    id: 3, 
    client: "Global Partners", 
    contact: "Mike Chen", 
    time: "9:00 AM", 
    date: "Tomorrow",
    email: "m.chen@globalpartners.com",
    phone: "+1 (555) 345-6789",
    notes: "Follow-up on proposal sent last week.",
    attendees: ["David Wilson", "Lisa Anderson"]
  },
  { 
    id: 4, 
    client: "Innovation Labs", 
    contact: "Emily Davis", 
    time: "11:00 AM", 
    date: "Tomorrow",
    email: "emily.d@innovationlabs.com",
    phone: "+1 (555) 456-7890",
    notes: "Contract negotiation meeting.",
    attendees: []
  },
];

const initialTasks: TaskItem[] = [
  { 
    id: 1, 
    title: "Follow up with Acme Corp", 
    priority: "high", 
    dueDate: "Today",
    description: "Send follow-up email regarding the proposal and schedule a call to discuss next steps.",
    status: "in_progress",
    relatedClient: "Acme Corp",
    assignee: "Sarah Johnson"
  },
  { 
    id: 2, 
    title: "Prepare proposal for TechStart", 
    priority: "high", 
    dueDate: "Tomorrow",
    description: "Create a comprehensive proposal including pricing, timeline, and deliverables for the software development project.",
    status: "in_progress",
    relatedClient: "TechStart Inc",
    assignee: "You"
  },
  { 
    id: 3, 
    title: "Update pricing sheet", 
    priority: "medium", 
    dueDate: "Feb 7",
    description: "Review and update the Q1 pricing sheet with new service offerings and adjusted rates.",
    status: "not_started",
    assignee: "You"
  },
  { 
    id: 4, 
    title: "Send contract to Global Partners", 
    priority: "medium", 
    dueDate: "Feb 8",
    description: "Finalize and send the service agreement contract for signature.",
    status: "not_started",
    relatedClient: "Global Partners",
    assignee: "Mike Thompson"
  },
];

export function SalesDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal States
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);
  
  // Data States
  const [upcomingCalls, setUpcomingCalls] = useState<Call[]>(initialUpcomingCalls);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  // Call Details Panel State
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);

  // Task Details Sidebar State
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);

  // Scroll to upcoming calls panel
  const scrollToUpcomingCalls = () => {
    const element = document.getElementById("upcoming-calls-panel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScheduleCall = (data: CallScheduleData) => {
    const newCall: Call = {
      id: upcomingCalls.length + 1,
      client: "New Client",
      contact: "TBD",
      time: data.timeSlot,
      date: format(data.date, "MMM d"),
      notes: data.notes,
      attendees: [],
    };
    setUpcomingCalls([...upcomingCalls, newCall]);
  };

  const handleCallClick = (call: Call) => {
    setSelectedCall(call);
    setIsCallDetailsOpen(true);
  };

  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
    setIsTaskSidebarOpen(true);
  };

  const handleTaskStatusChange = (taskId: number, completed: boolean) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newStatus = completed ? "completed" : "not_started";
        const updated = { ...t, status: newStatus as TaskItem["status"] };
        if (selectedTask?.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
    toast({
      title: "Task updated",
      description: `Task marked as ${completed ? "completed" : "not started"}`,
    });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Sales Dashboard</h2>
          <p className="text-muted-foreground">Track your deals and pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddClientOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add New Client
          </Button>
          <Button variant="outline" onClick={() => navigate("/create-proposal")}>
            <FileText size={16} className="mr-2" />
            Create Proposal
          </Button>
          <Button variant="outline" onClick={() => setIsScheduleCallOpen(true)}>
            <CalendarIcon size={16} className="mr-2" />
            Schedule Call
          </Button>
        </div>
      </div>

      {/* KPI Cards with Click Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="My Deals"
          value="12"
          change="$285K pipeline"
          changeType="positive"
          icon={Handshake}
          onClick={() => navigate("/deals")}
        />
        <StatsCard
          title="Pending Proposals"
          value="5"
          change="2 awaiting response"
          changeType="neutral"
          icon={FileText}
          onClick={() => navigate("/proposals?filter=pending")}
        />
        <StatsCard
          title="Signed Contracts"
          value="8"
          change="+3 this month"
          changeType="positive"
          icon={FileSignature}
          onClick={() => navigate("/contracts")}
        />
        <StatsCard
          title="Upcoming Calls"
          value={String(upcomingCalls.length)}
          change="2 today"
          changeType="neutral"
          icon={Phone}
          onClick={scrollToUpcomingCalls}
        />
        <StatsCard
          title="Tasks in Progress"
          value="6"
          change="2 overdue"
          changeType="negative"
          icon={CheckSquare}
          onClick={() => navigate("/tasks?role=sales")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Calls Panel */}
        <Card id="upcoming-calls-panel" className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Calls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => handleCallClick(call)}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{call.client}</p>
                  <p className="text-sm text-muted-foreground">{call.contact}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{call.time}</p>
                  <p className="text-xs text-muted-foreground">{call.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tasks Panel using TaskItemCard component */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Tasks in Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <TaskItemCard
                key={task.id}
                task={task}
                onClick={handleTaskClick}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add Client Modal */}
      <AddClientModal 
        open={isAddClientOpen} 
        onOpenChange={setIsAddClientOpen} 
      />

      {/* Schedule Call Modal */}
      <ScheduleCallModal 
        open={isScheduleCallOpen} 
        onOpenChange={setIsScheduleCallOpen}
        onConfirm={handleScheduleCall}
      />

      {/* Call Details Panel */}
      <Dialog open={isCallDetailsOpen} onOpenChange={setIsCallDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone size={20} className="text-primary" />
              Call Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedCall && (
            <div className="space-y-4 py-4">
              {/* Client Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedCall.client)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{selectedCall.client}</p>
                  <p className="text-sm text-muted-foreground">{selectedCall.contact}</p>
                </div>
              </div>

              {/* Time & Date */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <CalendarIcon size={18} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedCall.time}</p>
                  <p className="text-sm text-muted-foreground">{selectedCall.date}</p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2">
                {selectedCall.email && (
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50">
                    <Mail size={16} className="text-muted-foreground" />
                    <span className="text-sm">{selectedCall.email}</span>
                  </div>
                )}
                {selectedCall.phone && (
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50">
                    <Phone size={16} className="text-muted-foreground" />
                    <span className="text-sm">{selectedCall.phone}</span>
                  </div>
                )}
                {selectedCall.meetingLink && (
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50">
                    <Video size={16} className="text-muted-foreground" />
                    <a href={selectedCall.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      Join Meeting <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Attendees */}
              {selectedCall.attendees && selectedCall.attendees.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCall.attendees.map((attendee, index) => (
                      <Badge key={index} variant="secondary">
                        {attendee}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedCall.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                    {selectedCall.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCallDetailsOpen(false)}>
              Close
            </Button>
            {selectedCall?.meetingLink && (
              <Button asChild>
                <a href={selectedCall.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Video size={16} className="mr-2" />
                  Join Call
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Sidebar */}
      <TaskDetailsSidebar
        task={selectedTask}
        open={isTaskSidebarOpen}
        onOpenChange={setIsTaskSidebarOpen}
      />
    </div>
  );
}
