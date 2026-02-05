import { CheckSquare, Clock, TrendingUp, ListChecks } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const myTasks = [
  { id: 1, title: "Complete client onboarding documentation", status: "in_progress", dueDate: "Today", progress: 75 },
  { id: 2, title: "Review Q4 marketing materials", status: "pending", dueDate: "Tomorrow", progress: 30 },
  { id: 3, title: "Update project timeline", status: "in_progress", dueDate: "Feb 7", progress: 50 },
  { id: 4, title: "Prepare weekly report", status: "pending", dueDate: "Feb 8", progress: 0 },
];

const deadlines = [
  { id: 1, task: "Submit expense report", date: "Today", time: "5:00 PM", urgent: true },
  { id: 2, task: "Client presentation", date: "Tomorrow", time: "10:00 AM", urgent: true },
  { id: 3, task: "Project milestone review", date: "Feb 7", time: "2:00 PM", urgent: false },
  { id: 4, task: "Team sync meeting", date: "Feb 8", time: "11:00 AM", urgent: false },
];

const subtasks = [
  { id: 1, parent: "Client onboarding", title: "Gather client requirements", completed: true },
  { id: 2, parent: "Client onboarding", title: "Set up project workspace", completed: true },
  { id: 3, parent: "Client onboarding", title: "Create initial timeline", completed: false },
  { id: 4, parent: "Client onboarding", title: "Schedule kickoff call", completed: false },
  { id: 5, parent: "Q4 marketing", title: "Review creative assets", completed: false },
  { id: 6, parent: "Q4 marketing", title: "Provide feedback", completed: false },
];

const statusColors = {
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

export function EmployeeDashboard() {
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const totalSubtasks = subtasks.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My Workspace</h2>
          <p className="text-muted-foreground">Track your tasks and deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My Tasks"
          value="8"
          change="4 in progress"
          changeType="neutral"
          icon={CheckSquare}
        />
        <StatsCard
          title="Upcoming Deadlines"
          value="4"
          change="2 urgent"
          changeType="negative"
          icon={Clock}
        />
        <StatsCard
          title="Overall Progress"
          value="68%"
          change="+12% this week"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Subtasks"
          value={`${completedSubtasks}/${totalSubtasks}`}
          change={`${Math.round((completedSubtasks/totalSubtasks)*100)}% complete`}
          changeType="positive"
          icon={ListChecks}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">My Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myTasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Due: {task.dueDate}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[task.status]}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    deadline.urgent
                      ? "bg-red-50 border-l-red-500"
                      : "bg-secondary/50 border-l-muted-foreground"
                  }`}
                >
                  <p className="font-medium text-sm text-foreground">{deadline.task}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deadline.date} · {deadline.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Subtasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 py-2">
                  <Checkbox checked={subtask.completed} />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        subtask.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {subtask.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{subtask.parent}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
