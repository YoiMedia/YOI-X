import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TasksList } from "@/components/dashboard/TasksList";
import { Users, Handshake, FileText, DollarSign } from "lucide-react";

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clients"
            value="248"
            change="+12% from last month"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Active Deals"
            value="32"
            change="+4 new this week"
            changeType="positive"
            icon={Handshake}
          />
          <StatsCard
            title="Proposals Sent"
            value="18"
            change="5 pending response"
            changeType="neutral"
            icon={FileText}
          />
          <StatsCard
            title="Revenue (MTD)"
            value="$124,500"
            change="+8.2% vs target"
            changeType="positive"
            icon={DollarSign}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <TasksList />
        </div>
      </div>
    </AppLayout>
  );
}
