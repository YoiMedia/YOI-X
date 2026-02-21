import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import toast from "react-hot-toast";
import {
    User, Phone, Building2, Globe, MapPin,
    Loader2, CheckCircle2, ArrowRight, Sparkles
} from "lucide-react";

export default function CompleteProfileModal() {
    const updateUser = useMutation(api.clients.completeClientProfile);
    const currentUser = getUser();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        phone: "",
        companyName: "",
        industry: "",
        website: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!formData.phone) {
            toast.error("Phone number is required");
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.companyName) {
            toast.error("Company name is required");
            return;
        }

        setLoading(true);
        try {
            await updateUser({
                userId: currentUser.id,
                phone: formData.phone,
                companyName: formData.companyName,
                industry: formData.industry || undefined,
                website: formData.website || undefined,
                address: (formData.address.city && formData.address.country)
                    ? formData.address
                    : undefined,
            });

            toast.success("Profile completed! Welcome aboard.");
            window.location.reload();
        } catch (err) {
            toast.error(err.message || "Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3.5 rounded-2xl border border-border-accent bg-main-bg/30 text-text-main placeholder:text-text-secondary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-sm";
    const labelClass = "block text-[11px] font-black text-text-secondary uppercase tracking-[0.15em] mb-2 px-1";

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-secondary/80 backdrop-blur-md p-6">
            <div className="w-full max-w-xl animate-in zoom-in-95 duration-300">
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white relative">
                    {/* Progress Indicator Dots */}
                    <div className="absolute top-8 right-10 flex gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === 1 ? "bg-primary w-6" : "bg-primary/20"}`} />
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === 2 ? "bg-primary w-6" : "bg-primary/20"}`} />
                    </div>

                    {/* Left Brand Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />

                    {/* Header */}
                    <div className="px-10 pt-12 pb-8 border-b border-main-bg bg-header-bg/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-xl shadow-secondary/10">
                                <Sparkles size={22} className="text-primary" fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1.5">
                                    Account Verification
                                </p>
                                <h2 className="text-3xl font-black text-secondary tracking-tighter leading-none font-primary">
                                    {step === 1
                                        ? `Welcome, ${currentUser?.name?.split(' ')[0] || "Partner"} 👋`
                                        : "About your company"}
                                </h2>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-sm">
                            {step === 1
                                ? "Before we unlock your portal, we need a few final details to secure your account."
                                : "Help us personalize your experience by providing some basic company information."}
                        </p>
                    </div>

                    {/* Step 1: Contact info */}
                    {step === 1 && (
                        <form onSubmit={handleNext} className="px-10 py-10 space-y-8">
                            <div>
                                <label className={labelClass}>
                                    <Phone size={12} className="inline mr-2" /> Personal Contact Number *
                                </label>
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 555 000 0000"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                                <p className="text-[10px] text-text-secondary/60 mt-2 px-1 font-bold">
                                    We'll use this for important project updates and verification.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-[1.25rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                Next Step <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    )}

                    {/* Step 2: Company details */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="px-10 py-10 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        <Building2 size={12} className="inline mr-2" /> Registered Company Name *
                                    </label>
                                    <input
                                        required
                                        name="companyName"
                                        placeholder="e.g. Acme Creative Agency"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Industry Sector</label>
                                    <input
                                        name="industry"
                                        placeholder="e.g. Media, SaaS"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        <Globe size={12} className="inline mr-2" /> Website URL
                                    </label>
                                    <input
                                        name="website"
                                        type="url"
                                        placeholder="https://yoimedia.fun"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <MapPin size={12} /> Headquarter Address <span className="normal-case font-bold text-text-secondary/40">(Optional)</span>
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <input
                                            name="address.street"
                                            placeholder="Street and Number"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />
                                    </div>
                                    <input name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} className={inputClass} />
                                    <input name="address.state" placeholder="State" value={formData.address.state} onChange={handleChange} className={inputClass} />
                                    <input name="address.zipCode" placeholder="ZIP" value={formData.address.zipCode} onChange={handleChange} className={inputClass} />
                                    <input name="address.country" placeholder="Country" value={formData.address.country} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-4 rounded-2xl bg-main-bg text-secondary border border-border-accent hover:bg-border-accent text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} fill="currentColor" />}
                                    {loading ? "Finalizing..." : "Initialize Dashboard"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
