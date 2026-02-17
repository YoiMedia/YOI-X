import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    MessageCircle,
    Send,
    CheckCircle2,
    Paperclip,
    User,
    Clock,
    AlertCircle,
    Search,
    ChevronRight,
    Filter
} from "lucide-react";
import toast from "react-hot-toast";

export default function QueryCenter() {
    const currentUser = getUser();
    const queries = useQuery(api.taskQueries.getUserQueries, { userId: currentUser.id });
    const [selectedQueryId, setSelectedQueryId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedQuery = queries?.find(q => q._id === selectedQueryId);

    // Filter queries based on search
    const filteredQueries = queries?.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.task?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.requirementName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Sidebar (1/3) */}
            <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Queries</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {queries === undefined ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredQueries?.length === 0 ? (
                        <div className="text-center py-10 px-6">
                            <MessageCircle size={40} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-slate-400 text-sm font-medium">No queries found</p>
                        </div>
                    ) : (
                        filteredQueries?.map((query) => (
                            <div
                                key={query._id}
                                onClick={() => setSelectedQueryId(query._id)}
                                className={`p-4 rounded-3xl cursor-pointer transition-all border ${selectedQueryId === query._id
                                    ? "bg-white border-blue-100 shadow-sm ring-1 ring-blue-500/5"
                                    : "bg-transparent border-transparent hover:bg-white/50"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${query.status === "resolved"
                                        ? "bg-green-100 text-green-700"
                                        : query.status === "active"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-amber-100 text-amber-700"
                                        }`}>
                                        {query.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                        {query.queryNumber}
                                    </span>
                                </div>
                                <h3 className={`text-sm font-bold leading-tight line-clamp-1 ${selectedQueryId === query._id ? "text-blue-600" : "text-slate-900"
                                    }`}>
                                    {query.title}
                                </h3>
                                <div className="mt-2 space-y-1">
                                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                        <span className="text-slate-300">#</span> {query.task?.title}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight line-clamp-1">
                                        {query.requirementName}
                                    </p>
                                </div>
                                {query.lastMessagePreview && (
                                    <p className="mt-3 text-[11px] text-slate-400 line-clamp-1 italic bg-slate-50/50 p-2 rounded-xl">
                                        {query.lastMessagePreview}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Area (2/3) */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedQuery ? (
                    <QueryChatFullScreen
                        query={selectedQuery}
                        currentUser={currentUser}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/10">
                        <div className="w-20 h-20 bg-blue-50 rounded-4xl flex items-center justify-center mb-6">
                            <MessageCircle size={40} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Select a conversation</h2>
                        <p className="text-slate-500 mt-2 max-w-xs text-center text-sm font-medium">
                            Choose a query from the list to view the full discussion and respond.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function QueryChatFullScreen({ query, currentUser }) {
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
            toast.error("Failed to send message");
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
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                            Discussion active
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                            {query.queryNumber}
                        </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{query.title}</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <span className="text-slate-300">Task:</span>
                            <span className="text-slate-600">{query.task?.title}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                            <span className="text-slate-300">Requirement:</span>
                            <span className="text-slate-600 uppercase tracking-tight">{query.requirementName}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 mr-2">
                        {query.participants?.slice(0, 4).map((p, i) => (
                            <div
                                key={p?._id || i}
                                className="w-9 h-9 rounded-2xl border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden"
                                title={`${p?.fullName} (${p?.role})`}
                            >
                                {p?.profileImage ? (
                                    <img src={p.profileImage} alt={p.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-black text-slate-500">{p?.fullName?.[0]}</span>
                                )}
                            </div>
                        ))}
                        {query.participants?.length > 4 && (
                            <div className="w-9 h-9 rounded-2xl border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                +{query.participants.length - 4}
                            </div>
                        )}
                    </div>

                    {query.status !== "resolved" ? (
                        <button
                            onClick={() => handleStatusChange("resolved")}
                            className="bg-green-50 text-green-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                        >
                            <CheckCircle2 size={16} />
                            Mark Resolved
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStatusChange("active")}
                            className="bg-amber-50 text-amber-700 px-5 py-2.5 rounded-[1.25rem] text-xs font-black uppercase tracking-wider hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                        >
                            <AlertCircle size={16} />
                            Reopen
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center mb-4 text-blue-200">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="font-bold text-slate-400">No messages yet</h3>
                        <p className="text-xs text-slate-300 mt-1">Start the conversation by typing below</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.senderId === currentUser.id;
                        return (
                            <div key={message._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`flex gap-4 max-w-[80%] ${isOwn ? "flex-row-reverse text-right" : ""}`}>
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        {message.sender?.profileImage ? (
                                            <img src={message.sender.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-black text-slate-400">{message.sender?.fullName?.[0]}</span>
                                        )}
                                    </div>
                                    <div className={`space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                                        <div className="flex items-center gap-2 px-1">
                                            {!isOwn && <span className="text-xs font-black text-slate-900">{message.sender?.fullName}</span>}
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                {message.sender?.role}
                                            </span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-slate-200"></span>
                                            <span className="text-[10px] font-bold text-slate-300">
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`p-4 rounded-[1.75rem] text-sm leading-relaxed transition-all ${isOwn
                                            ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10"
                                            : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm"
                                            }`}>
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                    <div className="flex-1 relative flex items-center">
                        <div className="absolute left-4 p-2 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors">
                            <Paperclip size={18} />
                        </div>
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message or use @mention..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-4xl text-sm font-medium focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                            disabled={sending}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={sending || !messageText.trim()}
                        className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 rounded-[2rem] font-black uppercase tracking-wider text-xs shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                        <Send size={16} />
                        Send
                    </button>
                </form>
                <div className="mt-3 flex items-center justify-between px-2">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        Press Enter to send message
                    </p>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-tight cursor-help transition-colors hover:text-blue-500">@client</span>
                        <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-tight cursor-help transition-colors hover:text-blue-500">@freelancer</span>
                        <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-tight cursor-help transition-colors hover:text-blue-500">@admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
