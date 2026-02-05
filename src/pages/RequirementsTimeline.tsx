import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Send, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface Milestone {
  id: number;
  title: string;
  deliveryDate: string;
  description: string;
}

export default function RequirementsTimeline() {
  const [requirements, setRequirements] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, title: "Discovery & Research", deliveryDate: "2025-02-15", description: "Complete client research and competitor analysis" },
    { id: 2, title: "Design Phase", deliveryDate: "2025-03-01", description: "Wireframes and visual designs" },
  ]);

  const addMilestone = () => {
    const newId = Math.max(0, ...milestones.map((m) => m.id)) + 1;
    setMilestones([...milestones, { id: newId, title: "", deliveryDate: "", description: "" }]);
  };

  const removeMilestone = (id: number) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: number, field: keyof Milestone, value: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  return (
    <AppLayout title="Requirements & Timeline">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/deals">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Requirements & Timeline</h2>
            <p className="text-sm text-muted-foreground">Define project scope and milestones for approval</p>
          </div>
        </div>

        {/* Project Requirements */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Project Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe the project requirements, scope, deliverables, and any specific client needs..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        {/* Milestones */}
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
            {milestones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No milestones added yet.</p>
                <Button variant="link" onClick={addMilestone} className="mt-2">
                  Add your first milestone
                </Button>
              </div>
            ) : (
              milestones.map((milestone, index) => (
                <div key={milestone.id} className="p-4 rounded-lg bg-secondary/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Milestone {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Date</Label>
                      <Input
                        type="date"
                        value={milestone.deliveryDate}
                        onChange={(e) => updateMilestone(milestone.id, "deliveryDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe what will be delivered..."
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button size="lg">
            <Send size={16} className="mr-2" />
            Submit for Admin Approval
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
