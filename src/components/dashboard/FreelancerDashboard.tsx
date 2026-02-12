import { useState } from "react";
import { Users, Phone, FileText, Send, Plus, ArrowRight, UserPlus, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Inbox, MoreHorizontal, DollarSign, FileSignature } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RecentActivity } from "./RecentActivity";

export function FreelancerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients, documents, isLoading, addActivity, addClient } = useData();

  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", contact: "", value: "" });

  const [isDraftProposalOpen, setIsDraftProposalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({ title: "", client: "", value: "" });

  // Derived stats
  const pendingLeads = clients.filter(c => c.status === "pending");
  const activeDeals = clients.filter(c => c.status === "active");
  const pendingSignatures = documents.filter(d => !d.is_signed && (d.type === "proposal" || d.type === "nda" || d.type === "contract")).length;
  
  const totalValue = activeDeals.reduce((sum, c) => sum + parseInt(c.value?.replace(/[^0-9]/g, "") || "0"), 0);

  const handleAddLead = () => {
    if (!leadForm.name || !leadForm.email) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }

    addClient({
      name: leadForm.name,
      email: leadForm.email,
      contact: leadForm.contact,
      status: "pending",
      value: leadForm.value || "$0"
    });

    addActivity({
      actor_name: "Freelancer",
      actor_initials: "FL",
      action_text: `added new lead: ${leadForm.name}`,
      timestamp: "Just now"
    });

    setIsAddLeadOpen(false);
    toast({ title: "Lead Captured", description: `${leadForm.name} has been added to pending leads.` });
    setLeadForm({ name: "", email: "", contact: "", value: "" });
  };

  const handleDraftProposal = () => {
    if (!proposalForm.title || !proposalForm.client) {
      toast({ title: "Error", description: "Title and client are required", variant: "destructive" });
      return;
    }

    addActivity({
      actor_name: "Freelancer",
      actor_initials: "FL",
      action_text: `drafted proposal: ${proposalForm.title} for ${proposalForm.client}`,
      timestamp: "Just now"
    });

    setIsDraftProposalOpen(false);
    toast({ title: "Proposal Drafted", description: `A new draft has been saved for ${proposalForm.client}.` });
    setProposalForm({ title: "", client: "", value: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Freelancer Portal</h2>
          <p className="text-muted-foreground">Manage your solo operations and client pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/clients/add")} className="bg-primary hover:bg-primary/90">
            <UserPlus size={16} className="mr-2" />
            Add Client
          </Button>
          {/* <Button variant="outline" onClick={() => setIsDraftProposalOpen(true)}>
            <Send size={16} className="mr-2" />
            Quick Proposal
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="My Clients"
              value={String(clients.length)}
              change="+3 this month"
              changeType="positive"
              icon={Users}
              onClick={() => navigate("/clients")}
            />
            <StatsCard
              title="Active Deals"
              value={String(activeDeals.length)}
              change="Check follow-ups"
              changeType="neutral"
              icon={Phone}
              onClick={() => navigate("/deals")}
            />
            <StatsCard
              title="Pending Signatures"
              value={String(pendingSignatures)}
              change="Awaiting action"
              changeType="negative"
              icon={FileSignature}
              onClick={() => navigate("/contracts")}
            />
            <StatsCard
              title="Revenue Pipeline"
              value={`$${(totalValue / 1000).toFixed(1)}k`}
              change="Projected Q1"
              changeType="positive"
              icon={DollarSign}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Active Pipeline</CardTitle>
            <Link to="/clients" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLeads.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <Users size={32} className="mx-auto mb-2 opacity-10" />
                  <p className="text-sm">No new leads in the pipeline.</p>
                </div>
              ) : (
                pendingLeads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs">
                          {(lead.name || lead.companyName || "L").split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-none truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {lead.companyName} · {lead.contact}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">{lead.value}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <RecentActivity />
      </div>

      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Capture New Lead</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Lead Name</Label>
              <Input
                id="name"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                placeholder="Client or Company Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Primary Contact</Label>
              <Input
                id="contact"
                value={leadForm.contact}
                onChange={(e) => setLeadForm({ ...leadForm, contact: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Expected Value</Label>
              <Input
                id="value"
                value={leadForm.value}
                onChange={(e) => setLeadForm({ ...leadForm, value: e.target.value })}
                placeholder="$5,000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLead}>Save Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDraftProposalOpen} onOpenChange={setIsDraftProposalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Quick Proposal Draft</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                value={proposalForm.title}
                onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                placeholder="Q1 Growth Strategy"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-client">Client</Label>
              <Input
                id="p-client"
                value={proposalForm.client}
                onChange={(e) => setProposalForm({ ...proposalForm, client: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-value">Quoted Value</Label>
              <Input
                id="p-value"
                value={proposalForm.value}
                onChange={(e) => setProposalForm({ ...proposalForm, value: e.target.value })}
                placeholder="$12,500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDraftProposalOpen(false)}>Cancel</Button>
            <Button onClick={handleDraftProposal}>Generate Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
