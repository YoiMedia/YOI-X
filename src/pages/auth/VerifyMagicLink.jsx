import React, { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../../services/auth.service";
import toast from "react-hot-toast";
import { FiLock, FiShield, FiAlertTriangle, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

const VerifyMagicLink = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const verification = useQuery(api.auth.verifyMagicLinkToken, token ? { token } : "skip");
    const setClientPassword = useAction(api.auth.setClientPassword);

    const handleSetPassword = async (e) => {
        e.preventDefault();
        if (password.length < 8) return toast.error("Password must be at least 8 characters");
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        setIsLoading(true);
        try {
            const user = await setClientPassword({ token, password });
            setIsSuccess(true);

            // Delay login slightly to show success state
            setTimeout(() => {
                login(user);
                toast.success("Password set successfully! Redirecting...");
                window.location.href = "/";
            }, 2000);
        } catch (error) {
            toast.error(error.message || "Failed to set password");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <div className="bg-[#1e293b] p-8 rounded-3xl border border-white/5 text-center max-w-sm">
                    <FiAlertTriangle className="text-amber-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Missing Token</h2>
                    <p className="text-slate-400 mb-6">The verification link is invalid or incomplete.</p>
                    <button onClick={() => navigate("/auth/client-login")} className="text-blue-500 hover:underline">Go to Login</button>
                </div>
            </div>
        );
    }

    if (verification === undefined) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 animate-pulse">Verifying your secure link...</p>
                </div>
            </div>
        );
    }

    // Don't show error if we already succeeded (prevents flickers during state transitions)
    if (!verification.valid && !isSuccess) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-outfit">
                <div className="bg-[#1e293b] p-8 rounded-3xl border border-white/5 text-center max-w-md shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiAlertTriangle className="text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Link {verification.reason === "expired" ? "Expired" : "Invalid"}
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {verification.reason === "expired"
                            ? "For security, magic links expire after 15 minutes. Please request a new one."
                            : "This link is no longer valid or has already been used."}
                    </p>
                    <button
                        onClick={() => navigate("/auth/client-login")}
                        className="w-full bg-blue-600 hover:bg-blue-50 text-white font-semibold py-4 rounded-xl transition-all"
                    >
                        Request New Link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-outfit">
            <div className="w-full max-w-md">
                <div className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                    {/* Success Overlay */}
                    {isSuccess && (
                        <div className="absolute inset-0 bg-[#1e293b] z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 scale-up animate-in zoom-in duration-500">
                                <FiCheckCircle className="text-5xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">All Set!</h2>
                            <p className="text-slate-400">Your secure password has been saved. Logging you in...</p>
                        </div>
                    )}

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center">
                                <FiShield className="text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Security Setup</h2>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Step 2 of 2</p>
                            </div>
                        </div>

                        <h3 className="text-2xl font-semibold text-white mb-2">Hello, {verification.fullName}</h3>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            To complete your account setup, please create a secure password for future logins.
                        </p>

                        <form onSubmit={handleSetPassword} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="At least 8 characters"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono"
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat password"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? "Saving..." : "Set Password & Finish"}
                                </button>
                                <div className="flex items-start gap-3 p-4 bg-[#0f172a] rounded-2xl border border-white/5">
                                    <FiShield className="text-blue-500 mt-1 shrink-0" />
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        By setting a password, you'll be able to log in directly next time without needing an email link.
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyMagicLink;
