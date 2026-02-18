import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    Star,
    Send,
    MessageSquare,
    CheckCircle2,
    ArrowRight,
    Trophy,
    Heart,
    ThumbsUp,
    Sparkles,
    Layout
} from "lucide-react";
import toast from "react-hot-toast";

export default function FeedbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentUser = getUser();

    const submissionId = searchParams.get("submissionId");


    const createFeedback = useMutation(api.feedbacks.createFeedback);


    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please provide a rating");
            return;
        }

        setSubmitting(true);
        try {
            await createFeedback({

                submissionId: submissionId || undefined,
                clientId: currentUser.clientId,
                authorId: currentUser.id,
                rating,
                comment,
                sentiment: rating >= 4 ? "positive" : (rating >= 2 ? "neutral" : "negative")
            });
            setSubmitted(true);
            toast.success("Thank you for your feedback!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit feedback");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100/50">
                    <Trophy size={48} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">You're Amazing!</h1>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto mb-10">
                    Thank you for your valuable feedback. Your input helps us deliver better work and grow as a team.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate("/requirements")}
                        className="p-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                    >
                        View Requirements
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pt-10 pb-32">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                    <Sparkles size={14} />
                    Share Your Experience
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Service Feedback</h1>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                <form onSubmit={handleSubmit} className="relative space-y-12">
                    {/* Rating Selection */}
                    <div className="text-center space-y-6">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Rate the service</p>
                        <div className="flex items-center justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="relative group focus:outline-none transition-transform active:scale-90"
                                >
                                    <Star
                                        size={48}
                                        className={`transition-all duration-300 ${(hover || rating) >= star
                                            ? "fill-amber-400 text-amber-400 drop-shadow-lg"
                                            : "text-slate-200 group-hover:text-amber-200"
                                            }`}
                                    />
                                    {(hover || rating) === star && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                                            {star === 1 ? "Poor" : star === 2 ? "Fair" : star === 3 ? "Good" : star === 4 ? "Great" : "Excellent"}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Emoji Reaction */}
                    <div className="flex justify-center gap-8 py-4 opacity-50 bg-slate-50/50 rounded-3xl border border-slate-100">
                        <div className={`flex flex-col items-center gap-2 transition-all ${rating === 5 ? "opacity-100 scale-110 text-pink-500" : ""}`}>
                            <Heart size={24} fill={rating === 5 ? "currentColor" : "none"} />
                            <span className="text-[10px] font-bold">Love it</span>
                        </div>
                        <div className={`flex flex-col items-center gap-2 transition-all ${rating === 4 ? "opacity-100 scale-110 text-green-500" : ""}`}>
                            <ThumbsUp size={24} fill={rating === 4 ? "currentColor" : "none"} />
                            <span className="text-[10px] font-bold">Great</span>
                        </div>
                        <div className={`flex flex-col items-center gap-2 transition-all ${rating === 3 ? "opacity-100 scale-110 text-blue-500" : ""}`}>
                            <CheckCircle2 size={24} />
                            <span className="text-[10px] font-bold">Solid</span>
                        </div>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Optional Comments</label>
                            <span className="text-[10px] font-bold text-slate-300">{comment.length}/500</span>
                        </div>
                        <div className="relative group">
                            <MessageSquare className="absolute left-6 top-6 text-slate-300" size={20} />
                            <textarea
                                rows={6}
                                maxLength={500}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What stood out to you? Any suggestions for us?"
                                className="w-full pl-16 pr-8 py-6 bg-slate-50 border-transparent rounded-4xl text-sm font-medium focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none shadow-inner"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="w-full py-6 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-4xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                    >
                        {submitting ? "Sending..." : "Submit Review"}
                        <Send size={18} />
                    </button>
                </form>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-10">
                    Your feedback will be shared with the team
                </p>
            </div>
        </div>
    );
}
