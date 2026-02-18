import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, User, Phone, Globe, ChevronRight, Search, Mail } from "lucide-react";
import { useState } from "react";

export default function ClientList() {
    const navigate = useNavigate();
    const currentUser = getUser();
    const [searchTerm, setSearchTerm] = useState("");

    // If Admin/Superadmin, list all. If Sales (Freelancer), list only theirs.
    const isSales = currentUser?.role === "sales";
    const isAdminOrSuper = currentUser?.role === "admin" || currentUser?.role === "superadmin";
    const clients = useQuery(api.clients.listClients, isAdminOrSuper ? {} : { salesPersonId: currentUser?.id });

    const filteredClients = clients?.filter(c =>
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-secondary font-primary tracking-tight">Client Directory</h1>
                    <p className="text-text-secondary font-bold uppercase tracking-widest text-xs mt-1">Manage and view your portfolio of clients.</p>
                </div>

                {isSales && (
                    <button
                        onClick={() => navigate("/clients/add")}
                        className="bg-primary text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={18} />
                        Add Client
                    </button>
                )}
            </div>

            <div className="relative font-secondary">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                <input
                    type="text"
                    placeholder="Search by company or contact name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-accent bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-secondary text-sm placeholder:text-text-secondary/30"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!clients && (
                    <div className="col-span-full py-20 text-center text-slate-400">Loading clients...</div>
                )}

                {clients && filteredClients?.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400">No clients found matching your search.</div>
                )}

                {filteredClients?.map((client) => (
                    <div
                        key={client._id}
                        className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group"
                        onClick={() => navigate(`/clients/edit/${client._id}`)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-header-bg rounded-2xl flex items-center justify-center text-primary">
                                <Building2 size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${client.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                                client.status === 'lead' ? 'bg-primary/10 text-primary border-primary/20' :
                                    'bg-alt-bg text-text-secondary border-border-accent'
                                }`}>
                                {client.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-black text-secondary mb-1 group-hover:text-primary transition-colors font-primary">
                            {client.companyName}
                        </h3>
                        <p className="text-text-secondary/60 text-[10px] font-bold uppercase tracking-widest mb-4">{client.uniqueClientId}</p>

                        <div className="space-y-3 pt-4 border-t border-border-accent/30 font-secondary">
                            <div className="flex items-center gap-3 text-sm text-secondary font-bold">
                                <User size={16} className="text-text-secondary/40" />
                                {client.user?.fullName}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
                                <Phone size={16} className="text-text-secondary/40" />
                                {client.user?.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
                                <Mail size={16} className="text-text-secondary/40" />
                                {client.user?.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-primary font-bold">
                                <Globe size={16} />
                                <span className="truncate">{client.user?.website}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end text-text-secondary/30 group-hover:text-primary transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest mr-1">View Details</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
