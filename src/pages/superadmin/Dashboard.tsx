import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LogOut, ShieldCheck, UserPlus, UsersIcon } from "lucide-react";

export default function SuperadminDashboard() {
  const navigate = useNavigate();
  const superadminId = localStorage.getItem("yoi_superadminId") as Id<"superadmins"> | null;
  const superadmin = useQuery(api.superadmins.getById, superadminId ? { id: superadminId } : "skip");

  const handleLogout = () => {
    localStorage.removeItem("yoi_superadminId");
    navigate("/superadmin/login");
  };

  if (superadminId && superadmin === undefined) return <div className="p-8 text-center text-slate-500">Loading control panel...</div>;
  if (!superadminId || (superadmin === null)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600 font-medium">Unauthorized Access</p>
        <Button onClick={() => navigate("/superadmin/login")} className="bg-slate-900">Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Superadmin Control Panel</h1>
              <p className="text-slate-500 font-medium">Logged in as <span className="text-slate-900">{superadmin?.username}</span></p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-fit flex items-center gap-2 border-slate-300 hover:bg-slate-100 transition-colors">
            <LogOut size={18} /> Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate("/superadmin/create-account")}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserPlus size={20} />
              </div>
              <CardTitle className="text-lg font-bold">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">Provision new accounts for admins, staff, and freelancers.</p>
              <Button variant="link" className="p-0 text-emerald-600 hover:text-emerald-700 font-semibold">Start Creation →</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate("/superadmin/users")}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UsersIcon size={20} />
              </div>
              <CardTitle className="text-lg font-bold">Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">View and filter all administrative, staff, and freelancer accounts.</p>
              <Button variant="link" className="p-0 text-blue-600 hover:text-blue-700 font-semibold">View Users →</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
