import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  FileSignature, 
  Receipt, 
  Plus, 
  Send, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ArrowRight
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Documents() {
  const { documents, clients, isLoading, createDocument } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [docType, setDocType] = useState<"proposal" | "nda" | "invoice">("proposal");

  const filteredDocs = (documents ?? []).filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.document_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
      case "paid":
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">Completed</Badge>;
      case "sent":
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100">Sent</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Draft</Badge>;
      case "expired":
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "proposal": return <FileText size={18} className="text-blue-500" />;
      case "nda": return <FileSignature size={18} className="text-purple-500" />;
      case "invoice": return <Receipt size={18} className="text-emerald-500" />;
      default: return <FileText size={18} className="text-slate-500" />;
    }
  };

  if (isLoading) return <LoadingScreen message="Accessing document vault..." />;

  return (
    <AppLayout title="Documents & Contracts">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus size={16} className="mr-2" /> Create New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setDocType("proposal"); setIsCreateOpen(true); }}>
                  <FileText size={14} className="mr-2" /> Proposal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDocType("nda"); setIsCreateOpen(true); }}>
                  <FileSignature size={14} className="mr-2" /> NDA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDocType("invoice"); setIsCreateOpen(true); }}>
                  <Receipt size={14} className="mr-2" /> Invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="border-border bg-white shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-lg font-semibold">All Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <FileText size={48} className="mx-auto mb-4 opacity-5" />
                  <p className="text-sm font-medium">No documents found</p>
                  <p className="text-xs">Your proposals, NDAs, and invoices will appear here.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div key={doc._id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                      {getDocIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                        {getStatusBadge(doc.status)}
                      </div>
                      <p className="text-xs text-slate-500">
                        {doc.document_number} · Client: {clients.find(c => c.id === doc.client_id)?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                      <div className="hidden sm:block text-right">
                        <p className="font-medium text-slate-900">{doc.amount || "N/A"}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider">Amount</p>
                      </div>
                      <div className="hidden lg:block text-right min-w-[100px]">
                        <p className="text-slate-600 font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Created At</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                          <Eye size={16} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Send size={14} className="mr-2" /> Send to Client</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"><Plus size={14} className="mr-2 rotate-45" /> Delete</DropdownMenuItem>
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

        {/* Create Document Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="capitalize">Create New {docType}</DialogTitle>
              <DialogDescription>Draft your next document for professional delivery.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Client *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Which client is this for?" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc-title">Document Title *</Label>
                <Input id="doc-title" placeholder={`${docType.charAt(0).toUpperCase() + docType.slice(1)} for Q1 Project`} />
              </div>
              {docType === "invoice" && (
                <div className="grid gap-2">
                  <Label htmlFor="doc-amount">Amount (Fixed Fee)</Label>
                  <Input id="doc-amount" placeholder="e.g. $2,500" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create Draft</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
