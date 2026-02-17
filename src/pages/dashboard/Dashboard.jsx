import { Users, UserPlus, Activity, Database, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
    { label: "Total Users", value: "1,284", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Sessions", value: "42", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
    { label: "System Health", value: "99.9%", icon: Database, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Security Events", value: "0", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
];

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live</span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* View Users Placeholder */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                            View and manage all system users, their roles, and access permissions.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/users")}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                    >
                        View All Users
                    </button>
                </div>

                {/* Add User Placeholder */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <UserPlus size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                            Provision new accounts for Admins, Employees, Sales, or Clients.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/users/add")}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                    >
                        Provision Account
                    </button>
                </div>
            </div>
        </div>
    );
}
