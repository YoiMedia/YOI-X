import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";
import { login } from "../../services/auth.service";
import toast, { Toaster } from "react-hot-toast";

export default function SuperadminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Artificial delay for feel
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Hardcoded credentials for superadmin
            if (email === "superadmin@flowx.com" && password === "flowx@2025") {
                const superadminUser = {
                    id: "superadmin-root",
                    name: "Primary Superadmin",
                    email: "superadmin@flowx.com",
                    role: "superadmin",
                    phone: "N/A"
                };
                login(superadminUser);
                toast.success("Welcome back, Master Admin!");
                window.location.href = "/";
            } else {
                toast.error("Invalid Master Key or Email");
            }
        } catch (error) {
            toast.error("Portal access failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200 mb-4 animate-bounce">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">FlowX</h1>
                    <p className="text-slate-500 mt-2 font-medium">Superadmin Control Center</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                                    placeholder="admin@flowx.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                "Authorize Access"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            Enterprise Grade Security • 256-bit Encryption
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-400 text-xs mt-8">
                    © 2025 FlowX System Management
                </p>
            </div>
        </div>
    );
}
