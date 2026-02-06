import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

export default function Tasks() {
  const { employees, deleteTask } = useData();

  const allTasks = employees.flatMap(emp =>
    emp.taskList.map(task => ({
      ...task,
      assignee: emp.name,
      assigneeId: emp.id,
      completed: task.status === "Completed" || task.status === "approved"
    }))
  );

  const pendingTasks = allTasks.filter((t) => !t.completed);
  const completedTasks = allTasks.filter((t) => t.completed);

  return (
    <AppLayout title="Tasks">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {pendingTasks.length} pending · {completedTasks.length} completed
          </p>
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
