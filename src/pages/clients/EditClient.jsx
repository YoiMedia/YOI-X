import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Building2, User, MapPin, Globe, AlertCircle, CheckCircle2, Mail } from "lucide-react";

export default function EditClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const clientData = useQuery(api.clients.getClientById, { clientId: id });
    const updateClient = useMutation(api.clients.updateClient);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (clientData) {
            setFormData({
                companyName: clientData.companyName,
                industry: clientData.industry || "",
                status: clientData.status,
                fullName: clientData.user?.fullName || "",
                email: clientData.user?.email || "",
                phone: clientData.user?.phone || "",
                website: clientData.user?.website || "",
                address: clientData.user?.address || {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                }
            });
        }
    }, [clientData]);

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
            await updateClient({
                clientId: id,
                ...formData
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message || "Failed to update client");
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <div className="p-20 text-center text-slate-400">Loading client data...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium group"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-sans">Edit Client Profile</h1>
                        <p className="text-slate-500 mt-1">Update information for {formData.companyName}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Client ID</span>
                        <span className="text-lg font-mono font-bold text-blue-600">{clientData?.uniqueClientId}</span>
                    </div>
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
                            <p className="text-sm font-medium">Changes saved successfully!</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-2">
                            <Building2 size={18} />
                            <span>Business details</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Company Name</label>
                                <input
                                    required
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Industry</label>
                                <input
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Website</label>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        required
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="prospect">Prospect</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="churned">Churned</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-2">
                            <User size={18} />
                            <span>Primary contact</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Full Name</label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Phone</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-600 font-bold border-b border-slate-100 pb-2">
                            <MapPin size={18} />
                            <span>Location</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-slate-700">Street</label>
                                <input
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">City</label>
                                <input
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">State</label>
                                <input
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold font-sans shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? "Saving..." : "Update Client Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
