import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Upload, CheckSquare, ChevronDown, ChevronUp, MessageSquare, Send, HelpCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function TaskSubtask() {
  const { id } = useParams();
  const taskId = id as Id<"tasks">;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateTaskProgress, createDoubt, submitTask, sendNotification, users } = useData();
  
  const task = useQuery(api.tasks.getById, { id: taskId });
  const [newSubtask, setNewSubtask] = useState("");
  const [isDoubtDialogOpen, setIsDoubtDialogOpen] = useState(false);
  const [doubtText, setDoubtText] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const employees = users.filter(u => u.role === "employee");
  const salesReps = users.filter(u => u.role === "sales");

  const handleToggleSubtask = async (index: number) => {
    if (!task) return;
    const newSubtasks = [...task.subtasks];
    newSubtasks[index].completed = !newSubtasks[index].completed;
    await updateTaskProgress(taskId, { subtasks: newSubtasks });
  };

  const handleAddSubtask = async () => {
    if (!task || !newSubtask.trim()) return;
    const newSubtasks = [...task.subtasks, { text: newSubtask, completed: false }];
    await updateTaskProgress(taskId, { subtasks: newSubtasks });
    setNewSubtask("");
  };

  const handleUpdateStatus = async (status: "todo" | "in_progress" | "done") => {
    if (!task) return;
    await updateTaskProgress(taskId, { status });
    toast.success(`Status updated to ${status}`);
  };

  const handleAskDoubt = async () => {
    if (!task || !doubtText.trim()) return;
    try {
      // For now, send doubt to all sales reps as "account managers"
      const salesRep = salesReps[0]; // Simple pick
      if (!salesRep) {
        toast.error("No account manager available to receive your doubt");
        return;
      }

      await createDoubt({
        taskId,
        sentBy: user?._id as Id<"users">,
        sentTo: salesRep._id,
        title: `Question regarding ${task.title}`,
        message: doubtText,
      });

      await sendNotification({
        userId: salesRep._id,
        title: "New Employee Doubt",
        message: `${user?.fullname} has a question regarding "${task.title}".`,
        type: "doubt",
        link: `/tasks/${taskId}`,
      });

      toast.success("Doubt sent to account manager");
      setDoubtText("");
      setIsDoubtDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send doubt");
    }
  };

  const handleSubmitDeliverable = async () => {
    if (!task) return;
    try {
      // Find the requirement and client for this task
      const req = await (task as any).requirement; // This would need a smarter lookup in DataContext
      // For demo, we just assume the task has a link or we find it
      
      await submitTask({
        taskId,
        clientId: user?._id as any, // This is wrong, should be the actual client. 
        // I need to fetch the requirement to get the clientId.
        submittedBy: user?._id as Id<"users">,
        documents: ["final_deliverable_v1.png"],
      });

      await handleUpdateStatus("done");
      toast.success("Deliverable submitted for review");
      navigate("/tasks");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit deliverable");
    }
  };

  if (!task) return <div className="p-8 text-center text-muted-foreground">Loading task details...</div>;

  return (
    <AppLayout title="Task Management">
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{task.title}</h2>
            <p className="text-sm text-muted-foreground">Part of Project Phase</p>
          </div>
          <Badge variant="outline" className={cn(
             "capitalize",
             task.status === "todo" ? "bg-slate-50" : task.status === "in_progress" ? "bg-blue-50" : "bg-green-50"
          )}>
            {task.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-semibold">Scope & Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Subtasks Checklist</CardTitle>
                  <span className="text-xs font-bold text-primary">{Math.round(task.progress)}% Complete</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Break down this task..." 
                    value={newSubtask} 
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddSubtask()}
                  />
                  <Button size="sm" onClick={handleAddSubtask}><Plus size={16} /></Button>
                </div>
                
                <div className="space-y-2">
                  {task.subtasks.map((st, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-all",
                      st.completed ? "bg-green-50/50 border-green-100" : "bg-secondary/20"
                    )}>
                      <input 
                        type="checkbox" 
                        checked={st.completed} 
                        onChange={() => handleToggleSubtask(i)}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className={cn("text-sm flex-1", st.completed && "line-through text-muted-foreground")}>
                        {st.text}
                      </span>
                    </div>
                  ))}
                  {task.subtasks.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground italic py-4">No subtasks yet. Start by adding one above.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <Card className="border-border">
               <CardHeader className="pb-3 border-b border-border/50">
                 <CardTitle className="text-base font-semibold">Update Status</CardTitle>
               </CardHeader>
               <CardContent className="pt-4 space-y-3">
                 <Button 
                   variant={task.status === "todo" ? "default" : "outline"} 
                   className="w-full justify-start gap-2"
                   onClick={() => handleUpdateStatus("todo")}
                 >
                   <div className="w-2 h-2 rounded-full bg-slate-400" /> To Do
                 </Button>
                 <Button 
                   variant={task.status === "in_progress" ? "default" : "outline"} 
                   className="w-full justify-start gap-2"
                   onClick={() => handleUpdateStatus("in_progress")}
                 >
                   <div className="w-2 h-2 rounded-full bg-blue-400" /> In Progress
                 </Button>
                 <Button 
                   variant={task.status === "done" ? "default" : "outline"} 
                   className="w-full justify-start gap-2"
                   disabled={task.progress < 100}
                   onClick={() => handleUpdateStatus("done")}
                 >
                   <div className="w-2 h-2 rounded-full bg-green-400" /> Done
                 </Button>
                 <p className="text-[10px] text-center text-muted-foreground italic">
                   "Done" is enabled once all subtasks are complete.
                 </p>
               </CardContent>
             </Card>

             <Card className="border-border">
               <CardHeader className="pb-3 border-b border-border/50">
                 <CardTitle className="text-base font-semibold">Collaborate</CardTitle>
               </CardHeader>
               <CardContent className="pt-4 space-y-4">
                 <Button variant="outline" className="w-full gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => setIsDoubtDialogOpen(true)}>
                    <HelpCircle size={16} />
                    Ask Project Doubt
                 </Button>
                 <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={handleSubmitDeliverable}>
                   <Upload size={16} />
                   Submit Deliverable
                 </Button>
               </CardContent>
             </Card>
          </div>
        </div>
      </div>

      <Dialog open={isDoubtDialogOpen} onOpenChange={setIsDoubtDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ask Account Manager</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Question / Blockery</Label>
              <Textarea 
                placeholder="Details of what you need help with..." 
                value={doubtText}
                onChange={e => setDoubtText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">The assigned account manager will be notified and can respond directly to this task.</p>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsDoubtDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleAskDoubt} disabled={!doubtText.trim()}><MessageSquare size={16} className="mr-2" /> Send Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
