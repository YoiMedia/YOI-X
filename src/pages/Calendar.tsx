import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type EventType = "meeting" | "deadline" | "task" | "personal";

const typeColors: Record<EventType, string> = {
  meeting: "bg-blue-100 text-blue-700 border-l-blue-500",
  deadline: "bg-red-100 text-red-700 border-l-red-500",
  task: "bg-green-100 text-green-700 border-l-green-500",
  personal: "bg-purple-100 text-purple-700 border-l-purple-500",
};

export default function Calendar() {
  const { projects, employees, addActivity } = useData();
  const { toast } = useToast();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1)); // Feb 2025
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "", type: "meeting" as EventType });
  const [customEvents, setCustomEvents] = useState<any[]>([]);

  // Calendar Date Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 = Sun

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Create array for grid: empty slots for previous month days + actual days
  // Adjust so Monday is first day if desired, but standard US calendar has Sun first.
  // Standard CSS grid with 7 cols usually implies Sun-Sat. 
  // Let's stick to Mon-Sun as per previous design (days array starts with Mon).
  // getDay() returns 0 for Sunday. If we want Mon as start: 
  // Sun(0) -> index 6, Mon(1) -> index 0, Tue(2) -> index 1...
  // Formula: (day + 6) % 7
  const startOffset = (firstDay + 6) % 7;

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) {
      return dayNum;
    }
    return null;
  });

  // Derive events
  const projectEvents = projects.map(p => ({
    id: `proj-${p.id}`,
    title: `${p.name} Deadline`,
    time: "All Day",
    type: "deadline" as EventType,
    date: p.deadline // YYYY-MM-DD
  }));

  const taskEvents = employees.flatMap(emp =>
    emp.taskList
      .filter(t => t.dueDate)
      .map(t => ({
        id: `task-${t.id}`,
        title: `${t.title} (${emp.initials})`,
        time: "5:00 PM",
        type: "task" as EventType,
        date: t.dueDate // YYYY-MM-DD
      }))
  );

  const allEvents = [...projectEvents, ...taskEvents, ...customEvents];

  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    const newEvent = {
      id: `custom-${Date.now()}`,
      ...eventForm
    };

    setCustomEvents([...customEvents, newEvent]);

    addActivity({
      actor_name: "Sales Rep",
      actor_initials: "SR",
      action_text: `scheduled ${eventForm.type}: ${eventForm.title} on ${eventForm.date} at ${eventForm.time}`,
      timestamp: "Just now"
    });

    setIsAddEventOpen(false);
    toast({ title: "Event Scheduled", description: "Added to your calendar." });
    setEventForm({ title: "", date: "", time: "", type: "meeting" as EventType });
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const formatDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  return (
    <AppLayout title="Calendar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={16} />
            </Button>
            <h2 className="text-lg font-semibold flex items-center gap-2 min-w-[160px] justify-center">
              <CalendarIcon size={18} />
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
          <Button onClick={() => setIsAddEventOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden border border-border">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="bg-background text-center font-medium text-xs text-muted-foreground py-3 border-b border-border/50">
              {day}
            </div>
          ))}
          {calendarDays.map((date, i) => {
            if (!date) return <div key={i} className="min-h-[120px] bg-background/50 p-2" />;

            const dateStr = formatDateStr(date);
            const daysEvents = allEvents.filter(e => e.date === dateStr);

            return (
              <div key={i} className={`min-h-[120px] bg-background p-2 transition-colors hover:bg-secondary/20 flex flex-col gap-1 border-t border-l border-border/20`}>
                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${dateStr === '2025-02-15' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                  {date}
                </span>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
                  {daysEvents.map((event: any, idx) => (
                    <div
                      key={event.id || idx}
                      className={`text-[10px] px-1.5 py-1 rounded border-l-2 truncate font-medium cursor-pointer hover:opacity-80 ${event.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-500' :
                          event.type === 'deadline' ? 'bg-red-50 text-red-700 border-red-500' :
                            event.type === 'task' ? 'bg-green-50 text-green-700 border-green-500' :
                              'bg-purple-50 text-purple-700 border-purple-500'
                        }`}
                      title={`${event.time} - ${event.title}`}
                    >
                      <span className="opacity-75 mr-1">{event.time}</span>
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Card className="border-border">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>All Upcoming Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {allEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No events scheduled.</div>
            ) : (
              allEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event: any, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border-l-4 flex items-center justify-between ${typeColors[event.type as EventType] || typeColors.meeting} bg-opacity-50`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/50 rounded-md">
                        <Clock size={16} className="opacity-70" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm opacity-80">{event.date} · {event.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white/50 border-0 capitalize">
                      {event.type}
                    </Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Event Type</Label>
              <Select value={eventForm.type} onValueChange={(v) => setEventForm({ ...eventForm, type: v as EventType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task Block</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Event Title</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Sales Call with Acme"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Add to Calendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
