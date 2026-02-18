import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
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
    Filter,
    File,
    X,
    ExternalLink,
    Download,
    UserCircle2,
    Lock,
    Globe,
    Plus
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
        <div className="flex h-[calc(100vh-140px)] bg-card-bg rounded-[3rem] border border-border-accent shadow-xl overflow-hidden font-secondary">
            {/* Sidebar (1/3) */}
            <div className="w-1/3 border-r border-border-accent flex flex-col bg-alt-bg/30">
                <div className="p-8 border-b border-border-accent bg-card-bg">
                    <h1 className="text-3xl font-black text-secondary tracking-tight mb-6 font-primary uppercase tracking-widest text-[18px]">Query Matrix</h1>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/30" size={18} />
                        <input
                            type="text"
                            placeholder="Filter discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-alt-bg/50 border border-border-accent rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all placeholder-text-secondary/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {queries === undefined ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredQueries?.length === 0 ? (
                        <div className="text-center py-20 px-8">
                            <div className="w-16 h-16 bg-alt-bg rounded-3xl flex items-center justify-center mx-auto mb-4 text-text-secondary/20">
                                <MessageCircle size={32} />
                            </div>
                            <p className="text-text-secondary/40 text-[10px] font-black uppercase tracking-[0.2em]">No Synchronized Logs</p>
                        </div>
                    ) : (
                        filteredQueries?.map((query) => (
                            <div
                                key={query._id}
                                onClick={() => setSelectedQueryId(query._id)}
                                className={`p-5 rounded-[2rem] cursor-pointer transition-all border group ${selectedQueryId === query._id
                                    ? "bg-card-bg border-primary/20 shadow-lg shadow-primary/5"
                                    : "bg-transparent border-transparent hover:bg-card-bg hover:border-border-accent"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${query.status === "resolved"
                                        ? "bg-success/5 text-success border border-success/20"
                                        : query.status === "active"
                                            ? "bg-primary/5 text-primary border border-primary/20"
                                            : "bg-amber-100/10 text-amber-500 border border-amber-500/20"
                                        }`}>
                                        {query.status}
                                    </span>
                                    <span className="text-[9px] font-black text-text-secondary/30 bg-alt-bg px-2 py-0.5 rounded-lg border border-border-accent/10">
                                        {query.queryNumber}
                                    </span>
                                </div>
                                <h3 className={`text-sm font-black leading-tight line-clamp-1 transition-colors ${selectedQueryId === query._id ? "text-primary" : "text-secondary group-hover:text-primary"
                                    }`}>
                                    {query.title}
                                </h3>
                                <div className="mt-3 space-y-1.5">
                                    <p className="text-[10px] font-black text-text-secondary/40 flex items-center gap-2 uppercase tracking-tight">
                                        <div className="w-1 h-1 rounded-full bg-primary/40"></div>
                                        {query.task?.title}
                                    </p>
                                    <p className="text-[9px] font-black text-text-secondary/20 uppercase tracking-widest line-clamp-1">
                                        {query.requirementName}
                                    </p>
                                </div>
                                {query.lastMessagePreview && (
                                    <p className="mt-4 text-[11px] font-bold text-text-secondary/40 line-clamp-1 italic bg-alt-bg/30 p-2.5 rounded-xl border border-border-accent/5">
                                        "{query.lastMessagePreview}"
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Area (2/3) */}
            <div className="flex-1 flex flex-col bg-card-bg">
                {selectedQuery ? (
                    <QueryChatFullScreen
                        query={selectedQuery}
                        currentUser={currentUser}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-alt-bg/10 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/[0.02] -rotate-12 pointer-events-none">
                            <MessageCircle size={400} />
                        </div>
                        <div className="relative flex flex-col items-center">
                            <div className="w-24 h-24 bg-card-bg border border-border-accent rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-primary/5 animate-pulse">
                                <MessageCircle size={40} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-secondary tracking-tight font-primary uppercase tracking-widest">Select Discussion</h2>
                            <p className="text-text-secondary/40 mt-3 max-w-xs text-center text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                Access the secure encryption channel to synchronize with project participants.
                            </p>
                        </div>
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

    const generateUploadUrl = useAction(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);

    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const getFileUrl = useAction(api.files.getFileUrl);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        e.target.value = '';
        setUploading(true);
        const toastId = toast.loading(`Uploading ${file.name}...`);

        try {
            const { uploadUrl, key } = await generateUploadUrl({
                contentType: file.type,
                fileName: file.name
            });

            const result = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            if (!result.ok) throw new Error("Upload failed");

            const fileId = await saveFile({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storageKey: key,
                uploadedBy: currentUser.id,
                entityType: "taskQuery",
                entityId: query._id
            });

            setAttachments(prev => [...prev, {
                fileId,
                storageKey: key,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            }]);

            toast.success(`${file.name} attached`, { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(`Failed to upload ${file.name}`, { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file) => {
        if (!file.storageKey) {
            toast.error("File storage key missing");
            return;
        }

        setDownloading(file.fileId);
        try {
            const url = await getFileUrl({ storageKey: file.storageKey });
            window.open(url, '_blank');
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate download link");
        } finally {
            setDownloading(null);
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageText.trim() && attachments.length === 0) return;

        setSending(true);
        try {
            await sendMessage({
                queryId: query._id,
                senderId: currentUser.id,
                content: messageText || (attachments.length > 0 ? "Shared technical assets" : ""),
                attachments: attachments.length > 0 ? attachments : undefined
            });
            setMessageText("");
            setAttachments([]);
        } catch (error) {
            toast.error("Failed to send technical message");
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
            toast.success(`Matrix channel marked as ${status}`);
        } catch (error) {
            toast.error("Status update synchronization failed");
        }
    };

    if (!messages) {
        return (
            <div className="flex-1 flex items-center justify-center bg-card-bg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-card-bg font-secondary">
            {/* Chat Header */}
            <div className="px-10 py-8 border-b border-border-accent flex items-center justify-between bg-card-bg/80 backdrop-blur-xl z-10 sticky top-0 shadow-sm shadow-secondary/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
                            Active Sync
                        </span>
                        <span className="text-[10px] font-black text-text-secondary/40 border-l border-border-accent pl-3">
                            {query.queryNumber}
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-secondary tracking-tight font-primary uppercase tracking-tight">{query.title}</h2>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
                            <span className="text-primary/40">Task:</span>
                            <span className="text-secondary tracking-tight">{query.task?.title}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-border-accent/30"></div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
                            <span className="text-primary/40">Origin:</span>
                            <span className="text-secondary tracking-tight">{query.requirementName}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {query.participants?.slice(0, 4).map((p, i) => (
                            <div
                                key={p?._id || i}
                                className="w-12 h-12 rounded-[1.25rem] border-4 border-card-bg bg-header-bg flex items-center justify-center overflow-hidden shadow-lg shadow-secondary/10 transition-transform hover:scale-110"
                                title={`${p?.fullName} (${p?.role})`}
                            >
                                {p?.profileImage ? (
                                    <img src={p.profileImage} alt={p.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-black text-text-secondary/20">{p?.fullName?.[0]}</span>
                                )}
                            </div>
                        ))}
                        {query.participants?.length > 4 && (
                            <div className="w-12 h-12 rounded-[1.25rem] border-4 border-card-bg bg-secondary flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-secondary/20">
                                +{query.participants.length - 4}
                            </div>
                        )}
                    </div>

                    {query.status !== "resolved" ? (
                        <button
                            onClick={() => handleStatusChange("resolved")}
                            className="bg-success text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 shadow-xl shadow-success/10"
                        >
                            <CheckCircle2 size={16} />
                            Mark Resolved
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStatusChange("active")}
                            className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 shadow-xl shadow-primary/10"
                        >
                            <AlertCircle size={16} />
                            Reopen Matrix
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-alt-bg/10 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-700">
                        <div className="w-20 h-20 bg-card-bg border border-border-accent rounded-[2rem] flex items-center justify-center mb-6 text-text-secondary/10 shadow-sm">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="font-black text-secondary tracking-widest text-[10px] uppercase">Awaiting Synchronization</h3>
                        <p className="text-[10px] text-text-secondary/30 font-black uppercase tracking-widest mt-2">Initialize the secure thread below</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.senderId === currentUser.id;
                        return (
                            <div key={message._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-3 duration-500`}>
                                <div className={`flex gap-5 max-w-[85%] ${isOwn ? "flex-row-reverse text-right" : ""}`}>
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-card-bg shrink-0 flex items-center justify-center overflow-hidden border border-border-accent shadow-sm transition-transform hover:rotate-6">
                                        {message.sender?.profileImage ? (
                                            <img src={message.sender.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-black text-text-secondary/20">{message.sender?.fullName?.[0]}</span>
                                        )}
                                    </div>
                                    <div className={`space-y-2 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                                        <div className="flex items-center gap-3 px-1">
                                            {!isOwn && <span className="text-xs font-black text-secondary tracking-tight uppercase">{message.sender?.fullName}</span>}
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/20">
                                                {message.sender?.role}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-border-accent"></span>
                                            <span className="text-[9px] font-black text-text-secondary/30 uppercase tracking-[0.2em]">
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`p-6 rounded-[2.5rem] text-sm leading-relaxed transition-all shadow-sm ${isOwn
                                            ? "bg-secondary text-white rounded-tr-none border border-white/5"
                                            : "bg-card-bg text-secondary border border-border-accent rounded-tl-none"
                                            }`}>
                                            <p className="whitespace-pre-wrap font-bold">{message.content}</p>

                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    {message.attachments.map((file, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleDownload(file)}
                                                            disabled={downloading === file.fileId}
                                                            className={`flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all hover:scale-105 active:scale-95 group ${isOwn
                                                                ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                                                : "bg-alt-bg/30 border-border-accent text-secondary hover:border-primary/20"
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isOwn ? "bg-white/10 group-hover:bg-primary group-hover:text-white" : "bg-card-bg border border-border-accent text-primary"}`}>
                                                                {downloading === file.fileId ? (
                                                                    <Loader2 size={18} className="animate-spin" />
                                                                ) : (
                                                                    <File size={18} />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 text-left">
                                                                <p className="text-[10px] font-black uppercase tracking-tight truncate max-w-[120px]">{file.fileName}</p>
                                                                <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isOwn ? "text-white/40" : "text-text-secondary/40"}`}>
                                                                    {(file.fileSize / 1024).toFixed(1)} KB • Technical Asset
                                                                </p>
                                                            </div>
                                                            <Download size={16} className={isOwn ? "text-white/20" : "text-text-secondary/20"} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
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
            <div className="p-10 bg-card-bg border-t border-border-accent relative">
                {/* Pending Attachments */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6 px-4 animate-in slide-in-from-bottom-5 duration-300">
                        {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-primary/5 text-primary px-4 py-2.5 rounded-2xl border border-primary/20 shadow-sm transition-all hover:border-primary/40">
                                <File size={16} />
                                <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[200px]">{file.fileName}</span>
                                <button
                                    onClick={() => removeAttachment(idx)}
                                    className="p-1.5 hover:bg-primary/10 rounded-xl transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative group">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="flex items-end gap-6">
                        <div className="flex-1 relative flex items-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className={`absolute left-5 p-3 rounded-2xl transition-all shadow-sm ${uploading ? "bg-primary text-white animate-pulse" : "bg-card-bg text-text-secondary/30 hover:text-primary hover:bg-alt-bg border border-border-accent"}`}
                            >
                                <Paperclip size={20} />
                            </button>
                            <textarea
                                rows={1}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={uploading ? "Uploading technical payload..." : "Initiate thread synchronization..."}
                                className="w-full pl-20 pr-8 py-6 bg-alt-bg/30 border border-border-accent/50 rounded-[2.5rem] text-[15px] font-bold text-secondary focus:bg-card-bg focus:border-primary/30 focus:ring-8 focus:ring-primary/[0.03] outline-none transition-all resize-none shadow-inner custom-scrollbar"
                                disabled={sending || uploading}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={sending || uploading || (!messageText.trim() && attachments.length === 0)}
                            className="bg-primary text-white p-6 rounded-[2.25rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:shadow-none group"
                        >
                            <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between px-6">
                    <p className="text-[9px] font-black text-text-secondary/30 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Globe size={12} className="text-success" />
                        {uploading ? "Synchronizing Asset Pipeline..." : "Encrypted Matrix Channel Active"}
                    </p>
                    <div className="flex gap-6">
                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-[0.1em] cursor-help transition-all hover:text-primary hover:tracking-widest">@client</span>
                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-[0.1em] cursor-help transition-all hover:text-primary hover:tracking-widest">@architect</span>
                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-[0.1em] cursor-help transition-all hover:text-primary hover:tracking-widest">@executive</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
