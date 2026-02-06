import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileSignature, Receipt, MoreHorizontal, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Contracts() {
  const { clients, activities, addActivity } = useData();
  const { toast } = useToast();
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [docForm, setDocForm] = useState({ type: "nda", client: "", title: "" });

  // Derive NDAs from clients who are pending (needing NDA) or active (Signed)
  // For this demo, we'll confirm "Signed" if they are active, "Pending" if pending.
  const ndasList = clients.map(c => ({
    id: c.id,
    title: "Mutual NDA",
    client: c.name,
    status: c.status === "active" ? "signed" : "pending",
    date: "2025-02-01" // Mock date or could be derived
  }));

  // Derive Invoices from activities for a dynamic feel
  const invoiceActivities = activities.filter(a => a.action_text.toLowerCase().includes("invoice"));

  const handleCreateDocument = () => {
    if (!docForm.client || !docForm.title) {
      toast({ title: "Error", description: "Client and Title are required", variant: "destructive" });
      return;
    }

    addActivity({
      actor_name: "Sales Rep",
      actor_initials: "SR",
      action_text: `sent ${docForm.type.toUpperCase()}: ${docForm.title} to ${docForm.client}`,
      timestamp: "Just now"
    });

    setIsNewDocOpen(false);
    toast({ title: "Document Sent", description: `${docForm.type.toUpperCase()} sent to ${docForm.client}` });
    setDocForm({ type: "nda", client: "", title: "" });
  };

  return (
    <AppLayout title="Contracts">
      <Tabs defaultValue="nda" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="nda" className="gap-2">
              <FileSignature size={14} />
              NDAs
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <Receipt size={14} />
              Invoices
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsNewDocOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            New Document
          </Button>
        </div>

        <TabsContent value="nda">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Non-Disclosure Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {ndasList.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">No clients found.</div>
                ) : (
                  ndasList.map((nda) => (
                    <div key={nda.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className={`p-2 rounded-lg ${nda.status === 'signed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                        <FileSignature size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{nda.title}</p>
                        <p className="text-sm text-muted-foreground">{nda.client}</p>
                      </div>
                      <Badge variant="outline" className={nda.status === 'signed' ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200 capitalize"}>
                        {nda.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={16} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {invoiceActivities.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    <Receipt size={32} className="mx-auto mb-2 opacity-20" />
                    <p>No recent invoices generated.</p>
                  </div>
                ) : (
                  invoiceActivities.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Receipt size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{inv.action_text}</p>
                        <p className="text-sm text-muted-foreground">{inv.actor_name}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{inv.timestamp}</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                        Sent
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isNewDocOpen} onOpenChange={setIsNewDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send New Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Document Type</Label>
              <Select value={docForm.type} onValueChange={(v) => setDocForm({ ...docForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nda">Non-Disclosure Agreement (NDA)</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="contract">Service Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Client Name</Label>
              <Input
                value={docForm.client}
                onChange={(e) => setDocForm({ ...docForm, client: e.target.value })}
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="grid gap-2">
              <Label>Document Title</Label>
              <Input
                value={docForm.title}
                onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                placeholder="e.g. Q1 Services Agreement"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDocOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateDocument}>Send Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
