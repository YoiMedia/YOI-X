import { Users, UserPlus, Activity, Database, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
    { label: "Total Users", value: "1,284", icon: Users, color: "text-primary", bg: "bg-header-bg" },
    { label: "Active Sessions", value: "42", icon: Activity, color: "text-success", bg: "bg-success/10" },
    { label: "System Health", value: "99.9%", icon: Database, color: "text-secondary", bg: "bg-alt-bg" },
    { label: "Security Events", value: "0", icon: Shield, color: "text-error", bg: "bg-error/10" },
];

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-card-bg p-6 rounded-2xl border border-border-accent shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest bg-alt-bg px-2 py-0.5 rounded">Live</span>
                        </div>
                        <h3 className="text-text-secondary text-sm font-bold">{stat.label}</h3>
                        <p className="text-2xl font-black text-secondary mt-1 font-primary">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* View Users Placeholder */}
                <div className="bg-card-bg p-8 rounded-3xl border border-border-accent shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 bg-header-bg text-primary rounded-full flex items-center justify-center">
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-secondary font-primary">User Management</h2>
                        <p className="text-text-secondary text-sm max-w-xs mx-auto mt-2 font-medium">
                            View and manage all system users, their roles, and access permissions.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/users")}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        View All Users
                    </button>
                </div>

                {/* Add User Placeholder */}
                <div className="bg-card-bg p-8 rounded-3xl border border-border-accent shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                    <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center">
                        <UserPlus size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-secondary font-primary">Create New User</h2>
                        <p className="text-text-secondary text-sm max-w-xs mx-auto mt-2 font-medium">
                            Provision new accounts for Admins, Employees, Sales, or Clients.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/users/add")}
                        className="px-6 py-2.5 bg-success text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Provision Account
                    </button>
                </div>
            </div>
        </div>
    );
}
