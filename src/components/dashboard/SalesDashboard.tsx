import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Handshake, FileText, FileSignature, Phone, CheckSquare, Plus, Calendar as CalendarIcon, User, Clock, X, Video, Mail, MapPin, ExternalLink, Download } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

interface Task {
  id: number;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  description?: string;
  status?: "not_started" | "in_progress" | "completed";
  relatedClient?: string;
  assignee?: string;
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

const initialTasks: Task[] = [
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

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const statusColors = {
  not_started: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

const employees = [
  { id: 1, name: "Sarah Johnson" },
  { id: 2, name: "Mike Thompson" },
  { id: 3, name: "Emily Chen" },
  { id: 4, name: "David Wilson" },
  { id: 5, name: "Lisa Anderson" },
];

export function SalesDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Client Modal State
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    clientName: "",
    phone: "",
    altPhone: "",
    email: "",
    website: "",
    address: "",
    uniqueId: "CLT-2025-" + String(Math.floor(Math.random() * 900) + 100),
  });

  // Schedule Call Modal State
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);
  const [callDate, setCallDate] = useState<Date | undefined>(undefined);
  const [callTime, setCallTime] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [callNotes, setCallNotes] = useState("");
  const [callClient, setCallClient] = useState("");
  
  // Upcoming Calls State
  const [upcomingCalls, setUpcomingCalls] = useState<Call[]>(initialUpcomingCalls);
  
  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Call Details Panel State
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isCallDetailsOpen, setIsCallDetailsOpen] = useState(false);

  // Task Details Sidebar State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);

  // Scroll to upcoming calls panel
  const scrollToUpcomingCalls = () => {
    const element = document.getElementById("upcoming-calls-panel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const resetClientForm = () => {
    setClientForm({
      clientName: "",
      phone: "",
      altPhone: "",
      email: "",
      website: "",
      address: "",
      uniqueId: "CLT-2025-" + String(Math.floor(Math.random() * 900) + 100),
    });
  };

  const resetCallForm = () => {
    setCallDate(undefined);
    setCallTime("");
    setSelectedEmployees([]);
    setCallNotes("");
    setCallClient("");
  };

  const handleSaveClient = (sendLink: boolean) => {
    setIsAddClientOpen(false);
    toast({
      title: "Client created successfully",
      description: sendLink 
        ? `Login link sent to ${clientForm.email}` 
        : `${clientForm.clientName} has been added to your clients`,
    });
    resetClientForm();
  };

  const handleCancelClient = () => {
    setIsAddClientOpen(false);
    resetClientForm();
  };

  const handleConfirmCall = () => {
    if (callDate && callTime && callClient) {
      const newCall: Call = {
        id: upcomingCalls.length + 1,
        client: callClient,
        contact: employees.find(e => selectedEmployees.includes(e.id))?.name || "TBD",
        time: callTime,
        date: format(callDate, "MMM d"),
        notes: callNotes,
        attendees: selectedEmployees.map(id => employees.find(e => e.id === id)?.name || ""),
      };
      setUpcomingCalls([...upcomingCalls, newCall]);
      setIsScheduleCallOpen(false);
      toast({
        title: "Call scheduled successfully",
        description: `Call with ${callClient} scheduled for ${format(callDate, "MMM d")} at ${callTime}`,
      });
      resetCallForm();
    }
  };

  const handleCancelCall = () => {
    setIsScheduleCallOpen(false);
    resetCallForm();
  };

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleCallClick = (call: Call) => {
    setSelectedCall(call);
    setIsCallDetailsOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskSidebarOpen(true);
  };

  const handleTaskStatusChange = (taskId: number, newStatus: Task["status"]) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, status: newStatus };
        if (selectedTask?.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
    toast({
      title: "Task updated",
      description: `Status changed to ${newStatus?.replace("_", " ")}`,
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

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Tasks in Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              >
                <Checkbox 
                  checked={task.status === "completed"}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => {
                    handleTaskStatusChange(task.id, checked ? "completed" : "not_started");
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium",
                    task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                  )}>{task.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                </div>
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add Client Modal */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User size={20} className="text-primary" />
              Add New Client
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-clientName">Client Name *</Label>
                <Input
                  id="modal-clientName"
                  placeholder="Enter client or company name"
                  value={clientForm.clientName}
                  onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-uniqueId">Client Unique ID</Label>
                <Input
                  id="modal-uniqueId"
                  value={clientForm.uniqueId}
                  disabled
                  className="bg-secondary text-muted-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-phone">Phone *</Label>
                <Input
                  id="modal-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-altPhone">Alternate Phone</Label>
                <Input
                  id="modal-altPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={clientForm.altPhone}
                  onChange={(e) => setClientForm({ ...clientForm, altPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-email">Email *</Label>
                <Input
                  id="modal-email"
                  type="email"
                  placeholder="client@company.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-website">Website</Label>
                <Input
                  id="modal-website"
                  type="url"
                  placeholder="https://www.company.com"
                  value={clientForm.website}
                  onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-address">Address</Label>
              <Textarea
                id="modal-address"
                placeholder="Enter full address"
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                className="min-h-[70px]"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCancelClient}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleSaveClient(false)}>
              Save Only
            </Button>
            <Button onClick={() => handleSaveClient(true)}>
              Save & Send Login Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Call Modal */}
      <Dialog open={isScheduleCallOpen} onOpenChange={setIsScheduleCallOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Schedule Call
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="call-client">Client Name *</Label>
              <Input
                id="call-client"
                placeholder="Enter client name"
                value={callClient}
                onChange={(e) => setCallClient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !callDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {callDate ? format(callDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={callDate}
                    onSelect={setCallDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Select Time *</Label>
              <Select value={callTime} onValueChange={setCallTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Invite Employees</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-secondary/30">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                      selectedEmployees.includes(employee.id)
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-secondary"
                    )}
                    onClick={() => toggleEmployee(employee.id)}
                  >
                    <Checkbox checked={selectedEmployees.includes(employee.id)} />
                    <span className="text-sm">{employee.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="call-notes">Notes</Label>
              <Textarea
                id="call-notes"
                placeholder="Add any notes for the call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="min-h-[70px]"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCancelCall}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCall} disabled={!callDate || !callTime || !callClient}>
              Confirm Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      <Sheet open={isTaskSidebarOpen} onOpenChange={setIsTaskSidebarOpen}>
        <SheetContent className="w-[400px] sm:w-[480px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <CheckSquare size={20} className="text-primary" />
              Task Details
            </SheetTitle>
          </SheetHeader>

          {selectedTask && (
            <div className="mt-6 space-y-6">
              {/* Task Title & Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{selectedTask.title}</h3>
                  <Badge className={cn(statusColors[selectedTask.status || "not_started"])}>
                    {selectedTask.status?.replace("_", " ") || "Not Started"}
                  </Badge>
                </div>
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline" className={priorityColors[selectedTask.priority]}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <p className="font-medium">{selectedTask.dueDate}</p>
                </div>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {/* Related Client */}
              {selectedTask.relatedClient && (
                <div>
                  <p className="text-sm font-medium mb-2">Related Client</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(selectedTask.relatedClient)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{selectedTask.relatedClient}</span>
                  </div>
                </div>
              )}

              {/* Assignee */}
              {selectedTask.assignee && (
                <div>
                  <p className="text-sm font-medium mb-2">Assigned To</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(selectedTask.assignee)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{selectedTask.assignee}</span>
                  </div>
                </div>
              )}

              {/* Status Change */}
              <div>
                <p className="text-sm font-medium mb-2">Change Status</p>
                <Select 
                  value={selectedTask.status || "not_started"} 
                  onValueChange={(value) => handleTaskStatusChange(selectedTask.id, value as Task["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/tasks")}>
                  View All Tasks
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    handleTaskStatusChange(selectedTask.id, "completed");
                    setIsTaskSidebarOpen(false);
                  }}
                  disabled={selectedTask.status === "completed"}
                >
                  <CheckSquare size={16} className="mr-2" />
                  Mark Complete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
