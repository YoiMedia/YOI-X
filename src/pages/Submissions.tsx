import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileBox, ExternalLink, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Skeleton } from "@/components/ui/skeleton";

export default function Submissions() {
  const { submissions, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filteredSubmissions = (submissions ?? []).filter(sub => {
    const matchesSearch = sub.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sub.submission_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || sub.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-50 text-green-600 border-green-100"><CheckCircle2 size={12} className="mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-50 text-red-600 border-red-100"><AlertCircle size={12} className="mr-1" /> Revision Needed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-100"><Clock size={12} className="mr-1" /> Pending Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) return <LoadingScreen message="Loading submissions..." />;

  return (
    <AppLayout title="Submissions Review">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              className="pl-9 bg-white border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f as any)}
                className="capitalize whitespace-nowrap"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-border bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <FileBox size={20} className="text-primary" />
              <CardTitle className="text-lg font-semibold">Deliverable Submissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <FileBox size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium">No submissions found</p>
                  <p className="text-xs">Your client submissions will appear here once they start uploading deliverables.</p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <div key={submission._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono tracking-tighter uppercase">{submission.submission_number}</span>
                        <h3 className="font-semibold text-slate-900">{submission.title}</h3>
                        {getStatusBadge(submission.status)}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{submission.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(submission._creationTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><ExternalLink size={12} /> Deliverables: {submission.deliverables?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-9 px-3 border-slate-200">
                        <Eye size={14} className="mr-2" /> View Details
                      </Button>
                      <Button size="sm" className="h-9 px-3">
                        Review Now
                      </Button>
                    </div>
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
