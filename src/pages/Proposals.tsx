import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MoreHorizontal, Clock, Search } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";

const statusColors = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  declined: "bg-red-100 text-red-700 border-red-200",
};

export default function Proposals() {
  const { activities } = useData();

  // Derive proposals from activities for demonstration
  const proposalActions = activities.filter(a => a.action_text.toLowerCase().includes("proposal"));

  return (
    <AppLayout title="Proposals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search proposals..." className="pl-9" />
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            Create Proposal
          </Button>
        </div>

        {proposalActions.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
            <Card className="border-border border-dashed">
              <CardContent className="h-[160px] flex flex-col items-center justify-center text-muted-foreground">
                <FileText size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No proposals drafted yet.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposalActions.map((action, i) => (
              <Card key={i} className="border-border hover:border-primary/50 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/5 text-primary">
                        <FileText size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold truncate max-w-[150px]">
                          {action.action_text.split(":")[1]?.trim() || "New Proposal"}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.actor_name}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {action.timestamp}
                    </div>
                    <Badge variant="outline" className={statusColors.draft}>
                      Draft
                    </Badge>
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
