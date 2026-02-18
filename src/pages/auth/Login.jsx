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
        <div className="min-h-screen bg-main-bg flex items-center justify-center p-4 font-secondary">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/20 mb-4 animate-pulse">
                        <LogIn size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-secondary font-primary tracking-tight">Yoi Media</h1>
                    <p className="text-text-secondary mt-2 font-bold uppercase tracking-widest text-xs">Employee & Staff Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-card-bg rounded-3xl shadow-xl shadow-border-accent/40 p-8 border border-border-accent">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary ml-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-alt-bg border border-border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                    placeholder="yourname@yoimedia.fun"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary ml-1">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-alt-bg border border-border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-secondary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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

                    <div className="mt-8 pt-6 border-t border-border-accent text-center">
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                            Secure Enterprise Access
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-center text-text-secondary text-[10px] font-bold uppercase tracking-widest">
                        © 2026 Yoi Media System Management
                    </p>
                    <button
                        onClick={() => navigate("/auth/login-superadmin")}
                        className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                    >
                        Superadmin Login
                    </button>
                </div>
            </div>
        </div>
    );
}
