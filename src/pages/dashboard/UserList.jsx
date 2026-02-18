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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">
                        <ShieldCheck size={12} className="mr-1" />
                        Superadmin
                    </span>
                );
            case "admin":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                        <ShieldCheck size={12} className="mr-1" />
                        Admin
                    </span>
                );
            case "sales":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                        <BadgeCheck size={12} className="mr-1" />
                        Sales
                    </span>
                );
            case "employee":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
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
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Users</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and monitor your organization's members.</p>
                </div>
                <button
                    onClick={() => navigate("/users/add")}
                    className="flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 shrink-0"
                >
                    <Plus size={20} className="mr-2" />
                    Add New User
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {["all", "superadmin", "admin", "sales", "employee"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-wider ${filterRole === role
                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:text-slate-800 hover:bg-white"
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* User List / Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {!users ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="text-blue-600 animate-spin" size={40} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Records...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Users size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No users found</h3>
                        <p className="text-slate-500 max-w-xs mt-1">We couldn't find any users matching your current filters or search criteria.</p>
                        <button
                            onClick={() => { setFilterRole("all"); setSearchQuery(""); }}
                            className="mt-6 text-blue-600 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-bold shadow-sm ring-1 ring-white">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-slate-900 leading-tight">{user.fullName}</div>
                                                    <div className="text-sm font-medium text-slate-500 mt-0.5">@{user.username}</div>
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
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all opacity-0 group-hover:opacity-100">
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
                <div className="flex items-center justify-between text-sm font-bold text-slate-500 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <span className="uppercase tracking-widest text-xs">Showing {filteredUsers.length} of {users.length} System Users</span>
                    <button className="text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest text-xs">Export Records</button>
                </div>
            )}
        </div>
    );
}
