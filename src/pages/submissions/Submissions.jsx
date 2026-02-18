import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    FileText,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    User,
    Briefcase,
    Calendar,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Submissions() {
    const currentUser = getUser();
    const navigate = useNavigate();

    console.log("Submissions Page - Current User:", currentUser);

    // In a real scenario, we might want to filter based on role.
    // If client, show only their submissions.
    // If employee, show only what they submitted.
    // If admin/superadmin, show all.
    const submissions = useQuery(api.submissions.listSubmissions, {
        userId: currentUser?.id,
        role: currentUser?.role
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredSubmissions = submissions?.filter(sub => {
        const matchesSearch =
            sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.requirementName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (!submissions) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Work Submissions</h1>
                    <p className="text-slate-500 font-medium mt-1">Review and manage deliverables.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search submissions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="changes-requested">Changes Requested</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredSubmissions.map((sub) => (
                    <SubmissionCard
                        key={sub._id}
                        submission={sub}
                        onClick={() => navigate(`/submissions/${sub._id}`)}
                    />
                ))}

                {filteredSubmissions.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No Submissions Found</h3>
                        <p className="text-slate-500">There are no work submissions matching your current filters.</p>
                        {currentUser && (
                            <p className="text-xs text-slate-400 mt-2">
                                Viewing as: <span className="font-mono">{currentUser.role}</span> ({currentUser.email})
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function SubmissionCard({ submission, onClick }) {
    const statusConfig = {
        pending: { color: "bg-amber-100 text-amber-700", icon: <Clock size={14} />, label: "Pending Review" },
        approved: { color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={14} />, label: "Approved" },
        rejected: { color: "bg-red-100 text-red-700", icon: <AlertCircle size={14} />, label: "Rejected" },
        "changes-requested": { color: "bg-blue-100 text-blue-700", icon: <RotateCcw size={14} />, label: "Changes Requested" },
    };

    const config = statusConfig[submission.status] || statusConfig.pending;

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all cursor-pointer overflow-hidden relative"
        >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-50 group-hover:bg-blue-500 transition-colors" />

            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${config.color}`}>
                        {config.icon}
                        {config.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{submission.submissionNumber}</span>
                </div>

                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{submission.title}</h3>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                            <Briefcase size={14} className="text-slate-400" />
                            <span className="text-slate-700 font-bold">{submission.requirementName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                            <Calendar size={14} />
                            {new Date(submission.submissionDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Submitted By</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">{submission.submitterName}</p>
                    </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <ArrowRight size={20} />
                </div>
            </div>
        </div>
    );
}
