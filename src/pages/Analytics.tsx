import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, BarChart3, ArrowUpRight, ArrowDownRight, Award, Zap, Smile } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Analytics() {
  const stats = [
    { title: "Deal Conversion", value: "68%", icon: TrendingUp, change: "+5.2%", positive: true },
    { title: "Client Satisfaction", value: "4.9/5", icon: Smile, change: "+0.3", positive: true },
    { title: "Performance Score", value: "94", icon: Award, change: "-2", positive: false },
    { title: "Target Achievement", value: "82%", icon: Target, change: "+12.5%", positive: true },
  ];

  return (
    <AppLayout title="Analytics & Performance">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-border bg-white shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                    <stat.icon size={20} />
                  </div>
                  <Badge variant="outline" className={stat.positive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}>
                    {stat.positive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Pipeline Momentum
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discovery Calls</span>
                    <span className="font-bold">12/15</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Proposal Acceptance</span>
                    <span className="font-bold">8/10</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Contract Signing</span>
                    <span className="font-bold">4/6</span>
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary rotate-12">
              <Zap size={140} />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Award size={20} className="text-primary" />
                Performance Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Top Performer Q3", date: "Sep 2025", icon: Award },
                  { title: "100% Client Retention", date: "Aug 2025", icon: Smile },
                  { title: "Revenue Target Crushed", date: "Jul 2025", icon: TrendingUp },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <m.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
