import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const tasks = [
  {
    id: 1,
    title: "Review contract for TechCorp",
    priority: "high",
    dueDate: "Today",
    completed: false,
  },
  {
    id: 2,
    title: "Prepare proposal deck",
    priority: "medium",
    dueDate: "Tomorrow",
    completed: false,
  },
  {
    id: 3,
    title: "Schedule client call",
    priority: "low",
    dueDate: "Feb 7",
    completed: true,
  },
  {
    id: 4,
    title: "Update pricing sheet",
    priority: "medium",
    dueDate: "Feb 8",
    completed: false,
  },
];

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export function TasksList() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <Checkbox checked={task.completed} />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Due: {task.dueDate}</p>
            </div>
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
