import React, { useState, useEffect } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

const ClientLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Email check, 2: Password or Magic Link
    const [clientInfo, setClientInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);

    const navigate = useNavigate();
    const checkAccess = useQuery(api.auth.checkClientAccess, { email });
    const requestMagicLink = useAction(api.auth.requestMagicLink);
    const verifyLogin = useAction(api.users.verifyLogin);
    const clearPassword = useMutation(api.users.clearUserPassword);

    const handleEmailNext = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setIsLoading(true);
        try {
            if (checkAccess) {
                if (!checkAccess.exists || !checkAccess.isClient) {
                    toast.error("Account not found. Please contact support.");
                } else {
                    setClientInfo(checkAccess);
                    setStep(2);
                }
            } else {
                toast.error("Checking access... Please wait a moment.");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        if (!password) return toast.error("Please enter your password");

        setIsLoading(true);
        try {
            const user = await verifyLogin({ email, password });
            login(user);
            toast.success(`Welcome back, ${user.name}!`);
            window.location.href = "/";
        } catch (error) {
            toast.error(error.message || "Invalid password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLinkRequest = async () => {
        setIsLoading(true);
        try {
            await requestMagicLink({ email });
            setIsMagicLinkSent(true);
            toast.success("Magic link sent to your email!");
        } catch (error) {
            toast.error(error.message || "Failed to send link");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!window.confirm("Are you sure you want to reset your password? This will delete your current password and you will need to use a Magic Link to log in.")) return;

        setIsLoading(true);
        try {
            await clearPassword({ email });
            toast.success("Password cleared! Sending magic link...");
            await handleMagicLinkRequest();
        } catch (error) {
            toast.error(error.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full pl-14 pr-6 bg-transparent focus:outline-none text-sm font-bold placeholder:text-text-secondary/30";
    const labelClass = "text-[11px] font-black text-text-secondary uppercase tracking-widest ml-1 mb-2.5 block";

    return (
        <div className="min-h-screen bg-main-bg flex items-center justify-center p-6 font-accent selection:bg-primary/20 selection:text-secondary">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                {/* Logo / Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-4xl shadow-2xl shadow-secondary/10 mb-6 group hover:scale-105 transition-transform duration-500">
                        <ShieldCheck size={36} className="text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                    <h1 className="text-5xl font-black text-secondary font-primary tracking-tighter leading-none">FlowX</h1>
                    <p className="text-primary mt-3 font-black uppercase tracking-[0.25em] text-[10px]">Premium Client Portal</p>
                </div>

                <div className="bg-white rounded-4xl shadow-2xl shadow-secondary/5 p-10 border border-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-primary" />

                    {isMagicLinkSent ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/5">
                                <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
                            </div>
                            <h2 className="text-3xl font-black text-secondary tracking-tight font-primary mb-4 leading-tight">Check Your Inbox</h2>
                            <p className="text-text-secondary text-sm font-medium leading-relaxed mb-10">
                                We've sent a secure authentication link to <span className="text-secondary font-black">{email}</span>.
                                <br />The link expires in 15 minutes.
                            </p>
                            <button
                                onClick={() => setStep(1) || setIsMagicLinkSent(false)}
                                className="text-primary hover:text-primary-dark text-xs font-black uppercase tracking-widest transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={step === 1 ? handleEmailNext : handlePasswordLogin} className="space-y-8 relative z-10">
                            {step === 1 ? (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Registered Email Address</label>
                                        <div className="relative group">
                                            <div className="relative flex items-center justify-center w-full py-4 bg-main-bg/30 border border-border-accent rounded-3xl focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary transition-all">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary/30 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="name@company.com"
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-3xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs group"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <>
                                                Continue Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-5 p-5 bg-header-bg/40 rounded-3xl border border-primary/5">
                                        <div className="w-12 h-12 rounded-3xl bg-secondary flex items-center justify-center text-primary font-black shadow-lg shadow-secondary/10">
                                            {clientInfo?.fullName?.charAt(0) || 'C'}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1.5">Authorized User</p>
                                            <p className="text-secondary font-black truncate leading-none">{clientInfo?.fullName}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-[10px] p-2 hover:bg-white rounded-lg font-black text-primary uppercase tracking-widest transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    {clientInfo?.hasPassword ? (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className={labelClass}>Portal Password</label>
                                                    <div className="flex items-center gap-4 mb-2.5">
                                                        <button type="button" onClick={handleResetPassword} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Reset Password</button>
                                                        <button type="button" onClick={handleMagicLinkRequest} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Use Link Instead?</button>
                                                    </div>
                                                </div>
                                                <div className="relative group">
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary/30 group-focus-within:text-primary transition-colors" size={20} />
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className={inputClass}
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs"
                                            >
                                                {isLoading ? "Authenticating..." : "Enter Workspace"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="p-6 bg-header-bg border border-primary/10 rounded-[2rem] text-center relative overflow-hidden">
                                                <Sparkles className="absolute -top-2 -right-2 text-primary/10" size={60} />
                                                <p className="text-sm text-secondary font-bold leading-relaxed relative z-10">
                                                    First time here? We'll send you a <span className="text-primary font-black">secure link</span> to access your dashboard instantly.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleMagicLinkRequest}
                                                disabled={isLoading}
                                                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                            >
                                                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Mail size={18} />}
                                                {isLoading ? "Sending Link..." : "Send Authentication Link"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-center text-text-secondary/40 text-[10px] font-black uppercase tracking-[0.2em]">
                        © 2026 Yoi Media Group Intelligence
                    </p>
                    <button
                        onClick={() => navigate("/landing")}
                        className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60 hover:text-primary transition-colors flex items-center gap-2"
                    >
                        Back to Welcome Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientLogin;
