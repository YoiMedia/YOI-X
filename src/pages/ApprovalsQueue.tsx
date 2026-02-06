import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Calendar, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  client: string;
  submittedBy: string;
  submittedDate: string;
  requirements: string[];
  milestones: { name: string; date: string }[];
  totalValue: string;
  status: "pending" | "approved" | "changes_requested";
}

export default function ApprovalsQueue() {
  const { pendingApprovals, deleteApproval, approveTimeline } = useData();
  const { toast } = useToast();
  const [changeRequests, setChangeRequests] = useState<Record<string, string>>({});
  const [showChangeBox, setShowChangeBox] = useState<string | null>(null);

  // Map pendingApprovals from context to the UI structure if needed, 
  // but for now let's just use the context as the source of truth for the list

  const handleApprove = (id: string, name: string) => {
    approveTimeline(id);
    toast({
      title: "Project approved",
      description: `${name} has been approved and moved to active projects`,
    });
  };

  const handleRequestChanges = (id: string, name: string, submittedBy: string) => {
    if (changeRequests[id]) {
      // In a real app, this would update status in context. 
      // For this demo, we'll just toast and remove from queue (effectively dismissing it)
      deleteApproval(id);
      toast({
        title: "Changes requested",
        description: `Feedback sent to ${submittedBy} for ${name}`,
      });
      setShowChangeBox(null);
    } else {
      setShowChangeBox(id);
    }
  };

  return (
    <AppLayout title="Approvals Queue">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Approvals Queue</h2>
            <p className="text-sm text-muted-foreground">
              {pendingApprovals.length} project{pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
        </div>

        {pendingApprovals.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
              <p className="text-muted-foreground">No projects pending approval</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id} className="border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">{approval.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {approval.client} • Submitted recently
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {approval.urgent && (
                        <Badge variant="destructive" className="animate-pulse">Urgent</Badge>
                      )}
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Clock size={12} className="mr-1" />
                        Pending
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteApproval(approval.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText size={16} className="text-primary" />
                        Requirements Summary
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-foreground italic">Standard requirements package for {approval.title}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar size={16} className="text-primary" />
                        Timeline Summary
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                        <p className="text-muted-foreground">Awaiting detailed timeline approval from PM office.</p>
                      </div>
                    </div>
                  </div>

                  {showChangeBox === approval.id && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe the changes needed..."
                        value={changeRequests[approval.id] || ""}
                        onChange={(e) => setChangeRequests(prev => ({ ...prev, [approval.id]: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleApprove(approval.id, approval.title)}>
                      <CheckCircle size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRequestChanges(approval.id, approval.title, "Admin")}
                    >
                      <XCircle size={16} className="mr-2" />
                      {showChangeBox === approval.id ? "Submit Feedback" : "Request Changes"}
                    </Button>
                    {showChangeBox === approval.id && (
                      <Button variant="ghost" onClick={() => setShowChangeBox(null)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
