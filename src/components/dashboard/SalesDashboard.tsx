import { useState } from "react";
import { Handshake, FileText, FileSignature, Phone, CheckSquare, Plus, Calendar, User } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const upcomingCalls = [
  { id: 1, client: "Acme Corp", contact: "John Smith", time: "10:00 AM", date: "Today" },
  { id: 2, client: "TechStart Inc", contact: "Sarah Lee", time: "2:30 PM", date: "Today" },
  { id: 3, client: "Global Partners", contact: "Mike Chen", time: "9:00 AM", date: "Tomorrow" },
  { id: 4, client: "Innovation Labs", contact: "Emily Davis", time: "11:00 AM", date: "Tomorrow" },
];

const tasks = [
  { id: 1, title: "Follow up with Acme Corp", priority: "high", dueDate: "Today" },
  { id: 2, title: "Prepare proposal for TechStart", priority: "high", dueDate: "Tomorrow" },
  { id: 3, title: "Update pricing sheet", priority: "medium", dueDate: "Feb 7" },
  { id: 4, title: "Send contract to Global Partners", priority: "medium", dueDate: "Feb 8" },
];

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export function SalesDashboard() {
  const { toast } = useToast();
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

  const resetForm = () => {
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

  const handleSaveClient = (sendLink: boolean) => {
    setIsAddClientOpen(false);
    toast({
      title: "Client created successfully",
      description: sendLink 
        ? `Login link sent to ${clientForm.email}` 
        : `${clientForm.clientName} has been added to your clients`,
    });
    resetForm();
  };

  const handleCancel = () => {
    setIsAddClientOpen(false);
    resetForm();
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
          <Button variant="outline">
            <FileText size={16} className="mr-2" />
            Create Proposal
          </Button>
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
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
        />
        <StatsCard
          title="Pending Proposals"
          value="5"
          change="2 awaiting response"
          changeType="neutral"
          icon={FileText}
        />
        <StatsCard
          title="Signed Contracts"
          value="8"
          change="+3 this month"
          changeType="positive"
          icon={FileSignature}
        />
        <StatsCard
          title="Upcoming Calls"
          value="4"
          change="2 today"
          changeType="neutral"
          icon={Phone}
        />
        <StatsCard
          title="Tasks in Progress"
          value="6"
          change="2 overdue"
          changeType="negative"
          icon={CheckSquare}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Calls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
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
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Checkbox />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{task.title}</p>
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
            <Button variant="outline" onClick={handleCancel}>
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
    </div>
  );
}
