import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users as UsersIcon, Shield, User, Briefcase, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SuperadminUsers() {
  const navigate = useNavigate();
  const superadminId = localStorage.getItem("yoi_superadminId") as Id<"superadmins"> | null;
  const allUsers = useQuery(api.users.list, {});
  
  const [filter, setFilter] = useState<"all" | "admin" | "employee" | "freelancer">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!superadminId) {
    navigate("/superadmin/login");
    return null;
  }

  // Filter out clients and apply role filter + search
  const filteredUsers = (allUsers ?? []).filter(u => {
    if (u.role === "client") return false;
    
    const matchesFilter = filter === "all" || u.role === filter;
    const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50"><Shield size={12} className="mr-1" /> Admin</Badge>;
      case "employee": return <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50"><User size={12} className="mr-1" /> Employee</Badge>;
      case "freelancer": return <Badge className="bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-50"><Briefcase size={12} className="mr-1" /> Freelancer</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/superadmin/dashboard")}
              className="p-0 h-auto hover:bg-transparent text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-2"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg text-white">
                <UsersIcon size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Users</h1>
            </div>
            <p className="text-slate-500 font-medium ml-12">View and manage all authenticated accounts.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <Button 
              variant={filter === "all" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-slate-900" : "text-slate-600"}
            >
              All
            </Button>
            <Button 
              variant={filter === "admin" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilter("admin")}
              className={filter === "admin" ? "bg-red-600 hover:bg-red-700" : "text-slate-600 hover:text-red-600"}
            >
              Admins
            </Button>
            <Button 
              variant={filter === "employee" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilter("employee")}
              className={filter === "employee" ? "bg-blue-600 hover:bg-blue-700" : "text-slate-600 hover:text-blue-600"}
            >
              Employees
            </Button>
            <Button 
              variant={filter === "freelancer" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setFilter("freelancer")}
              className={filter === "freelancer" ? "bg-purple-600 hover:bg-purple-700" : "text-slate-600 hover:text-purple-600"}
            >
              Freelancers
            </Button>
          </div>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by name, email, or username..." 
            className="pl-10 py-6 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allUsers === undefined ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse border-slate-200 bg-white">
                <div className="h-32 bg-slate-100 rounded-t-xl" />
                <CardContent className="h-24" />
              </Card>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <UsersIcon size={48} className="mx-auto mb-4 text-slate-200" />
              <h3 className="text-lg font-semibold text-slate-900">No users found</h3>
              <p className="text-slate-500">No users match your current filter or search criteria.</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <Card key={user._id} className="border-slate-200 bg-white hover:shadow-md transition-all group overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50 group-hover:bg-white transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                      {user.role === "admin" ? <Shield size={20} className="text-red-500" /> : 
                       user.role === "employee" ? <User size={20} className="text-blue-500" /> : 
                       <Briefcase size={20} className="text-purple-500" />}
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                  <CardTitle className="text-lg font-bold mt-4 text-slate-900 truncate">
                    {user.full_name || user.username}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Username</span>
                    <span className="text-sm font-medium text-slate-700">{user.username}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Email Address</span>
                    <span className="text-sm font-medium text-slate-700 truncate">{user.email}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phone</span>
                    <span className="text-sm font-medium text-slate-700">{user.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
