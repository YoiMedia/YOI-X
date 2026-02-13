import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import {
  FileText,
  FileSignature,
  Receipt,
  Download,
  Eye,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: any = {
  proposal: FileText,
  nda: FileSignature,
  invoice: Receipt,
};

export default function ClientDocuments() {
  const { user } = useAuth();
  const { clients } = useData();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const client = clients.find((c) => c.user_id === user?._id);
  const documents = useQuery(
    api.documents.listForUser,
    user?._id ? { userId: user._id } : "skip",
  );

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
    setIsViewOpen(true);
  };

  const handleSignClick = (doc: any) => {
    setSelectedDoc(doc);
    setIsSignModalOpen(true);
  };

  const filteredDocs = {
    all: documents || [],
    proposals: (documents || []).filter((d) => d.type === "proposal"),
    ndas: (documents || []).filter((d) => d.type === "nda"),
    invoices: (documents || []).filter((d) => d.type === "invoice"),
  };

  const renderDocumentCard = (doc: any) => {
    const Icon = typeIcons[doc.type] || FileText;
    return (
      <Card
        key={doc._id}
        className="border-border hover:border-primary/30 transition-all"
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {doc.document_number}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    doc.is_signed
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200",
                  )}
                >
                  {doc.is_signed ? (
                    <>
                      <CheckCircle size={12} className="mr-1" /> Signed
                    </>
                  ) : (
                    "Pending Signature"
                  )}
                </Badge>
              </div>

              {doc.amount && (
                <p className="text-sm font-semibold text-foreground mb-2">
                  Amount: ${doc.amount.toLocaleString()}
                </p>
              )}

              {doc.due_date && (
                <p className="text-xs text-muted-foreground mb-3">
                  Due: {new Date(doc.due_date).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(doc)}
                  className="gap-2"
                >
                  <Eye size={14} />
                  View
                </Button>
                {!doc.is_signed && (
                  <Button
                    size="sm"
                    onClick={() => handleSignClick(doc)}
                    className="gap-2"
                  >
                    <FileSignature size={14} />
                    Sign Now
                  </Button>
                )}
                {doc.is_signed && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download size={14} />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout title="Documents">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your Documents</h2>
            <p className="text-muted-foreground">
              View and sign your proposals, NDAs, and invoices
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">
              All ({filteredDocs.all.length})
            </TabsTrigger>
            <TabsTrigger value="proposals">
              Proposals ({filteredDocs.proposals.length})
            </TabsTrigger>
            <TabsTrigger value="ndas">
              NDAs ({filteredDocs.ndas.length})
            </TabsTrigger>
            <TabsTrigger value="invoices">
              Invoices ({filteredDocs.invoices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredDocs.all.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No documents found</p>
              </div>
            ) : (
              filteredDocs.all.map(renderDocumentCard)
            )}
          </TabsContent>

          <TabsContent value="proposals" className="space-y-4 mt-6">
            {filteredDocs.proposals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No proposals found</p>
              </div>
            ) : (
              filteredDocs.proposals.map(renderDocumentCard)
            )}
          </TabsContent>

          <TabsContent value="ndas" className="space-y-4 mt-6">
            {filteredDocs.ndas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileSignature size={48} className="mx-auto mb-4 opacity-20" />
                <p>No NDAs found</p>
              </div>
            ) : (
              filteredDocs.ndas.map(renderDocumentCard)
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4 mt-6">
            {filteredDocs.invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt size={48} className="mx-auto mb-4 opacity-20" />
                <p>No invoices found</p>
              </div>
            ) : (
              filteredDocs.invoices.map(renderDocumentCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Document Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-secondary/20 rounded-lg min-h-[400px]">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(selectedDoc?.content, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Document Modal */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              You are about to sign:{" "}
              <span className="font-semibold text-foreground">
                {selectedDoc?.title}
              </span>
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileSignature
                size={48}
                className="mx-auto mb-4 text-muted-foreground opacity-30"
              />
              <p className="text-sm text-muted-foreground mb-4">
                Signature placeholder
              </p>
              <Button>Confirm Signature</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
