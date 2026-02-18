import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    X,
    Upload,
    FileText,
    Trash2,
    Loader2,
    Send
} from "lucide-react";
import toast from "react-hot-toast";

export default function SubmissionModal({ task, requirement, currentUser, onClose }) {
    const [title, setTitle] = useState(`Submission for ${task.title}`);
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]); // { fileName, storageKey, fileType, fileSize }
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);
    const generateUploadUrl = useAction(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const createSubmission = useMutation(api.submissions.createSubmission);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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

            // We don't necessarily need saveFile here if we store keys in submission, 
            // but it's good practice for the files table.
            await saveFile({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storageKey: key,
                uploadedBy: currentUser.id,
                entityType: "submission",
                // entityId will be set after submission is created, or we can leave it optional
            });

            setFiles(prev => [...prev, {
                fileName: file.name,
                storageKey: key,
                fileType: file.type,
                fileSize: file.size
            }]);

            toast.success(`${file.name} uploaded`, { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(`Failed to upload ${file.name}`, { id: toastId });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Please provide a title");
            return;
        }

        setSubmitting(true);
        try {
            await createSubmission({
                title,
                description,
                taskId: task._id,
                requirementId: requirement._id,
                clientId: requirement.clientId,
                submittedBy: currentUser.id,
                deliverables: files.map(f => f.storageKey)
            });
            toast.success("Work submitted successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit work");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Submit Your Work</h2>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{task.taskNumber} • {requirement.requirementName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Submission Title</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="e.g., Initial design draft"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Description / Notes</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                placeholder="Explain what you've completed and any important details..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Deliverables / Attachments</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-700">Click to upload files</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1">Images, PDFs, Documents (Max 10MB)</p>
                                </div>
                            </div>

                            {/* File List */}
                            <div className="mt-4 space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-slate-100">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{file.fileName}</span>
                                                <span className="text-[10px] font-medium text-slate-400">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors rounded-xl"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="flex-2 py-4 px-6 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-linear-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Work
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
