import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { login } from "../../services/auth.service";
import toast from "react-hot-toast";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function SuperadminLogin() {
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
                if (user.role !== "superadmin") {
                    throw new Error("Unauthorized: Access restricted to Superadmins.");
                }
                login(user); // user already has safe details (id, name, email, role, phone)
                toast.success(`Welcome back, Master Admin!`);
                window.location.href = "/";
            }
        } catch (error) {
            toast.error(error.message || "Invalid Master Key or Email");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-14 pr-6 py-4 bg-main-bg/30 border border-border-accent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold placeholder:text-text-secondary/30";
    const labelClass = "text-[11px] font-black text-text-secondary uppercase tracking-widest ml-1 mb-2.5 block";

    return (
        <div className="min-h-screen bg-main-bg flex items-center justify-center p-6 font-accent selection:bg-primary/20 selection:text-secondary">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                {/* Logo/Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-[2.5rem] shadow-2xl shadow-secondary/10 mb-6 group hover:scale-105 transition-transform duration-500">
                        <ShieldCheck size={36} className="text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                    <h1 className="text-5xl font-black text-secondary font-primary tracking-tighter leading-none">FlowX</h1>
                    <p className="text-primary mt-3 font-black uppercase tracking-[0.25em] text-[10px]">Superadmin Command Center</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[2.75rem] shadow-2xl shadow-secondary/5 p-10 border border-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-2">
                            <label className={labelClass}>Admin Email</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                    placeholder="admin@yoimedia.fun"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClass}>Security Master Key</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Verify & Authorize</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-main-bg text-center">
                        <p className="text-[9px] text-text-secondary/50 font-black uppercase tracking-[0.3em]">
                            Enterprise Grade • 256-bit AES
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-center text-text-secondary/40 text-[10px] font-black uppercase tracking-[0.2em]">
                        © 2026 Yoi Media Group
                    </p>
                    <button
                        onClick={() => navigate("/landing")}
                        className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 hover:text-primary transition-colors"
                    >
                        Return to Public Page
                    </button>
                </div>
            </div>
        </div>
    );
}
