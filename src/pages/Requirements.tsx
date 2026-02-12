import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ClipboardCheck, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ArrowRight,
  Filter,
  Users
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Link, useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Requirements() {
  const navigate = useNavigate();
  const { requirements, clients, users, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReqs = (requirements ?? []).filter(req =>
    req.requirement_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requirement_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100">Rejected</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) return <LoadingScreen message="Loading requirements dashboard..." />;

  return (
    <AppLayout title="Project Requirements">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requirements..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white">
              <Filter size={16} className="mr-2" /> Filter
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {clients.length === 0 ? (
            <Card className="border-border bg-white shadow-sm overflow-hidden">
              <CardContent className="py-20 text-center text-muted-foreground">
                <Users size={48} className="mx-auto mb-4 opacity-5" />
                <p className="text-sm font-medium">No clients found</p>
                <p className="text-xs">Add clients to begin managing requirements.</p>
              </CardContent>
            </Card>
          ) : (
            clients.map((client) => {
              const clientReqs = filteredReqs.filter(req => req.client_id === client.id);
              
              return (
                <Card key={client.id} className="border-border bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {client.name[0]}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-slate-900">{client.name}</CardTitle>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            {client.companyName || "Client"} · {client.uniqueClientId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-slate-500">
                          {clientReqs.length} {clientReqs.length === 1 ? 'Requirement' : 'Requirements'}
                        </Badge>
                        <Link to={`/projects/requirements?clientId=${client.id}`}>
                          <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-[10px] px-3">
                            <Plus size={12} className="mr-1" /> Add Requirement
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {clientReqs.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground bg-slate-50/50">
                          <p className="text-xs font-semibold text-slate-400 mb-3">No requirements listed yet</p>
                          <Link to={`/projects/requirements?clientId=${client.id}`}>
                            <Button variant="default" size="sm" className="bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-[10px]">
                              <Plus size={12} className="mr-1" /> Add First Requirement
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        clientReqs.map((req) => (
                          <div key={req._id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                <h3 className="font-medium text-slate-800 text-sm truncate">{req.requirement_name}</h3>
                                {getStatusBadge(req.status)}
                              </div>
                              <p className="text-[10px] text-slate-500 ml-3.5">
                                {req.requirement_number} · Created {new Date(req.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="hidden sm:block text-right">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Team</p>
                                <div className="flex -space-x-1.5 mt-0.5">
                                  {(req.assigned_employees || []).slice(0, 3).map((empId: string, i: number) => (
                                    <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                                      {users.find(u => u._id === empId)?.full_name?.[0] || "E"}
                                    </div>
                                  ))}
                                  {(req.assigned_employees || []).length > 3 && (
                                    <div className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                      +{(req.assigned_employees || []).length - 3}
                                    </div>
                                  )}
                                  {(req.assigned_employees || []).length === 0 && (
                                    <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Link to={`/projects/requirements?id=${req._id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-primary">
                                    <Eye size={14} />
                                  </Button>
                                </Link>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                                      <MoreHorizontal size={14} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="text-xs">
                                    <DropdownMenuItem onClick={() => navigate(`/projects/requirements?id=${req._id}`)}>
                                      Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-rose-600">Archive</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
