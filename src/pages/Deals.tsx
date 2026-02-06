import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight, MoreHorizontal } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const stages = [
  { id: "pending", name: "Leads", color: "bg-slate-500/10 text-slate-700" },
  { id: "active", name: "Active Clients", color: "bg-green-500/10 text-green-700" },
  { id: "inactive", name: "Inactive", color: "bg-gray-500/10 text-gray-700" },
];

import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Deals() {
  const { clients, isLoading } = useData();

  if (isLoading) {
    return <LoadingScreen message="Visualizing sales pipeline..." />;
  }

  return (
    <AppLayout title="Pipeline">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Monitor lead flow and conversion stages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{stage.name}</h3>
                  <Badge variant="secondary" className="px-1.5 py-0 h-5 min-w-5 justify-center rounded-full bg-secondary/50">
                    {clients.filter(c => c.status === stage.id).length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 min-h-[500px] rounded-xl bg-secondary/20 p-2 border border-border/50">
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <Card key={i} className="border-border shadow-none">
                      <CardContent className="p-4 space-y-2">
                        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : clients.filter(c => c.status === stage.id).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/40 italic text-sm">
                    No items in {(stage.name ?? "").toLowerCase()}
                  </div>
                ) : (
                  clients
                    .filter((client) => client.status === stage.id)
                    .map((client) => (
                      <Card key={client.id} className="border-border shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-sm text-foreground">{client.name}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal size={14} />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{client.email}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="text-sm font-bold text-primary">{client.value}</span>
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold border-none px-0 ${stage.color}`}>
                              {client.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
