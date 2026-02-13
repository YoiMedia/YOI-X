import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientSubmissions() {
  const { user } = useAuth();
  const { clients } = useData();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");

  const client = clients.find((c) => c.user_id === user?._id);
  const submissions = useQuery(
    api.submissions.listForClient,
    client?._id ? { client_id: client._id } : "skip",
  );

  const reviewMutation = useMutation(api.submissions.review);
  const requestChangesMutation = useMutation(api.submissions.requestChanges);

  const submissionsByStatus = {
    pending: (submissions || []).filter((s) => s.status === "pending"),
    approved: (submissions || []).filter((s) => s.status === "approved"),
    changes_requested: (submissions || []).filter(
      (s) => s.status === "changes_requested",
    ),
  };

  const handleApprove = async (submission: any) => {
    if (!user) return;
    try {
      await reviewMutation({
        id: submission._id,
        status: "approved",
        reviewed_by: user._id,
      });
      toast.success("Submission approved!");
      setIsReviewModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve submission");
    }
  };

  const handleReject = async (submission: any) => {
    if (!user) return;
    try {
      await reviewMutation({
        id: submission._id,
        status: "rejected",
        reviewed_by: user._id,
        rejection_reason: "Client rejected the submission",
      });
      toast.success("Submission rejected");
      setIsReviewModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to reject submission");
    }
  };

  const handleRequestChanges = async (submission: any) => {
    if (!user || !changeRequest) return;
    try {
      await requestChangesMutation({
        id: submission._id,
        change_request_details: changeRequest,
        reviewed_by: user._id,
      });
      toast.success("Change request sent!");
      setIsChangesModalOpen(false);
      setChangeRequest("");
    } catch (error: any) {
      toast.error(error.message || "Failed to request changes");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "changes_requested":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const renderSubmissionCard = (submission: any) => (
    <Card
      key={submission._id}
      className="border-border hover:border-primary/30 transition-all"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{submission.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {submission.submission_number}
            </p>
            {submission.description && (
              <p className="text-sm text-muted-foreground">
                {submission.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs", getStatusColor(submission.status))}
          >
            {submission.status.replace("_", " ")}
          </Badge>
        </div>

        {submission.deliverables && submission.deliverables.length > 0 && (
          <div className="my-3 p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs font-semibold mb-2">
              Deliverables ({submission.deliverables.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {submission.deliverables.slice(0, 3).map((_, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-background px-2 py-1 rounded border"
                >
                  File {idx + 1}
                </div>
              ))}
              {submission.deliverables.length > 3 && (
                <div className="text-xs text-muted-foreground px-2 py-1">
                  +{submission.deliverables.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSubmission(submission);
              setIsReviewModalOpen(true);
            }}
            className="gap-2"
          >
            <Eye size={14} />
            Review
          </Button>
          {submission.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(submission)}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle size={14} />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSubmission(submission);
                  setIsChangesModalOpen(true);
                }}
                className="gap-2"
              >
                <AlertCircle size={14} />
                Request Changes
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout title="Submissions">
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Review Submissions</h2>
          <p className="text-muted-foreground">
            Review and approve work submitted by your team
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Review ({submissionsByStatus.pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({submissionsByStatus.approved.length})
            </TabsTrigger>
            <TabsTrigger value="changes">
              Changes Requested ({submissionsByStatus.changes_requested.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {submissionsByStatus.pending.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>No pending submissions</p>
              </div>
            ) : (
              submissionsByStatus.pending.map(renderSubmissionCard)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {submissionsByStatus.approved.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>No approved submissions</p>
              </div>
            ) : (
              submissionsByStatus.approved.map(renderSubmissionCard)
            )}
          </TabsContent>

          <TabsContent value="changes" className="space-y-4 mt-6">
            {submissionsByStatus.changes_requested.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>No change requests</p>
              </div>
            ) : (
              submissionsByStatus.changes_requested.map(renderSubmissionCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedSubmission.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedSubmission.submission_number}
                </p>
              </div>
              {selectedSubmission.description && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.description}
                  </p>
                </div>
              )}
              <div className="p-4 bg-secondary/20 rounded-lg min-h-[200px]">
                <p className="text-sm text-muted-foreground">
                  Deliverable files preview would appear here
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Close
            </Button>
            {selectedSubmission?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedSubmission)}
                  className="text-destructive"
                >
                  <XCircle size={14} className="mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedSubmission)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={14} className="mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Modal */}
      <Dialog open={isChangesModalOpen} onOpenChange={setIsChangesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Describe the changes needed
              </label>
              <Textarea
                placeholder="Please explain what needs to be changed or improved..."
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangesModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleRequestChanges(selectedSubmission)}
              disabled={!changeRequest}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
