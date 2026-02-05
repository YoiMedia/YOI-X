import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MoreHorizontal } from "lucide-react";

const proposals = [
  { id: 1, title: "Q4 Marketing Campaign", client: "Acme Corp", value: "$45,000", status: "sent", date: "Feb 2, 2025" },
  { id: 2, title: "Web Redesign Project", client: "TechStart Inc", value: "$28,000", status: "draft", date: "Feb 1, 2025" },
  { id: 3, title: "Annual Maintenance", client: "Global Partners", value: "$18,000", status: "accepted", date: "Jan 30, 2025" },
  { id: 4, title: "Consulting Services", client: "Innovation Labs", value: "$35,000", status: "sent", date: "Jan 28, 2025" },
  { id: 5, title: "Software License", client: "Quantum Solutions", value: "$52,000", status: "declined", date: "Jan 25, 2025" },
];

const statusColors = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  declined: "bg-red-100 text-red-700 border-red-200",
};

export default function Proposals() {
  return (
    <AppLayout title="Proposals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Manage your proposals and track their status</p>
          <Button>
            <Plus size={16} className="mr-2" />
            Create Proposal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <FileText size={16} className="text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{proposal.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{proposal.client}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{proposal.value}</p>
                    <p className="text-xs text-muted-foreground">{proposal.date}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[proposal.status]}>
                    {proposal.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
