import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Upload, CheckSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

const statusOptions = [
  { value: "not_started", label: "Not Started", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "under_review", label: "Under Review", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700 border-green-200" },
];

export default function TaskSubtask() {
  const [taskTitle] = useState("Complete Homepage Redesign");
  const [taskDescription] = useState("Redesign the homepage based on the approved mockups. Ensure responsive design and performance optimization.");
  const [progress, setProgress] = useState([65]);
  const [status, setStatus] = useState("in_progress");
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: 1, title: "Create header component", completed: true },
    { id: 2, title: "Design hero section", completed: true },
    { id: 3, title: "Build feature cards", completed: false },
    { id: 4, title: "Implement footer", completed: false },
    { id: 5, title: "Add animations", completed: false },
  ]);
  const [newSubtask, setNewSubtask] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const newId = Math.max(0, ...subtasks.map((s) => s.id)) + 1;
      setSubtasks([...subtasks, { id: newId, title: newSubtask, completed: false }]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (id: number) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const removeSubtask = (id: number) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const currentStatus = statusOptions.find((s) => s.value === status);

  return (
    <AppLayout title="Task Management">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{taskTitle}</h2>
            <p className="text-sm text-muted-foreground">Assigned to you · Due Feb 15, 2025</p>
          </div>
          <Badge variant="outline" className={currentStatus?.color}>
            {currentStatus?.label}
          </Badge>
        </div>

        {/* Main Task Card */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" />
              Task Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-foreground">{taskDescription}</p>
            </div>

            {/* Progress Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Progress</span>
                <span className="text-sm font-semibold text-primary">{progress[0]}%</span>
              </div>
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Status Dropdown */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">Status</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color.split(" ")[0]}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subtasks */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <button
                className="flex items-center gap-2 text-base font-semibold"
                onClick={() => setShowSubtasks(!showSubtasks)}
              >
                Subtasks
                <Badge variant="secondary" className="font-normal">
                  {completedCount}/{subtasks.length}
                </Badge>
                {showSubtasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </CardHeader>
          {showSubtasks && (
            <CardContent className="space-y-4">
              {/* Add Subtask */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                />
                <Button onClick={addSubtask}>
                  <Plus size={16} className="mr-1" />
                  Add
                </Button>
              </div>

              {/* Subtask List */}
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      subtask.completed ? "bg-green-50 border-green-200" : "bg-secondary/50 border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtask(subtask.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        subtask.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSubtask(subtask.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Upload Deliverable */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload size={40} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-1">Upload Deliverable</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here or click to browse
              </p>
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
