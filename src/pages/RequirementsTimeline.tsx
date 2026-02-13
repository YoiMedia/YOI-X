import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Calendar,
  FileText,
  Paperclip,
  MessageSquare,
  Download,
  Hash,
  Link as LinkIcon,
  FileCheck,
  Clock,
  XCircle,
  MoreHorizontal,
  Eye,
  Upload,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Milestone {
  id: string;
  title: string;
  deliveryDate: string;
  description: string;
  attachments: string[]; // storage keys
  newFiles: File[]; // locally selected files
}

export default function RequirementsTimeline() {
  const [searchParams] = useSearchParams();
  const reqId = searchParams.get("id") as Id<"requirements">;
  const urlClientId = searchParams.get("clientId") as Id<"clients">;

  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    users,
    clients,
    createRequirements,
    approveRequirements,
    sendNotification,
    generateUploadUrl,
    syncMetadata,
    isLoading,
  } = useData();

  const [selectedClientId, setSelectedClientId] =
    useState<Id<"clients"> | null>(urlClientId || null);
  const [requirementName, setRequirementName] = useState("");
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<Id<"users">[]>(
    [],
  );
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "Discovery",
      deliveryDate: "",
      description: "",
      attachments: [],
      newFiles: [],
    },
  ]);

  const employees = users.filter((u) => u.role === "employee");

  // Fetch client-specific data
  const meetings = useQuery(
    api.meetings.listForClient,
    selectedClientId ? { client_id: selectedClientId } : "skip",
  );
  const projects = useQuery(
    api.projects.listByClient,
    selectedClientId ? { client_id: selectedClientId } : "skip",
  );

  const currentReq = useQuery(
    api.requirements.getById,
    reqId ? { id: reqId } : "skip",
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientDisplayName =
    selectedClient?.name || selectedClient?.fullname || "Client";

  const { getFileUrl } = useData();

  const handleFileView = async (key: string) => {
    try {
      const url = await getFileUrl(key);
      if (url) window.open(url, "_blank");
      else toast.error("Could not retrieve file URL");
    } catch (err) {
      toast.error("Error opening file");
    }
  };

  useEffect(() => {
    if (urlClientId) {
      setSelectedClientId(urlClientId);
    }
  }, [urlClientId]);

  useEffect(() => {
    if (currentReq) {
      setRequirementName(currentReq.requirement_name);
      setSelectedClientId(currentReq.client_id);
      // Assuming milestones structure
      if (Array.isArray(currentReq.requirements)) {
        setMilestones(
          currentReq.requirements.map((m: any, i: number) => ({
            id: i.toString(),
            title: m.title || "",
            deliveryDate: m.dueDate || "",
            description: m.description || "",
            attachments: m.attachments || [],
            newFiles: [],
          })),
        );
      }
    }
  }, [currentReq]);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        title: "",
        deliveryDate: "",
        description: "",
        attachments: [],
        newFiles: [],
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const linkFileToMilestone = (storageKey: string, milestoneId: string) => {
    setMilestones(
      milestones.map((m) => {
        if (m.id === milestoneId) {
          if (m.attachments.includes(storageKey)) return m;
          return { ...m, attachments: [...m.attachments, storageKey] };
        }
        return m;
      }),
    );
    toast.success("File linked to milestone");
  };

  const handleSubmit = async () => {
    if (
      !selectedClientId ||
      !requirementName ||
      milestones.some((m) => !m.title || !m.deliveryDate)
    ) {
      toast.error("Please fill in project name, client, and all milestones");
      return;
    }

    try {
      // 1. Upload new files for each milestone
      const finalMilestones = await Promise.all(
        milestones.map(async (m) => {
          const uploadedKeys = [...m.attachments];

          for (const file of m.newFiles) {
            const { key, url } = await generateUploadUrl();
            const result = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });
            if (!result.ok) throw new Error(`Failed to upload ${file.name}`);
            await syncMetadata({ key });
            uploadedKeys.push(key);
          }

          return {
            title: m.title,
            description: m.description,
            dueDate: m.deliveryDate,
            attachments: uploadedKeys,
          };
        }),
      );

      // Find active project for this client or lead to a default
      const projectId = projects?.[0]?._id;

      const id = await createRequirements({
        requirement_name: requirementName,
        clientId: selectedClientId,
        project_id: projectId,
        items: finalMilestones,
        status: "pending",
      });

      if (selectedClient?.user_id) {
        await sendNotification({
          userId: selectedClient.user_id,
          title: "Project Requirements Ready",
          message: `Requirements for "${requirementName}" have been prepared for your review.`,
          type: "project",
          link: `/requirements?id=${id}`,
        });
      }

      toast.success("Requirements submitted for approval");
      navigate("/requirements");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit requirements");
    }
  };

  if (isLoading) return <LoadingScreen message="Loading workspace..." />;

  return (
    <AppLayout title={reqId ? "Edit Requirement" : "Define Requirements"}>
      <div className="flex gap-6 h-[calc(100vh-120px)]">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/requirements">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {selectedClientId
                  ? `Requirements for ${clientDisplayName}`
                  : "Project Requirements"}
              </h2>
            </div>
          </div>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    placeholder="e.g. Website Redesign"
                    value={requirementName}
                    onChange={(e) => setRequirementName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input
                    value={
                      clientDisplayName !== "Client"
                        ? clientDisplayName
                        : "Select client from dashboard"
                    }
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar size={16} /> Milestones & Deliverables
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="h-8 text-xs"
              >
                <Plus size={14} className="mr-1" /> Add Milestone
              </Button>
            </div>

            {milestones.map((milestone, index) => (
              <Card
                key={milestone.id}
                className="border-border shadow-sm transition-all duration-200"
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-none"
                    >
                      Milestone #{index + 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Title</Label>
                      <Input
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) =>
                          updateMilestone(milestone.id, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Delivery Date</Label>
                      <Input
                        type="date"
                        value={milestone.deliveryDate}
                        onChange={(e) =>
                          updateMilestone(
                            milestone.id,
                            "deliveryDate",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      placeholder="What will be delivered in this milestone?"
                      value={milestone.description}
                      onChange={(e) =>
                        updateMilestone(
                          milestone.id,
                          "description",
                          e.target.value,
                        )
                      }
                      className="min-h-[60px] text-sm"
                    />
                  </div>

                  {/* Milestone Attachments */}
                  <div className="space-y-2 pt-2 border-t border-slate-50">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">
                      Linked Attachments
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {milestone.attachments.length === 0 &&
                      milestone.newFiles.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">
                          No files linked. Use the context on the right or
                          upload below.
                        </p>
                      ) : (
                        <>
                          {milestone.attachments.map((key, i) => (
                            <div
                              key={`existing-${i}`}
                              className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] group transition-colors hover:border-primary/20 shadow-sm"
                            >
                              <Paperclip size={10} className="text-primary" />
                              <span className="truncate max-w-[120px]">
                                {key.split("/").pop()}
                              </span>
                              <div className="flex items-center gap-1 ml-auto">
                                <button
                                  onClick={() => handleFileView(key)}
                                  className="text-slate-400 hover:text-primary transition-colors"
                                  title="View File"
                                >
                                  <Eye size={10} />
                                </button>
                                <button
                                  onClick={() =>
                                    updateMilestone(
                                      milestone.id,
                                      "attachments",
                                      milestone.attachments.filter(
                                        (k) => k !== key,
                                      ),
                                    )
                                  }
                                >
                                  <XCircle
                                    size={10}
                                    className="text-slate-400 hover:text-destructive"
                                  />
                                </button>
                              </div>
                            </div>
                          ))}
                          {milestone.newFiles.map((file, i) => (
                            <div
                              key={`new-${i}`}
                              className="flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary/20 rounded text-[10px] font-medium text-primary"
                            >
                              <Upload size={10} />
                              <span className="truncate max-w-[120px]">
                                {file.name}
                              </span>
                              <button
                                onClick={() =>
                                  updateMilestone(
                                    milestone.id,
                                    "newFiles",
                                    milestone.newFiles.filter(
                                      (_, idx) => idx !== i,
                                    ),
                                  )
                                }
                              >
                                <XCircle
                                  size={10}
                                  className="text-primary/40 hover:text-destructive"
                                />
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Label className="cursor-pointer">
                      <Input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            updateMilestone(milestone.id, "newFiles", [
                              ...milestone.newFiles,
                              ...Array.from(e.target.files),
                            ]);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-7 text-[10px] border-dashed border-slate-300 cursor-pointer"
                      >
                        <span>
                          <Upload size={12} className="mr-1" /> Upload Files
                        </span>
                      </Button>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 px-8 shadow-md"
            >
              <Send size={16} className="mr-2" />
              Submit Requirements
            </Button>
          </div>
        </div>

        {/* Sidebar: Meetings & Outcomes */}
        <div className="w-80 flex flex-col border-l border-slate-100 pl-4">
          <div className="pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              Meeting Context
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Reference past outcomes and link files
            </p>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {meetings?.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock size={32} className="mx-auto opacity-10" />
                  <p className="text-xs">No meetings found for this client.</p>
                </div>
              ) : (
                meetings?.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {meeting.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(meeting.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[8px] h-4 px-1">
                        {meeting.status}
                      </Badge>
                    </div>

                    {meeting.outcome ? (
                      <div className="space-y-2">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Key Notes:
                          </p>

                          <p className="text-[10px] text-slate-600 italic">
                            {meeting.outcome.sales_notes
                              ? meeting.outcome.sales_notes
                                  .split("•")
                                  .filter(Boolean)
                                  .map((line, i) => (
                                    <span key={i} className="block">
                                      • {line.trim()}
                                    </span>
                                  ))
                              : "No notes recorded."}
                          </p>
                        </div>

                        {(meeting.outcome.other_files || []).length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400">
                              Attachments:
                            </p>
                            {(meeting.outcome.other_files || []).map(
                              (fileKey: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-1.5 border border-slate-50 rounded text-[10px] group transition-colors hover:border-primary/20 bg-white shadow-sm"
                                >
                                  <span className="truncate text-slate-500 max-w-[120px] font-medium">
                                    {fileKey.split("/").pop()}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 text-slate-400 hover:text-primary"
                                      onClick={() => handleFileView(fileKey)}
                                    >
                                      <Eye size={10} />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5 bg-primary/10 text-primary"
                                        >
                                          <Plus size={10} />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="text-[10px]"
                                      >
                                        {milestones.map((m, idx) => (
                                          <DropdownMenuItem
                                            key={m.id}
                                            onClick={() =>
                                              linkFileToMilestone(fileKey, m.id)
                                            }
                                          >
                                            Link to Milestone #{idx + 1}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">
                        No outcome recorded for this meeting.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}
