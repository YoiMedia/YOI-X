import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Save, X, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const unassignedTasks = [
  { id: 1, title: "Website redesign for Acme Corp", priority: "high", dueDate: "Feb 15", project: "Acme Corp" },
  { id: 2, title: "Create marketing materials", priority: "medium", dueDate: "Feb 18", project: "TechStart Inc" },
  { id: 3, title: "Set up analytics dashboard", priority: "high", dueDate: "Feb 12", project: "Global Partners" },
  { id: 4, title: "Content writing for blog", priority: "low", dueDate: "Feb 20", project: "Innovation Labs" },
  { id: 5, title: "Social media strategy", priority: "medium", dueDate: "Feb 22", project: "Quantum Solutions" },
  { id: 6, title: "UX audit and recommendations", priority: "high", dueDate: "Feb 14", project: "Acme Corp" },
];

const employees = [
  { id: "1", name: "Sarah Chen", initials: "SC", tasks: 8, capacity: 10 },
  { id: "2", name: "Mike Johnson", initials: "MJ", tasks: 6, capacity: 10 },
  { id: "3", name: "Emily Davis", initials: "ED", tasks: 9, capacity: 10 },
  { id: "4", name: "Alex Rivera", initials: "AR", tasks: 4, capacity: 10 },
  { id: "5", name: "Jordan Lee", initials: "JL", tasks: 5, capacity: 10 },
];

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export default function TaskAssignment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Record<number, string>>({});

  const handleAssign = (taskId: number, employeeId: string) => {
    setAssignments(prev => ({ ...prev, [taskId]: employeeId }));
  };

  const handleSave = () => {
    const assignedCount = Object.keys(assignments).length;
    toast({
      title: "Assignments saved",
      description: `${assignedCount} task${assignedCount !== 1 ? 's' : ''} assigned successfully`,
    });
    navigate("/");
  };

  const getEmployeeLoad = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const additionalTasks = Object.values(assignments).filter(id => id === employeeId).length;
    return employee ? employee.tasks + additionalTasks : 0;
  };

  return (
    <AppLayout title="Task Assignment">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Task Assignment Board</h2>
              <p className="text-sm text-muted-foreground">Assign unassigned tasks to employees</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Save Assignments
            </Button>
          </div>
        </div>

        {/* Employee Capacity Overview */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Employee Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {employees.map((employee) => {
                const currentLoad = getEmployeeLoad(employee.id);
                const isOverloaded = currentLoad >= employee.capacity;
                return (
                  <div key={employee.id} className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{employee.name}</span>
                    </div>
                    <Progress 
                      value={(currentLoad / employee.capacity) * 100} 
                      className={`h-2 ${isOverloaded ? '[&>div]:bg-red-500' : ''}`} 
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {currentLoad}/{employee.capacity}
                      </span>
                      {isOverloaded && (
                        <AlertCircle size={12} className="text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Tasks */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Unassigned Tasks ({unassignedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unassignedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{task.project}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                  </div>
                </div>
                <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
                  {task.priority}
                </Badge>
                <Select
                  value={assignments[task.id] || ""}
                  onValueChange={(value) => handleAssign(task.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <span>{employee.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({employee.tasks + (Object.values(assignments).filter(id => id === employee.id).length)}/{employee.capacity})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
