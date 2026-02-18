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
                    <h1 className="text-2xl font-bold text-slate-900 font-sans">Client Directory</h1>
                    <p className="text-slate-500">Manage and view your portfolio of clients.</p>
                </div>

                {isSales && (
                    <button
                        onClick={() => navigate("/clients/add")}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                        <Plus size={20} />
                        Add Client
                    </button>
                )}
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by company or contact name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
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
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Building2 size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${client.status === 'active' ? 'bg-green-50 text-green-700' :
                                client.status === 'lead' ? 'bg-orange-50 text-orange-700' :
                                    'bg-slate-50 text-slate-700'
                                }`}>
                                {client.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {client.companyName}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">{client.uniqueClientId}</p>

                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                <User size={16} className="text-slate-400" />
                                {client.user?.fullName}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone size={16} className="text-slate-400" />
                                {client.user?.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail size={16} className="text-slate-400" />
                                {client.user?.email}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-blue-500 font-medium">
                                <Globe size={16} />
                                <span className="truncate">{client.user?.website}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end text-slate-300 group-hover:text-blue-500 transition-colors">
                            <span className="text-xs font-bold mr-1">View Details</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
