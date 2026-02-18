import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Video,
    Building2,
    Users as UsersIcon,
    FileText,
    Save,
    Loader2,
    CheckCircle2,
    Plus,
    Trash2,
    ExternalLink,
    AlertCircle,
    ClipboardList,
    MessageSquare,
    Link as LinkIcon,
    Upload,
    File as FileIcon,
    Lock,
    Globe
} from "lucide-react";
import toast from "react-hot-toast";
import { getUser } from "../../services/auth.service";

export default function MeetingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = getUser();
    const meeting = useQuery(api.meetings.getMeetingById, { meetingId: id });
    const updateMeeting = useMutation(api.meetings.updateMeeting);

    // Meeting Outcomes
    const outcomes = useQuery(api.meetingOutcomes.listMeetingOutcomes, {
        meetingId: id,
        userId: currentUser.id,
        role: currentUser.role
    });
    const createOutcome = useMutation(api.meetingOutcomes.createMeetingOutcome);
    const updateOutcome = useMutation(api.meetingOutcomes.updateMeetingOutcome);

    // File Management
    const files = useQuery(api.files.getFiles, { entityType: "meeting", entityId: id });
    const generateUploadUrl = useAction(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const deleteFile = useMutation(api.files.deleteFile);
    const getFileUrl = useAction(api.files.getFileUrl);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [outcomeEditMode, setOutcomeEditMode] = useState(false);

    // Form State for meeting details
    const [notes, setNotes] = useState("");
    const [recordingUrl, setRecordingUrl] = useState("");
    const [status, setStatus] = useState("");
    const [agenda, setAgenda] = useState("");
    const [location, setLocation] = useState("");
    const [duration, setDuration] = useState(30);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Outcome form state
    const [outcomeSummary, setOutcomeSummary] = useState("");
    const [outcomeSentiment, setOutcomeSentiment] = useState("neutral");
    const [outcomeNextSteps, setOutcomeNextSteps] = useState("");
    const [outcomeActionItems, setOutcomeActionItems] = useState([]);
    const [outcomeIsPrivate, setOutcomeIsPrivate] = useState(true);
    const [editingOutcomeId, setEditingOutcomeId] = useState(null);

    // My outcome (from the current user)
    const myOutcome = outcomes?.find(o => o.authorId === currentUser.id);
    const sharedOutcomes = outcomes?.filter(o => !o.isPrivate) || [];

    useEffect(() => {
        if (meeting) {
            setNotes(meeting.notes || "");
            setRecordingUrl(meeting.recordingUrl || "");
            setStatus(meeting.status);
            setAgenda(meeting.agenda || "");
            setLocation(meeting.location || "");
            setDuration(meeting.duration || 30);
            setTitle(meeting.title || "");
            setDescription(meeting.description || "");
        }
    }, [meeting]);

    useEffect(() => {
        if (myOutcome && outcomeEditMode) {
            setOutcomeSummary(myOutcome.summary || "");
            setOutcomeSentiment(myOutcome.sentiment || "neutral");
            setOutcomeNextSteps(myOutcome.nextSteps || "");
            setOutcomeActionItems(myOutcome.actionItems || []);
            setOutcomeIsPrivate(myOutcome.isPrivate);
            setEditingOutcomeId(myOutcome._id);
        }
    }, [myOutcome, outcomeEditMode]);

    const handleSaveMeetingDetails = async () => {
        setLoading(true);
        try {
            await updateMeeting({
                meetingId: id,
                notes,
                recordingUrl,
                status,
                agenda,
                location,
                duration,
                title,
                description
            });
            toast.success("Meeting details updated successfully!");
            setEditMode(false);
        } catch (error) {
            toast.error(error.message || "Failed to update meeting");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOutcome = async () => {
        setLoading(true);
        try {
            if (editingOutcomeId) {
                await updateOutcome({
                    userId: currentUser.id,
                    outcomeId: editingOutcomeId,
                    summary: outcomeSummary,
                    sentiment: outcomeSentiment,
                    nextSteps: outcomeNextSteps,
                    actionItems: outcomeActionItems,
                    isPrivate: outcomeIsPrivate,
                });
                toast.success("Outcome updated!");
            } else {
                await createOutcome({
                    userId: currentUser.id,
                    meetingId: id,
                    summary: outcomeSummary,
                    sentiment: outcomeSentiment,
                    nextSteps: outcomeNextSteps,
                    actionItems: outcomeActionItems,
                    isPrivate: outcomeIsPrivate,
                });
                toast.success("Outcome saved!");
            }
            setOutcomeEditMode(false);
            resetOutcomeForm();
        } catch (error) {
            toast.error(error.message || "Failed to save outcome");
        } finally {
            setLoading(false);
        }
    };

    const resetOutcomeForm = () => {
        setOutcomeSummary("");
        setOutcomeSentiment("neutral");
        setOutcomeNextSteps("");
        setOutcomeActionItems([]);
        setOutcomeIsPrivate(true);
        setEditingOutcomeId(null);
    };

    const addActionItem = () => {
        setOutcomeActionItems([...outcomeActionItems, { id: Date.now().toString(), description: "", completed: false }]);
    };

    const updateActionItem = (id, description) => {
        setOutcomeActionItems(outcomeActionItems.map(item => item.id === id ? { ...item, description } : item));
    };

    const toggleActionItem = (id) => {
        setOutcomeActionItems(outcomeActionItems.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    };

    const removeActionItem = (id) => {
        setOutcomeActionItems(outcomeActionItems.filter(item => item.id !== id));
    };

    // File Upload Handler
    const handleFileUpload = async (e, entityType = "meeting", entityId = id) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { uploadUrl, key } = await generateUploadUrl({ contentType: file.type, fileName: file.name });
            await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            await saveFile({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storageKey: key,
                uploadedBy: currentUser.id,
                entityType,
                entityId,
            });

            toast.success("File uploaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const OutcomeFiles = ({ outcomeId, isEditable }) => {
        const files = useQuery(api.files.getFiles, { entityType: "meetingOutcome", entityId: outcomeId });

        if (!files || files.length === 0) {
            if (!isEditable) return null;
            return (
                <div className="pt-4 mt-4 border-t border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attachments</p>
                    <label className="flex items-center gap-2 p-3 bg-white border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "meetingOutcome", outcomeId)} disabled={uploading} />
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        </div>
                        <span className="text-xs font-bold text-slate-500">Attach a file</span>
                    </label>
                </div>
            );
        }

        return (
            <div className="pt-4 mt-4 border-t border-slate-100/50 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments ({files.length})</p>
                    {isEditable && (
                        <label className="cursor-pointer">
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "meetingOutcome", outcomeId)} disabled={uploading} />
                            <div className="text-blue-600 font-bold text-[10px] flex items-center gap-1 hover:text-blue-700">
                                {uploading ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                                Add More
                            </div>
                        </label>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {files.map(file => (
                        <div key={file._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl group border border-slate-100">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileIcon size={12} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-600 truncate">{file.fileName}</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleDownloadFile(file.storageKey, file.fileName)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <ExternalLink size={12} />
                                </button>
                                {isEditable && (
                                    <button
                                        onClick={() => handleDeleteFile(file._id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleDeleteFile = async (fileId) => {
        try {
            await deleteFile({ fileId });
            toast.success("File deleted!");
        } catch (error) {
            toast.error("Failed to delete file");
        }
    };

    const handleDownloadFile = async (storageKey, fileName) => {
        try {
            const url = await getFileUrl({ storageKey });
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error("Failed to download file");
        }
    };

    if (!meeting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in font-secondary">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/meetings")}
                    className="p-3 rounded-2xl bg-card-bg border border-border-accent text-text-secondary hover:bg-alt-bg transition-all shadow-sm hover:shadow hover:scale-105"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight font-primary">{meeting.title}</h1>
                    <p className="text-text-secondary font-black uppercase tracking-widest text-[10px] mt-1">{meeting.companyName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Meeting Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card-bg border border-border-accent p-8 rounded-[2.5rem] shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-secondary uppercase tracking-widest font-primary">Meeting Overview</h2>
                            {!editMode ? (
                                (currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'client' || meeting.organizer === currentUser.id) && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-secondary text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Edit Briefing
                                    </button>
                                )
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => setEditMode(false)} className="font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-2xl bg-card-bg border border-border-accent hover:bg-alt-bg transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveMeetingDetails}
                                        disabled={loading}
                                        className="font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-2xl bg-success text-white flex items-center gap-2 hover:bg-success/90 disabled:opacity-50 shadow-lg shadow-success/10"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Commit Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-text-secondary/40">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Strategic Date</span>
                                </div>
                                <p className="font-black text-secondary">{new Date(meeting.scheduledAt).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-text-secondary/40">
                                    <Clock size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Timezone Slot</span>
                                </div>
                                <p className="font-black text-secondary">{new Date(meeting.scheduledAt).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        {editMode ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Technical Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-border-accent bg-card-bg font-bold text-secondary focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Executive Summary</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        className="w-full p-4 rounded-2xl border border-border-accent bg-card-bg font-bold text-secondary focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Progress Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-border-accent bg-card-bg font-bold text-sm text-secondary focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="scheduled">Planned Briefing</option>
                                        <option value="in-progress">Sync Active</option>
                                        <option value="completed">Asset Released</option>
                                        <option value="cancelled">Declined</option>
                                        <option value="no-show">No Response</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {meeting.description && <p className="text-text-secondary font-bold leading-relaxed">{meeting.description}</p>}
                            </div>
                        )}
                    </div>

                    {/* My Outcome Section */}
                    <div className="bg-header-bg/30 border border-primary/20 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-secondary uppercase tracking-widest font-primary">Encrypted Briefing</h2>
                                    <p className="text-[10px] text-text-secondary/60 font-black uppercase tracking-widest">Confidential Internal Metadata</p>
                                </div>
                            </div>
                            {!outcomeEditMode ? (
                                <button
                                    onClick={() => setOutcomeEditMode(true)}
                                    className="bg-primary text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {myOutcome ? "Edit Records" : "Initialize Notes"}
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => { setOutcomeEditMode(false); resetOutcomeForm(); }} className="font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-2xl bg-card-bg border border-border-accent hover:bg-alt-bg transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveOutcome}
                                        disabled={loading}
                                        className="font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-2xl bg-success text-white flex items-center gap-2 hover:bg-success/90 disabled:opacity-50 shadow-lg shadow-success/10"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Save Insight
                                    </button>
                                </div>
                            )}
                        </div>

                        {outcomeEditMode ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={!outcomeIsPrivate}
                                        onChange={(e) => setOutcomeIsPrivate(!e.target.checked)}
                                        className="w-5 h-5 rounded accent-primary"
                                    />
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                        <Globe size={14} className="text-primary" />
                                        Distribute briefing to all mission participants
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Strategic Sentiment</label>
                                    <select
                                        value={outcomeSentiment}
                                        onChange={(e) => setOutcomeSentiment(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-border-accent bg-card-bg font-bold text-sm text-secondary focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="positive">High Velocity / Progressive</option>
                                        <option value="neutral">Strategic Alignment</option>
                                        <option value="negative">Risk Detected / Awaiting Resync</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Briefing Summary</label>
                                    <textarea
                                        value={outcomeSummary}
                                        onChange={(e) => setOutcomeSummary(e.target.value)}
                                        rows="4"
                                        className="w-full p-4 rounded-2xl border border-border-accent bg-card-bg font-bold text-secondary focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                        placeholder="Document major takeaways and technical breakthroughs..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Tactical Pipeline</label>
                                        <button onClick={addActionItem} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-card-bg border border-primary/10 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                                            <Plus size={14} /> New Objective
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {outcomeActionItems?.map((item) => (
                                            <div key={item.id} className="flex gap-3 bg-card-bg p-3 rounded-2xl border border-border-accent items-start group transition-all hover:border-primary/20">
                                                <button
                                                    onClick={() => toggleActionItem(item.id)}
                                                    className={`mt-1 p-1 rounded-lg border transition-colors ${item.completed ? 'bg-success border-success text-white' : 'border-border-accent text-transparent hover:border-primary/40'}`}
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                                <input
                                                    value={item.description}
                                                    onChange={(e) => updateActionItem(item.id, e.target.value)}
                                                    className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold ${item.completed ? 'line-through text-text-secondary/40' : 'text-secondary'}`}
                                                    placeholder="Define objective..."
                                                />
                                                <button onClick={() => removeActionItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary/20 hover:text-error transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : myOutcome ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${myOutcome.sentiment === 'positive' ? 'bg-success/10 text-success' : myOutcome.sentiment === 'negative' ? 'bg-error/10 text-error' : 'bg-alt-bg text-text-secondary'}`}>
                                        {myOutcome.sentiment}
                                    </span>
                                    {!myOutcome.isPrivate && <span className="text-[10px] text-primary font-black flex items-center gap-1 uppercase tracking-widest"><Globe size={12} /> Sync Enabled</span>}
                                </div>
                                <p className="text-secondary leading-relaxed font-bold whitespace-pre-wrap text-sm">{myOutcome.summary}</p>
                                {myOutcome.actionItems?.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Tactical Pipeline</h4>
                                        {myOutcome.actionItems.map(item => (
                                            <div key={item.id} className="flex gap-3 items-start">
                                                <div className={`mt-1 h-5 w-5 rounded-lg border flex items-center justify-center ${item.completed ? 'bg-success border-success text-white' : 'border-border-accent'}`}>
                                                    {item.completed && <CheckCircle2 size={12} />}
                                                </div>
                                                <span className={`font-bold text-sm ${item.completed ? 'text-text-secondary/30 line-through' : 'text-secondary'}`}>
                                                    {item.description}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <OutcomeFiles outcomeId={myOutcome._id} isEditable={true} />
                            </div>
                        ) : (
                            <div className="text-center py-12 text-text-secondary/20">
                                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-black uppercase tracking-widest text-[10px]">No briefing records detected.</p>
                            </div>
                        )}
                    </div>

                    {/* Shared Outcomes */}
                    {sharedOutcomes.length > 0 && (
                        <div className="bg-success/5 border border-success/20 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-success text-white rounded-xl shadow-lg shadow-success/20">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-secondary uppercase tracking-widest font-primary">Global Synced Records</h2>
                                    <p className="text-[10px] text-text-secondary/60 font-black uppercase tracking-widest">Metadata From Participants</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {sharedOutcomes.map(outcome => (
                                    <div key={outcome._id} className="bg-card-bg border border-border-accent p-6 rounded-[2rem] space-y-3 transition-all hover:border-success/30">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">{outcome.role} Brief</span>
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${outcome.sentiment === 'positive' ? 'bg-success/10 text-success' : outcome.sentiment === 'negative' ? 'bg-error/10 text-error' : 'bg-alt-bg text-text-secondary'}`}>
                                                {outcome.sentiment}
                                            </span>
                                        </div>
                                        <p className="text-secondary font-bold text-sm whitespace-pre-wrap leading-relaxed">{outcome.summary}</p>
                                        {outcome.actionItems?.length > 0 && (
                                            <div className="space-y-2 pt-4 border-t border-border-accent/10">
                                                <h5 className="text-[10px] font-black text-text-secondary/20 uppercase tracking-widest">Tactical Pipe</h5>
                                                {outcome.actionItems.map(item => (
                                                    <div key={item.id} className="flex items-center gap-2 text-xs font-bold text-secondary">
                                                        <CheckCircle2 size={14} className={item.completed ? 'text-success' : 'text-text-secondary/20'} />
                                                        <span className={item.completed ? 'line-through text-text-secondary/30' : ''}>{item.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <OutcomeFiles outcomeId={outcome._id} isEditable={false} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Attendees */}
                    <div className="bg-card-bg border border-border-accent p-6 rounded-[2.5rem] shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black text-secondary flex items-center gap-2 uppercase tracking-[0.2em] font-primary">
                            <UsersIcon size={16} className="text-primary" /> Active Personnel
                        </h3>
                        <div className="space-y-4">
                            {meeting.attendeesWithDetails?.map((attendee) => (
                                <div key={attendee.userId} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-2xl bg-header-bg flex items-center justify-center text-primary font-black text-sm border border-primary/10 transition-transform group-hover:scale-110">
                                        {attendee.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-secondary text-sm tracking-tight">{attendee.name}</p>
                                        <p className="text-[9px] text-text-secondary/40 font-black uppercase tracking-widest">{attendee.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Files */}
                    <div className="bg-card-bg border border-border-accent p-6 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-secondary flex items-center gap-2 uppercase tracking-[0.2em] font-primary">
                                <FileIcon size={16} className="text-primary" /> Assets
                            </h3>
                            <label className="cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                <div className="text-primary font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 bg-header-bg px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10">
                                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                    Deploy
                                </div>
                            </label>
                        </div>
                        <div className="space-y-2">
                            {files?.map((file) => (
                                <div key={file._id} className="flex items-center justify-between p-3 bg-alt-bg/30 rounded-2xl group border border-transparent hover:border-primary/10 hover:bg-card-bg transition-all">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FileIcon size={14} className="text-text-secondary/40" />
                                        <span className="text-[11px] font-black text-secondary truncate uppercase tracking-tight">{file.fileName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDownloadFile(file.storageKey, file.fileName)} className="opacity-0 group-hover:opacity-100 text-primary hover:scale-110 transition-all">
                                            <ExternalLink size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteFile(file._id)} className="opacity-0 group-hover:opacity-100 text-error hover:scale-110 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {!files?.length && <p className="text-[9px] text-text-secondary/20 font-black uppercase tracking-widest text-center py-6">No assets uploaded.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
