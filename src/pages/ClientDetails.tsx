import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FolderKanban,
  ExternalLink,
  MessageSquare,
  Eye,
  Building2,
  Tag,
  Users
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function ClientDetails() {
  const { clientId } = useParams();
  const { clients, documents, requirements, meetings, isLoading } = useData();

  const client = clients.find(c => c.id === clientId || (c as any)._id === clientId);
  
  const clientDocs = documents.filter(d => d.client_id === clientId);
  const clientMeetings = meetings.filter(m => m.client_id === clientId);
  const clientReqs = requirements.filter(r => r.client_id === clientId);

  if (isLoading) return <LoadingScreen message="Loading client profile..." />;
  if (!client) return <AppLayout title="Error">Client not found</AppLayout>;

  return (
    <AppLayout title={`${client.name} Profile`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
            <p className="text-sm text-slate-500">Client since {new Date((client as any).created_at || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Badge variant="outline" className="h-6 px-1.5 font-mono text-[10px]">{client.uniqueClientId}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Client ID</p>
                    <p className="text-sm font-semibold text-slate-700">{client.uniqueClientId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Company Name</p>
                    <p className="text-sm font-semibold truncate text-slate-700">{client.companyName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Tag size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Industry</p>
                    <p className="text-sm font-semibold text-slate-700">{client.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Company Size</p>
                    <p className="text-sm font-semibold text-slate-700">{client.companySize} employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Email Address</p>
                    <p className="text-sm font-semibold truncate text-slate-700">{client.email || "No email provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-700">{client.contact || "No contact provided"}</p>
                  </div>
                </div>
                {client.website && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Globe size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 font-medium">Website</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{client.website}</p>
                    </div>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 font-medium">Address</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{client.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button className="w-full h-11" variant="outline">
              <MessageSquare size={16} className="mr-2" /> Message Client
            </Button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FolderKanban size={18} className="text-primary" />
                  Active Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {clientReqs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic">No active requirements</div>
                  ) : (
                    clientReqs.map(req => (
                      <div key={req._id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{req.requirement_name}</p>
                          <p className="text-xs text-slate-500">Scheduled: {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-blue-100">{req.status}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  Shared Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {clientDocs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic">No shared documents</div>
                  ) : (
                    clientDocs.map(doc => (
                      <div key={doc._id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-slate-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">{doc.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-primary">
                          <Eye size={14} className="mr-1" /> View
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {clientMeetings.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic">No scheduled meetings</div>
                  ) : (
                    clientMeetings.map(m => (
                      <div key={m._id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{m.title}</p>
                          <p className="text-xs text-slate-500">{new Date(m.scheduled_at).toLocaleString()}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8">Join</Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
