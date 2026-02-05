import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal } from "lucide-react";

const tasks = [
  { id: 1, title: "Review contract for TechCorp", assignee: "John Doe", priority: "high", dueDate: "Today", completed: false },
  { id: 2, title: "Prepare Q4 proposal deck", assignee: "Sarah Chen", priority: "high", dueDate: "Tomorrow", completed: false },
  { id: 3, title: "Schedule client onboarding call", assignee: "Mike Johnson", priority: "medium", dueDate: "Feb 7", completed: false },
  { id: 4, title: "Update pricing documentation", assignee: "Emily Davis", priority: "low", dueDate: "Feb 8", completed: false },
  { id: 5, title: "Send follow-up emails", assignee: "Alex Rivera", priority: "medium", dueDate: "Feb 6", completed: true },
  { id: 6, title: "Complete compliance training", assignee: "Jordan Lee", priority: "low", dueDate: "Feb 10", completed: true },
];

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export default function Tasks() {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <AppLayout title="Tasks">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {pendingTasks.length} pending · {completedTasks.length} completed
          </p>
          <Button>
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <Checkbox />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.assignee}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{task.dueDate}</span>
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 opacity-60">
                    <Checkbox checked />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-through">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.assignee}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{task.dueDate}</span>
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
