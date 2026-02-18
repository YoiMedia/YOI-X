import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../services/auth.service";
import { UserPlus, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Building2, Globe, MapPin } from "lucide-react";

export default function AddClient() {
    const navigate = useNavigate();
    const createClient = useAction(api.users.createClient);
    const currentUser = getUser();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        companyName: "",
        industry: "",
        website: "",
        status: "lead",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await createClient({
                ...formData,
                salesPersonId: currentUser.id,
            });
            setSuccess(true);
            setTimeout(() => navigate("/clients"), 2000);
        } catch (err) {
            setError(err.message || "Failed to create client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-secondary transition-colors font-black uppercase tracking-widest text-[10px] group"
                >
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Directory
                </button>
            </div>

            <div className="bg-card-bg rounded-3xl border border-border-accent shadow-sm overflow-hidden font-secondary">
                <div className="p-8 border-b border-border-accent bg-alt-bg/50">
                    <h1 className="text-3xl font-black text-secondary font-primary tracking-tight">Add New Client</h1>
                    <p className="text-text-secondary mt-1 font-bold uppercase tracking-widest text-[10px]">Create a new client profile linked to your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && (
                        <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
                            <AlertCircle size={20} className="mr-3 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100">
                            <CheckCircle2 size={20} className="mr-3 shrink-0" />
                            <p className="text-sm font-medium">Client created successfully!</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-border-accent/30 pb-2">
                            <Building2 size={18} />
                            <span>Company Details</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Company Name *</label>
                                <input
                                    required
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Industry</label>
                                <input
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Website *</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        required
                                        name="website"
                                        placeholder="https://example.com"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="prospect">Prospect</option>
                                    <option value="active">Active</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-border-accent/30 pb-2">
                            <UserPlus size={18} />
                            <span>Primary Contact Detail</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Contact Person *</label>
                                <input
                                    required
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Username *</label>
                                <input
                                    required
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Email Address *</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-secondary uppercase tracking-widest ml-1">Phone *</label>
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs border-b border-border-accent/30 pb-2">
                            <MapPin size={18} />
                            <span>Location Information</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-slate-700">Street</label>
                                <input
                                    required
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">City</label>
                                <input
                                    required
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">State</label>
                                <input
                                    required
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Zip Code</label>
                                <input
                                    required
                                    name="address.zipCode"
                                    value={formData.address.zipCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Country</label>
                                <input
                                    required
                                    name="address.country"
                                    value={formData.address.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border-accent flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:bg-primary-dark hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Save Client Portfolio
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
