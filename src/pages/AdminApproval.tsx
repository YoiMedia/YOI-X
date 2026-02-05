import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, XCircle, Users, Calendar, FileText, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const approvalRequest = {
  id: "REQ-2025-001",
  project: "Acme Corp Website Redesign",
  submittedBy: "Mike Johnson",
  submittedDate: "Feb 5, 2025",
  requirements: `Complete website redesign for Acme Corporation including:
- Modern responsive design
- E-commerce integration
- CMS for content management
- SEO optimization
- Performance optimization
- Mobile-first approach

Client has requested a clean, professional look with their brand colors (blue and white). The website should support multiple languages and have a blog section.`,
  milestones: [
    { id: 1, title: "Discovery & Research", date: "Feb 15, 2025", description: "Client interviews, competitor analysis, and requirements documentation" },
    { id: 2, title: "Wireframes & Design", date: "Mar 1, 2025", description: "Low-fi wireframes, high-fi mockups, and design system" },
    { id: 3, title: "Development Phase 1", date: "Mar 20, 2025", description: "Core pages, navigation, and responsive layout" },
    { id: 4, title: "Development Phase 2", date: "Apr 5, 2025", description: "E-commerce, CMS integration, and features" },
    { id: 5, title: "Testing & QA", date: "Apr 15, 2025", description: "Cross-browser testing, performance optimization" },
    { id: 6, title: "Launch", date: "Apr 25, 2025", description: "Deployment and go-live" },
  ],
};

const availableEmployees = [
  { id: 1, name: "Sarah Chen", role: "Project Manager", available: true },
  { id: 2, name: "Emily Davis", role: "Lead Designer", available: true },
  { id: 3, name: "Alex Rivera", role: "Frontend Developer", available: true },
  { id: 4, name: "Jordan Lee", role: "Backend Developer", available: false },
  { id: 5, name: "Chris Taylor", role: "QA Engineer", available: true },
];

export default function AdminApproval() {
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([1, 2, 3, 5]);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [changesNote, setChangesNote] = useState("");

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

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
              <h2 className="text-xl font-semibold text-foreground">Approval Request</h2>
              <p className="text-sm text-muted-foreground">{approvalRequest.id} · Submitted by {approvalRequest.submittedBy}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle size={14} className="mr-1" />
            Pending Approval
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Requirements Summary */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  Requirements Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2">{approvalRequest.project}</h3>
                  <p className="text-sm text-muted-foreground">Submitted: {approvalRequest.submittedDate}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-line">{approvalRequest.requirements}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Summary */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Timeline Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approvalRequest.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4 p-3 rounded-lg bg-secondary/50">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">{milestone.title}</p>
                          <Badge variant="secondary">{milestone.date}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Employee Assignment */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Assign Employees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      !employee.available
                        ? "border-border bg-muted opacity-60 cursor-not-allowed"
                        : selectedEmployees.includes(employee.id)
                        ? "border-primary bg-primary/5 cursor-pointer"
                        : "border-border hover:bg-secondary/50 cursor-pointer"
                    }`}
                    onClick={() => employee.available && toggleEmployee(employee.id)}
                  >
                    <Checkbox
                      checked={selectedEmployees.includes(employee.id)}
                      disabled={!employee.available}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                    </div>
                    {!employee.available && (
                      <Badge variant="outline" className="text-xs">Busy</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showChangesForm ? (
                  <div className="space-y-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle size={16} className="mr-2" />
                      Approve
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
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">What changes are needed?</p>
                      <Textarea
                        placeholder="Describe the required changes..."
                        value={changesNote}
                        onChange={(e) => setChangesNote(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowChangesForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1" variant="destructive">
                        Submit
                      </Button>
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
