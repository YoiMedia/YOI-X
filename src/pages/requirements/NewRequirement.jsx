import { useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Loader2,
    Save,
    Plus,
    Trash2,
    Video,
    Calendar,
    FileText,
    ArrowDownToLine,
    ArrowRight,
    Users as UsersIcon
} from "lucide-react";
import toast from "react-hot-toast";

export default function NewRequirement() {
    const navigate = useNavigate();
    const { id, projectId: paramProjectId } = useParams(); // 'id' for view mode, 'projectId' for new
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Determine if we are in view mode
    const isViewMode = !!id && id !== "new-requirement";

    // Resolve projectId from Params > State > Query > null
    const projectId = paramProjectId || location.state?.projectId || searchParams.get("projectId") || "";
    const currentUser = getUser();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]); // Array of { name, key, type, size }
    const [newItem, setNewItem] = useState(""); // State for simple item input

    // Fetch requirement if in view mode
    const requirement = useQuery(api.requirements.getRequirementById, isViewMode ? { requirementId: id } : "skip");

    // Fetch projects to populate dropdown
    const projects = useQuery(api.projects.listProjects);
    const clients = useQuery(api.clients.listClients, currentUser.role === "sales" ? { salesPersonId: currentUser.id } : {});

    const createRequirement = useMutation(api.requirements.createRequirement);
    const updateRequirement = useMutation(api.requirements.updateRequirement);
    const generateUploadUrl = useAction(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const copyFileToEntity = useMutation(api.files.copyFileToEntity);
    const getFileUrl = useAction(api.files.getFileUrl);

    // Fetch existing files if in view mode
    const existingFiles = useQuery(api.files.getFiles, isViewMode ? { entityType: "requirement", entityId: id } : "skip");

    const [formData, setFormData] = useState({
        requirementName: "",
        description: "",
        projectId: projectId || "", // Pre-fill if coming from project page
        clientId: "", // Will auto-fill if project selected
        salesPersonId: currentUser.id,
        priority: "medium",
        estimatedBudget: "",
        estimatedHours: "",
        items: [] // { id, title, description, priority, estimatedHours }
    });

    // Populate data if in view mode
    useEffect(() => {
        if (requirement) {
            setFormData({
                requirementName: requirement.requirementName,
                description: requirement.description || "",
                projectId: requirement.projectId || "",
                clientId: requirement.clientId,
                salesPersonId: requirement.salesPersonId,
                priority: requirement.priority || "medium",
                estimatedBudget: requirement.estimatedBudget?.toString() || "",
                estimatedHours: requirement.estimatedHours?.toString() || "",
                items: requirement.items || []
            });
        }
    }, [requirement]);

    // Fetch Meeting Outcomes for sidebar
    const contextMeetings = useQuery(api.meetings.getContextMeetings,
        formData.projectId ? { projectId: formData.projectId } : { projectId: undefined }
    );

    // Effect to auto-select client if project is selected
    useEffect(() => {
        if (!isViewMode && formData.projectId && projects) {
            const project = projects.find(p => p._id === formData.projectId);
            if (project) {
                setFormData(prev => ({ ...prev, clientId: project.clientId }));
            }
        }
    }, [formData.projectId, projects, isViewMode]);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { uploadUrl, key } = await generateUploadUrl({
                contentType: file.type,
                fileName: file.name
            });

            await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            });

            setAttachedFiles(prev => [...prev, {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storageKey: key,
                isNewUpload: true // flag to know we need to save record
            }]);

            toast.success("File uploaded ready to attach");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    const handleImportFile = async (file) => {
        setAttachedFiles(prev => [...prev, {
            ...file,
            isImport: true, // flag to know we copy
            originalFileId: file._id
        }]);
        toast.success(`Marked ${file.fileName} for import`);
    };

    const handleDownload = async (storageKey) => {
        try {
            const url = await getFileUrl({ storageKey });
            window.open(url, '_blank');
        } catch (error) {
            toast.error("Failed to get file URL");
        }
    };

    const handleAddItem = () => {
        if (!newItem.trim()) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                id: crypto.randomUUID(), // Generate a client-side ID for list management
                title: newItem,
                description: "",
                priority: "medium",
                estimatedHours: 0
            }]
        }));
        setNewItem("");
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.projectId) {
                toast.error("Please select a project first.");
                setLoading(false);
                return;
            }

            let reqId;
            if (isViewMode) {
                await updateRequirement({
                    requirementId: id,
                    requirementName: formData.requirementName,
                    description: formData.description,
                    estimatedBudget: Number(formData.estimatedBudget) || 0,
                    estimatedHours: Number(formData.estimatedHours) || 0,
                    items: formData.items
                });
                reqId = id;
            } else {
                reqId = await createRequirement({
                    requirementName: formData.requirementName,
                    description: formData.description,
                    clientId: formData.clientId,
                    projectId: formData.projectId,
                    salesPersonId: formData.salesPersonId,
                    estimatedBudget: Number(formData.estimatedBudget) || 0,
                    estimatedHours: Number(formData.estimatedHours) || 0,
                    items: formData.items // Pass the sub-items
                });
            }

            // Process Attachments (only new uploads/imports)
            const newFiles = attachedFiles.filter(f => f.isNewUpload || f.isImport);
            if (newFiles.length > 0) {
                await Promise.all(newFiles.map(async (file) => {
                    if (file.isNewUpload) {
                        await saveFile({
                            fileName: file.fileName,
                            fileType: file.fileType,
                            fileSize: file.fileSize,
                            storageKey: file.storageKey,
                            uploadedBy: currentUser.id,
                            entityType: "requirement",
                            entityId: reqId,
                            description: "Requirement attachment"
                        });
                    } else if (file.isImport) {
                        await copyFileToEntity({
                            fileId: file.originalFileId,
                            targetEntityType: "requirement",
                            targetEntityId: reqId,
                            userId: currentUser.id
                        });
                    }
                }));
            }

            toast.success(isViewMode ? "Requirement updated successfully!" : "Requirement created successfully!");
            if (!isViewMode) navigate("/requirements");

        } catch (error) {
            toast.error(`Failed to ${isViewMode ? 'update' : 'create'} requirement: ` + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <button
                onClick={() => navigate("/requirements")}
                className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-bold group mb-6"
            >
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Context Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Assigned Employees Section */}
                    {isViewMode && requirement?.assignedEmployeesDetails && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                                <UsersIcon size={20} className="text-blue-500" />
                                Assigned Team
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {requirement.assignedEmployeesDetails.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No employees assigned yet.</p>
                                )}
                                {requirement.assignedEmployeesDetails.map(emp => (
                                    <div
                                        key={emp.id}
                                        className="rounded-full bg-blue-100 border border-blue-200 flex px-3 py-1.5 items-center justify-center text-xs font-bold text-blue-700 shadow-sm"
                                        title={emp.name}
                                    >
                                        {emp.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
                        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <Video size={20} className="text-blue-500" />
                            Meeting Context
                        </h3>
                        <p className="text-xs text-slate-500 mb-6 font-medium">Use insights from recent or linked meetings to define requirements.</p>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {!contextMeetings && <div className="text-center py-10"><Loader2 className="animate-spin text-slate-400 mx-auto" /></div>}
                            {contextMeetings?.length === 0 && <div className="text-slate-400 text-sm italic text-center">No relevant meetings found.</div>}

                            {contextMeetings?.map(meeting => (
                                <MeetingContextCard
                                    key={meeting._id}
                                    meeting={meeting}
                                    onImportFile={handleImportFile}
                                    disabled={isViewMode && currentUser.role === 'admin'}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {isViewMode ? "Requirement Details" : "New Requirement"}
                                </h1>
                                <p className="text-slate-500 font-medium">
                                    {isViewMode ? `Viewing ${requirement?.requirementNumber || "Requirement"}` : "Define the requirements for a project."}
                                </p>
                            </div>
                            {isViewMode && (
                                <div className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest ${requirement?.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                    requirement?.status === 'draft' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                                        'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                    {requirement?.status}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Project</label>
                                    <select
                                        required
                                        disabled={isViewMode}
                                        value={formData.projectId}
                                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white font-medium disabled:bg-slate-50 disabled:text-slate-500"
                                    >
                                        <option value="">Select a Project</option>
                                        {projects?.map(proj => (
                                            <option key={proj._id} value={proj._id}>
                                                {proj.projectName} ({proj.projectNumber})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Requirement Title</label>
                                    <input
                                        required
                                        disabled={isViewMode && currentUser.role === 'admin'}
                                        value={formData.requirementName}
                                        onChange={(e) => setFormData({ ...formData, requirementName: e.target.value })}
                                        className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-bold text-lg disabled:bg-slate-100 disabled:text-slate-600"
                                        placeholder="e.g. User Authentication Module"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Detailed Description</label>
                                    <textarea
                                        disabled={isViewMode && currentUser.role === 'admin'}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="5"
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                                        placeholder="Describe the functional and non-functional requirements..."
                                    />
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Requirement Items (Tasks)</label>

                                <div className="space-y-2 mb-3">
                                    {formData.items.length === 0 && <div className="text-xs text-slate-400 italic">No items added yet.</div>}
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                            <span className="flex-1 font-bold text-slate-700">{item.title}</span>
                                            {!(isViewMode && currentUser.role === 'admin') && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!(isViewMode && currentUser.role === 'admin') && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={newItem}
                                            onChange={(e) => setNewItem(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-slate-400"
                                            placeholder="Add a sub-task or item..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-3 rounded-xl transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Attachments Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Attachments</label>
                                    {!(isViewMode && currentUser.role === 'admin') && (
                                        <label className="cursor-pointer text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1">
                                            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                            Upload File
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    )}
                                </div>

                                {((existingFiles && existingFiles.length > 0) || attachedFiles.length > 0) && (
                                    <div className="space-y-3 mb-4">
                                        {/* Existing Files */}
                                        {existingFiles?.map((file) => (
                                            <div key={file._id} className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-blue-500" />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 leading-tight">{file.fileName}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">Uploaded by {file.uploaderName}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload(file.storageKey)}
                                                    className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-600 transition-colors"
                                                >
                                                    <ArrowDownToLine size={14} />
                                                    Download
                                                </button>
                                            </div>
                                        ))}

                                        {/* New/Pending Files */}
                                        {attachedFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-700 leading-tight">{file.fileName}</span>
                                                        {file.isImport && <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Imported</span>}
                                                        {!file.isImport && <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">New Upload</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={isViewMode && currentUser.role === 'admin'}
                                                    onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-slate-400 hover:text-red-500 disabled:opacity-0"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Est. Budget ($)</label>
                                    <input
                                        type="number"
                                        disabled={isViewMode && currentUser.role === 'admin'}
                                        value={formData.estimatedBudget}
                                        onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium disabled:bg-slate-50"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Est. Hours</label>
                                    <input
                                        type="number"
                                        disabled={isViewMode && currentUser.role === 'admin'}
                                        value={formData.estimatedHours}
                                        onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium disabled:bg-slate-50"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {!(isViewMode && currentUser.role === 'admin') && (
                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                        {isViewMode ? "Update Requirement" : "Save Requirement"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Child component for meeting card in sidebar
function MeetingContextCard({ meeting, onImportFile }) {
    const meetingFiles = useQuery(api.files.getFiles, { entityType: "meeting", entityId: meeting._id });
    const meetingOutcomes = useQuery(api.meetingOutcomes.listMeetingOutcomes, {
        meetingId: meeting._id,
        userId: undefined,
        role: undefined
    });
    const [expanded, setExpanded] = useState(false);

    const scheduledDate = new Date(meeting.scheduledAt);

    // Get shared outcomes (non-private) for preview
    const sharedOutcomes = meetingOutcomes?.filter(o => !o.isPrivate) || [];

    return (
        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:bg-white hover:shadow-md transition-all group">
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {meeting.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                        {scheduledDate.toLocaleDateString()}
                    </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{meeting.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="truncate max-w-[100px]">{meeting.organizerName}</span>
                    <span>•</span>
                    <span className="truncate max-w-[100px]">{meeting.companyName}</span>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 bg-white border-t border-slate-100 animate-in slide-in-from-top-2">
                    {/* Meeting Notes/Outcomes */}
                    {sharedOutcomes.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</div>
                            {sharedOutcomes.map(outcome => (
                                <div key={outcome._id} className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="font-bold text-slate-700 text-[10px] uppercase">{outcome.role}</span>
                                        {outcome.sentiment && (
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${outcome.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                    outcome.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {outcome.sentiment}
                                            </span>
                                        )}
                                    </div>
                                    <p className="line-clamp-2">"{outcome.summary}"</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Files List */}
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Attachments</div>
                        {!meetingFiles || meetingFiles.length === 0 ? (
                            <div className="text-xs text-slate-400 italic">No files attached.</div>
                        ) : (
                            meetingFiles.map(file => (
                                <div key={file._id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText size={12} className="text-blue-500" />
                                        <span className="truncate max-w-[120px]">{file.fileName}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onImportFile(file); }}
                                        className="flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-1 rounded-lg font-bold text-[10px] transition-all"
                                        title="Import this file to requirement"
                                    >
                                        <Plus size={12} />
                                        Import
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {!expanded && (sharedOutcomes.length > 0 || (meetingFiles && meetingFiles.length > 0)) && (
                <div className="px-4 pb-2 flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    {sharedOutcomes.length > 0 && <span>{sharedOutcomes.length} note{sharedOutcomes.length !== 1 ? 's' : ''}</span>}
                    {sharedOutcomes.length > 0 && meetingFiles && meetingFiles.length > 0 && <span>•</span>}
                    {meetingFiles && meetingFiles.length > 0 && (
                        <>
                            <FileText size={10} /> {meetingFiles.length} file{meetingFiles.length !== 1 ? 's' : ''}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
