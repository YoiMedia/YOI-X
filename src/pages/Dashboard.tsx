import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleSwitcher, UserRole } from "@/components/dashboard/RoleSwitcher";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SalesDashboard } from "@/components/dashboard/SalesDashboard";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

const dashboardComponents: Record<UserRole, React.FC> = {
  admin: AdminDashboard,
  sales: SalesDashboard,
  employee: EmployeeDashboard,
  client: ClientDashboard,
};

export default function Dashboard() {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  
  const DashboardComponent = dashboardComponents[currentRole];

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <RoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} />
        <DashboardComponent />
      </div>
    </AppLayout>
  );
}
