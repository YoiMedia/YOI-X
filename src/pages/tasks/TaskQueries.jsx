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
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function TaskQueries({ task, onClose }) {
    const currentUser = getUser();
    const queries = useQuery(api.taskQueries.getQueriesByTask, { taskId: task._id });
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [showNewQueryForm, setShowNewQueryForm] = useState(false);

    // If there's exactly one query, auto-select it
    useEffect(() => {
        if (queries && queries.length === 1 && !selectedQuery) {
            setSelectedQuery(queries[0]);
        }
    }, [queries, selectedQuery]);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {selectedQuery ? (
                                <button
                                    onClick={() => setSelectedQuery(null)}
                                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <MessageCircle size={20} />
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-black tracking-tight">
                                    {selectedQuery ? selectedQuery.title : "Task Queries"}
                                </h2>
                                <p className="text-sm text-white/80 mt-0.5">
                                    {selectedQuery ? `Query #${selectedQuery.queryNumber}` : task.title}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
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
            toast.error("Please enter a title");
            return;
        }

        setLoading(true);
        try {
            const queryId = await createQuery({
                taskId: task._id,
                title,
                description,
                createdBy: currentUser.id,
            });

            // Find the newly created query and select it
            toast.success("Query created successfully");
            setTitle("");
            setDescription("");
            setShowNewQueryForm(false);
        } catch (error) {
            toast.error("Failed to create query");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!queries) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-4">
                {/* New Query Button */}
                {!showNewQueryForm && (
                    <button
                        onClick={() => setShowNewQueryForm(true)}
                        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={20} />
                        Raise a New Query
                    </button>
                )}

                {/* New Query Form */}
                {showNewQueryForm && (
                    <form onSubmit={handleCreateQuery} className="bg-blue-50 p-6 rounded-2xl space-y-4 border-2 border-blue-100">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-900">New Query</h3>
                            <button
                                type="button"
                                onClick={() => setShowNewQueryForm(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's your question?"
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details (optional)..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Query"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewQueryForm(false)}
                                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Queries List */}
                {queries.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl">
                        <MessageCircle size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No queries yet</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Start a conversation by raising a question
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {queries.map((query) => (
                            <div
                                key={query._id}
                                onClick={() => onSelectQuery(query)}
                                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${query.status === "resolved"
                                                ? "bg-green-100 text-green-700"
                                                : query.status === "active"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-amber-100 text-amber-700"
                                                }`}>
                                                {query.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {query.queryNumber}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {query.title}
                                        </h4>
                                        {query.description && (
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                {query.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                            <User size={12} />
                                            <span>{query.creator?.fullName}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <Clock size={12} />
                                            <span>
                                                {new Date(query.lastMessageAt || query.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {query.lastMessagePreview && (
                                            <div className="mt-2 text-xs text-slate-500 italic bg-slate-50 px-3 py-2 rounded-lg">
                                                {query.lastMessagePreview}
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
            // Parse mentions from message text (e.g., @client, @freelancer, @admin)
            const mentionPattern = /@(\w+)/g;
            const mentionMatches = [...messageText.matchAll(mentionPattern)];

            await sendMessage({
                queryId: query._id,
                senderId: currentUser.id,
                content: messageText,
            });

            setMessageText("");
        } catch (error) {
            toast.error("Failed to send message");
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
            toast.success(`Query marked as ${status}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (!messages) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Query Info */}
            <div className="border-b border-slate-200 p-6 bg-slate-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {query.participants?.slice(0, 3).map((participant, i) => (
                                <div
                                    key={participant._id}
                                    className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                    title={participant.fullName}
                                >
                                    {participant.fullName[0]}
                                </div>
                            ))}
                            {query.participants?.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold">
                                    +{query.participants.length - 3}
                                </div>
                            )}
                        </div>
                        <div className="text-sm">
                            <div className="font-bold text-slate-700">
                                {query.participants?.length} participants
                            </div>
                            <div className="text-slate-500 text-xs">
                                {query.participants?.map(p => p.role).join(", ")}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {query.status !== "resolved" && (
                            <button
                                onClick={() => handleStatusChange("resolved")}
                                className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
                            >
                                <CheckCircle2 size={14} />
                                Mark Resolved
                            </button>
                        )}
                        {query.status === "resolved" && (
                            <button
                                onClick={() => handleStatusChange("active")}
                                className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                            >
                                <AlertCircle size={14} />
                                Reopen
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-linear-to-b from-slate-50 to-white">
                {messages.map((message) => {
                    const isOwnMessage = message.senderId === currentUser.id;
                    return (
                        <div
                            key={message._id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                {!isOwnMessage && (
                                    <div className="flex items-center gap-2 px-3">
                                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                            {message.sender?.fullName[0] || "?"}
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">
                                            {message.sender?.fullName}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            ({message.sender?.role})
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`px-4 py-3 rounded-2xl ${isOwnMessage
                                        ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-br-md"
                                        : "bg-white border border-slate-200 text-slate-900 rounded-bl-md"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    {message.isEdited && (
                                        <span className={`text-xs mt-1 block ${isOwnMessage ? "text-white/70" : "text-slate-400"}`}>
                                            (edited)
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 px-3">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-slate-200 p-6 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message... (use @client, @freelancer, @admin to mention)"
                            className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            disabled={sending}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <Paperclip size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="w-12 h-12 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-xs text-slate-400 mt-2 px-1">
                    Tip: Use @client, @freelancer, or @admin to mention and notify specific roles
                </p>
            </div>
        </div>
    );
}
