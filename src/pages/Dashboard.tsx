import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SalesDashboard } from "@/components/dashboard/SalesDashboard";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { FreelancerDashboard } from "@/components/dashboard/FreelancerDashboard";
import { useAuth } from "@/contexts/AuthContext";

const dashboardComponents: Record<string, React.FC> = {
  admin: AdminDashboard,
  sales: SalesDashboard,
  employee: EmployeeDashboard,
  client: ClientDashboard,
  freelancer: FreelancerDashboard,
};

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <LoadingScreen />;
  }
  
  const DashboardComponent = dashboardComponents[user.role] || AdminDashboard;

  return (
    <AppLayout title={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`}>
      <div className="space-y-6">
        <DashboardComponent />
      </div>
    </AppLayout>
  );
}
