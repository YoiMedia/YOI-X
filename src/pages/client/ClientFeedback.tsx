import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Star, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientFeedback() {
  const { user } = useAuth();
  const { clients } = useData();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackForm, setFeedbackForm] = useState({
    quality_rating: 0,
    timeliness_rating: 0,
    communication_rating: 0,
    comments: "",
  });

  const client = clients.find((c) => c.user_id === user?._id);
  const feedbackHistory = useQuery(
    api.feedback.listForClient,
    client?._id ? { client_id: client._id } : "skip",
  );

  const submissions = useQuery(
    api.submissions.listForClient,
    client?._id ? { client_id: client._id } : "skip",
  );

  const createFeedback = useMutation(api.feedback.create);

  // Get the latest approved submission
  const latestApprovedSubmission = (submissions || [])
    .filter((s) => s.status === "approved")
    .sort((a, b) => b.created_at - a.created_at)[0];

  const handleSubmitFeedback = async () => {
    if (!client || !latestApprovedSubmission) {
      toast.error("No approved submission found to provide feedback on");
      return;
    }

    try {
      const overallRating =
        (feedbackForm.quality_rating +
          feedbackForm.timeliness_rating +
          feedbackForm.communication_rating) /
        3;

      await createFeedback({
        submission_id: latestApprovedSubmission._id,
        requirement_id: latestApprovedSubmission.requirement_id,
        client_id: client._id,
        overall_rating: Math.round(overallRating),
        quality_rating: feedbackForm.quality_rating,
        timeliness_rating: feedbackForm.timeliness_rating,
        communication_rating: feedbackForm.communication_rating,
        comments: feedbackForm.comments,
      });

      toast.success("Feedback submitted successfully!");
      setFeedbackForm({
        quality_rating: 0,
        timeliness_rating: 0,
        communication_rating: 0,
        comments: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback");
    }
  };

  const renderStarRating = (value: number, onChange: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={cn(
                "transition-colors",
                star <= (hoverRating || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300",
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <AppLayout title="Feedback">
      <div className="max-w-4xl space-y-8">
        {/* Provide Feedback Form */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send size={20} className="text-primary" />
              Provide Feedback
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Share your experience and help us improve
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Quality of Work</Label>
                {renderStarRating(feedbackForm.quality_rating, (val) =>
                  setFeedbackForm({ ...feedbackForm, quality_rating: val }),
                )}
              </div>

              <div>
                <Label className="mb-3 block">Timeliness</Label>
                {renderStarRating(feedbackForm.timeliness_rating, (val) =>
                  setFeedbackForm({ ...feedbackForm, timeliness_rating: val }),
                )}
              </div>

              <div>
                <Label className="mb-3 block">Communication</Label>
                {renderStarRating(feedbackForm.communication_rating, (val) =>
                  setFeedbackForm({
                    ...feedbackForm,
                    communication_rating: val,
                  }),
                )}
              </div>

              <div>
                <Label htmlFor="comments" className="mb-2 block">
                  Additional Comments
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Tell us more about your experience..."
                  value={feedbackForm.comments}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      comments: e.target.value,
                    })
                  }
                  rows={5}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmitFeedback}
              disabled={
                feedbackForm.quality_rating === 0 ||
                feedbackForm.timeliness_rating === 0 ||
                feedbackForm.communication_rating === 0
              }
              className="gap-2"
            >
              <Send size={16} />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>

        {/* Feedback History */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Your Feedback History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!feedbackHistory || feedbackHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p>No feedback submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackHistory.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= (feedback.overall_rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">
                          {feedback.overall_rating}/5
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          feedback.submitted_at || feedback.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quality:</span>{" "}
                        <span className="font-medium">
                          {feedback.quality_rating}/5
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Timeliness:
                        </span>{" "}
                        <span className="font-medium">
                          {feedback.timeliness_rating}/5
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Communication:
                        </span>{" "}
                        <span className="font-medium">
                          {feedback.communication_rating}/5
                        </span>
                      </div>
                    </div>

                    {feedback.comments && (
                      <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">
                        "{feedback.comments}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
