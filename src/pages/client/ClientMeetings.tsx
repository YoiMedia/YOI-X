import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Calendar, Clock, Plus, Video, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientMeetings() {
  const { user } = useAuth();
  const { clients } = useData();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    preferred_date: "",
    preferred_time: "",
  });

  const client = clients.find((c) => c.user_id === user?._id);
  const meetings = useQuery(
    api.meetings.listForUser,
    user?._id ? { userId: user._id } : "skip",
  );

  const requestMeeting = useMutation(api.meetings.requestMeeting);

  const now = Date.now();
  const upcomingMeetings = (meetings || []).filter((m) => m.scheduled_at > now);
  const pastMeetings = (meetings || []).filter((m) => m.scheduled_at <= now);

  const handleRequestMeeting = async () => {
    if (!client || !user) return;

    try {
      const dateTime = new Date(
        `${meetingForm.preferred_date}T${meetingForm.preferred_time}`,
      );
      await requestMeeting({
        client_id: client._id,
        title: meetingForm.title,
        description: meetingForm.description,
        preferred_time: dateTime.getTime(),
        initiated_by: user._id,
      });

      toast.success("Meeting request sent!");
      setIsRequestModalOpen(false);
      setMeetingForm({
        title: "",
        description: "",
        preferred_date: "",
        preferred_time: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to request meeting");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "requested":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const renderMeetingCard = (meeting: any) => (
    <Card
      key={meeting._id}
      className="border-border hover:border-primary/30 transition-all"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{meeting.title}</h3>
            {meeting.description && (
              <p className="text-sm text-muted-foreground">
                {meeting.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs", getStatusColor(meeting.status))}
          >
            {meeting.status}
          </Badge>
        </div>

        <div className="space-y-2 my-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>{new Date(meeting.scheduled_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>
              {new Date(meeting.scheduled_at).toLocaleTimeString()} (
              {meeting.duration || 60} min)
            </span>
          </div>
          {meeting.meeting_link && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              <span className="truncate">{meeting.meeting_link}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {meeting.meeting_link && meeting.status === "scheduled" && (
            <Button size="sm" className="gap-2">
              <Video size={14} />
              Join Meeting
            </Button>
          )}
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout title="Meetings">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your Meetings</h2>
            <p className="text-muted-foreground">
              Schedule and manage your meetings
            </p>
          </div>
          <Button onClick={() => setIsRequestModalOpen(true)} className="gap-2">
            <Plus size={16} />
            Request Meeting
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({pastMeetings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p className="mb-4">No upcoming meetings</p>
                <Button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Request a Meeting
                </Button>
              </div>
            ) : (
              upcomingMeetings.map(renderMeetingCard)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-6">
            {pastMeetings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>No past meetings</p>
              </div>
            ) : (
              pastMeetings.map(renderMeetingCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Meeting Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Project Progress Discussion"
                value={meetingForm.title}
                onChange={(e) =>
                  setMeetingForm({ ...meetingForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What would you like to discuss?"
                value={meetingForm.description}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={meetingForm.preferred_date}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      preferred_date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={meetingForm.preferred_time}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      preferred_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRequestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestMeeting}
              disabled={
                !meetingForm.title ||
                !meetingForm.preferred_date ||
                !meetingForm.preferred_time
              }
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
