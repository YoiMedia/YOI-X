import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, RotateCcw, Upload, Image, FileText, Send, Eye, ShieldCheck, Signature, XCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ClientReview() {
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("docId") as Id<"documents">;
  const subId = searchParams.get("subId") as Id<"submissions">;
  const navigate = useNavigate();
  const { signDocument, reviewSubmission, sendNotification, users } = useData();

  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [signature, setSignature] = useState("");

  const currentDoc = useQuery(api.documents.getById, docId ? { id: docId } : "skip");
  const currentSub = useQuery(api.submissions.getById, subId ? { id: subId } : "skip");

  const handleSign = async () => {
    if (!signature) {
      toast.error("Please enter your signature");
      return;
    }
    try {
      if (docId) {
        await signDocument(docId, signature);
        const admin = users.find(u => u.role === "admin" || u.role === "sales");
        if (admin) {
          await sendNotification({
            userId: admin._id,
            title: "Document Signed",
            message: `The client has signed the ${currentDoc?.type}.`,
            type: "document",
            link: "/contracts",
          });
        }
        toast.success("Document signed successfully");
        navigate("/portal");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sign document");
    }
  };

  const handleReview = async (status: "approved" | "rejected") => {
    try {
      if (subId) {
        await reviewSubmission(subId, status, revisionComment);
        
        // Notify the employee who submitted
        if (currentSub?.submittedBy) {
          await sendNotification({
            userId: currentSub.submittedBy,
            title: `Work ${status}`,
            message: `The client has ${status} your submission for task. ${status === "rejected" ? "Please check feedback." : ""}`,
            type: "task",
            link: "/tasks",
          });
        }

        toast.success(`Submission ${status}`);
        navigate("/portal");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    }
  };

  if ((docId && !currentDoc) || (subId && !currentSub)) {
    return <div className="p-8 text-center text-muted-foreground">Loading details...</div>;
  }

  const isProposal = currentDoc?.type === "proposal";
  const docContent = currentDoc?.content ? (typeof currentDoc.content === 'string' ? JSON.parse(currentDoc.content) : currentDoc.content) : {};

  return (
    <AppLayout title={isProposal ? "Review Proposal" : "Review Deliverable"}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/portal">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {subId ? "Deliverable Review" : isProposal ? "Contract Review" : "Document Review"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {subId ? "Review the work submitted by the team" : "Please review the terms and take action"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Awaiting Action
          </Badge>
        </div>

        {subId && currentSub ? (
          <div className="space-y-6">
             <Card className="border-border">
               <CardHeader className="pb-3 border-b">
                 <div className="flex items-center justify-between">
                   <CardTitle className="text-base font-semibold">Final Deliverable Preview</CardTitle>
                   <Badge variant="secondary">v1.0</Badge>
                 </div>
               </CardHeader>
               <CardContent className="pt-6 space-y-6">
                 <div className="bg-secondary/20 rounded-lg p-12 min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-border/50">
                    <Image size={64} className="text-muted-foreground mb-4 opacity-20" />
                    <p className="font-semibold text-foreground">Visual Asset Preview</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-6">Click to view full-size high resolution mockup</p>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm"><Eye size={16} className="mr-2" /> Preview</Button>
                      <Button variant="outline" size="sm"><Download size={16} className="mr-2" /> Download</Button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {currentSub.documents.map((doc, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-secondary/50 border border-border/50">
                        <FileText size={18} className="text-primary" />
                        <span className="text-sm font-medium truncate">{doc}</span>
                     </div>
                   ))}
                 </div>

                 <Separator />

                 {!showRevisionForm ? (
                   <div className="flex gap-4">
                     <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg" onClick={() => handleReview("approved")}>
                       <CheckCircle size={18} className="mr-2" /> Approve Deliverable
                     </Button>
                     <Button variant="outline" className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50" size="lg" onClick={() => setShowRevisionForm(true)}>
                       <RotateCcw size={18} className="mr-2" /> Request Revision
                     </Button>
                   </div>
                 ) : (
                   <div className="space-y-4 pt-4 animate-in slide-in-from-top-2">
                     <div className="space-y-2">
                       <Label className="text-sm font-bold">Revision Feedback</Label>
                       <Textarea 
                        placeholder="Explain what needs to be changed..." 
                        value={revisionComment}
                        onChange={e => setRevisionComment(e.target.value)}
                        className="min-h-[120px]"
                       />
                     </div>
                     <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setShowRevisionForm(false)}>Back</Button>
                        <Button className="flex-1 bg-orange-600" onClick={() => handleReview("rejected")} disabled={!revisionComment.trim()}>
                           <Send size={16} className="mr-2" /> Submit Feedback
                        </Button>
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>
        ) : isProposal ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border">
              <CardContent className="p-8 space-y-8 bg-white text-gray-800 shadow-sm rounded-lg">
                <div className="text-center border-b pb-6">
                  <h3 className="text-2xl font-bold tracking-tighter">SERVICE AGREEMENT</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="bg-gray-50 p-4 rounded border">
                    <p className="font-bold mb-2 uppercase text-[10px] text-gray-500">Selected Services</p>
                    <ul className="list-disc list-inside space-y-1">
                      {docContent.services?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold uppercase text-[10px] text-gray-500">Scope</p>
                    <p className="italic text-gray-600">"{docContent.description}"</p>
                  </div>
                  <div className="flex justify-between items-center py-4 border-y">
                    <span className="font-bold text-gray-500">Total Investment</span>
                    <span className="text-xl font-black text-primary">₹{docContent.price?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Signature size={18} /> Signature</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    placeholder="Type Name to Sign"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="font-signature italic text-lg"
                  />
                  <Button className="w-full" onClick={handleSign} disabled={!signature || currentDoc?.isSigned}>
                    <ShieldCheck size={18} className="mr-2" /> {currentDoc?.isSigned ? "Signed" : "Sign & Accept"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">Document not found or unsupported type.</div>
        )}
      </div>
    </AppLayout>
  );
}

function Label({ children, className }: any) {
  return <label className={cn("text-sm font-medium leading-none", className)}>{children}</label>;
}
