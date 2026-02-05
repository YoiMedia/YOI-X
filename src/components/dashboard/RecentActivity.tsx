import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: "Sarah Chen",
    initials: "SC",
    action: "created a new proposal",
    target: "Q4 Marketing Campaign",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Mike Johnson",
    initials: "MJ",
    action: "closed a deal with",
    target: "Acme Corp",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: "Emily Davis",
    initials: "ED",
    action: "sent an NDA to",
    target: "TechStart Inc",
    time: "5 hours ago",
  },
  {
    id: 4,
    user: "Alex Rivera",
    initials: "AR",
    action: "completed task",
    target: "Client onboarding",
    time: "Yesterday",
  },
  {
    id: 5,
    user: "Jordan Lee",
    initials: "JL",
    action: "scheduled meeting with",
    target: "Global Partners",
    time: "Yesterday",
  },
];

export function RecentActivity() {
  return (
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
  );
}
