import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    ArrowLeft,
    Calendar,
    FileText,
    Download,
    CheckCircle2,
    XCircle,
    RotateCcw,
    MessageSquare,
    AlertCircle,
    ArrowRight,
    Loader2,
    Plus,
    Trash2,
    Check,
    Briefcase,
    UserCircle2,
    ExternalLink,
    Building2,
    ClipboardList,
    Globe
} from "lucide-react";
import toast from "react-hot-toast";

export default function SubmissionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = getUser();

    const submission = useQuery(api.submissions.getSubmissionById, { submissionId: id });
    const reviewSubmission = useMutation(api.submissions.reviewSubmission);
    const getFileUrl = useAction(api.files.getFileUrl);

    const [reviewNotes, setReviewNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(null);
    const [changes, setChanges] = useState([]); // { description }
    const [newChange, setNewChange] = useState("");

    const isClient = currentUser.role === "client";
    const isSuper = currentUser.role === "superadmin";
    const canReview = (isClient || isSuper) && (submission?.status === "pending" || submission?.status === "under-review");

    const handleDownload = async (storageKey) => {
        setDownloading(storageKey);
        try {
            const url = await getFileUrl({ storageKey });
            window.open(url, '_blank');
        } catch (error) {
            console.error(error);
            toast.error("Failed to get download link");
        } finally {
            setDownloading(null);
        }
    };

    const handleAddChange = () => {
        if (!newChange.trim()) return;
        setChanges([...changes, { id: Math.random().toString(36).substring(7), description: newChange }]);
        setNewChange("");
    };

    const removeChange = (id) => {
        setChanges(changes.filter(c => c.id !== id));
    };

    const handleReview = async (status) => {
        if (!reviewNotes.trim() && status !== "approved") {
            toast.error("Please provide review notes for feedback");
            return;
        }

        if (status === "changes-requested" && changes.length === 0) {
            toast.error("Please list the changes you'd like to see");
            return;
        }

        setLoading(true);
        try {
            await reviewSubmission({
                submissionId: id,
                status,
                reviewNotes,
                requestedChanges: status === "changes-requested" ? changes : undefined,
                reviewedBy: currentUser.id
            });

            toast.success(`Submission ${status.replace("-", " ")}`);

            if (status === "approved") {
                setTimeout(() => navigate(`/feedback?submissionId=${id}`), 1000);
            } else {
                navigate("/submissions");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to process review");
        } finally {
            setLoading(false);
        }
    };

    if (!submission) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32 fade-in font-secondary">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/submissions")}
                        className="p-3 rounded-2xl bg-card-bg border border-border-accent text-text-secondary hover:bg-alt-bg transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-secondary tracking-tight font-primary">{submission.title}</h1>
                        <p className="text-text-secondary font-black uppercase tracking-widest text-[10px] mt-1">Ref: {submission._id.toString().slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] border shadow-sm ${submission.status === 'approved' ? 'bg-success/5 border-success/20 text-success' :
                        submission.status === 'rejected' ? 'bg-error/5 border-error/20 text-error' :
                            submission.status === 'changes-requested' ? 'bg-primary/5 border-primary/20 text-primary' :
                                'bg-alt-bg border-border-accent text-text-secondary'
                        }`}>
                        {submission.status.replace('-', ' ')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card-bg border border-border-accent p-8 rounded-[2.5rem] shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-xl font-black text-secondary uppercase tracking-widest font-primary">Submission Assets</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-alt-bg/30 p-8 rounded-4xl border border-border-accent/10">
                                <h4 className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest mb-3">Executive Summary</h4>
                                <p className="text-secondary font-bold leading-relaxed whitespace-pre-wrap">{submission.description || "No description provided."}</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Digital Deliverables</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {submission.deliverables?.map((key, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-card-bg rounded-2xl border border-border-accent hover:border-primary/20 transition-all group shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-header-bg rounded-xl text-text-secondary/40 group-hover:text-primary transition-colors">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-secondary truncate tracking-tight uppercase">Part #{idx + 1}</p>
                                                    <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">Asset</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(key)}
                                                disabled={downloading === key}
                                                className="p-2.5 bg-alt-bg text-text-secondary/40 rounded-xl hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
                                            >
                                                {downloading === key ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                            </button>
                                        </div>
                                    ))}
                                    {(!submission.deliverables || submission.deliverables.length === 0) && (
                                        <div className="col-span-full py-12 text-center bg-alt-bg/30 rounded-4xl border-2 border-dashed border-border-accent/40 flex flex-col items-center gap-3">
                                            <AlertCircle size={32} className="text-text-secondary/20" />
                                            <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">No external assets attached.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Log / History */}
                    {submission.requestedChanges && submission.requestedChanges.length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                                    <RotateCcw size={20} />
                                </div>
                                <h2 className="text-xl font-black text-secondary uppercase tracking-widest font-primary">Strategic Sync Requirements</h2>
                            </div>
                            <div className="space-y-4">
                                {submission.requestedChanges.map((change) => (
                                    <div key={change.id} className="flex items-start gap-4 p-4 bg-card-bg rounded-2xl border border-border-accent">
                                        <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${change.completed ? 'bg-success border-success text-white' : 'border-border-accent text-transparent'}`}>
                                            <Check size={14} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${change.completed ? 'text-text-secondary/40 line-through' : 'text-secondary'}`}>{change.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Review Section */}
                    {canReview && (
                        <div className="bg-secondary p-8 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 text-white/5 rotate-12">
                                <ClipboardList size={200} />
                            </div>
                            <div className="relative">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight font-primary">Technical Review</h3>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Executive Decision Pipeline</p>
                                </div>

                                <div className="space-y-6 mt-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Executive Feedback</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Provide technical analysis or strategic feedback..."
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/10 focus:ring-4 focus:ring-primary/20 outline-none transition-all resize-none font-bold"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Targeted Optimizations (Optional)</label>
                                        <div className="flex gap-3">
                                            <input
                                                placeholder="Define required adjustment..."
                                                value={newChange}
                                                onChange={(e) => setNewChange(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddChange()}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none focus:border-primary/50"
                                            />
                                            <button
                                                onClick={handleAddChange}
                                                className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {changes.map(c => (
                                                <div key={c.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 group">
                                                    <span className="text-[11px] font-bold text-white/70">{c.description}</span>
                                                    <button onClick={() => removeChange(c.id)} className="text-white/10 hover:text-error transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button
                                        onClick={() => handleReview("approved")}
                                        disabled={loading}
                                        className="col-span-2 bg-success text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-success/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={18} />
                                        Commit Release
                                    </button>
                                    <button
                                        onClick={() => handleReview("changes-requested")}
                                        disabled={loading}
                                        className="bg-white/5 text-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Request Sync
                                    </button>
                                    <button
                                        onClick={() => handleReview("rejected")}
                                        disabled={loading}
                                        className="bg-white/5 text-error py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Decline Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Post-Review Result */}
                    {submission.status !== "pending" && submission.status !== "under-review" && (
                        <div className={`rounded-4xl p-8 space-y-6 border shadow-sm ${submission.status === "approved" ? "bg-success/5 border-success/20" :
                            submission.status === "rejected" ? "bg-error/5 border-error/20" :
                                "bg-primary/5 border-primary/20"
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl text-white ${submission.status === 'approved' ? 'bg-success/90 shadow-lg shadow-success/20' :
                                    submission.status === 'rejected' ? 'bg-error/90 shadow-lg shadow-error/20' : 'bg-primary/90 shadow-lg shadow-primary/20'
                                    }`}>
                                    <ClipboardList size={20} />
                                </div>
                                <h3 className="text-xl font-black text-secondary uppercase tracking-widest font-primary">Review Verdict</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-card-bg p-6 rounded-4xl border border-border-accent/10 shadow-inner">
                                    <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest mb-2">Technical Analysis</p>
                                    <p className="text-sm font-bold text-secondary leading-relaxed">{submission.reviewNotes || "No detailed notes provided."}</p>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-alt-bg/30 rounded-2xl">
                                    <div className="w-10 h-10 bg-card-bg rounded-xl flex items-center justify-center text-primary border border-border-accent shadow-sm">
                                        <UserCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest leading-none">Reviewed By</p>
                                        <p className="text-sm font-black text-secondary mt-1 tracking-tight">{submission.reviewer?.fullName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-card-bg border border-border-accent p-6 rounded-[2.5rem] shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] font-primary flex items-center gap-2">
                            <Briefcase size={16} className="text-primary" /> Personnel Details
                        </h3>
                        <div className="flex items-center gap-4 pb-6 border-b border-border-accent/10">
                            <div className="w-14 h-14 bg-header-bg rounded-2xl flex items-center justify-center overflow-hidden border border-border-accent transition-transform hover:scale-105">
                                {submission.submitter?.profileImage ? (
                                    <img src={submission.submitter.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle2 size={36} className="text-text-secondary/20" />
                                )}
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">Release Lead</p>
                                <p className="text-sm font-black text-secondary mt-0.5 tracking-tight">{submission.submitter?.fullName}</p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">{submission.submitter?.role}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest flex items-center gap-2"><Building2 size={14} /> Origin</p>
                                <p className="text-xs font-black text-secondary truncate max-w-[120px]">{submission.requirement?.requirementName}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Commit</p>
                                <p className="text-xs font-black text-secondary">{new Date(submission.submissionDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
