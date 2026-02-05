import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

const events = [
  { id: 1, title: "Client Call - Acme Corp", time: "9:00 AM", type: "meeting" },
  { id: 2, title: "Team Standup", time: "10:00 AM", type: "internal" },
  { id: 3, title: "Proposal Review", time: "2:00 PM", type: "task" },
  { id: 4, title: "TechStart Demo", time: "3:30 PM", type: "meeting" },
];

const typeColors = {
  meeting: "bg-blue-100 text-blue-700 border-l-blue-500",
  internal: "bg-purple-100 text-purple-700 border-l-purple-500",
  task: "bg-green-100 text-green-700 border-l-green-500",
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [3, 4, 5, 6, 7, 8, 9];

export default function Calendar() {
  return (
    <AppLayout title="Calendar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <ChevronLeft size={16} />
            </Button>
            <h2 className="text-lg font-semibold">February 2025</h2>
            <Button variant="outline" size="icon">
              <ChevronRight size={16} />
            </Button>
          </div>
          <Button>
            <Plus size={16} className="mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {days.map((day, i) => (
            <div key={day} className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{day}</p>
              <div
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                  dates[i] === 5
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:bg-secondary cursor-pointer"
                }`}
              >
                {dates[i]}
              </div>
            </div>
          ))}
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Today's Schedule · February 5, 2025
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border-l-4 ${typeColors[event.type]}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <Badge variant="outline" className="capitalize">
                    {event.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{event.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
