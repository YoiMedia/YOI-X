import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    MessageCircle,
    Send,
    X,
    CheckCircle2,
    Paperclip,
    ArrowLeft,
    User,
    Clock,
    AlertCircle,
    Lock,
    Globe,
    Plus,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function TaskQueries({ task, onClose }) {
    const currentUser = getUser();
    const queries = useQuery(api.taskQueries.getQueriesByTask, { taskId: task._id });
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [showNewQueryForm, setShowNewQueryForm] = useState(false);

    useEffect(() => {
        if (queries && queries.length === 1 && !selectedQuery) {
            setSelectedQuery(queries[0]);
        }
    }, [queries, selectedQuery]);

    return (
        <div className="fixed inset-0 bg-secondary/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-card-bg rounded-[3rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-border-accent font-secondary">
                {/* Header */}
                <div className="bg-header-bg/20 p-8 border-b border-border-accent/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            {selectedQuery ? (
                                <button
                                    onClick={() => setSelectedQuery(null)}
                                    className="w-12 h-12 rounded-2xl bg-card-bg border border-border-accent flex items-center justify-center text-text-secondary/40 hover:text-secondary transition-all hover:scale-105"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <MessageCircle size={20} />
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-black text-secondary tracking-tight font-primary uppercase tracking-widest leading-none">
                                    {selectedQuery ? selectedQuery.title : "Query Matrix"}
                                </h2>
                                <p className="text-[10px] font-black text-text-secondary/40 mt-2 uppercase tracking-[0.2em]">
                                    {selectedQuery ? `SYNC LOG #${selectedQuery.queryNumber}` : task.title}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-2xl bg-card-bg border border-transparent hover:border-border-accent flex items-center justify-center text-text-secondary/40 hover:text-secondary transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {!selectedQuery ? (
                        <QueryList
                            queries={queries}
                            onSelectQuery={setSelectedQuery}
                            showNewQueryForm={showNewQueryForm}
                            setShowNewQueryForm={setShowNewQueryForm}
                            task={task}
                            currentUser={currentUser}
                        />
                    ) : (
                        <QueryChat
                            query={selectedQuery}
                            currentUser={currentUser}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function QueryList({ queries, onSelectQuery, showNewQueryForm, setShowNewQueryForm, task, currentUser }) {
    const createQuery = useMutation(api.taskQueries.createQuery);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateQuery = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Technical title required");
            return;
        }

        setLoading(true);
        try {
            await createQuery({
                taskId: task._id,
                title,
                description,
                createdBy: currentUser.id,
            });

            toast.success("Query synchronized to matrix");
            setTitle("");
            setDescription("");
            setShowNewQueryForm(false);
        } catch (error) {
            toast.error("Synchronization failed");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!queries) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-8 space-y-6">
                {/* New Query Button */}
                {!showNewQueryForm && (
                    <button
                        onClick={() => setShowNewQueryForm(true)}
                        className="w-full bg-gradient-to-r from-primary to-orange-600 text-white p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        Raise New Synchronization Request
                    </button>
                )}

                {/* New Query Form */}
                {showNewQueryForm && (
                    <form onSubmit={handleCreateQuery} className="bg-alt-bg/30 p-8 rounded-[2.5rem] border border-border-accent space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Initialize Thread</h3>
                            <button
                                type="button"
                                onClick={() => setShowNewQueryForm(false)}
                                className="text-text-secondary/40 hover:text-secondary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest px-1">Tactical Title</label>
                                <input
                                    autoFocus
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Brief technical summary..."
                                    className="w-full px-5 py-4 bg-card-bg border border-border-accent rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all placeholder-text-secondary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary/60 uppercase tracking-widest px-1">Technical Brief</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detail the specific friction point or architectural concern..."
                                    rows={4}
                                    className="w-full px-5 py-4 bg-card-bg border border-border-accent rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none resize-none transition-all placeholder-text-secondary/20"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-secondary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-secondary/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                {loading ? "Syncing..." : "Transmit Log"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewQueryForm(false)}
                                className="px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] bg-card-bg border border-border-accent rounded-2xl hover:bg-alt-bg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Queries List */}
                {queries.length === 0 ? (
                    <div className="text-center py-20 bg-alt-bg/30 border border-border-accent/10 rounded-[3rem] animate-in fade-in duration-500">
                        <MessageCircle size={64} className="mx-auto text-text-secondary/10 mb-6" />
                        <h3 className="text-[10px] font-black text-secondary tracking-[0.2em] uppercase">No Discussion Threads</h3>
                        <p className="text-[10px] text-text-secondary/40 mt-3 font-black uppercase tracking-widest leading-relaxed px-10">
                            System is currently operating within nominal parameters. Raise a sync request if technical friction occurs.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {queries.map((query) => (
                            <div
                                key={query._id}
                                onClick={() => onSelectQuery(query)}
                                className="bg-card-bg border border-border-accent rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group animate-in slide-in-from-bottom-4 duration-300"
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${query.status === "resolved"
                                                ? "bg-success/5 text-success border border-success/20"
                                                : query.status === "active"
                                                    ? "bg-primary/5 text-primary border border-primary/20"
                                                    : "bg-amber-100/10 text-amber-500 border border-amber-500/20"
                                                }`}>
                                                {query.status}
                                            </span>
                                            <span className="text-[10px] font-black text-text-secondary/30 uppercase tracking-widest">
                                                LOG {query.queryNumber}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-black text-secondary group-hover:text-primary transition-colors leading-tight font-primary">
                                            {query.title}
                                        </h4>
                                        {query.description && (
                                            <p className="text-[11px] font-bold text-text-secondary/60 mt-2 line-clamp-2 leading-relaxed">
                                                {query.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-alt-bg flex items-center justify-center border border-border-accent">
                                                    <User size={12} className="text-text-secondary/40" />
                                                </div>
                                                <span className="text-[10px] font-black text-text-secondary/60 uppercase tracking-tight">{query.creator?.fullName}</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-border-accent/30"></div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className="text-text-secondary/40" />
                                                <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-tight">
                                                    {new Date(query.lastMessageAt || query.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {query.lastMessagePreview && (
                                            <div className="mt-5 text-[10px] text-text-secondary/40 font-bold italic bg-alt-bg/30 px-4 py-3 rounded-[1.25rem] border border-border-accent/10 line-clamp-1">
                                                "{query.lastMessagePreview}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function QueryChat({ query, currentUser }) {
    const messages = useQuery(api.taskQueries.getMessagesByQuery, { queryId: query._id });
    const sendMessage = useMutation(api.taskQueries.sendMessage);
    const updateQueryStatus = useMutation(api.taskQueries.updateQueryStatus);

    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        setSending(true);
        try {
            await sendMessage({
                queryId: query._id,
                senderId: currentUser.id,
                content: messageText,
            });
            setMessageText("");
        } catch (error) {
            toast.error("Transmission breakdown");
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (status) => {
        try {
            await updateQueryStatus({
                queryId: query._id,
                status,
                userId: currentUser.id,
            });
            toast.success(`Matrix channel status: ${status}`);
        } catch (error) {
            toast.error("Status synchronization failure");
        }
    };

    if (!messages) {
        return (
            <div className="flex items-center justify-center h-full bg-card-bg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-card-bg">
            {/* Query Info */}
            <div className="border-b border-border-accent p-8 bg-alt-bg/10 backdrop-blur-sm z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex -space-x-3">
                            {query.participants?.slice(0, 3).map((participant, i) => (
                                <div
                                    key={participant?._id || i}
                                    className="w-10 h-10 rounded-[1.25rem] bg-header-bg border-4 border-card-bg flex items-center justify-center text-text-secondary/40 text-[10px] font-black uppercase shadow-lg shadow-secondary/5"
                                    title={participant?.fullName || "Participant"}
                                >
                                    {participant?.fullName?.[0] || "?"}
                                </div>
                            ))}
                            {query.participants?.length > 3 && (
                                <div className="w-10 h-10 rounded-[1.25rem] bg-secondary border-4 border-card-bg flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-secondary/20">
                                    +{query.participants.length - 3}
                                </div>
                            )}
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] leading-tight">
                                {query.participants?.length} Secure Connections
                            </div>
                            <div className="text-text-secondary/40 text-[9px] font-black uppercase tracking-widest mt-1">
                                {query.participants?.map(p => p?.role).filter(Boolean).join(" • ")}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {query.status !== "resolved" && (
                            <button
                                onClick={() => handleStatusChange("resolved")}
                                className="flex items-center gap-2.5 px-6 py-3 bg-success text-white rounded-[1.25rem] text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-success/10"
                            >
                                <CheckCircle2 size={14} />
                                Terminate Thread
                            </button>
                        )}
                        {query.status === "resolved" && (
                            <button
                                onClick={() => handleStatusChange("active")}
                                className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-[1.25rem] text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10"
                            >
                                <AlertCircle size={14} />
                                Re-Sync Matrix
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-alt-bg/10 custom-scrollbar">
                {messages.map((message) => {
                    const isOwnMessage = message.senderId === currentUser.id;
                    return (
                        <div
                            key={message._id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-3 duration-500`}
                        >
                            <div className={`max-w-[80%] ${isOwnMessage ? "items-end text-right" : "items-start text-left"} flex flex-col gap-2`}>
                                {!isOwnMessage && (
                                    <div className="flex items-center gap-2.5 px-2">
                                        <div className="w-8 h-8 rounded-xl bg-card-bg border border-border-accent flex items-center justify-center text-text-secondary/20 text-xs font-black shadow-sm">
                                            {message.sender?.fullName?.[0] || "?"}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-tight">
                                                {message.sender?.fullName}
                                            </span>
                                            <span className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">
                                                {message.sender?.role}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div
                                    className={`px-6 py-5 rounded-[2.25rem] text-sm leading-relaxed transition-all shadow-sm ${isOwnMessage
                                        ? "bg-secondary text-white rounded-tr-none border border-white/5"
                                        : "bg-card-bg border border-border-accent text-secondary rounded-tl-none"
                                        }`}
                                >
                                    <p className="font-bold whitespace-pre-wrap">{message.content}</p>
                                    {message.isEdited && (
                                        <span className={`text-[9px] font-black uppercase tracking-widest mt-3 block ${isOwnMessage ? "text-white/40" : "text-text-secondary/40"}`}>
                                            (Revised)
                                        </span>
                                    )}
                                </div>
                                <span className="text-[9px] font-black text-text-secondary/30 uppercase tracking-[0.2em] px-3">
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-border-accent p-10 bg-card-bg relative">
                <form onSubmit={handleSendMessage} className="flex gap-6 items-end">
                    <div className="flex-1 relative flex items-center">
                        <textarea
                            rows={1}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Input tactical response..."
                            className="w-full pl-8 pr-16 py-6 bg-alt-bg/30 border border-border-accent/50 rounded-[2.5rem] text-[15px] font-bold text-secondary focus:bg-card-bg focus:border-primary/30 focus:ring-8 focus:ring-primary/[0.03] outline-none transition-all resize-none shadow-inner custom-scrollbar"
                            disabled={sending}
                        />
                        <button
                            type="button"
                            className="absolute right-5 p-3 rounded-2xl bg-card-bg border border-border-accent text-text-secondary/30 hover:text-primary transition-all hover:border-primary/20 shadow-sm"
                        >
                            <Paperclip size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="bg-primary text-white p-6 rounded-[2.25rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:scale-100 disabled:shadow-none group"
                    >
                        <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </form>
                <div className="mt-6 flex items-center justify-between px-6">
                    <p className="text-[9px] font-black text-text-secondary/30 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Lock size={12} className="text-primary/40" />
                        End-to-End Cryptography Enabled
                    </p>
                    <div className="flex gap-6">
                        <span className="text-[9px] font-black text-primary/20 uppercase tracking-[0.1em] cursor-help">@client</span>
                        <span className="text-[9px] font-black text-primary/20 uppercase tracking-[0.1em] cursor-help">@freelancer</span>
                        <span className="text-[9px] font-black text-primary/20 uppercase tracking-[0.1em] cursor-help">@admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
