import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  FileSignature,
  Receipt,
  Download,
  Upload,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  MessageSquare,
  Paperclip,
  RotateCcw,
  FolderKanban,
  Phone,
} from "lucide-react";

const services = [
  { id: 1, name: "Website Redesign", status: "in_progress", progress: 65, startDate: "Jan 15", endDate: "Mar 30" },
  { id: 2, name: "Brand Identity Package", status: "completed", progress: 100, startDate: "Jan 10", endDate: "Feb 1" },
  { id: 3, name: "SEO Optimization", status: "in_progress", progress: 40, startDate: "Feb 1", endDate: "Apr 15" },
  { id: 4, name: "Content Strategy", status: "pending", progress: 0, startDate: "Mar 1", endDate: "Apr 30" },
];

const timeline = [
  { id: 1, title: "Project Kickoff", date: "Jan 15", status: "completed" },
  { id: 2, title: "Discovery & Research", date: "Jan 22", status: "completed" },
  { id: 3, title: "Design Concepts", date: "Feb 5", status: "completed" },
  { id: 4, title: "Development Phase", date: "Feb 15", status: "current" },
  { id: 5, title: "Testing & QA", date: "Mar 10", status: "upcoming" },
  { id: 6, title: "Launch", date: "Mar 30", status: "upcoming" },
];

const documents = [
  { id: 1, type: "proposal", name: "Project Proposal", date: "Jan 10, 2025", size: "2.4 MB" },
  { id: 2, type: "nda", name: "Non-Disclosure Agreement", date: "Jan 12, 2025", size: "156 KB" },
  { id: 3, type: "invoice", name: "Invoice #INV-001 (Deposit)", date: "Jan 15, 2025", amount: "$12,500", size: "98 KB" },
  { id: 4, type: "invoice", name: "Invoice #INV-002 (Milestone 1)", date: "Feb 1, 2025", amount: "$8,500", size: "95 KB" },
];

const messages = [
  { id: 1, sender: "Sarah Chen", initials: "SC", role: "Project Manager", message: "Hi! The design concepts are ready for your review. Please let me know your thoughts.", time: "2 hours ago", isTeam: true },
  { id: 2, sender: "You", initials: "YO", role: "Client", message: "Thanks Sarah! I love the direction. Can we make the header a bit more prominent?", time: "1 hour ago", isTeam: false },
  { id: 3, sender: "Sarah Chen", initials: "SC", role: "Project Manager", message: "Absolutely! I'll have the updated version ready by tomorrow.", time: "45 min ago", isTeam: true },
];

const statusColors = {
  completed: "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  current: "bg-primary text-primary-foreground",
  upcoming: "bg-secondary text-muted-foreground",
};

const typeIcons = {
  proposal: FileText,
  nda: FileSignature,
  invoice: Receipt,
};

export default function ClientPortal() {
  const [newMessage, setNewMessage] = useState("");

  return (
    <AppLayout title="Client Portal">
      <div className="space-y-8 max-w-6xl">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome back, John</h2>
            <p className="text-muted-foreground">Here's an overview of your projects and documents</p>
          </div>
          <Button>
            <Phone size={16} className="mr-2" />
            Contact Support
          </Button>
        </div>

        {/* Project Overview Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderKanban size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Project Overview</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services List */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Services Purchased</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.startDate} - {service.endDate}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusColors[service.status]}>
                        {service.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{service.progress}%</span>
                      </div>
                      <Progress value={service.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-600"
                              : item.status === "current"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {item.status === "completed" ? (
                            <CheckCircle size={16} />
                          ) : item.status === "current" ? (
                            <Clock size={16} />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 mt-2 ${
                              item.status === "completed" ? "bg-green-300" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p
                          className={`font-medium ${
                            item.status === "upcoming" ? "text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Documents Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Documents</h3>
          </div>

          <Card className="border-border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {documents.map((doc) => {
                  const Icon = typeIcons[doc.type];
                  return (
                    <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                      <div className="p-2.5 rounded-lg bg-secondary">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.date} · {doc.size}
                          {doc.amount && ` · ${doc.amount}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Download size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Communication & Scheduling Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Communication Panel */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Communication</h3>
            </div>

            <Card className="border-border">
              <CardContent className="p-4 space-y-4">
                {/* Messages */}
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${!msg.isTeam ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback
                          className={
                            msg.isTeam
                              ? "bg-primary text-primary-foreground text-xs"
                              : "bg-secondary text-foreground text-xs"
                          }
                        >
                          {msg.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[75%] ${!msg.isTeam ? "text-right" : ""}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            msg.isTeam
                              ? "bg-secondary text-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Message Input */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Paperclip size={14} className="mr-2" />
                        Attach File
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload size={14} className="mr-2" />
                        Upload Screenshot
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RotateCcw size={14} className="mr-2" />
                        Request Revision
                      </Button>
                      <Button size="sm">
                        <Send size={14} className="mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Call Scheduling */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Schedule a Call</h3>
            </div>

            <Card className="border-border">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar size={28} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Book a Meeting</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule a call with your project manager to discuss progress or provide feedback.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" variant="default">
                    <Phone size={16} className="mr-2" />
                    Onboarding Call
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MessageSquare size={16} className="mr-2" />
                    Project Review
                  </Button>
                  <Button className="w-full" variant="outline">
                    <RotateCcw size={16} className="mr-2" />
                    Revision Discussion
                  </Button>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">Your Project Manager</p>
                  <div className="flex items-center justify-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">SC</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">Available Mon-Fri, 9AM-5PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
