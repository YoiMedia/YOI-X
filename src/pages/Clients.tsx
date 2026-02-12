import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, Plus, MoreHorizontal, Eye, Edit2, User, Building2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const statusColors = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function Clients() {
  const navigate = useNavigate();
  const { clients, isLoading, deleteClient, updateClient } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    address: "",
    company_name: "",
    industry: "",
    company_size: "",
    status: "",
  });

  if (isLoading) {
    return <LoadingScreen message="Fetching client directory..." />;
  }

  const filteredClients = clients.filter(client =>
    (client.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contact ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.companyName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.industry ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (client: any) => {
    setEditingClient(client);
    setEditForm({
      fullName: client.name || "",
      email: client.email || "",
      phone: client.contact || "",
      alternatePhone: client.alternatePhone || "",
      website: client.website || "",
      address: client.address || "",
      company_name: client.companyName || "",
      industry: client.industry || "",
      company_size: client.companySize?.toString() || "",
      status: client.status || "active",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      await updateClient(editingClient.id as Id<"clients">, {
        ...editForm,
        company_size: editForm.company_size ? parseInt(editForm.company_size) : undefined,
      });
      toast.success("Client details updated successfully");
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update client");
    }
  };

  return (
    <AppLayout title="Clients">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, or industry..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {user?.role === "freelancer" && (
            <Button onClick={() => navigate("/clients/add")} className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> Add New Client
            </Button>
          )}
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
                        {(client.name || client.companyName || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link to={`/clients/${client.id}`} className="font-bold text-slate-900 truncate block hover:text-primary transition-colors">{client.name}</Link>
                      <p className="text-sm text-slate-500 font-medium truncate">
                        {client.companyName} ({client.industry}) · {client.contact} · {client.email}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusColors[client.status as keyof typeof statusColors] ?? statusColors.active}>
                      {client.status}
                    </Badge>
                    <span className="text-sm font-medium text-foreground w-24 text-right">{client.uniqueClientId}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                          <Eye size={14} className="mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(client)}>
                          <Edit2 size={14} className="mr-2" />
                          Edit Client
                        </DropdownMenuItem>
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 size={20} className="text-primary" />
              Edit Client Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User size={16} /> Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-alt-phone">Alternate Phone</Label>
                  <Input id="edit-alt-phone" value={editForm.alternatePhone} onChange={(e) => setEditForm({...editForm, alternatePhone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input id="edit-website" value={editForm.website} onChange={(e) => setEditForm({...editForm, website: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea id="edit-address" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Building2 size={16} /> Company Details
              </h4>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company Name</Label>
                <Input id="edit-company" value={editForm.company_name} onChange={(e) => setEditForm({...editForm, company_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Input id="edit-industry" value={editForm.industry} onChange={(e) => setEditForm({...editForm, industry: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Company Size</Label>
                  <Input id="edit-size" type="number" value={editForm.company_size} onChange={(e) => setEditForm({...editForm, company_size: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateClient}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
