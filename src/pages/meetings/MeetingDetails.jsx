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
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/meetings")}
                    className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm hover:shadow hover:scale-105"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{meeting.title}</h1>
                    <p className="text-slate-500 font-medium mt-1">{meeting.companyName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Meeting Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-white via-slate-50/30 to-white border border-slate-200 p-8 rounded-[2rem] shadow-lg space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Meeting Info</h2>
                            {!editMode ? (
                                (currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'client' || meeting.organizer === currentUser.id) && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                                    >
                                        Edit Details
                                    </button>
                                )
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => setEditMode(false)} className="font-bold px-5 py-2.5 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-50">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveMeetingDetails}
                                        disabled={loading}
                                        className="font-bold px-6 py-2.5 rounded-2xl bg-green-600 text-white flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                                </div>
                                <p className="font-black text-slate-900">{new Date(meeting.scheduledAt).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Time</span>
                                </div>
                                <p className="font-black text-slate-900">{new Date(meeting.scheduledAt).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        {editMode ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        className="w-full p-4 rounded-2xl border border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white font-bold text-sm"
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="no-show">No Show</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {meeting.description && <p className="text-slate-600 font-medium">{meeting.description}</p>}
                            </div>
                        )}
                    </div>

                    {/* My Outcome Section */}
                    <div className="bg-gradient-to-br from-white via-blue-50/20 to-white border-2 border-blue-100 p-8 rounded-[2rem] shadow-lg space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Lock size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">My Notes</h2>
                                    <p className="text-xs text-slate-500 font-medium">Only visible to you</p>
                                </div>
                            </div>
                            {!outcomeEditMode ? (
                                <button
                                    onClick={() => setOutcomeEditMode(true)}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                                >
                                    {myOutcome ? "Edit Note" : "Add Note"}
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => { setOutcomeEditMode(false); resetOutcomeForm(); }} className="font-bold px-5 py-2.5 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-50">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveOutcome}
                                        disabled={loading}
                                        className="font-bold px-6 py-2.5 rounded-2xl bg-green-600 text-white flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Save Note
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
                                        className="w-5 h-5 rounded"
                                    />
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Globe size={16} />
                                        Share this note with all meeting participants
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sentiment</label>
                                    <select
                                        value={outcomeSentiment}
                                        onChange={(e) => setOutcomeSentiment(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white font-bold text-sm"
                                    >
                                        <option value="positive">Positive & Progressive</option>
                                        <option value="neutral">Neutral / Standard</option>
                                        <option value="negative">Negative / Requires Attention</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Summary</label>
                                    <textarea
                                        value={outcomeSummary}
                                        onChange={(e) => setOutcomeSummary(e.target.value)}
                                        rows="4"
                                        className="w-full p-4 rounded-2xl border border-slate-200"
                                        placeholder="Summarize the key takeaways..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action Items</label>
                                        <button onClick={addActionItem} className="text-blue-600 font-bold text-xs flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100">
                                            <Plus size={14} /> Add Action
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {outcomeActionItems?.map((item) => (
                                            <div key={item.id} className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 items-start group">
                                                <button
                                                    onClick={() => toggleActionItem(item.id)}
                                                    className={`mt-1 p-1 rounded-lg border transition-colors ${item.completed ? 'bg-green-600 border-green-600 text-white' : 'border-slate-200 text-transparent hover:border-blue-400'}`}
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                                <input
                                                    value={item.description}
                                                    onChange={(e) => updateActionItem(item.id, e.target.value)}
                                                    className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                                                    placeholder="Task description..."
                                                />
                                                <button onClick={() => removeActionItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all">
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
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${myOutcome.sentiment === 'positive' ? 'bg-green-100 text-green-700' : myOutcome.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {myOutcome.sentiment}
                                    </span>
                                    {!myOutcome.isPrivate && <span className="text-xs text-blue-600 font-bold flex items-center gap-1"><Globe size={12} /> Shared</span>}
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{myOutcome.summary}</p>
                                {myOutcome.actionItems?.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">My Action Items</h4>
                                        {myOutcome.actionItems.map(item => (
                                            <div key={item.id} className="flex gap-3 items-start">
                                                <div className={`mt-1 h-5 w-5 rounded-lg border-2 shrink-0 flex items-center justify-center ${item.completed ? 'bg-green-600 border-green-600 text-white' : 'border-slate-200'}`}>
                                                    {item.completed && <CheckCircle2 size={12} />}
                                                </div>
                                                <span className={`font-medium text-sm ${item.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                                                    {item.description}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <OutcomeFiles outcomeId={myOutcome._id} isEditable={true} />
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No notes yet. Add your meeting summary here.</p>
                            </div>
                        )}
                    </div>

                    {/* Shared Outcomes */}
                    {sharedOutcomes.length > 0 && (
                        <div className="bg-gradient-to-br from-white via-green-50/20 to-white border-2 border-green-100 p-8 rounded-[2rem] shadow-lg space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-xl">
                                    <Globe size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Shared Notes</h2>
                                    <p className="text-xs text-slate-500 font-medium">From other participants</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {sharedOutcomes.map(outcome => (
                                    <div key={outcome._id} className="bg-white border border-green-100 p-6 rounded-2xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{outcome.role}</span>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${outcome.sentiment === 'positive' ? 'bg-green-100 text-green-700' : outcome.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {outcome.sentiment}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 font-medium whitespace-pre-wrap">{outcome.summary}</p>
                                        {outcome.actionItems?.length > 0 && (
                                            <div className="space-y-2 pt-2 border-t border-green-50">
                                                <h5 className="text-xs font-bold text-slate-400 uppercase">Action Items</h5>
                                                {outcome.actionItems.map(item => (
                                                    <div key={item.id} className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 size={14} className={item.completed ? 'text-green-600' : 'text-slate-300'} />
                                                        <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-600'}>{item.description}</span>
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
                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-4">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                            <UsersIcon size={18} className="text-blue-600" /> Attendees
                        </h3>
                        <div className="space-y-3">
                            {meeting.attendeesWithDetails?.map((attendee) => (
                                <div key={attendee.userId} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                                        {attendee.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 text-sm">{attendee.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{attendee.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Files */}
                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                <FileIcon size={18} className="text-purple-600" /> Files
                            </h3>
                            <label className="cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                <div className="text-blue-600 font-bold text-xs flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100">
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    Upload
                                </div>
                            </label>
                        </div>
                        <div className="space-y-2">
                            {files?.map((file) => (
                                <div key={file._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                                    <div className="flex items-center gap-2 flex-1">
                                        <FileIcon size={16} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 truncate">{file.fileName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDownloadFile(file.storageKey, file.fileName)} className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700">
                                            <ExternalLink size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteFile(file._id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {!files?.length && <p className="text-sm text-slate-400 text-center py-4">No files yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
