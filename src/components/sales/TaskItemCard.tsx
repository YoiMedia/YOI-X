import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TaskItem {
  id: number;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  description?: string;
  status?: "not_started" | "in_progress" | "completed";
  relatedClient?: string;
  assignee?: string;
  notes?: string;
}

interface TaskItemCardProps {
  task: TaskItem;
  onClick?: (task: TaskItem) => void;
  onStatusChange?: (taskId: number, completed: boolean) => void;
}

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export function TaskItemCard({ task, onClick, onStatusChange }: TaskItemCardProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCheckedChange = (checked: boolean) => {
    if (onStatusChange) {
      onStatusChange(task.id, checked);
    }
  };

  return (
    <div
      onClick={() => onClick?.(task)}
      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
    >
      <Checkbox 
        checked={task.status === "completed"}
        onClick={handleCheckboxClick}
        onCheckedChange={handleCheckedChange}
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium",
          task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
        )}>
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
      </div>
      <Badge variant="outline" className={priorityColors[task.priority]}>
        {task.priority}
      </Badge>
    </div>
  );
}
