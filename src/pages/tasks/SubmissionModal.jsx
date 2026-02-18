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

            await saveFile({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                storageKey: key,
                uploadedBy: currentUser.id,
                entityType: "submission",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card-bg w-full max-w-2xl rounded-[3rem] shadow-2xl border border-border-accent overflow-hidden animate-in zoom-in-95 duration-300 font-secondary">
                <div className="px-10 py-8 border-b border-border-accent/10 flex items-center justify-between bg-header-bg/20">
                    <div>
                        <h2 className="text-2xl font-black text-secondary tracking-tight font-primary">Submit Mission Asset</h2>
                        <p className="text-[10px] font-black text-text-secondary/40 mt-1 uppercase tracking-[0.2em]">{task.taskNumber} • {requirement.requirementName}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-card-bg rounded-2xl transition-all text-text-secondary/40 hover:text-secondary border border-transparent hover:border-border-accent">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest px-1">Technical Title</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-4 bg-alt-bg/30 border border-border-accent rounded-2xl text-sm font-black text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                placeholder="e.g., Initial design draft"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest px-1">Executive Summary / Technical Notes</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 bg-alt-bg/30 border border-border-accent rounded-2xl text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all resize-none"
                                placeholder="Explain what you've completed and any important details..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest px-1 text-center block">Digital Deliverables</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border-accent rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <div className="w-14 h-14 bg-card-bg border border-border-accent rounded-2xl flex items-center justify-center text-text-secondary/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-110 transition-all shadow-sm">
                                    {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-secondary">Deploy Technical Assets</p>
                                    <p className="text-[10px] font-black text-text-secondary/40 mt-1 uppercase tracking-widest leading-relaxed">System supports Images, PDFs, and Documents (Max 10MB)</p>
                                </div>
                            </div>

                            {/* File List */}
                            <div className="space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-alt-bg/30 rounded-2xl border border-border-accent animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-card-bg rounded-xl flex items-center justify-center text-primary shadow-sm border border-border-accent">
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-secondary uppercase tracking-tight">{file.fileName}</span>
                                                <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest mt-0.5">{(file.fileSize / 1024 / 1024).toFixed(2)} MB • Active Payload</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="p-2.5 hover:bg-error/10 text-text-secondary/20 hover:text-error transition-all rounded-xl"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-secondary bg-alt-bg hover:bg-alt-bg/50 transition-all border border-border-accent"
                        >
                            Decline
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="flex-[2] py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Commit Submission
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
