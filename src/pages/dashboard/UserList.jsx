import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    ShieldCheck,
    BadgeCheck,
    UserCog,
    Loader2,
    Plus
} from "lucide-react";

export default function UserList() {
    const navigate = useNavigate();
    const [filterRole, setFilterRole] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const users = useQuery(api.users.listUsers);

    const filteredUsers = users?.filter(user => {
        const matchesRole = filterRole === "all" || user.role === filterRole;
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case "superadmin":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-error/10 text-error border border-error/20 uppercase tracking-widest">
                        <ShieldCheck size={12} className="mr-1" />
                        Superadmin
                    </span>
                );
            case "admin":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-secondary text-white border border-secondary uppercase tracking-widest">
                        <ShieldCheck size={12} className="mr-1" />
                        Admin
                    </span>
                );
            case "sales":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                        <BadgeCheck size={12} className="mr-1" />
                        Sales
                    </span>
                );
            case "employee":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                        <UserCog size={12} className="mr-1" />
                        Employee
                    </span>
                );
            default:
                return role;
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight font-primary">System Users</h1>
                    <p className="text-text-secondary mt-1 font-bold uppercase tracking-widest text-xs">Manage and monitor your organization's members.</p>
                </div>
                <button
                    onClick={() => navigate("/users/add")}
                    className="flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98] shrink-0"
                >
                    <Plus size={20} className="mr-2" />
                    Add New User
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-card-bg p-4 rounded-3xl border border-border-accent shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full font-secondary">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-accent bg-alt-bg/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-secondary placeholder:text-text-secondary/40"
                    />
                </div>
                <div className="flex items-center gap-2 p-1 bg-alt-bg rounded-2xl border border-border-accent w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {["all", "superadmin", "admin", "sales", "employee"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${filterRole === role
                                ? "bg-card-bg text-primary shadow-sm ring-1 ring-border-accent"
                                : "text-text-secondary hover:text-secondary hover:bg-card-bg"
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* User List / Table */}
            <div className="bg-card-bg rounded-3xl border border-border-accent shadow-sm overflow-hidden font-secondary">
                {!users ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="text-primary animate-spin" size={40} />
                        <p className="text-text-secondary font-black uppercase tracking-widest text-xs">Synchronizing Records...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                        <div className="w-20 h-20 bg-alt-bg rounded-full flex items-center justify-center text-text-secondary/30 mb-4">
                            <Users size={40} />
                        </div>
                        <h3 className="text-lg font-black text-secondary font-primary">No users found</h3>
                        <p className="text-text-secondary max-w-xs mt-1 font-bold uppercase tracking-widest text-[10px]">We couldn't find any users matching your current filters or search criteria.</p>
                        <button
                            onClick={() => { setFilterRole("all"); setSearchQuery(""); }}
                            className="mt-6 text-primary font-black uppercase tracking-widest text-xs hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-alt-bg/50 border-b border-border-accent">
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-accent/30">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-alt-bg/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-alt-bg rounded-2xl flex items-center justify-center text-secondary font-black shadow-sm ring-1 ring-border-accent">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-base font-black text-secondary leading-tight font-primary">{user.fullName}</div>
                                                    <div className="text-[11px] font-bold text-text-secondary mt-0.5 uppercase tracking-wider">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center text-sm font-medium text-slate-600">
                                                    <Mail size={14} className="mr-2 text-slate-300" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center text-sm font-medium text-slate-600">
                                                    <Phone size={14} className="mr-2 text-slate-300" />
                                                    {user.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-text-secondary/40 hover:text-primary hover:bg-alt-bg rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            {users && filteredUsers.length > 0 && (
                <div className="flex items-center justify-between text-sm font-bold text-text-secondary bg-alt-bg/30 p-6 rounded-3xl border border-border-accent">
                    <span className="uppercase tracking-widest text-[10px] font-black">Showing {filteredUsers.length} of {users.length} System Users</span>
                    <button className="text-primary hover:text-primary-dark transition-colors uppercase tracking-widest text-[10px] font-black">Export Records</button>
                </div>
            )}
        </div>
    );
}
