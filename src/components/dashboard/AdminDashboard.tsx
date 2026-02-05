import { Users, FolderKanban, Clock, UserCheck, Plus, ListTodo, CheckCircle } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const activities = [
  { id: 1, user: "Sarah Chen", initials: "SC", action: "submitted proposal for", target: "Q4 Campaign", time: "10 min ago" },
  { id: 2, user: "Mike Johnson", initials: "MJ", action: "closed deal with", target: "Acme Corp", time: "1 hour ago" },
  { id: 3, user: "Emily Davis", initials: "ED", action: "completed task", target: "Client onboarding", time: "2 hours ago" },
  { id: 4, user: "Alex Rivera", initials: "AR", action: "requested approval for", target: "New timeline", time: "3 hours ago" },
];

const employees = [
  { name: "Sarah Chen", tasks: 8, capacity: 10 },
  { name: "Mike Johnson", tasks: 6, capacity: 10 },
  { name: "Emily Davis", tasks: 9, capacity: 10 },
  { name: "Alex Rivera", tasks: 4, capacity: 10 },
  { name: "Jordan Lee", tasks: 7, capacity: 10 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Admin Overview</h2>
          <p className="text-muted-foreground">Manage your organization</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus size={16} className="mr-2" />
            Create Sales Account
          </Button>
          <Button variant="outline">
            <ListTodo size={16} className="mr-2" />
            Assign Tasks
          </Button>
          <Button variant="outline">
            <CheckCircle size={16} className="mr-2" />
            Approve Timelines
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Clients"
          value="248"
          change="+12 this month"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Active Projects"
          value="42"
          change="8 near deadline"
          changeType="neutral"
          icon={FolderKanban}
        />
        <StatsCard
          title="Pending Approvals"
          value="7"
          change="3 urgent"
          changeType="negative"
          icon={Clock}
        />
        <StatsCard
          title="Active Employees"
          value="24"
          change="2 on leave"
          changeType="neutral"
          icon={UserCheck}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Employee Workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{employee.name}</span>
                  <span className="text-muted-foreground">
                    {employee.tasks}/{employee.capacity} tasks
                  </span>
                </div>
                <Progress 
                  value={(employee.tasks / employee.capacity) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-foreground text-xs">
                    {activity.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
