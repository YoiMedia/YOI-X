import { CheckSquare, Clock, AlertOctagon, PlayCircle, CheckCircle, MessageSquare } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const todaysTasks = [
  { id: 1, title: "Complete client onboarding documentation", progress: 75, completed: false },
  { id: 2, title: "Review Q4 marketing materials", progress: 30, completed: false },
  { id: 3, title: "Update project timeline for TechCorp", progress: 50, completed: false },
  { id: 4, title: "Prepare weekly status report", progress: 0, completed: false },
  { id: 5, title: "Send meeting notes to team", progress: 100, completed: true },
];

const clientFeedback = [
  { id: 1, client: "Sarah Chen", initials: "SC", task: "Website Redesign", comment: "Great progress! Can we add more contrast to the hero section?", time: "30 min ago" },
  { id: 2, client: "Mike Johnson", initials: "MJ", task: "Marketing Campaign", comment: "Approved the final deliverables. Excellent work!", time: "2 hours ago" },
  { id: 3, client: "Emily Davis", initials: "ED", task: "App Development", comment: "Please review the latest mockups and provide feedback.", time: "4 hours ago" },
  { id: 4, client: "Alex Rivera", initials: "AR", task: "Brand Guidelines", comment: "Requesting minor revisions to the color palette.", time: "Yesterday" },
];

export function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My Workspace</h2>
          <p className="text-muted-foreground">Track your tasks and client feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="My Tasks"
          value="12"
          change="3 new today"
          changeType="neutral"
          icon={CheckSquare}
        />
        <StatsCard
          title="Due Today"
          value="5"
          change="2 urgent"
          changeType="negative"
          icon={Clock}
        />
        <StatsCard
          title="Blocked Tasks"
          value="2"
          change="Awaiting input"
          changeType="negative"
          icon={AlertOctagon}
        />
        <StatsCard
          title="In Progress"
          value="4"
          change="On track"
          changeType="positive"
          icon={PlayCircle}
        />
        <StatsCard
          title="Completed This Week"
          value="8"
          change="+3 from last week"
          changeType="positive"
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Checkbox checked={task.completed} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={task.progress} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare size={16} />
              Client Feedback & Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {feedback.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{feedback.client}</p>
                    <span className="text-xs text-muted-foreground">{feedback.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{feedback.task}</p>
                  <p className="text-sm text-foreground mt-1">{feedback.comment}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
