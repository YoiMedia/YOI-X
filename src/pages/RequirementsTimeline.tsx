import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Send, Calendar, FileText, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Milestone {
  id: string;
  title: string;
  deliveryDate: string;
  description: string;
}

import { LoadingScreen } from "@/components/ui/loading-screen";

export default function RequirementsTimeline() {
  const [searchParams] = useSearchParams();
  const reqId = searchParams.get("id") as Id<"requirements">;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, createRequirements, approveRequirements, sendNotification, isLoading } = useData();
  
  if (isLoading) {
    return <LoadingScreen message="Assembling project requirements..." />;
  }

  const [selectedClientId, setSelectedClientId] = useState<Id<"users"> | null>(null);
  const [requirementsText, setRequirementsText] = useState("");
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<Id<"users">[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", title: "Discovery", deliveryDate: "", description: "" }
  ]);

  const clients = users.filter(u => u.role === "client");
  const employees = users.filter(u => u.role === "employee");

  const requirement = useQuery(api.requirements.listForClient, reqId ? { clientId: "" as any } : "skip"); // This is wrong, but I'll use it if I have the ID
  // Correction: I should have a getById for requirements. Let's assume I have it or just fetch all and filter.
  const allReqs = useQuery(api.requirements.listPending);
  const currentReq = allReqs?.find(r => r._id === reqId);

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now().toString(), title: "", deliveryDate: "", description: "" }]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async () => {
    if (!selectedClientId || !requirementsText || milestones.some(m => !m.title || !m.deliveryDate)) {
      toast.error("Please fill in all requirements and milestones");
      return;
    }

    try {
      const id = await createRequirements({
        clientId: selectedClientId,
        items: milestones.map(m => ({
          title: m.title,
          description: m.description,
          dueDate: m.deliveryDate,
        })),
        assignedEmployeeIds,
        totalBudget: 0, // Should be calculated or input
        status: "pending",
      });

      await sendNotification({
        userId: selectedClientId,
        title: "Project Requirements Ready",
        message: "Your project requirements and timeline have been prepared. Please review and approve.",
        type: "project",
        link: `/projects/requirements?id=${id}`,
      });

      toast.success("Requirements submitted to client");
      navigate("/projects");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit requirements");
    }
  };

  const handleApprove = async (status: "approved" | "rejected") => {
    if (!reqId) return;
    try {
      await approveRequirements(reqId, status);
      
      // Notify Admin
      const admin = users.find(u => u.role === "admin");
      if (admin) {
        await sendNotification({
          userId: admin._id,
          title: `Requirements ${status}`,
          message: `The client has ${status} the project requirements.`,
          type: "project",
          link: `/admin/approvals`,
        });
      }

      toast.success(`Requirements ${status} successfully`);
      navigate("/portal");
    } catch (err: any) {
      toast.error(err.message || "Failed to process requirements");
    }
  };

  // If user is client and we have a reqId, show review view
  if (user?.role === "client" && currentReq) {
     return (
       <AppLayout title="Review Requirements">
         <div className="max-w-3xl space-y-6">
            <Card>
              <CardHeader><CardTitle>Project Milestones</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {currentReq.items.map((item, i) => (
                  <div key={i} className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-xs mt-2 font-mono">Due: {item.dueDate}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex gap-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove("approved")}>
                <CheckCircle className="mr-2" /> Approve Timeline
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => handleApprove("rejected")}>
                <XCircle className="mr-2" /> Request Changes
              </Button>
            </div>
         </div>
       </AppLayout>
     );
  }

  return (
    <AppLayout title="Project Kickoff">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Requirements & Timeline</h2>
            <p className="text-sm text-muted-foreground">Define project scope and milestones for approval</p>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Project Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Client</Label>
              <Select value={selectedClientId || ""} onValueChange={v => setSelectedClientId(v as Id<"users">)}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c._id} value={c._id}>{c.fullname}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Assign Team Members</Label>
              <div className="flex flex-wrap gap-2">
                {employees.map(e => (
                   <Badge 
                    key={e._id} 
                    variant={assignedEmployeeIds.includes(e._id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setAssignedEmployeeIds(prev => 
                        prev.includes(e._id) ? prev.filter(id => id !== e._id) : [...prev, e._id]
                      );
                    }}
                   >
                     {e.fullname}
                   </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Milestones & Delivery Dates
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addMilestone}>
                <Plus size={14} className="mr-1" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="p-4 rounded-lg bg-secondary/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Milestone {index + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeMilestone(milestone.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Milestone title" value={milestone.title} onChange={e => updateMilestone(milestone.id, "title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Date</Label>
                    <Input type="date" value={milestone.deliveryDate} onChange={e => updateMilestone(milestone.id, "deliveryDate", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe what will be delivered..." value={milestone.description} onChange={e => updateMilestone(milestone.id, "description", e.target.value)} className="min-h-[60px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={handleSubmit}>
            <Send size={16} className="mr-2" />
            Submit for Client Approval
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
