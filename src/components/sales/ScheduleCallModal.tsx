import { useState } from "react";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ScheduleCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (data: CallScheduleData) => void;
}

export interface CallScheduleData {
  date: Date;
  timeSlot: string;
  employees: number[];
  notes: string;
}

const morningSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const afternoonSlots = ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"];
const eveningSlots = ["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"];

const employees = [
  { id: 1, name: "Sarah Johnson" },
  { id: 2, name: "Mike Thompson" },
  { id: 3, name: "Emily Chen" },
  { id: 4, name: "David Wilson" },
  { id: 5, name: "Lisa Anderson" },
];

export function ScheduleCallModal({ open, onOpenChange, onConfirm }: ScheduleCallModalProps) {
  const { toast } = useToast();
  const [callDate, setCallDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setCallDate(undefined);
    setSelectedTimeSlot("");
    setSelectedEmployees([]);
    setNotes("");
  };

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleConfirm = () => {
    if (callDate && selectedTimeSlot) {
      const data: CallScheduleData = {
        date: callDate,
        timeSlot: selectedTimeSlot,
        employees: selectedEmployees,
        notes,
      };
      
      if (onConfirm) {
        onConfirm(data);
      }
      
      onOpenChange(false);
      toast({
        title: "Call scheduled successfully",
        description: `Call scheduled for ${format(callDate, "MMM d")} at ${selectedTimeSlot}`,
      });
      resetForm();
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const TimeSlotSection = ({ title, slots }: { title: string; slots: string[] }) => (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <Button
            key={slot}
            variant={selectedTimeSlot === slot ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setSelectedTimeSlot(slot)}
          >
            {slot}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Schedule Onboarding Call
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Calendar Grid */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon size={16} />
              Select Date
            </Label>
            <div className="flex justify-center border rounded-lg p-2 bg-secondary/20">
              <Calendar
                mode="single"
                selected={callDate}
                onSelect={setCallDate}
                className="pointer-events-auto"
                disabled={(date) => date < new Date()}
              />
            </div>
            {callDate && (
              <p className="text-sm text-center text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{format(callDate, "EEEE, MMMM d, yyyy")}</span>
              </p>
            )}
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-4">
            <Label>Select Time Slot</Label>
            <TimeSlotSection title="Morning" slots={morningSlots} />
            <TimeSlotSection title="Afternoon" slots={afternoonSlots} />
            <TimeSlotSection title="Evening" slots={eveningSlots} />
          </div>

          {/* Invite Employees Multi-select */}
          <div className="space-y-2">
            <Label>Invite Employees</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-secondary/30">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                    selectedEmployees.includes(employee.id)
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-secondary border border-transparent"
                  )}
                  onClick={() => toggleEmployee(employee.id)}
                >
                  <Checkbox checked={selectedEmployees.includes(employee.id)} />
                  <span className="text-sm">{employee.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or agenda for the call..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!callDate || !selectedTimeSlot}>
            Confirm Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
