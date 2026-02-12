import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  Building2, 
  FileText, 
  Plus, 
  CheckCircle2, 
  MessageSquare,
  ArrowLeft,
  Paperclip,
  Download
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AddCallOutcome } from "@/components/meetings/AddCallOutcome";
import { useState } from "react";

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, isLoading } = useData();
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);

  const meeting = meetings?.find(m => m._id === id);

  if (isLoading || !meetings) {
    return <LoadingScreen message="Loading meeting details..." />;
  }

  if (!meeting) {
    return (
      <AppLayout title="Meeting Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">The meeting you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/calendar")}>Back to Meetings</Button>
        </div>
      </AppLayout>
    );
  }

  const scheduledDate = new Date(meeting.scheduled_at);

  return (
    <AppLayout title="Meeting Details">
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-slate-500 hover:text-slate-900"
          onClick={() => navigate("/calendar")}
        >
          <ArrowLeft size={16} /> Back to Meetings
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{meeting.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                <CalendarIcon size={14} />
                {scheduledDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                <Clock size={14} />
                {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={
              meeting.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
              meeting.status === "accepted" ? "bg-blue-50 text-blue-700 border-blue-200" :
              "bg-slate-50 text-slate-600"
            }>
              {meeting.status.toUpperCase()}
            </Badge>
            <Button onClick={() => setIsOutcomeOpen(true)} className="bg-primary hover:bg-primary/90">
              {meeting.outcome ? (
                <>
                  <MessageSquare size={16} className="mr-2" /> Edit Call Outcome
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" /> Add Call Outcome
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Meeting Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {meeting.description || "No description provided for this meeting."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Call Outcomes & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {meeting.outcome ? (
                  <div className="space-y-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                          Recorded on {new Date(meeting.outcome.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {meeting.outcome.sales_notes && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Discussion Notes</p>
                        <div className="text-sm text-slate-700 space-y-1">
                          {meeting.outcome.sales_notes.split('\n').map((line: string, i: number) => (
                            <p key={i} className="flex gap-2">
                              <span className="text-primary">•</span> {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {meeting.outcome.next_steps && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Next Steps</p>
                        <div className="text-sm text-slate-700 space-y-1">
                          {meeting.outcome.next_steps.split('\n').map((line: string, i: number) => (
                            <p key={i} className="flex gap-2">
                              <span className="text-green-500">→</span> {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {((meeting.outcome.documents?.length ?? 0) > 0 || (meeting.outcome.other_files?.length ?? 0) > 0) && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Attached Files</p>
                        <div className="flex flex-wrap gap-2">
                          {[...(meeting.outcome.documents || []), ...(meeting.outcome.other_files || [])].map((storageKey: string, i: number) => (
                            <FileLink key={i} storageKey={storageKey} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <MessageSquare size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">No outcomes recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Participants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Client Organization</p>
                    <p className="text-sm font-bold text-slate-700">{meeting.clientName}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Users size={14} /> Attendees
                  </p>
                  <div className="space-y-2">
                    {meeting.attendeesData?.map((attendee: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                          {attendee.name[0]}
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{attendee.name}</span>
                      </div>
                    ))}
                    {(!meeting.attendeesData || meeting.attendeesData.length === 0) && (
                      <p className="text-xs text-slate-400 italic">No other attendees listed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {meeting.meeting_link && (
              <Card className="shadow-sm bg-primary/5 border-primary/10">
                <CardContent className="pt-6">
                  <Button className="w-full" onClick={() => window.open(meeting.meeting_link, '_blank')}>
                    Join Meeting Link
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddCallOutcome 
        open={isOutcomeOpen} 
        onOpenChange={setIsOutcomeOpen} 
        meeting={meeting} 
      />
    </AppLayout>
  );
}

function FileLink({ storageKey }: { storageKey: string }) {
  const url = useQuery(api.meetings.getFileUrl, { storageKey });
  
  if (!url) return null;
  
  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-primary transition-colors cursor-pointer group"
      onClick={() => window.open(url, '_blank')}
    >
      <Paperclip size={12} className="text-slate-400 group-hover:text-primary" />
      <span className="truncate max-w-[150px]">View Attachment</span>
      <Download size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
