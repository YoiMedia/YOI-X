import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight } from "lucide-react";

const stages = [
  { id: "lead", name: "Lead", color: "bg-slate-100" },
  { id: "qualified", name: "Qualified", color: "bg-blue-100" },
  { id: "proposal", name: "Proposal", color: "bg-purple-100" },
  { id: "negotiation", name: "Negotiation", color: "bg-orange-100" },
  { id: "closed", name: "Closed Won", color: "bg-green-100" },
];

const deals = [
  { id: 1, name: "Enterprise License", client: "Acme Corp", value: "$45,000", stage: "proposal" },
  { id: 2, name: "Consulting Package", client: "TechStart", value: "$28,000", stage: "lead" },
  { id: 3, name: "Annual Contract", client: "Global Partners", value: "$62,000", stage: "negotiation" },
  { id: 4, name: "Starter Plan", client: "Innovation Labs", value: "$12,000", stage: "qualified" },
  { id: 5, name: "Premium Support", client: "Quantum Solutions", value: "$8,500", stage: "closed" },
  { id: 6, name: "Team License", client: "DataFlow Inc", value: "$32,000", stage: "proposal" },
];

export default function Deals() {
  return (
    <AppLayout title="Deals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stages.map((stage, i) => (
              <div key={stage.id} className="flex items-center">
                <Badge variant="outline" className={`${stage.color} border-0`}>
                  {stage.name}
                </Badge>
                {i < stages.length - 1 && <ArrowRight size={14} className="mx-1 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <Button>
            <Plus size={16} className="mr-2" />
            Add Deal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <Card key={stage.id} className={`border-border ${stage.color}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {stage.name}
                  <Badge variant="secondary" className="font-normal">
                    {deals.filter((d) => d.stage === stage.id).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deals
                  .filter((deal) => deal.stage === stage.id)
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <p className="font-medium text-sm text-foreground">{deal.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{deal.client}</p>
                      <p className="text-sm font-semibold text-foreground mt-2">{deal.value}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
