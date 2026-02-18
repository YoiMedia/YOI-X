import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    ChevronLeft,
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
    UserCircle2
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
    const [reviewing, setReviewing] = useState(false);
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

        setReviewing(true);
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
                // Redirect to feedback page as per user request
                setTimeout(() => navigate(`/feedback?submissionId=${id}`), 1000);
            } else {
                navigate("/submissions");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to process review");
        } finally {
            setReviewing(false);
        }
    };

    if (!submission) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/submissions")}
                    className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                >
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{submission.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{submission.submissionNumber}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${submission.status === "approved" ? "bg-green-100 text-green-700" :
                            submission.status === "rejected" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                            }`}>
                            {submission.status.replace("-", " ")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Details Card */}
                    <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={16} className="text-blue-500" />
                                Submission Content
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description / Summary</h4>
                                <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                                    {submission.description || "No description provided."}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Deliverables</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {submission.deliverables?.map((key, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">Document #{idx + 1}</p>
                                                    <p className="text-[10px] font-medium text-slate-400">Deliverable</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(key)}
                                                disabled={downloading === key}
                                                className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-50"
                                            >
                                                {downloading === key ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                            </button>
                                        </div>
                                    ))}
                                    {(!submission.deliverables || submission.deliverables.length === 0) && (
                                        <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-2">
                                            <AlertCircle size={24} className="text-slate-300" />
                                            <p className="text-xs font-bold text-slate-400">No external deliverables attached.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Log / History (Optional) */}
                    {submission.requestedChanges && submission.requestedChanges.length > 0 && (
                        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-blue-50/30">
                                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                    <RotateCcw size={16} className="text-blue-600" />
                                    Review Requirements
                                </h3>
                            </div>
                            <div className="p-8 space-y-4">
                                {submission.requestedChanges.map((change) => (
                                    <div key={change.id} className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${change.completed ? 'bg-green-500 border-green-500 text-white' : 'border-blue-300 text-blue-500'}`}>
                                            {change.completed ? <Check size={12} /> : <div className="w-1 h-1 bg-current rounded-full" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${change.completed ? 'text-blue-900/50 line-through' : 'text-blue-900'}`}>{change.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Quick Stats Card */}
                    <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                {submission.submitter?.profileImage ? (
                                    <img src={submission.submitter.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle2 size={32} className="text-slate-300" />
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted By</p>
                                <p className="text-sm font-black text-slate-900 mt-0.5">{submission.submitter?.fullName}</p>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">{submission.submitter?.role}</p>
                            </div>
                        </div>

                        <div className="space-y-4">

                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><ArrowRight size={14} /> Requirement</p>
                                <p className="text-xs font-black text-slate-700 truncate max-w-[120px]">{submission.requirement?.requirementName}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Calendar size={14} /> Date</p>
                                <p className="text-xs font-black text-slate-700">{new Date(submission.submissionDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Review Section (For Client) */}
                    {canReview && (
                        <div className="bg-slate-900 rounded-4xl shadow-xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight">Review Work</h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">Provide feedback or approve the deliverables.</p>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    rows={4}
                                    placeholder="Add internal notes or feedback for the team..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none font-medium"
                                />

                                {/* Changes Requested Section */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Requested Changes (Optional)</p>
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="What needs fixing?"
                                            value={newChange}
                                            onChange={(e) => setNewChange(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddChange()}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleAddChange}
                                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {changes.map(c => (
                                            <div key={c.id} className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                                                <span className="text-[11px] font-medium text-white/90">{c.description}</span>
                                                <button onClick={() => removeChange(c.id)} className="text-white/20 hover:text-red-400">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleReview("approved")}
                                    disabled={reviewing}
                                    className="col-span-2 bg-green-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:bg-green-400 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Approve Work
                                </button>
                                <button
                                    onClick={() => handleReview("changes-requested")}
                                    disabled={reviewing}
                                    className="bg-white/5 text-blue-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                                >
                                    Request Changes
                                </button>
                                <button
                                    onClick={() => handleReview("rejected")}
                                    disabled={reviewing}
                                    className="bg-white/5 text-red-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                                >
                                    Reject All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Review Result (Post-Review) */}
                    {submission.status !== "pending" && submission.status !== "under-review" && (
                        <div className={`rounded-4xl p-8 space-y-4 border ${submission.status === "approved" ? "bg-green-50/50 border-green-100" :
                            submission.status === "rejected" ? "bg-red-50/50 border-red-100" :
                                "bg-blue-50/50 border-blue-100"
                            }`}>
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                {submission.status === "approved" ? <CheckCircle2 size={24} className="text-green-500" /> :
                                    submission.status === "rejected" ? <XCircle size={24} className="text-red-500" /> :
                                        <RotateCcw size={24} className="text-blue-500" />}
                                Review Result
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Notes</p>
                                    <p className="text-sm font-medium text-slate-700 mt-2 bg-white/80 p-4 rounded-2xl border border-white/50">{submission.reviewNotes || "No detailed notes provided."}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                                        <UserCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 leading-none">Reviewed By</p>
                                        <p className="text-xs font-bold text-slate-900 mt-1">{submission.reviewer?.fullName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
