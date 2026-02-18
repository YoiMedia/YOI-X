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
                <div className="font-primary">
                    <h1 className="text-4xl font-black text-secondary tracking-tight">Work Submissions</h1>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mt-1">Review and manage project deliverables.</p>
                </div>

                <div className="flex items-center gap-3 font-secondary">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" size={16} />
                        <input
                            type="text"
                            placeholder="Filter deliverables..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-border-accent rounded-2xl text-[11px] font-bold text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all shadow-sm placeholder:text-text-secondary/20"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-card-bg border border-border-accent rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-text-secondary shadow-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all cursor-pointer"
                    >
                        <option value="all">Global Pipeline</option>
                        <option value="pending">Review Process</option>
                        <option value="approved">Asset Released</option>
                        <option value="rejected">Declined</option>
                        <option value="changes-requested">Revision Loop</option>
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
        pending: { color: "bg-amber-100 text-amber-700", icon: <Clock size={12} />, label: "Pending Brief" },
        approved: { color: "bg-success/10 text-success", icon: <CheckCircle2 size={12} />, label: "Validated" },
        rejected: { color: "bg-error/10 text-error", icon: <AlertCircle size={12} />, label: "Refused" },
        "changes-requested": { color: "bg-primary/10 text-primary", icon: <RotateCcw size={12} />, label: "Awaiting Fix" },
    };

    const config = statusConfig[submission.status] || statusConfig.pending;

    return (
        <div
            onClick={onClick}
            className="group bg-card-bg rounded-[2rem] border border-border-accent p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden relative font-secondary"
        >
            <div className="absolute top-0 left-0 w-2 h-full bg-alt-bg group-hover:bg-primary transition-colors" />

            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 ${config.color}`}>
                        {config.icon}
                        {config.label}
                    </span>
                    <span className="text-[10px] font-black text-text-secondary/30 uppercase tracking-widest">{submission.submissionNumber}</span>
                </div>

                <div>
                    <h3 className="text-xl font-black text-secondary tracking-tight group-hover:text-primary transition-colors font-primary">{submission.title}</h3>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary bg-alt-bg/50 px-3 py-1 rounded-xl border border-border-accent/10">
                            <Briefcase size={12} className="text-primary" />
                            <span className="text-secondary">{submission.requirementName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary/50">
                            <Calendar size={12} />
                            {new Date(submission.submissionDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t border-border-accent/10 md:border-t-0 pt-4 md:pt-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-header-bg flex items-center justify-center text-primary border border-primary/10">
                        <User size={18} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-[0.2em] leading-none">Submitted By</p>
                        <p className="text-xs font-black text-secondary mt-1.5 uppercase tracking-tight">{submission.submitterName}</p>
                    </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-alt-bg/30 flex items-center justify-center text-text-secondary/20 group-hover:bg-primary group-hover:text-white group-hover:translate-x-1 transition-all">
                    <ArrowRight size={18} />
                </div>
            </div>
        </div>
    );
}
