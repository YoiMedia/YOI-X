import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ListTodo, MoreHorizontal, ArrowRight } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-green-100 text-green-700 border-green-200",
};

export default function Tasks() {
  const { tasks, isLoading } = useData();
  const { user } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>;
  }

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <AppLayout title="Project Tasks">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Delivery Pipeline</h2>
            <p className="text-sm text-muted-foreground">Manage your assignments and track progress</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-slate-50">{todoTasks.length} To Do</Badge>
            <Badge variant="outline" className="bg-blue-50">{inProgressTasks.length} In Progress</Badge>
            <Badge variant="outline" className="bg-green-50">{doneTasks.length} Done</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TO DO */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <ListTodo size={18} className="text-slate-400" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">To Do</h3>
            </div>
            <div className="space-y-3">
              {todoTasks.map(task => <TaskCard key={task._id} task={task} />)}
              {todoTasks.length === 0 && <EmptyLane />}
            </div>
          </section>

          {/* IN PROGRESS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Clock size={18} className="text-blue-400" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">In Progress</h3>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map(task => <TaskCard key={task._id} task={task} />)}
              {inProgressTasks.length === 0 && <EmptyLane />}
            </div>
          </section>

          {/* DONE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <CheckCircle2 size={18} className="text-green-400" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Done</h3>
            </div>
            <div className="space-y-3">
              {doneTasks.map(task => <TaskCard key={task._id} task={task} />)}
              {doneTasks.length === 0 && <EmptyLane />}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function TaskCard({ task }: { task: any }) {
  return (
    <Link to={`/tasks/${task._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={14} />
            </Button>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
              <span>Progress</span>
              <span>{Math.round(task.progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  task.status === "done" ? "bg-green-500" : "bg-primary"
                )} 
                style={{ width: `${task.progress}%` }} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-2">
               <div className="w-5 h-5 rounded-full bg-primary/10 border border-background flex items-center justify-center text-[8px] font-bold">
                 {task.subtasks.filter((s:any) => s.completed).length}/{task.subtasks.length}
               </div>
            </div>
            <ArrowRight size={14} className="text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyLane() {
  return (
    <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground italic">
      No tasks here
    </div>
  );
}
