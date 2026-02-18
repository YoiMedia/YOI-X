import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AddUser() {
    const navigate = useNavigate();
    const createUser = useAction(api.users.createUser);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        alternatePhone: "",
        role: "employee",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const data = { ...formData };
            if (!data.alternatePhone) delete data.alternatePhone;
            data.phone = formData.phone.replace(/[^0-9]/g, "");

            await createUser(data);
            setSuccess(true);
            setTimeout(() => navigate("/users"), 2000);
        } catch (err) {
            setError(err.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-secondary transition-colors font-bold uppercase tracking-widest text-[10px] group"
                >
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
                <div className="flex items-center space-x-2 bg-header-bg text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <UserPlus size={12} />
                    <span>System Administration</span>
                </div>
            </div>

            <div className="bg-card-bg rounded-3xl border border-border-accent shadow-sm overflow-hidden font-secondary">
                <div className="p-8 border-b border-border-accent bg-alt-bg/50">
                    <h1 className="text-2xl font-black text-secondary font-primary">Create New User</h1>
                    <p className="text-text-secondary mt-1 font-bold uppercase tracking-widest text-[10px]">Provision a new account for system access.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Status Messages */}
                    {error && (
                        <div className="flex items-center p-4 bg-error/10 text-error rounded-2xl border border-error/20 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle size={20} className="mr-3 shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center p-4 bg-success/10 text-success rounded-2xl border border-success/20 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 size={20} className="mr-3 shrink-0" />
                            <p className="text-sm font-bold">User created successfully! Redirecting...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                required
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/30 font-bold text-secondary text-sm"
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Username</label>
                            <input
                                required
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                className="w-full px-4 py-3 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/30 font-bold text-secondary text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/30 font-bold text-secondary text-sm"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Account Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-border-accent focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all bg-alt-bg/30 appearance-none cursor-pointer font-bold text-secondary text-sm"
                            >
                                <option value="admin">Admin</option>
                                <option value="sales">Sales</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                                className="w-full px-4 py-3 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/30 font-bold text-secondary text-sm"
                            />
                        </div>

                        {/* Alternate Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Alt. Phone (Optional)</label>
                            <input
                                name="alternatePhone"
                                value={formData.alternatePhone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Initial Password</label>
                            <input
                                required
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-secondary/30 font-bold text-secondary text-sm"
                            />
                            <p className="text-[10px] text-text-secondary ml-1 italic font-bold uppercase tracking-widest">Please set a secure password for the new user.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border-accent flex flex-col sm:flex-row gap-3">
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="flex-1 bg-primary text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="mr-2 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create System User"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                            className="px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs text-text-secondary border border-border-accent hover:bg-alt-bg transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
