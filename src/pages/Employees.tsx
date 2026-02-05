import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone } from "lucide-react";

const employees = [
  { id: 1, name: "John Doe", role: "CEO", department: "Executive", email: "john@company.com", phone: "+1 555-0101", status: "active" },
  { id: 2, name: "Sarah Chen", role: "Sales Manager", department: "Sales", email: "sarah@company.com", phone: "+1 555-0102", status: "active" },
  { id: 3, name: "Mike Johnson", role: "Account Executive", department: "Sales", email: "mike@company.com", phone: "+1 555-0103", status: "active" },
  { id: 4, name: "Emily Davis", role: "Operations Lead", department: "Operations", email: "emily@company.com", phone: "+1 555-0104", status: "active" },
  { id: 5, name: "Alex Rivera", role: "Product Designer", department: "Design", email: "alex@company.com", phone: "+1 555-0105", status: "away" },
  { id: 6, name: "Jordan Lee", role: "Developer", department: "Engineering", email: "jordan@company.com", phone: "+1 555-0106", status: "active" },
];

const statusColors = {
  active: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-gray-400",
};

export default function Employees() {
  return (
    <AppLayout title="Employees">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employees..." className="pl-9" />
          </div>
          <Button>
            <Plus size={16} className="mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Card key={employee.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employee.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                        statusColors[employee.status]
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {employee.department}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={14} />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone size={14} />
                    <span>{employee.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
