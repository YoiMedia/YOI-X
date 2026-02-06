import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, XCircle, Users, Calendar, FileText, AlertCircle, IndianRupee } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AdminApproval() {
  const [searchParams] = useSearchParams();
  const reqId = searchParams.get("id") as Id<"requirements">;
  const navigate = useNavigate();
  const { approveRequirements, createTask, sendNotification, users, isLoading } = useData();
  
  if (isLoading) {
    return <LoadingScreen message="Loading administrative approvals..." />;
  }

  const allReqs = useQuery(api.requirements.listPending);
  const currentReq = allReqs?.find(r => r._id === reqId);

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Id<"users">[]>([]);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [changesNote, setChangesNote] = useState("");

  const employees = users.filter(u => u.role === "employee");

  const handleApprove = async () => {
    if (!currentReq) return;
    try {
      await approveRequirements(currentReq._id, "approved");

      // Auto-create tasks for assigned employees
      // For simplicity, we create one task per requirement item for ALL assigned employees
      for (const item of currentReq.items) {
        for (const empId of currentReq.assignedEmployeeIds) {
          await createTask({
            requirementId: currentReq._id,
            assignedEmployeeId: empId,
            title: item.title,
            description: item.description,
            subtasks: [],
            status: "todo",
          });
          
          await sendNotification({
            userId: empId,
            title: "New Task Assigned",
            message: `You have been assigned the task: ${item.title}`,
            type: "task",
            link: "/tasks",
          });
        }
      }

      toast.success("Project approved and tasks assigned to team");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve project");
    }
  };

  const handleRequestChanges = async () => {
    if (!currentReq) return;
    try {
      await approveRequirements(currentReq._id, "rejected");
      toast.success("Changes requested from account manager");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    }
  };

  if (reqId && !currentReq) {
    return <div className="p-8 text-center text-muted-foreground">No pending request found for this ID.</div>;
  }

  return (
    <AppLayout title="Admin Approval">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Final Project Approval</h2>
              <p className="text-sm text-muted-foreground">Review requirements and authorize project kickoff</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle size={14} className="mr-1" />
            Pending Your Review
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  Proposed Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentReq?.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{item.title}</p>
                          <Badge variant="secondary">{item.dueDate}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Assigned Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentReq?.assignedEmployeeIds.map(id => {
                  const emp = employees.find(e => e._id === id);
                  return (
                    <div key={id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold uppercase">
                        {(emp?.fullname ?? "E P").split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp?.fullname ?? "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{emp?.role ?? "Staff"}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Decide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showChangesForm ? (
                  <div className="space-y-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                      <CheckCircle size={16} className="mr-2" />
                      Approve & Kickoff
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setShowChangesForm(true)}
                    >
                      <XCircle size={16} className="mr-2" />
                      Request Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Specify your concerns..."
                      value={changesNote}
                      onChange={(e) => setChangesNote(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowChangesForm(false)}>Cancel</Button>
                      <Button className="flex-1" variant="destructive" onClick={handleRequestChanges}>Submit</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
