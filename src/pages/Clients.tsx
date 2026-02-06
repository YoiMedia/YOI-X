import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";

const statusColors = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function Clients() {
  const navigate = useNavigate();
  const { clients, isLoading, deleteClient } = useData();
  
  if (isLoading) {
    return <LoadingScreen message="Fetching client directory..." />;
  }
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(client =>
    (client.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contact ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Clients">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredClients.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <Plus size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium mb-1">No clients found</p>
                  <p className="text-xs opacity-60">You haven't added any clients yet.</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div key={client.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-secondary text-foreground text-sm">
                        {(client.name ?? "User").split(" ").map((n) => n[0]).join("").slice(0, 2)}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteClient(client.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
