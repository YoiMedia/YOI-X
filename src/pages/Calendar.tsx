import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User, List, LayoutGrid, Building2, Users as UsersIcon } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { MultiSelect } from "@/components/ui/multi-select"; // Assuming this exists or using a fallback

type ViewMode = "calendar" | "list";
type EventType = "meeting" | "deadline" | "task" | "personal";

const typeColors: Record<EventType, string> = {
  meeting: "bg-blue-100 text-blue-700 border-l-blue-500",
  deadline: "bg-red-100 text-red-700 border-l-red-500",
  task: "bg-green-100 text-green-700 border-l-green-500",
  personal: "bg-purple-100 text-purple-700 border-l-purple-500",
};

export default function MeetingsPage() {
  const { clients, employeeUsers, adminUsers, meetings, scheduleMeeting, sendNotification, isLoading } = useData();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [eventForm, setEventForm] = useState({ 
    title: "", 
    date: "", 
    time: "", 
    description: "",
    clientId: "" as string,
    attendees: [] as string[]
  });

  if (isLoading) {
    return <LoadingScreen message="Syncing meeting schedule..." />;
  }

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  const handleAddMeeting = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.clientId) {
      toast.error("Please fill in all required fields including Client");
      return;
    }

    try {
      await scheduleMeeting({
        client_id: eventForm.clientId as Id<"clients">,
        title: eventForm.title,
        description: eventForm.description,
        scheduled_at: new Date(`${eventForm.date}T${eventForm.time}:00`).getTime(),
        attendees: eventForm.attendees as Id<"users">[],
        type: "consultation",
        status: "scheduled",
      });

      toast.success("Meeting scheduled successfully");
      setIsAddEventOpen(false);
      setEventForm({ title: "", date: "", time: "", description: "", clientId: "", attendees: [] });
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule meeting");
    }
  };

  const changeMonth = (delta: number) => setCurrentDate(new Date(year, month + delta, 1));
  const formatDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const allMeetings = ((meetings as any[]) ?? []).map(m => ({
    ...m,
    date: new Date(m.scheduled_at).toISOString().split("T")[0],
    time: new Date(m.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <AppLayout title="Meetings">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-border rounded-lg p-1 w-fit">
            <Button 
              variant={viewMode === "calendar" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setViewMode("calendar")}
            >
              <LayoutGrid size={14} /> Calendar
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 gap-2"
              onClick={() => setViewMode("list")}
            >
              <List size={14} /> Table View
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {viewMode === "calendar" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
                  <ChevronLeft size={16} />
                </Button>
                <h2 className="text-sm font-semibold min-w-[120px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
            <Button onClick={() => setIsAddEventOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> Schedule Meeting
            </Button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <div className="grid grid-cols-7 gap-px bg-border/50 rounded-xl overflow-hidden border border-border shadow-sm">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="bg-slate-50 text-center font-bold text-[10px] uppercase tracking-wider text-slate-400 py-3">
                {day}
              </div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} className="min-h-[140px] bg-white/50" />;
              const dateStr = formatDateStr(date);
              const dayMeetings = allMeetings.filter(m => m.date === dateStr);

              return (
                <div key={i} className="min-h-[140px] bg-white p-2 transition-colors hover:bg-slate-50 flex flex-col gap-1 border-t border-l border-border/20">
                  <span className="text-sm font-bold text-slate-400 mb-1">{date}</span>
                  <div className="flex flex-col gap-1">
                    {dayMeetings.map((m, idx) => (
                      <div
                        key={m._id || idx}
                        className="text-[10px] px-2 py-1 rounded bg-blue-50 text-blue-700 border-l-2 border-blue-500 truncate cursor-pointer hover:bg-blue-100"
                        onClick={() => navigate(`/meetings/${m._id}`)}
                      >
                        {m.time} {m.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-slate-50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Meeting Info</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Client</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Attendees</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allMeetings.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700">{m.title}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <Clock size={12} /> {m.date} at {m.time}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">{m.clientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={
                            m.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                            m.status === "scheduled" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-50 text-slate-600"
                          }>
                            {m.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {m.attendeesData?.slice(0, 3).map((a: any, i: number) => (
                              <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600" title={a.name}>
                                {a.name[0]}
                              </div>
                            ))}
                            {m.attendeesData?.length > 3 && (
                              <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                +{m.attendeesData.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8" 
                            onClick={() => navigate(`/meetings/${m._id}`)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="text-primary" size={20} />
              Schedule New Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Select value={eventForm.clientId} onValueChange={(v) => setEventForm({ ...eventForm, clientId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.companyName} ({c.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                placeholder="e.g. Requirement Gathering Session" 
                value={eventForm.title}
                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Internal Attendees (Staff & Admins)</Label>
              <div className="max-h-[120px] overflow-y-auto border border-border rounded-md p-2 bg-slate-50 space-y-2">
                {[...adminUsers, ...employeeUsers].map(u => (
                  <div key={u._id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id={u._id}
                      checked={eventForm.attendees.includes(u._id)}
                      onChange={(e) => {
                        const next = e.target.checked 
                          ? [...eventForm.attendees, u._id]
                          : eventForm.attendees.filter(id => id !== u._id);
                        setEventForm({ ...eventForm, attendees: next });
                      }}
                    />
                    <Label htmlFor={u._id} className="text-xs font-medium cursor-pointer">
                      {u.full_name} <span className="text-[10px] opacity-50 capitalize">({u.role})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Agenda / Description</Label>
              <Textarea 
                placeholder="What will be discussed?" 
                value={eventForm.description}
                onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMeeting} className="bg-primary hover:bg-primary/90">Schedule Meeting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
