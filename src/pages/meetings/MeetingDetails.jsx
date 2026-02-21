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
    Globe,
    Mail,
    X,
    Edit3
} from "lucide-react";
import toast from "react-hot-toast";
import { getUser } from "../../services/auth.service";

export default function MeetingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = getUser();
    const meeting = useQuery(api.meetings.getMeetingById, { meetingId: id });
    const updateMeeting = useMutation(api.meetings.updateMeeting);
    const updateAttendees = useMutation(api.meetings.updateAttendees);
    const staff = useQuery(api.meetings.getStaff);

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

    // Attendee editing state
    const [editingAttendees, setEditingAttendees] = useState(false);
    const [localAttendees, setLocalAttendees] = useState([]);
    const [localExternalAttendees, setLocalExternalAttendees] = useState([]);
    const [attendeeExternalInput, setAttendeeExternalInput] = useState("");
    const [savingAttendees, setSavingAttendees] = useState(false);

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

    const handleSaveAttendees = async () => {
        setSavingAttendees(true);
        try {
            await updateAttendees({
                meetingId: id,
                attendees: localAttendees,
                externalAttendees: localExternalAttendees.length > 0 ? localExternalAttendees : undefined,
            });
            toast.success("Attendees updated!");
            setEditingAttendees(false);
        } catch (error) {
            toast.error(error.message || "Failed to update attendees");
        } finally {
            setSavingAttendees(false);
        }
    };

    const toggleLocalAttendee = (userId) => {
        setLocalAttendees(prev => {
            const isSelected = prev.find(a => a.userId === userId);
            if (isSelected) return prev.filter(a => a.userId !== userId);
            return [...prev, { userId, status: "invited" }];
        });
    };

    const addAttendeeExternalEmail = () => {
        const email = attendeeExternalInput.trim().toLowerCase();
        if (!email) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }
        if (localExternalAttendees.includes(email)) {
            toast.error("This email is already added");
            return;
        }
        setLocalExternalAttendees(prev => [...prev, email]);
        setAttendeeExternalInput("");
    };

    const removeAttendeeExternalEmail = (email) => {
        setLocalExternalAttendees(prev => prev.filter(e => e !== email));
    };

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
            // Sync attendee lists
            setLocalAttendees(meeting.attendees || []);
            setLocalExternalAttendees(meeting.externalAttendees || []);
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
        <div className="space-y-8 animate-in fade-in duration-700 font-accent selection:bg-primary/20 selection:text-secondary">
            <div className="flex items-center gap-6 px-1">
                <button
                    onClick={() => navigate("/meetings")}
                    className="p-4 rounded-[1.25rem] bg-white border border-border-accent text-text-secondary hover:bg-alt-bg hover:text-primary transition-all shadow-sm hover:shadow-md group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-5xl font-black text-secondary tracking-tighter font-primary leading-tight">{meeting.title}</h1>
                    <p className="text-primary font-black uppercase tracking-[0.25em] text-[10px] mt-1">{meeting.companyName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Meeting Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-border-accent p-10 rounded-[2.75rem] shadow-2xl shadow-secondary/5 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-alt-bg" />

                        <div className="flex items-center justify-between pl-4">
                            <h2 className="text-2xl font-black text-secondary uppercase tracking-widest font-primary">Briefing Overview</h2>
                            {!editMode ? (
                                (currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'client' || meeting.organizer === currentUser.id) && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-secondary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Edit Briefing
                                    </button>
                                )
                            ) : (
                                <div className="flex gap-4">
                                    <button onClick={() => setEditMode(false)} className="font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl bg-white border border-border-accent hover:bg-alt-bg transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveMeetingDetails}
                                        disabled={loading}
                                        className="font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-2xl bg-primary text-white flex items-center gap-3 hover:bg-primary-dark disabled:opacity-50 shadow-xl shadow-primary/20 group"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
                                        Commit Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-10 pl-4 border-l border-border-accent/40">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-text-secondary/40">
                                    <Calendar size={14} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategic Date</span>
                                </div>
                                <p className="font-black text-secondary text-lg">{new Date(meeting.scheduledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-text-secondary/40">
                                    <Clock size={14} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Timezone Slot</span>
                                </div>
                                <p className="font-black text-secondary text-lg">{new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>

                        {editMode ? (
                            <div className="space-y-8 pl-4">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary/40 uppercase tracking-[0.2em]">Technical Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-5 rounded-[1.25rem] border border-border-accent bg-main-bg/30 font-black text-secondary focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary/40 uppercase tracking-[0.2em]">Executive Summary</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="4"
                                        className="w-full p-5 rounded-[1.25rem] border border-border-accent bg-main-bg/30 font-black text-secondary focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-inner resize-none text-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary/40 uppercase tracking-[0.2em]">Progress Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full p-5 rounded-3xl border border-border-accent bg-white font-black text-sm text-secondary focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer appearance-none"
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
                            <div className="space-y-6 pl-4">
                                {meeting.description ? (
                                    <p className="text-secondary font-bold leading-relaxed text-lg border-l-4 border-primary/20 pl-6 py-2">{meeting.description}</p>
                                ) : (
                                    <p className="text-text-secondary/20 font-black uppercase tracking-widest text-xs italic">No executive summary provided.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* My Outcome Section */}
                    <div className="bg-secondary text-white p-10 rounded-[2.75rem] shadow-2xl shadow-secondary/20 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/20 group hover:rotate-12 transition-transform">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter font-primary leading-none">Encrypted Briefing</h2>
                                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[9px] mt-2">Confidential Multi-Role Metadata</p>
                                </div>
                            </div>
                            {!outcomeEditMode ? (
                                <button
                                    onClick={() => setOutcomeEditMode(true)}
                                    className="bg-white text-secondary px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-white/5 hover:bg-primary hover:text-white transition-all group"
                                >
                                    {myOutcome ? "Modify Records" : "Initialize Insight"}
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button onClick={() => { setOutcomeEditMode(false); resetOutcomeForm(); }} className="font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/10">
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleSaveOutcome}
                                        disabled={loading}
                                        className="font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-2xl bg-primary text-white flex items-center gap-3 hover:bg-primary-dark shadow-2xl shadow-primary/30"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Save Data
                                    </button>
                                </div>
                            )}
                        </div>

                        {outcomeEditMode ? (
                            <div className="space-y-8 relative z-10">
                                <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={!outcomeIsPrivate}
                                        onChange={(e) => setOutcomeIsPrivate(!e.target.checked)}
                                        className="w-6 h-6 rounded-lg accent-primary border-white/20 bg-transparent"
                                    />
                                    <label className="text-[11px] font-black uppercase tracking-[0.1em] text-white/80 flex items-center gap-3 cursor-pointer">
                                        <Globe size={16} className="text-primary" />
                                        Distribute briefing metadata to all mission participants
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Strategic Sentiment</label>
                                    <select
                                        value={outcomeSentiment}
                                        onChange={(e) => setOutcomeSentiment(e.target.value)}
                                        className="w-full p-5 rounded-[1.5rem] border border-white/10 bg-white/5 font-black text-sm text-white focus:border-primary/60 focus:ring-4 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="positive" className="bg-secondary text-white">High Velocity / Progressive</option>
                                        <option value="neutral" className="bg-secondary text-white">Strategic Alignment</option>
                                        <option value="negative" className="bg-secondary text-white">Risk Detected / Awaiting Resync</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Briefing Summary</label>
                                    <textarea
                                        value={outcomeSummary}
                                        onChange={(e) => setOutcomeSummary(e.target.value)}
                                        rows="5"
                                        className="w-full p-6 rounded-[2rem] border border-white/10 bg-white/5 font-black text-white placeholder:text-white/10 focus:border-primary/60 focus:ring-4 focus:ring-primary/20 outline-none transition-all shadow-inner text-sm leading-relaxed"
                                        placeholder="Document major takeaways and technical breakthroughs..."
                                    />
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Tactical Pipeline</label>
                                        <button onClick={addActionItem} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-white/5 border border-primary/20 px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-black/20">
                                            <Plus size={16} /> New Objective
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {outcomeActionItems?.map((item) => (
                                            <div key={item.id} className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 items-start group transition-all hover:bg-white/10 hover:border-primary/20">
                                                <button
                                                    onClick={() => toggleActionItem(item.id)}
                                                    className={`mt-1.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${item.completed ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'border-white/20 text-transparent hover:border-primary/50'}`}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <input
                                                    value={item.description}
                                                    onChange={(e) => updateActionItem(item.id, e.target.value)}
                                                    className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-black p-0 mt-1 ${item.completed ? 'line-through text-white/20' : 'text-white'}`}
                                                    placeholder="Define objective..."
                                                />
                                                <button onClick={() => removeActionItem(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-white/10 hover:text-primary transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : myOutcome ? (
                            <div className="space-y-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl ${myOutcome.sentiment === 'positive' ? 'bg-primary text-white shadow-primary/20' : myOutcome.sentiment === 'negative' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/10 text-white/60 border border-white/5'}`}>
                                        {myOutcome.sentiment}
                                    </span>
                                    {!myOutcome.isPrivate && <span className="text-[10px] text-primary font-black flex items-center gap-2 uppercase tracking-[0.2em] px-4 py-2 bg-white/5 rounded-xl"><Globe size={14} /> Sync Enabled</span>}
                                </div>
                                <p className="text-white leading-relaxed font-black whitespace-pre-wrap text-lg border-l-4 border-primary/20 pl-8">{myOutcome.summary}</p>
                                {myOutcome.actionItems?.length > 0 && (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto px-6 py-4 bg-alt-bg/30 rounded-3xl border border-border-accent/10 custom-scrollbar">
                                        <h4 className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Tactical Pipeline</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {myOutcome.actionItems.map(item => (
                                                <div key={item.id} className="flex gap-4 items-center group">
                                                    <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${item.completed ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-white/10 text-transparent'}`}>
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                    <span className={`font-black text-sm tracking-tight ${item.completed ? 'text-white/20 line-through' : 'text-white'}`}>
                                                        {item.description}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <OutcomeFiles outcomeId={myOutcome._id} isEditable={true} />
                            </div>
                        ) : (
                            <div className="text-center py-20 relative z-10 opacity-30">
                                <FileText size={48} className="mx-auto mb-5 text-white" />
                                <p className="font-black uppercase tracking-[0.4em] text-[10px] text-white">No digital briefing records located.</p>
                            </div>
                        )}
                    </div>

                    {/* Shared Outcomes */}
                    {sharedOutcomes.length > 0 && (
                        <div className="bg-white border border-border-accent p-10 rounded-[2.75rem] shadow-2xl shadow-secondary/5 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-header-bg/50 text-primary border border-primary/10 rounded-2xl shadow-lg shadow-primary/5">
                                    <Globe size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter font-primary leading-none">Global Network Sync</h2>
                                    <p className="text-text-secondary/60 font-black uppercase tracking-[0.3em] text-[9px] mt-2">Shared Intelligence From Participants</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {sharedOutcomes.map(outcome => (
                                    <div key={outcome._id} className="bg-main-bg/30 border border-border-accent p-8 rounded-[2.25rem] space-y-6 transition-all hover:bg-white hover:shadow-2xl hover:shadow-secondary/5 group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-secondary text-primary flex items-center justify-center text-[10px] font-black">
                                                    {outcome.role?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{outcome.role} Intelligence</span>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${outcome.sentiment === 'positive' ? 'bg-primary/10 text-primary' : outcome.sentiment === 'negative' ? 'bg-red-50 text-red-600' : 'bg-alt-bg text-text-secondary'}`}>
                                                {outcome.sentiment}
                                            </span>
                                        </div>
                                        <p className="text-secondary font-bold text-base whitespace-pre-wrap leading-relaxed border-l-2 border-primary/10 pl-6">{outcome.summary}</p>
                                        {outcome.actionItems?.length > 0 && (
                                            <div className="space-y-3 pt-6 border-t border-border-accent/30">
                                                <h5 className="text-[10px] font-black text-text-secondary/30 uppercase tracking-[0.2em]">Cross-Department Pipe</h5>
                                                {outcome.actionItems.map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 text-xs font-black text-secondary/60">
                                                        <CheckCircle2 size={16} className={item.completed ? 'text-primary' : 'text-text-secondary/10'} />
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
                <div className="space-y-8">
                    {/* Attendees */}
                    <div className="bg-white border border-border-accent p-8 rounded-[2.75rem] shadow-2xl shadow-secondary/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-secondary flex items-center gap-3 uppercase tracking-[0.25em] font-primary">
                                <UsersIcon size={18} className="text-primary" /> Active Personnel
                            </h3>
                            {(currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.id === meeting.organizer) && (
                                !editingAttendees ? (
                                    <button
                                        onClick={() => setEditingAttendees(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 px-4 py-2 rounded-xl hover:bg-header-bg transition-all flex items-center gap-2"
                                    >
                                        <Edit3 size={12} /> Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingAttendees(false); setLocalAttendees(meeting.attendees || []); setLocalExternalAttendees(meeting.externalAttendees || []); }} className="text-[9px] font-black uppercase tracking-widest text-text-secondary border border-border-accent px-3 py-2 rounded-xl hover:bg-alt-bg transition-all">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveAttendees}
                                            disabled={savingAttendees}
                                            className="text-[9px] font-black uppercase tracking-widest text-white bg-primary px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
                                        >
                                            {savingAttendees ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                            Save
                                        </button>
                                    </div>
                                )
                            )}
                        </div>

                        {editingAttendees ? (
                            <div className="space-y-6">
                                {/* Internal Staff */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest mb-3">Meeting Metadata</h4>
                                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                                        {staff?.map(person => (
                                            <button
                                                key={person._id}
                                                type="button"
                                                onClick={() => toggleLocalAttendee(person._id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${localAttendees.find(a => a.userId === person._id)
                                                    ? 'bg-secondary border-secondary text-primary shadow-xl shadow-secondary/10'
                                                    : 'bg-white border-border-accent text-secondary/60 hover:border-primary/20'
                                                    }`}
                                            >
                                                <span className="truncate">{person.fullName}</span>
                                                {localAttendees.find(a => a.userId === person._id) && <CheckCircle2 size={14} className="text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* External Emails */}
                                <div className="space-y-4 pt-4 border-t border-border-accent">
                                    <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><Mail size={12} className="text-primary" /> External Guests</p>
                                    <div className="flex gap-3">
                                        <input
                                            type="email"
                                            placeholder="guest@company.com"
                                            value={attendeeExternalInput}
                                            onChange={(e) => setAttendeeExternalInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttendeeExternalEmail(); } }}
                                            className="flex-1 px-5 py-3 rounded-2xl border border-border-accent text-xs font-black bg-main-bg/30 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none shadow-inner"
                                        />
                                        <button type="button" onClick={addAttendeeExternalEmail} className="px-5 py-3 bg-secondary text-primary border border-secondary rounded-[1rem] font-black text-xs hover:bg-black transition-all">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {localExternalAttendees.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            {localExternalAttendees.map(email => (
                                                <div key={email} className="flex items-center justify-between bg-white border border-border-accent px-4 py-2.5 rounded-xl shadow-sm">
                                                    <span className="text-[11px] font-black text-secondary truncate">{email}</span>
                                                    <button type="button" onClick={() => removeAttendeeExternalEmail(email)} className="text-text-secondary/30 hover:text-primary transition-colors ml-2 flex-shrink-0">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {meeting.attendeesWithDetails?.map((attendee) => (
                                    <div key={attendee.userId} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-[1.25rem] bg-secondary flex items-center justify-center text-primary font-black text-base border border-white/5 transition-transform group-hover:scale-110 shadow-lg shadow-secondary/10 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/20 transition-colors" />
                                            <span className="relative z-10">{attendee.name?.charAt(0)}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-secondary text-base tracking-tighter leading-tight group-hover:text-primary transition-colors">{attendee.name}</p>
                                            <p className="text-[9px] text-text-secondary/40 font-black uppercase tracking-[0.25em] mt-1">{attendee.role}</p>
                                        </div>
                                    </div>
                                ))}
                                {meeting.externalAttendees?.length > 0 && (
                                    <div className="pt-8 border-t border-border-accent/40 space-y-4">
                                        <p className="text-[10px] font-black text-text-secondary/20 uppercase tracking-[0.3em] flex items-center gap-2"><Mail size={12} className="text-primary" /> External Network</p>
                                        {meeting.externalAttendees.map(email => (
                                            <div key={email} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-alt-bg flex items-center justify-center border border-border-accent group-hover:border-primary/20 transition-all text-text-secondary/30 group-hover:text-primary">
                                                    <Mail size={16} />
                                                </div>
                                                <span className="text-[11px] font-black text-secondary truncate tracking-tight">{email}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!meeting.attendeesWithDetails?.length && !meeting.externalAttendees?.length && (
                                    <p className="text-[10px] text-text-secondary/20 font-black uppercase tracking-[0.4em] text-center py-6 border-2 border-dashed border-border-accent rounded-[2rem]">No active personnel.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Files */}
                    <div className="bg-white border border-border-accent p-8 rounded-[2.75rem] shadow-2xl shadow-secondary/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-secondary flex items-center gap-3 uppercase tracking-[0.25em] font-primary">
                                <FileIcon size={18} className="text-primary" /> Strategic Assets
                            </h3>
                            <label className="cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                <div className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-header-bg/50 px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5 border border-primary/10">
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    Deploy
                                </div>
                            </label>
                        </div>
                        <div className="space-y-3">
                            {files?.length > 0 ? files.map((file) => (
                                <div key={file._id} className="flex items-center justify-between p-4 bg-alt-bg/30 rounded-2xl group border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-secondary/5 transition-all">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-white rounded-3xl border border-border-accent group-hover:border-primary/20 transition-colors">
                                            <FileIcon size={16} className="text-text-secondary/40 group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="text-[11px] font-black text-secondary truncate uppercase tracking-tight group-hover:text-primary transition-colors">{file.fileName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDownloadFile(file.storageKey, file.fileName)}
                                            className="p-2 text-text-secondary/30 hover:text-primary hover:bg-header-bg/50 rounded-lg transition-all"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFile(file._id)}
                                            className="p-2 text-text-secondary/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-20 flex flex-col items-center gap-3">
                                    <Upload size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Vault is empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

