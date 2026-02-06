import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: number;
  name: string;
  client: string;
  submittedBy: string;
  submittedDate: string;
  requirements: string[];
  milestones: { name: string; date: string }[];
  totalValue: string;
  status: "pending" | "approved" | "changes_requested";
}

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    client: "Acme Corp",
    submittedBy: "Sarah Chen",
    submittedDate: "Feb 4, 2025",
    requirements: [
      "Complete website redesign with new branding",
      "Mobile-responsive design",
      "Integration with existing CRM",
      "SEO optimization package",
    ],
    milestones: [
      { name: "Design mockups", date: "Feb 15" },
      { name: "Development phase", date: "Mar 1" },
      { name: "Testing & QA", date: "Mar 10" },
      { name: "Launch", date: "Mar 15" },
    ],
    totalValue: "$45,000",
    status: "pending",
  },
  {
    id: 2,
    name: "Marketing Campaign",
    client: "TechStart Inc",
    submittedBy: "Mike Johnson",
    submittedDate: "Feb 3, 2025",
    requirements: [
      "Social media campaign across 3 platforms",
      "Email marketing automation setup",
      "Content creation (10 blog posts)",
      "Analytics dashboard",
    ],
    milestones: [
      { name: "Strategy finalization", date: "Feb 10" },
      { name: "Content creation", date: "Feb 20" },
      { name: "Campaign launch", date: "Mar 1" },
      { name: "Performance review", date: "Mar 15" },
    ],
    totalValue: "$28,500",
    status: "pending",
  },
  {
    id: 3,
    name: "App Development",
    client: "Innovation Labs",
    submittedBy: "Emily Davis",
    submittedDate: "Feb 2, 2025",
    requirements: [
      "iOS and Android mobile app",
      "User authentication system",
      "Push notifications",
      "Admin dashboard",
      "API development",
    ],
    milestones: [
      { name: "UI/UX design", date: "Feb 20" },
      { name: "Backend development", date: "Mar 10" },
      { name: "Frontend development", date: "Mar 25" },
      { name: "Beta testing", date: "Apr 5" },
      { name: "App store submission", date: "Apr 15" },
    ],
    totalValue: "$85,000",
    status: "pending",
  },
];

export default function ApprovalsQueue() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [changeRequests, setChangeRequests] = useState<Record<number, string>>({});
  const [showChangeBox, setShowChangeBox] = useState<number | null>(null);

  const handleApprove = (projectId: number) => {
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, status: "approved" as const } : p))
    );
    const project = projects.find(p => p.id === projectId);
    toast({
      title: "Project approved",
      description: `${project?.name} has been approved and moved to active projects`,
    });
  };

  const handleRequestChanges = (projectId: number) => {
    if (changeRequests[projectId]) {
      setProjects(prev =>
        prev.map(p => (p.id === projectId ? { ...p, status: "changes_requested" as const } : p))
      );
      const project = projects.find(p => p.id === projectId);
      toast({
        title: "Changes requested",
        description: `Feedback sent to ${project?.submittedBy} for ${project?.name}`,
      });
      setShowChangeBox(null);
    } else {
      setShowChangeBox(projectId);
    }
  };

  const pendingProjects = projects.filter(p => p.status === "pending");

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
              {pendingProjects.length} project{pendingProjects.length !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
        </div>

        {pendingProjects.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
              <p className="text-muted-foreground">No projects pending approval</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingProjects.map((project) => (
              <Card key={project.id} className="border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.client} • Submitted by {project.submittedBy} on {project.submittedDate}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Clock size={12} className="mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Requirements Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText size={16} className="text-primary" />
                        Requirements Summary
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                        {project.requirements.map((req, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary">•</span>
                            <span className="text-foreground">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar size={16} className="text-primary" />
                        Timeline Summary
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                        {project.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{milestone.name}</span>
                            <span className="text-muted-foreground">{milestone.date}</span>
                          </div>
                        ))}
                        <div className="border-t border-border pt-2 mt-2 flex justify-between font-medium">
                          <span>Total Value</span>
                          <span className="text-primary">{project.totalValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change Request Box */}
                  {showChangeBox === project.id && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe the changes needed..."
                        value={changeRequests[project.id] || ""}
                        onChange={(e) => setChangeRequests(prev => ({ ...prev, [project.id]: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleApprove(project.id)}>
                      <CheckCircle size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleRequestChanges(project.id)}
                    >
                      <XCircle size={16} className="mr-2" />
                      {showChangeBox === project.id ? "Submit Feedback" : "Request Changes"}
                    </Button>
                    {showChangeBox === project.id && (
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
