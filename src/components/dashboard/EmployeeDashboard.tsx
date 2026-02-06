import { useState, useRef } from "react";
import { CheckSquare, Clock, AlertOctagon, PlayCircle, CheckCircle, MessageSquare, Plus, Upload, Download, FileText } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  status: "not_started" | "in_progress" | "under_review" | "blocked" | "completed";
  subtasks: Subtask[];
  deliverables: string[];
  blockedReason?: string;
  comments: Comment[];
}

interface Subtask {
  id: number;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface Comment {
  id: number;
  user: string;
  initials: string;
  text: string;
  time: string;
}

const initialTasks: Task[] = [
  { 
    id: 1, 
    title: "Complete client onboarding documentation", 
    description: "Create comprehensive onboarding documentation for new clients including welcome guides, FAQ sections, and video tutorials.",
    progress: 75, 
    completed: false, 
    status: "in_progress", 
    subtasks: [], 
    deliverables: [],
    comments: [
      { id: 1, user: "Sarah Chen", initials: "SC", text: "Looking good! Can we add more screenshots?", time: "2 hours ago" }
    ]
  },
  { 
    id: 2, 
    title: "Review Q4 marketing materials", 
    description: "Review all marketing materials prepared for Q4 campaigns including social media posts, email templates, and banner ads.",
    progress: 30, 
    completed: false, 
    status: "in_progress", 
    subtasks: [], 
    deliverables: [],
    comments: []
  },
  { 
    id: 3, 
    title: "Update project timeline for TechCorp", 
    description: "Revise the project timeline based on the latest client feedback and update all stakeholders.",
    progress: 50, 
    completed: false, 
    status: "under_review", 
    subtasks: [], 
    deliverables: [],
    comments: [
      { id: 1, user: "Mike Johnson", initials: "MJ", text: "Please adjust the Q2 milestones", time: "1 hour ago" }
    ]
  },
  { 
    id: 4, 
    title: "Prepare weekly status report", 
    description: "Compile the weekly status report summarizing project progress, blockers, and next steps for all active projects.",
    progress: 0, 
    completed: false, 
    status: "not_started", 
    subtasks: [], 
    deliverables: [],
    comments: []
  },
  { 
    id: 5, 
    title: "Send meeting notes to team", 
    description: "Distribute the meeting notes from the last client call to all team members and stakeholders.",
    progress: 100, 
    completed: true, 
    status: "completed", 
    subtasks: [], 
    deliverables: ["meeting_notes_feb5.pdf"],
    comments: [
      { id: 1, user: "Emily Davis", initials: "ED", text: "Thanks for the quick turnaround!", time: "Yesterday" }
    ]
  },
];

const clientFeedback = [
  { id: 1, client: "Sarah Chen", initials: "SC", task: "Website Redesign", comment: "Great progress! Can we add more contrast to the hero section?", time: "30 min ago" },
  { id: 2, client: "Mike Johnson", initials: "MJ", task: "Marketing Campaign", comment: "Approved the final deliverables. Excellent work!", time: "2 hours ago" },
  { id: 3, client: "Emily Davis", initials: "ED", task: "App Development", comment: "Please review the latest mockups and provide feedback.", time: "4 hours ago" },
  { id: 4, client: "Alex Rivera", initials: "AR", task: "Brand Guidelines", comment: "Requesting minor revisions to the color palette.", time: "Yesterday" },
];

const statusOptions = [
  { value: "not_started", label: "Not Started", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "under_review", label: "Under Review", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700 border-green-200" },
];

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

export function EmployeeDashboard() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  // Add Subtask Modal State
  const [isAddSubtaskOpen, setIsAddSubtaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [subtaskForm, setSubtaskForm] = useState({
    title: "",
    dueDate: "",
    priority: "medium" as "high" | "medium" | "low",
  });
  
  // Upload Deliverable State
  const [uploadTaskId, setUploadTaskId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Task Detail Sidebar State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  const openAddSubtask = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskId(taskId);
    setIsAddSubtaskOpen(true);
  };

  const handleAddSubtask = () => {
    if (selectedTaskId && subtaskForm.title) {
      setTasks(prev => prev.map(task => {
        if (task.id === selectedTaskId) {
          return {
            ...task,
            subtasks: [...task.subtasks, {
              id: Date.now(),
              title: subtaskForm.title,
              dueDate: subtaskForm.dueDate,
              priority: subtaskForm.priority,
              completed: false,
            }]
          };
        }
        return task;
      }));
      toast({
        title: "Subtask added",
        description: `"${subtaskForm.title}" added successfully`,
      });
      setIsAddSubtaskOpen(false);
      setSubtaskForm({ title: "", dueDate: "", priority: "medium" });
    }
  };

  const handleStatusChange = (taskId: number, newStatus: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          status: newStatus as Task["status"],
          completed: newStatus === "completed",
          progress: newStatus === "completed" ? 100 : task.progress,
        };
        // Update sidebar if open
        if (selectedTask?.id === taskId) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const handleBlockedReason = (taskId: number, reason: string, e?: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, blockedReason: reason };
      }
      return task;
    }));
  };

  const handleFileUpload = (taskId: number, files: FileList | null, e?: React.MouseEvent) => {
    if (files && files.length > 0) {
      const fileName = files[0].name;
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, deliverables: [...task.deliverables, fileName] };
          if (selectedTask?.id === taskId) {
            setSelectedTask(updatedTask);
          }
          return updatedTask;
        }
        return task;
      }));
      toast({
        title: "Deliverable uploaded",
        description: `${fileName} uploaded successfully`,
      });
      setUploadTaskId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileUpload(taskId, e.dataTransfer.files);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskSidebarOpen(true);
  };

  const handleAddComment = () => {
    if (selectedTask && newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        user: "You",
        initials: "YO",
        text: newComment,
        time: "Just now"
      };
      
      setTasks(prev => prev.map(task => {
        if (task.id === selectedTask.id) {
          const updatedTask = { ...task, comments: [...task.comments, comment] };
          setSelectedTask(updatedTask);
          return updatedTask;
        }
        return task;
      }));
      
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    }
  };

  const handleSubtaskToggle = (taskId: number, subtaskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          subtasks: task.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
        if (selectedTask?.id === taskId) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || "";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle size={14} className="text-green-600" />;
      case "blocked": return <AlertOctagon size={14} className="text-red-600" />;
      case "in_progress": return <PlayCircle size={14} className="text-blue-600" />;
      case "under_review": return <Clock size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My Workspace</h2>
          <p className="text-muted-foreground">Track your tasks and client feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="My Tasks"
          value={String(tasks.length)}
          change="3 new today"
          changeType="neutral"
          icon={CheckSquare}
        />
        <StatsCard
          title="Due Today"
          value="5"
          change="2 urgent"
          changeType="negative"
          icon={Clock}
        />
        <StatsCard
          title="Blocked Tasks"
          value={String(tasks.filter(t => t.status === "blocked").length)}
          change="Awaiting input"
          changeType="negative"
          icon={AlertOctagon}
        />
        <StatsCard
          title="In Progress"
          value={String(tasks.filter(t => t.status === "in_progress").length)}
          change="On track"
          changeType="positive"
          icon={PlayCircle}
        />
        <StatsCard
          title="Completed This Week"
          value={String(tasks.filter(t => t.status === "completed").length)}
          change="+3 from last week"
          changeType="positive"
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={cn(
                  "p-3 rounded-lg border transition-colors cursor-pointer",
                  task.status === "blocked" ? "border-red-200 bg-red-50/50 hover:bg-red-50" :
                  task.status === "completed" ? "border-green-200 bg-green-50/50 hover:bg-green-50" :
                  task.status === "under_review" ? "border-orange-200 bg-orange-50/50 hover:bg-orange-50" :
                  "border-border bg-secondary/50 hover:bg-secondary"
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={task.completed} 
                    className="mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={(checked) => {
                      if (checked) handleStatusChange(task.id, "completed");
                      else handleStatusChange(task.id, "not_started");
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <p
                          className={cn(
                            "text-sm font-medium",
                            task.completed ? "line-through text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {task.title}
                        </p>
                      </div>
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger 
                          className={cn("h-7 w-auto text-xs px-2", getStatusColor(task.status))}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={task.progress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {task.progress}%
                      </span>
                    </div>

                    {/* Blocked Comment Box */}
                    {task.status === "blocked" && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <Textarea
                          placeholder="Describe the blocker..."
                          value={task.blockedReason || ""}
                          onChange={(e) => handleBlockedReason(task.id, e.target.value)}
                          className="text-xs min-h-[60px] bg-white"
                        />
                      </div>
                    )}

                    {/* Subtasks */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-2 pl-2 border-l-2 border-primary/20 space-y-1" onClick={(e) => e.stopPropagation()}>
                        {task.subtasks.map(subtask => (
                          <div key={subtask.id} className="flex items-center gap-2 text-xs">
                            <Checkbox 
                              checked={subtask.completed} 
                              className="h-3 w-3" 
                              onCheckedChange={() => handleSubtaskToggle(task.id, subtask.id)}
                            />
                            <span className={subtask.completed ? "line-through text-muted-foreground" : ""}>
                              {subtask.title}
                            </span>
                            <Badge className={cn("text-[10px] px-1 py-0", priorityColors[subtask.priority])}>
                              {subtask.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Deliverables */}
                    {task.deliverables.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                        {task.deliverables.map((file, index) => (
                          <Badge key={index} variant="secondary" className="text-xs cursor-pointer hover:bg-secondary">
                            <Download size={10} className="mr-1" />
                            {file}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Upload Area */}
                    {uploadTaskId === task.id && (
                      <div
                        className={cn(
                          "mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors",
                          isDragging ? "border-primary bg-primary/5" : "border-border"
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => handleDrop(e, task.id)}
                      >
                        <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground mb-2">
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
                          className="hidden"
                          onChange={(e) => handleFileUpload(task.id, e.target.files)}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => openAddSubtask(task.id, e)}
                      >
                        <Plus size={12} className="mr-1" />
                        Add Subtask
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadTaskId(uploadTaskId === task.id ? null : task.id);
                        }}
                      >
                        <Upload size={12} className="mr-1" />
                        Upload Deliverable
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare size={16} />
              Client Feedback & Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {feedback.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{feedback.client}</p>
                    <span className="text-xs text-muted-foreground">{feedback.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{feedback.task}</p>
                  <p className="text-sm text-foreground mt-1">{feedback.comment}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add Subtask Modal */}
      <Dialog open={isAddSubtaskOpen} onOpenChange={setIsAddSubtaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              Add Subtask
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtask-title">Subtask Title *</Label>
              <Input
                id="subtask-title"
                placeholder="Enter subtask title"
                value={subtaskForm.title}
                onChange={(e) => setSubtaskForm({ ...subtaskForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtask-due">Due Date</Label>
              <Input
                id="subtask-due"
                type="date"
                value={subtaskForm.dueDate}
                onChange={(e) => setSubtaskForm({ ...subtaskForm, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={subtaskForm.priority}
                onValueChange={(value: "high" | "medium" | "low") => setSubtaskForm({ ...subtaskForm, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddSubtaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubtask} disabled={!subtaskForm.title}>
              Add Subtask
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Sidebar */}
      <Sheet open={isTaskSidebarOpen} onOpenChange={setIsTaskSidebarOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Task Details
            </SheetTitle>
          </SheetHeader>

          {selectedTask && (
            <div className="mt-6 space-y-6">
              {/* Task Title & Status */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{selectedTask.title}</h3>
                  <Badge className={cn("whitespace-nowrap", getStatusColor(selectedTask.status))}>
                    {statusOptions.find(s => s.value === selectedTask.status)?.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{selectedTask.description}</p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm text-muted-foreground">{selectedTask.progress}%</p>
                </div>
                <Progress value={selectedTask.progress} className="h-3" />
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Subtasks ({selectedTask.subtasks.length})</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => {
                      setSelectedTaskId(selectedTask.id);
                      setIsAddSubtaskOpen(true);
                    }}
                  >
                    <Plus size={12} className="mr-1" />
                    Add
                  </Button>
                </div>
                {selectedTask.subtasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No subtasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTask.subtasks.map(subtask => (
                      <div 
                        key={subtask.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-border bg-background"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={subtask.completed}
                            onCheckedChange={() => handleSubtaskToggle(selectedTask.id, subtask.id)}
                          />
                          <span className={cn(
                            "text-sm",
                            subtask.completed && "line-through text-muted-foreground"
                          )}>
                            {subtask.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {subtask.dueDate && (
                            <span className="text-xs text-muted-foreground">{subtask.dueDate}</span>
                          )}
                          <Badge className={cn("text-xs", priorityColors[subtask.priority])}>
                            {subtask.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deliverables */}
              <div>
                <p className="text-sm font-medium mb-3">Deliverables ({selectedTask.deliverables.length})</p>
                {selectedTask.deliverables.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No deliverables uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTask.deliverables.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg border border-border bg-background"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-muted-foreground" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7">
                          <Download size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div>
                <p className="text-sm font-medium mb-3">Comments ({selectedTask.comments.length})</p>
                
                {/* Add Comment */}
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Post
                  </Button>
                </div>

                {/* Comments List */}
                {selectedTask.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedTask.comments.map(comment => (
                      <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {comment.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{comment.user}</p>
                            <span className="text-xs text-muted-foreground">{comment.time}</span>
                          </div>
                          <p className="text-sm text-foreground mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
