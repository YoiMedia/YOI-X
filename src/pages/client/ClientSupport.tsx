import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { HelpCircle, Plus, MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientSupport() {
  const { user } = useAuth();
  const { clients } = useData();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    title: "",
    description: "",
  });

  const client = clients.find((c) => c.user_id === user?._id);

  // Fetch all client questions
  const allQuestions = useQuery(
    api.support.getClientQuestions,
    client?._id ? { client_id: client._id } : "skip",
  );

  const openQuestions = (allQuestions || []).filter((q) => q.status === "open");
  const resolvedQuestions = (allQuestions || []).filter(
    (q) => q.status === "resolved",
  );

  const askQuestion = useMutation(api.support.askQuestion);

  // Get first task ID (for demo purposes, in real app would select appropriate task)
  const requirements = useQuery(
    api.requirements.listForUser,
    user?._id ? { userId: user._id } : "skip",
  );

  const firstTask = useQuery(
    api.tasks.listByRequirement,
    requirements && requirements.length > 0
      ? { requirement_id: requirements[0]._id }
      : "skip",
  );

  const handleAskQuestion = async () => {
    if (!user || !firstTask || firstTask.length === 0) {
      toast.error("No active project found");
      return;
    }

    try {
      await askQuestion({
        task_id: firstTask[0]._id,
        title: questionForm.title,
        description: questionForm.description,
        asked_by: user._id,
      });

      toast.success("Question submitted!");
      setIsAskModalOpen(false);
      setQuestionForm({ title: "", description: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit question");
    }
  };

  const viewThread = (question: any) => {
    setSelectedQuestion(question);
    setIsThreadOpen(true);
  };

  const renderQuestionCard = (question: any) => (
    <Card
      key={question._id}
      className="border-border hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => viewThread(question)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{question.title}</h3>
            {question.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {question.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              question.status === "resolved"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200",
            )}
          >
            {question.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{new Date(question.created_at).toLocaleDateString()}</span>
          {question.responded_at && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={12} />
              Responded
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout title="Support">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Support & Questions</h2>
            <p className="text-muted-foreground">Get help from your team</p>
          </div>
          <Button onClick={() => setIsAskModalOpen(true)} className="gap-2">
            <Plus size={16} />
            Ask Question
          </Button>
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList>
            <TabsTrigger value="open">
              Open Questions ({openQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4 mt-6">
            {openQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p className="mb-4">No open questions</p>
                <Button
                  onClick={() => setIsAskModalOpen(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Ask Your First Question
                </Button>
              </div>
            ) : (
              openQuestions.map(renderQuestionCard)
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4 mt-6">
            {resolvedQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>No resolved questions yet</p>
              </div>
            ) : (
              resolvedQuestions.map(renderQuestionCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ask Question Modal */}
      <Dialog open={isAskModalOpen} onOpenChange={setIsAskModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question-title">Question Title *</Label>
              <Input
                id="question-title"
                placeholder="e.g., How do I access the staging environment?"
                value={questionForm.title}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question-description">Details</Label>
              <Textarea
                id="question-description"
                placeholder="Provide more context about your question..."
                value={questionForm.description}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    description: e.target.value,
                  })
                }
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAskModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAskQuestion} disabled={!questionForm.title}>
              Submit Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thread View Modal */}
      <Dialog open={isThreadOpen} onOpenChange={setIsThreadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Thread</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {selectedQuestion.title}
                </h3>
                {selectedQuestion.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedQuestion.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Asked on{" "}
                  {new Date(selectedQuestion.created_at).toLocaleString()}
                </p>
              </div>

              {selectedQuestion.response ? (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-900">
                      Team Response
                    </span>
                  </div>
                  <p className="text-sm text-green-900">
                    {selectedQuestion.response}
                  </p>
                  {selectedQuestion.responded_at && (
                    <p className="text-xs text-green-700 mt-2">
                      Responded on{" "}
                      {new Date(selectedQuestion.responded_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                  <MessageCircle
                    size={32}
                    className="mx-auto mb-2 text-yellow-600"
                  />
                  <p className="text-sm text-yellow-900">
                    Waiting for response from your team...
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
