import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, Clock, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";

const timeSlots = [
  { id: 1, time: "9:00 AM", available: true },
  { id: 2, time: "10:00 AM", available: true },
  { id: 3, time: "11:00 AM", available: false },
  { id: 4, time: "1:00 PM", available: true },
  { id: 5, time: "2:00 PM", available: true },
  { id: 6, time: "3:00 PM", available: true },
  { id: 7, time: "4:00 PM", available: false },
];

const employees = [
  { id: 1, name: "Sarah Chen", role: "Project Manager" },
  { id: 2, name: "Mike Johnson", role: "Account Executive" },
  { id: 3, name: "Emily Davis", role: "Designer" },
  { id: 4, name: "Alex Rivera", role: "Developer" },
  { id: 5, name: "Jordan Lee", role: "QA Engineer" },
];

const weekDays = [
  { day: "Mon", date: 10, month: "Feb" },
  { day: "Tue", date: 11, month: "Feb" },
  { day: "Wed", date: 12, month: "Feb" },
  { day: "Thu", date: 13, month: "Feb" },
  { day: "Fri", date: 14, month: "Feb" },
];

export default function OnboardingCall() {
  const [selectedDate, setSelectedDate] = useState<number | null>(12);
  const [selectedTime, setSelectedTime] = useState<string | null>("10:00 AM");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([1, 2]);
  const [notes, setNotes] = useState("");

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout title="Schedule Onboarding Call">
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/calendar">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Schedule Onboarding Call</h2>
            <p className="text-sm text-muted-foreground">Set up a kickoff meeting with the client</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar View */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">February 2025</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          selectedDate === day.date
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        <p className="text-xs font-medium">{day.day}</p>
                        <p className="text-lg font-semibold">{day.date}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">Available Time Slots</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === slot.time
                            ? "bg-primary text-primary-foreground"
                            : slot.available
                            ? "bg-secondary hover:bg-secondary/80 text-foreground"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        <Clock size={14} className="inline mr-1" />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Meeting Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add agenda items, discussion points, or any preparation notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Employees */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Invite Employees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEmployees.includes(employee.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                    onClick={() => toggleEmployee(employee.id)}
                  >
                    <Checkbox checked={selectedEmployees.includes(employee.id)} />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Summary & Action */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Meeting Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {selectedDate ? `Feb ${selectedDate}, 2025` : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{selectedTime || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attendees</span>
                    <span className="font-medium text-foreground">{selectedEmployees.length} invited</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedEmployees.map((id) => {
                    const emp = employees.find((e) => e.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {emp?.name}
                      </Badge>
                    );
                  })}
                </div>

                <Button className="w-full">
                  <Send size={16} className="mr-2" />
                  Send Invites
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
