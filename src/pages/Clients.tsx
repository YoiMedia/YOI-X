import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal } from "lucide-react";

const clients = [
  { id: 1, name: "Acme Corporation", contact: "John Smith", email: "john@acme.com", status: "active", value: "$45,000" },
  { id: 2, name: "TechStart Inc", contact: "Sarah Johnson", email: "sarah@techstart.com", status: "active", value: "$32,000" },
  { id: 3, name: "Global Partners", contact: "Mike Chen", email: "mike@globalpartners.com", status: "pending", value: "$28,500" },
  { id: 4, name: "Innovation Labs", contact: "Emily Davis", email: "emily@innovationlabs.com", status: "active", value: "$52,000" },
  { id: 5, name: "Quantum Solutions", contact: "Alex Rivera", email: "alex@quantum.com", status: "inactive", value: "$18,000" },
];

const statusColors = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function Clients() {
  return (
    <AppLayout title="Clients">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-9" />
          </div>
          <Button>
            <Plus size={16} className="mr-2" />
            Add Client
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary text-foreground text-sm">
                      {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.contact} · {client.email}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[client.status]}>
                    {client.status}
                  </Badge>
                  <span className="text-sm font-medium text-foreground w-20 text-right">{client.value}</span>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
