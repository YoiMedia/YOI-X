import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientProject() {
  const { user } = useAuth();
  const { requirements, isLoading } = useData();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);

  // Use requirements as the source of "Project"
  const activeRequirement = requirements.length > 0 ? requirements[0] : null;

  // Fetch tasks for the requirement
  const tasksQuery = useQuery(
    api.tasks.listByRequirement,
    activeRequirement?._id ? { requirement_id: activeRequirement._id } : "skip",
  );

  if (isLoading) {
    return (
      <AppLayout title="Project Progress">
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </AppLayout>
    );
  }

  if (!activeRequirement) {
    return (
      <AppLayout title="Project Progress">
        <div className="text-center py-12">
          <AlertCircle
            size={48}
            className="mx-auto mb-4 text-muted-foreground opacity-30"
          />
          <p className="text-muted-foreground">No active project found.</p>
        </div>
      </AppLayout>
    );
  }

  const tasks = tasksQuery || [];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskPanelOpen(true);
  };

  return (
    <AppLayout title="Project Progress">
      <div className="space-y-6 max-w-7xl">
        {/* Overview Card */}
        <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {activeRequirement.requirement_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeRequirement.requirement_number}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  getStatusColor(activeRequirement.status),
                )}
              >
                {activeRequirement.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedTasks}/{totalTasks} tasks completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {tasksByStatus.todo.length}
                </p>
                <p className="text-xs text-muted-foreground">To Do</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {tasksByStatus.in_progress.length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {tasksByStatus.completed.length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Clock size={16} />
              To Do ({tasksByStatus.todo.length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus.todo.map((task) => (
                <Card
                  key={task._id}
                  className="border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {task.priority || "Medium"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.progress}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tasksByStatus.todo.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground italic border-2 border-dashed border-border rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-blue-600 uppercase tracking-wide flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              In Progress ({tasksByStatus.in_progress.length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus.in_progress.map((task) => (
                <Card
                  key={task._id}
                  className="border-blue-200 hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/50"
                  onClick={() => handleTaskClick(task)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-[10px]">
                        {task.priority || "Medium"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.progress}%
                      </span>
                    </div>
                    <Progress value={task.progress} className="h-1" />
                  </CardContent>
                </Card>
              ))}
              {tasksByStatus.in_progress.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground italic border-2 border-dashed border-border rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-green-600 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle size={16} />
              Completed ({tasksByStatus.completed.length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus.completed.map((task) => (
                <Card
                  key={task._id}
                  className="border-green-200 hover:border-green-400 transition-colors cursor-pointer bg-green-50/30"
                  onClick={() => handleTaskClick(task)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm mb-2 line-through text-muted-foreground">
                      {task.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-green-100 text-green-700"
                      >
                        Done
                      </Badge>
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tasksByStatus.completed.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground italic border-2 border-dashed border-border rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Side Panel */}
      <Sheet open={isTaskPanelOpen} onOpenChange={setIsTaskPanelOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTask.task_number}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={getStatusColor(selectedTask.status)}
                >
                  {selectedTask.status}
                </Badge>
                <Badge variant="outline">
                  {selectedTask.priority || "Medium"} Priority
                </Badge>
              </div>

              {selectedTask.description && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Progress</h4>
                  <span className="text-sm text-muted-foreground">
                    {selectedTask.progress}%
                  </span>
                </div>
                <Progress value={selectedTask.progress} className="h-3" />
              </div>

              {selectedTask.due_date && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Due Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.due_date}
                  </p>
                </div>
              )}

              {selectedTask.subtasks &&
                Array.isArray(selectedTask.subtasks) && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Subtasks</h4>
                    <div className="space-y-2">
                      {selectedTask.subtasks.map(
                        (subtask: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded bg-secondary/30"
                          >
                            <CheckCircle
                              size={16}
                              className={
                                subtask.completed
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }
                            />
                            <span
                              className={cn(
                                "text-sm",
                                subtask.completed &&
                                  "line-through text-muted-foreground",
                              )}
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
