import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

type EventType = "meeting" | "deadline" | "task" | "personal";

const typeColors: Record<EventType, string> = {
  meeting: "bg-blue-100 text-blue-700 border-l-blue-500",
  deadline: "bg-red-100 text-red-700 border-l-red-500",
  task: "bg-green-100 text-green-700 border-l-green-500",
  personal: "bg-purple-100 text-purple-700 border-l-purple-500",
};

import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Calendar() {
  const { users, meetings, scheduleMeeting, sendNotification, isLoading } = useData();

  if (isLoading) {
    return <LoadingScreen message="Syncing calendar events..." />;
  }
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1)); // Feb 2025
  const [eventForm, setEventForm] = useState({ 
    title: "", 
    date: "", 
    time: "", 
    type: "meeting" as EventType,
    clientId: "" as string 
  });

  const clients = users.filter(u => u.role === "client");

  // Calendar Date Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const startOffset = (firstDay + 6) % 7;

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  const handleAddEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (eventForm.type === "meeting" && eventForm.clientId) {
        await scheduleMeeting({
          clientId: eventForm.clientId as Id<"users">,
          title: eventForm.title,
          scheduledAt: `${eventForm.date}T${eventForm.time}:00`,
          type: "onboarding", // Defaulting to onboarding for this flow
          status: "accepted",
        });

        await sendNotification({
          userId: eventForm.clientId as Id<"users">,
          title: "Meeting Scheduled",
          message: `Your ${eventForm.title} has been scheduled for ${eventForm.date} at ${eventForm.time}.`,
          type: "meeting",
          link: "/calendar",
        });

        toast.success("Meeting scheduled and client notified");
      } else {
        // Generic event (internal)
        toast.info("Internal event added (not persisted in this demo for simplicity)");
      }

      setIsAddEventOpen(false);
      setEventForm({ title: "", date: "", time: "", type: "meeting", clientId: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule meeting");
    }
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const formatDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const allEvents = (meetings ?? []).map(m => ({
    id: m._id,
    title: m.title ?? "Meeting",
    time: (m.scheduledAt ?? "2025-01-01T00:00:00").split("T")[1]?.substring(0, 5) ?? "00:00",
    date: (m.scheduledAt ?? "2025-01-01T00:00:00").split("T")[0],
    type: "meeting" as EventType,
  }));

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
            Schedule Meeting
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
                      className="text-[10px] px-1.5 py-1 rounded border-l-2 truncate font-medium bg-blue-50 text-blue-700 border-blue-500"
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
            <CardTitle className="text-base font-semibold">Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {allEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No meetings scheduled.</div>
            ) : (
              allEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event: any, i) => (
                  <div key={i} className="p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-md">
                        <Clock size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.date} · {event.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">onboarding</Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Onboarding Call</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Client</Label>
              <Select value={eventForm.clientId} onValueChange={(v) => setEventForm({ ...eventForm, clientId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.fullname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Meeting Title</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Kickoff Strategy Session"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Time</Label>
                <Input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Schedule & Notify Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
