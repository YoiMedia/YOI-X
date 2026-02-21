import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "../../services/auth.service";
import { UserPlus, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Mail, User, Check, Globe, Target, Layers, Share2, MessageSquare } from "lucide-react";
import { SERVICE_TYPES } from "../../constants/servicePackages";

const SERVICE_ICONS = {
    "website-dev": Globe,
    "google-meta-ads": Target,
    "google-meta-combo": Layers,
    "social-media": Share2,
    "whatsapp-chatbot": MessageSquare,
};


export default function AddClient() {
    const navigate = useNavigate();
    const location = useLocation();
    const createClient = useAction(api.users.createClient);
    const linkLeadToClient = useMutation(api.leads.linkLeadToClient);
    const currentUser = getUser();

    const leadId = location.state?.leadId;
    const prefillData = location.state?.prefill;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
    });

    const [pitchedServices, setPitchedServices] = useState(location.state?.pitchedServices || []);


    useEffect(() => {
        if (prefillData) {
            setFormData(prev => ({
                ...prev,
                fullName: prefillData.fullName || prefillData.contactPerson || "",
                email: prefillData.email || "",
            }));
        }
    }, [prefillData]);

    const toggleService = (serviceId) => {
        setPitchedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

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
            const clientId = await createClient({
                fullName: formData.fullName,
                email: formData.email,
                salesPersonId: currentUser.id,
            });

            if (leadId) {
                await linkLeadToClient({
                    leadId,
                    clientId,
                    userId: currentUser.id,
                    pitchedServices: pitchedServices
                });
            }


            setSuccess(true);
            setTimeout(() => navigate("/clients"), 2000);
        } catch (err) {
            setError(err.message || "Failed to create client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 font-accent selection:bg-primary/20 selection:text-secondary">
            <div className="flex items-center justify-between px-2">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-primary transition-all font-black uppercase tracking-[0.2em] text-[10px] group bg-white px-5 py-3 rounded-xl border border-border-accent shadow-sm hover:shadow-md"
                >
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Directory
                </button>
            </div>

            <div className="bg-white rounded-[2.75rem] border border-border-accent shadow-2xl shadow-secondary/5 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

                <div className="p-12 border-b border-alt-bg bg-main-bg/30 relative">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center shadow-xl shadow-secondary/10 group hover:scale-105 transition-transform duration-500">
                            <UserPlus size={28} className="text-primary group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-secondary font-primary tracking-tighter leading-none">Register Client</h1>
                            <p className="text-primary font-black uppercase tracking-[0.25em] text-[9px] mt-3">
                                Onboarding & Intelligence Initialization
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-10">
                    {error && (
                        <div className="flex items-center p-5 bg-red-50 text-red-700 rounded-[1.25rem] border border-red-100 animate-in zoom-in-95 duration-300">
                            <AlertCircle size={20} className="mr-4 shrink-0" />
                            <p className="text-sm font-black uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center p-5 bg-green-50 text-green-700 rounded-[1.25rem] border border-green-100 animate-in zoom-in-95 duration-300">
                            <CheckCircle2 size={20} className="mr-4 shrink-0" />
                            <p className="text-sm font-black uppercase tracking-tight">
                                Authentication Ready. magic link deployed to client.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User size={14} className="text-primary" /> Full Legal Name
                            </label>
                            <div className="relative group">
                                <input
                                    required
                                    name="fullName"
                                    placeholder="e.g. Alexander Pierce"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-main-bg/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail size={14} className="text-primary" /> Verified Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    placeholder="client@yoimedia.fun"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-main-bg/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Layers size={14} className="text-primary" /> Services & Packages Pitched
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SERVICE_TYPES.map((service) => {
                                    const Icon = SERVICE_ICONS[service.id] || Globe;
                                    const isSelected = pitchedServices.includes(service.id);
                                    return (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => toggleService(service.id)}
                                            className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${isSelected ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border-accent hover:border-primary/30 hover:bg-main-bg/50"}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-primary text-white" : "bg-main-bg text-text-secondary group-hover:text-primary"}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-xs font-black uppercase tracking-tight ${isSelected ? "text-secondary" : "text-text-secondary group-hover:text-secondary"} transition-colors`}>{service.label}</div>
                                                <div className="text-[10px] text-text-secondary/60 font-bold leading-tight mt-1 line-clamp-2">{service.description}</div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>


                    {/* Meta box */}
                    <div className="p-6 bg-header-bg/50 rounded-[1.5rem] border border-primary/10 text-[11px] text-text-secondary font-bold leading-relaxed flex gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                            <Mail size={18} className="text-primary" />
                        </div>
                        <p className="mt-1">
                            An encrypted invitation will be dispatched. Upon initialization, the client will authorize their session and finalize company parameters.
                        </p>
                    </div>

                    <div className="pt-8 border-t border-alt-bg">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-5 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span>Deploy System Invite</span>
                                    <CheckCircle2 size={18} className="group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="text-center">
                <p className="text-[10px] font-black text-text-secondary/30 uppercase tracking-[0.3em]">
                    SECURE CLIENT ONBOARDING PORTAL v2.0
                </p>
            </div>
        </div>
    );
}
