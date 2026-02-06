import { CheckSquare, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskItem } from "./TaskItemCard";

interface TaskDetailsSidebarProps {
  task: TaskItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export function TaskDetailsSidebar({ task, open, onOpenChange }: TaskDetailsSidebarProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => onOpenChange(false)}
          >
            <X size={18} />
          </Button>
          <SheetTitle className="flex items-center gap-2 pr-8">
            <CheckSquare size={20} className="text-primary" />
            Task Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Task Title */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
          </div>

          {/* Due Date */}
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Due Date</p>
            <p className="font-medium">{task.dueDate}</p>
          </div>

          {/* Priority Badge */}
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-2">Priority</p>
            <Badge variant="outline" className={cn(priorityColors[task.priority], "text-sm")}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>

          {/* Notes Section (Read-only) */}
          <div>
            <p className="text-sm font-medium mb-2">Notes</p>
            <div className="p-3 bg-secondary/50 rounded-lg min-h-[100px]">
              {task.notes || task.description ? (
                <p className="text-sm text-muted-foreground">
                  {task.notes || task.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes available</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
