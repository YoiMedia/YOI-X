import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { login } from "../../services/auth.service";
import toast, { Toaster } from "react-hot-toast";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const verifyLogin = useAction(api.users.verifyLogin);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await verifyLogin({ email, password });

            if (user) {
                login(user); // user already has safe details (id, name, email, role, phone)
                toast.success(`Welcome back, ${user.name || user.fullName}!`);
                window.location.href = "/";
            }
        } catch (error) {
            toast.error(error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4 animate-pulse">
                        <LogIn size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">FlowX</h1>
                    <p className="text-slate-500 mt-2 font-medium">Employee & Staff Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                                    placeholder="yourname@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                "Sign In to Workspace"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                            Secure Enterprise Access
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-center text-slate-400 text-xs">
                        © 2025 FlowX System Management
                    </p>
                    <button
                        onClick={() => navigate("/auth/login-superadmin")}
                        className="text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
                    >
                        Superadmin Login
                    </button>
                </div>
            </div>
        </div>
    );
}
