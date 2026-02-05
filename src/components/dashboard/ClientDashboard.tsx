import { FolderKanban, FileText, FileSignature, Receipt, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const projects = [
  { id: 1, name: "Website Redesign", status: "in_progress", progress: 65, startDate: "Jan 15", endDate: "Mar 30" },
  { id: 2, name: "Mobile App Development", status: "in_progress", progress: 40, startDate: "Feb 1", endDate: "May 15" },
  { id: 3, name: "Marketing Campaign", status: "pending", progress: 15, startDate: "Feb 10", endDate: "Apr 20" },
];

const documents = [
  { id: 1, type: "proposal", name: "Website Redesign Proposal", date: "Jan 10, 2025", status: "accepted" },
  { id: 2, type: "nda", name: "Mutual Non-Disclosure Agreement", date: "Jan 12, 2025", status: "signed" },
  { id: 3, type: "invoice", name: "Invoice #INV-001", date: "Jan 15, 2025", status: "paid", amount: "$12,500" },
  { id: 4, type: "proposal", name: "Mobile App Proposal", date: "Jan 28, 2025", status: "accepted" },
  { id: 5, type: "invoice", name: "Invoice #INV-002", date: "Feb 1, 2025", status: "pending", amount: "$8,500" },
];

const statusColors = {
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  signed: "bg-green-100 text-green-700 border-green-200",
  paid: "bg-green-100 text-green-700 border-green-200",
};

const typeIcons = {
  proposal: FileText,
  nda: FileSignature,
  invoice: Receipt,
};

export function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground">View your projects and documents</p>
        </div>
        <Button>
          <Calendar size={16} className="mr-2" />
          Schedule Call
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderKanban size={18} className="text-primary" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {project.startDate} - {project.endDate}
                  </p>
                </div>
                <Badge variant="outline" className={statusColors[project.status]}>
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Project Progress</span>
                  <span className="font-medium text-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {documents.map((doc) => {
              const Icon = typeIcons[doc.type];
              return (
                <div key={doc.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.date}</p>
                  </div>
                  {doc.amount && (
                    <span className="text-sm font-medium text-foreground">{doc.amount}</span>
                  )}
                  <Badge variant="outline" className={statusColors[doc.status]}>
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
