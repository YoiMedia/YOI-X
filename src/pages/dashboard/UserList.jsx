import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../services/auth.service";
import toast from "react-hot-toast";
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
    Plus,
    KeyRound,
    X,
    ShieldAlert
} from "lucide-react";

export default function UserList() {
    const navigate = useNavigate();
    const currentUser = getUser();
    const isSuperadmin = currentUser?.role === "superadmin";

    const [filterRole, setFilterRole] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [resettingUser, setResettingUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    const users = useQuery(api.users.listUsers);
    const resetPassword = useAction(api.users.resetUserPassword);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 4) {
            return toast.error("Password must be at least 4 characters.");
        }

        setIsResetting(true);
        try {
            await resetPassword({
                superadminId: currentUser.id,
                targetUserId: resettingUser._id,
                newPassword: newPassword
            });
            toast.success(`Password reset successfully for ${resettingUser.fullName}`);
            setResettingUser(null);
            setNewPassword("");
        } catch (error) {
            toast.error(error.message || "Failed to reset password");
        } finally {
            setIsResetting(false);
        }
    };

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
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isSuperadmin && user.role !== "superadmin" && (
                                                    <button
                                                        onClick={() => setResettingUser(user)}
                                                        className="p-2 text-text-secondary/40 hover:text-primary hover:bg-alt-bg rounded-xl transition-all"
                                                        title="Reset Password"
                                                    >
                                                        <KeyRound size={18} />
                                                    </button>
                                                )}
                                                <button className="p-2 text-text-secondary/40 hover:text-primary hover:bg-alt-bg rounded-xl transition-all">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Password Reset Modal */}
            {resettingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-4xl shadow-2xl border border-border-accent overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-alt-bg/50 px-8 py-6 border-b border-border-accent flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <KeyRound size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-secondary font-primary leading-none">Reset Password</h3>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Force Access Credential Update</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setResettingUser(null)}
                                className="p-2 hover:bg-white rounded-xl text-text-secondary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="p-8 space-y-6">
                            <div className="bg-header-bg/50 p-4 rounded-2xl border border-primary/5 flex items-center gap-4">
                                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary font-black shadow-sm">
                                    {resettingUser.fullName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Target User</p>
                                    <p className="text-sm font-black text-secondary">{resettingUser.fullName}</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-center p-4 bg-error/5 rounded-2xl border border-error/10">
                                <ShieldAlert size={24} className="text-error mx-auto opacity-50" />
                                <p className="text-[11px] font-bold text-error/80 leading-relaxed uppercase tracking-wider">
                                    This will immediately overwrite the existing password. The user will need this new credential for their next login.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">New System Password</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/30" size={18} />
                                    <input
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new strong password"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-sm text-secondary"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setResettingUser(null)}
                                    className="flex-1 py-4 rounded-2xl border border-border-accent text-[10px] font-black text-text-secondary uppercase tracking-widest hover:bg-alt-bg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isResetting}
                                    className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                                >
                                    {isResetting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>Confirm Reset</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
