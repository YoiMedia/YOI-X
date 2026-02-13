import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  FolderKanban,
  FileText,
  FileSignature,
  Receipt,
  Calendar as CalendarIcon,
  MessageSquare,
  Upload,
  CheckCircle,
  Clock,
  X,
  Sparkles,
  Download,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  status:
    | "in_progress"
    | "pending"
    | "completed"
    | "revision_requested"
    | "approved";
  progress: number;
  startDate: string;
  endDate: string;
  description: string;
  services: string[];
  documents: { name: string; type: string; date: string }[];
  recentUpdates: { text: string; date: string }[];
}

const documents = [
  {
    id: 1,
    type: "proposal" as const,
    name: "Website Redesign Proposal",
    date: "Jan 10, 2025",
    status: "accepted" as const,
  },
  {
    id: 2,
    type: "nda" as const,
    name: "Mutual Non-Disclosure Agreement",
    date: "Jan 12, 2025",
    status: "signed" as const,
  },
  {
    id: 3,
    type: "invoice" as const,
    name: "Invoice #INV-001",
    date: "Jan 15, 2025",
    status: "paid" as const,
    amount: "$12,500",
  },
  {
    id: 4,
    type: "proposal" as const,
    name: "Mobile App Proposal",
    date: "Jan 28, 2025",
    status: "accepted" as const,
  },
  {
    id: 5,
    type: "invoice" as const,
    name: "Invoice #INV-002",
    date: "Feb 1, 2025",
    status: "pending" as const,
    amount: "$8,500",
  },
];

const statusColors: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  accepted: "bg-green-100 text-green-700 border-green-200",
  signed: "bg-green-100 text-green-700 border-green-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  revision_requested: "bg-orange-100 text-orange-700 border-orange-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const typeIcons = {
  proposal: FileText,
  nda: FileSignature,
  invoice: Receipt,
};

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

// Confetti component
function Confetti({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-[confetti_3s_ease-out_forwards]"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor: [
              "#FFD700",
              "#FF6B6B",
              "#4CAF50",
              "#2196F3",
              "#9C27B0",
            ][Math.floor(Math.random() * 5)],
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function ClientDashboard() {
  const { toast } = useToast();
  const { requirements, isLoading, approveRequirements } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <LoadingScreen message="Unlocking your client portal..." />;
  }

  // Projects State derived from requirements
  const projects: Project[] = useMemo(() => {
    return (requirements || []).map((req: any) => ({
      id: req._id,
      name: req.requirement_name,
      status: (req.status === "approved"
        ? "approved"
        : req.status === "in_progress"
          ? "in_progress"
          : req.status === "completed"
            ? "completed"
            : req.status === "revision_requested"
              ? "revision_requested"
              : "pending") as Project["status"],
      progress:
        req.status === "approved" ? 100 : req.status === "in_progress" ? 50 : 0,
      startDate: req.start_date
        ? new Date(req.start_date).toLocaleDateString()
        : "TBD",
      endDate: req.expected_end_date
        ? new Date(req.expected_end_date).toLocaleDateString()
        : "TBD",
      description: req.description || "Project details...",
      services: [],
      documents: [],
      recentUpdates: [],
    }));
  }, [requirements]);

  // Schedule Call Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [callDate, setCallDate] = useState<Date | undefined>(undefined);
  const [callTime, setCallTime] = useState("");
  const [callMessage, setCallMessage] = useState("");

  // Request Revision Modal State
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionProjectId, setRevisionProjectId] = useState<string | null>(
    null,
  );
  const [revisionComment, setRevisionComment] = useState("");
  const [revisionFiles, setRevisionFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Confetti State
  const [showConfetti, setShowConfetti] = useState(false);

  // Project Detail Sidebar State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);

  const handleScheduleCall = () => {
    if (callDate && callTime) {
      setIsScheduleOpen(false);
      toast({
        title: "Call scheduled",
        description: `Your call is scheduled for ${format(callDate, "MMM d")} at ${callTime}`,
      });
      setCallDate(undefined);
      setCallTime("");
      setCallMessage("");
    }
  };

  const openRevisionModal = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevisionProjectId(projectId);
    setIsRevisionOpen(true);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      setRevisionFiles((prev) => [...prev, ...fileNames]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (fileName: string) => {
    setRevisionFiles((prev) => prev.filter((f) => f !== fileName));
  };

  const handleSubmitRevision = async () => {
    if (revisionProjectId && revisionComment) {
      try {
        // Reuse approveRequirements but set status to revision_requested?
        // Actually approveRequirements only accepts "approved" | "rejected" based on DataContext type
        // I should probably use "rejected" or add "revision_requested" to the type
        // For now, let's use "rejected" as proxy or cast if backend supports it.
        // Backend `setStatus` accepts any string.
        await approveRequirements(
          revisionProjectId as any,
          "revision_requested" as any,
        );

        setIsRevisionOpen(false);
        toast({
          title: "Revision requested",
          description: "Your revision request has been submitted",
        });
        setRevisionComment("");
        setRevisionFiles([]);
        setRevisionProjectId(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit revision request",
          variant: "destructive",
        });
      }
    }
  };

  const handleApproveDeliverable = async (
    projectId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await approveRequirements(projectId as any, "approved");
      setShowConfetti(true);
      toast({
        title: "Deliverable approved! 🎉",
        description: "Thank you for approving the project deliverables",
      });
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve deliverable",
        variant: "destructive",
      });
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectSidebarOpen(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "revision_requested":
        return "Revision Requested";
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <Confetti show={showConfetti} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome Back
          </h2>
          <p className="text-muted-foreground">
            View your projects and documents
          </p>
        </div>
        <Button onClick={() => setIsScheduleOpen(true)}>
          <CalendarIcon size={16} className="mr-2" />
          Schedule Call
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderKanban size={18} className="text-primary" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className={cn(
                "p-4 rounded-lg transition-all cursor-pointer group",
                project.status === "approved"
                  ? "bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70"
                  : project.status === "revision_requested"
                    ? "bg-orange-50 border border-orange-200 hover:bg-orange-100/70"
                    : "bg-secondary/50 hover:bg-secondary",
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {project.name}
                    {project.status === "approved" && (
                      <Sparkles size={16} className="text-emerald-500" />
                    )}
                    <ArrowRight
                      size={16}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {project.startDate} - {project.endDate}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[project.status]}
                >
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Project Progress
                  </span>
                  <span className="font-medium text-foreground">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>

              {/* Action Buttons */}
              {project.status !== "approved" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => openRevisionModal(project.id, e)}
                  >
                    <MessageSquare size={14} className="mr-1" />
                    Request Revision
                  </Button>
                  {project.progress >= 50 && (
                    <Button
                      size="sm"
                      onClick={(e) => handleApproveDeliverable(project.id, e)}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Approve Deliverable
                    </Button>
                  )}
                </div>
              )}

              {project.status === "approved" && (
                <div className="mt-4 p-3 bg-emerald-100 rounded-lg flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Project approved and completed!
                  </span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {documents.map((doc) => {
              const Icon = typeIcons[doc.type];
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="p-2 rounded-lg bg-secondary">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.date}</p>
                  </div>
                  {doc.amount && (
                    <span className="text-sm font-medium text-foreground">
                      {doc.amount}
                    </span>
                  )}
                  <Badge variant="outline" className={statusColors[doc.status]}>
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Call Modal */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary" />
              Schedule a Call
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !callDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {callDate ? (
                      format(callDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={callDate}
                    onSelect={setCallDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Select Time *</Label>
              <Select value={callTime} onValueChange={setCallTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="call-message">Message (optional)</Label>
              <Textarea
                id="call-message"
                placeholder="What would you like to discuss?"
                value={callMessage}
                onChange={(e) => setCallMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleCall}
              disabled={!callDate || !callTime}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revision Modal */}
      <Dialog open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Request Changes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="revision-comment">
                Describe the changes needed *
              </Label>
              <Textarea
                id="revision-comment"
                placeholder="Please provide details about the revisions you'd like..."
                value={revisionComment}
                onChange={(e) => setRevisionComment(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Screenshots/Files (optional)</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <Upload
                  size={32}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop files here or
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              {revisionFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {revisionFiles.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="pl-2 pr-1 py-1"
                    >
                      📎 {file}
                      <button
                        onClick={() => removeFile(file)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRevisionOpen(false);
                setRevisionComment("");
                setRevisionFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRevision} disabled={!revisionComment}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Detail Sidebar */}
      <Sheet open={isProjectSidebarOpen} onOpenChange={setIsProjectSidebarOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FolderKanban size={20} className="text-primary" />
              Project Details
            </SheetTitle>
          </SheetHeader>

          {selectedProject && (
            <div className="mt-6 space-y-6">
              {/* Project Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {selectedProject.name}
                    {selectedProject.status === "approved" && (
                      <Sparkles size={16} className="text-emerald-500" />
                    )}
                  </h3>
                  <Badge
                    className={cn(
                      "whitespace-nowrap",
                      statusColors[selectedProject.status],
                    )}
                  >
                    {getStatusLabel(selectedProject.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedProject.description}
                </p>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Timeline</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedProject.startDate} - {selectedProject.endDate}
                  </span>
                </div>
                <Progress value={selectedProject.progress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2 text-right">
                  {selectedProject.progress}% Complete
                </p>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-medium mb-3">
                  Services ({selectedProject.services.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.services.map((service, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-background"
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-sm font-medium mb-3">
                  Documents ({selectedProject.documents.length})
                </p>
                <div className="space-y-2">
                  {selectedProject.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-secondary">
                          <FileText size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.date}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Updates */}
              <div>
                <p className="text-sm font-medium mb-3">Recent Updates</p>
                <div className="space-y-3">
                  {selectedProject.recentUpdates.map((update, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{update.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {update.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons in Sidebar */}
              {selectedProject.status !== "approved" && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => openRevisionModal(selectedProject.id, e)}
                  >
                    <MessageSquare size={14} className="mr-2" />
                    Request Revision
                  </Button>
                  {selectedProject.progress >= 50 && (
                    <Button
                      className="flex-1"
                      onClick={(e) =>
                        handleApproveDeliverable(selectedProject.id, e)
                      }
                    >
                      <CheckCircle size={14} className="mr-2" />
                      Approve
                    </Button>
                  )}
                </div>
              )}

              {selectedProject.status === "approved" && (
                <div className="p-4 bg-emerald-50 rounded-lg flex items-center gap-3 border border-emerald-200">
                  <CheckCircle size={24} className="text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-700">
                      Project Approved!
                    </p>
                    <p className="text-sm text-emerald-600">
                      All deliverables have been accepted
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
