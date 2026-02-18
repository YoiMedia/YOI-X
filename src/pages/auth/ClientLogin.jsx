import React, { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiArrowRight, FiCheckCircle } from "react-icons/fi";

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

    const handleEmailNext = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setIsLoading(true);
        try {
            // checkAccess is a query, so it's reactive. But we want to trigger a transition.
            // We can use the result from the query directly if it's already fetched, 
            // or wait for it.
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

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-outfit">
            <div className="w-full max-w-md">
                {/* Logo / Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-500 mb-4 border border-blue-500/30">
                        <FiLock className="text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Connect to FlowX</h1>
                    <p className="text-slate-400">Premium Client Portal Access</p>
                </div>

                <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                    {/* Subtle glow effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full group-hover:bg-blue-600/20 transition-all duration-500"></div>

                    {isMagicLinkSent ? (
                        <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiCheckCircle className="text-4xl" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-4">Check Your Email</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                We've sent a secure login link to <span className="text-blue-400 font-medium">{email}</span>.
                                It will expire in 15 minutes.
                            </p>
                            <button
                                onClick={() => setStep(1) || setIsMagicLinkSent(false)}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={step === 1 ? handleEmailNext : handlePasswordLogin} className="space-y-6 relative z-10">
                            {step === 1 ? (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                        <div className="relative">
                                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Continue <FiArrowRight />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-4 p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                                            {clientInfo?.fullName?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Logging in as</p>
                                            <p className="text-white font-medium">{clientInfo?.fullName}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="ml-auto text-xs text-blue-400 hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>

                                    {clientInfo?.hasPassword ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all"
                                            >
                                                {isLoading ? "Signing in..." : "Login"}
                                            </button>
                                            <div className="relative py-2">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/5"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-[#1e293b] px-2 text-slate-500">Or use magic link</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleMagicLinkRequest}
                                                disabled={isLoading}
                                                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-3 rounded-xl border border-white/5 transition-all"
                                            >
                                                Send Email Link
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                                <p className="text-sm text-amber-200 leading-relaxed text-center">
                                                    Welcome to FlowX! You don't have a password set yet.
                                                    We'll send you a magic link to get started securely.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleMagicLinkRequest}
                                                disabled={isLoading}
                                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all"
                                            >
                                                {isLoading ? "Sending..." : "Send Magic Link"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    Protected by enterprise-grade encryption.
                </p>
            </div>
        </div>
    );
};

export default ClientLogin;
