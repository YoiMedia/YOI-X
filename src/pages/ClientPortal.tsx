import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  FileSignature,
  Receipt,
  Download,
  Upload,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  MessageSquare,
  Paperclip,
  RotateCcw,
  FolderKanban,
  Phone,
  ExternalLink,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusColors: any = {
  completed: "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  approved: "bg-green-100 text-green-700 border-green-200",
};

const typeIcons: any = {
  proposal: FileText,
  nda: FileSignature,
  invoice: Receipt,
};

export default function ClientPortal() {
  const { user } = useAuth();
  const { documents, meetings, requirements, notifications, isLoading } = useData();
  const [newMessage, setNewMessage] = useState("");

  const activeRequirement = requirements[0]; // Assume one active project for demo

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading your portal...</div>;

  return (
    <AppLayout title="Project Portal">
      <div className="space-y-8 max-w-6xl">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome back, {user?.fullname}</h2>
            <p className="text-muted-foreground">Track your project progress and manage documents below.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Phone size={16} />
            Connect with Manager
          </Button>
        </div>

        {/* Project Overview Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Project Status</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Services List / Requirements */}
            <Card className="lg:col-span-2 border-border">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Project Milestones</CardTitle>
                {activeRequirement && (
                  <Badge variant="outline" className={cn(statusColors[activeRequirement.status])}>
                    {activeRequirement.status}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {activeRequirement?.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {item.dueDate}</p>
                      </div>
                    </div>
                    <Badge variant="ghost" className="text-[10px] uppercase tracking-wider">Upcoming</Badge>
                  </div>
                ))}
                {!activeRequirement && (
                  <div className="text-center py-8 text-muted-foreground italic">
                    No active project requirements found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Meeting */}
            <div className="space-y-6">
               <Card className="border-border bg-primary/5">
                <CardHeader className="pb-3 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Calendar size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-sm font-bold">Upcoming Meeting</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {meetings.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold">{meetings[0].title}</p>
                      <p className="text-xs text-muted-foreground">{meetings[0].scheduledAt}</p>
                      <Button size="sm" className="mt-4 w-full">Join via Meet</Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No meetings scheduled.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Alerts</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {notifications.filter(n => !n.isRead).slice(0, 3).map(n => (
                    <div key={n._id} className="p-2 rounded bg-orange-50 border border-orange-100 flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                      <div>
                        <p className="text-xs font-bold">{n.title}</p>
                        {n.link && <Link to={n.link} className="text-[10px] text-orange-600 underline">Take Action</Link>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Documents Repository</h3>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {documents.map((doc) => {
                  const Icon = typeIcons[doc.type] || FileText;
                  return (
                    <div key={doc._id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                      <div className="p-2.5 rounded-lg bg-secondary">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground capitalize">{doc.type} Contract</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.isSigned ? "Signed" : "Waiting for Signature"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/portal/review?docId=${doc._id}`}>
                          <Button variant="outline" size="sm">
                            {doc.isSigned ? "View" : "Review & Sign"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {documents.length === 0 && (
                   <div className="p-8 text-center text-muted-foreground italic">No documents available.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
