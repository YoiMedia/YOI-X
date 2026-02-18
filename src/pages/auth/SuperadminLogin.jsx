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
        <div className="min-h-screen bg-main-bg flex items-center justify-center p-4 font-secondary">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/20 mb-4 animate-bounce">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-secondary font-primary tracking-tight">Yoi Media</h1>
                    <p className="text-text-secondary mt-2 font-bold uppercase tracking-widest text-xs">Superadmin Control Center</p>
                </div>

                {/* Login Card */}
                <div className="bg-card-bg rounded-3xl shadow-xl shadow-border-accent/40 p-8 border border-border-accent">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary ml-1">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-alt-bg border border-border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                    placeholder="admin@yoimedia.fun"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-secondary ml-1">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-alt-bg border border-border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                "Authorize Access"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border-accent text-center">
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                            Enterprise Grade Security • 256-bit Encryption
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-text-secondary text-[10px] mt-8 font-bold uppercase tracking-widest">
                    © 2026 Yoi Media System Management
                </p>
            </div>
        </div>
    );
}
