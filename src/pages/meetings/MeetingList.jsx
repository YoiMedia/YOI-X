import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    Calendar,
    Plus,
    Video,
    MapPin,
    Users as UsersIcon,
    Clock,
    ChevronRight,
    Search,
    X,
    CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MeetingList() {
    const currentUser = getUser();
    const navigate = useNavigate();
    const meetings = useQuery(api.meetings.listMeetings, { userId: currentUser.id, role: currentUser.role });
    const clients = useQuery(api.clients.listClients);
    const staff = useQuery(api.meetings.getStaff);
    const scheduleMeeting = useMutation(api.meetings.scheduleMeeting);
    const generateMeetLink = useAction(api.meetings.generateMeetLink);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        type: "general",
        scheduledAt: "",
        duration: 30,
        location: "",
        clientId: "",
        requirementId: "",
        attendees: [],
        externalAttendees: [],
        description: "",
    });

    // Input for adding a new external email
    const [externalEmailInput, setExternalEmailInput] = useState("");


    const selectedRequirements = useQuery(
        api.meetings.getRequirementsByClient,
        formData.clientId ? { clientId: formData.clientId } : "skip"
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === "duration" ? Number(value) : value
        }));
    };


    const toggleAttendee = (userId) => {
        setFormData(prev => {
            const isSelected = prev.attendees.find(a => a.userId === userId);
            if (isSelected) {
                return { ...prev, attendees: prev.attendees.filter(a => a.userId !== userId) };
            } else {
                return { ...prev, attendees: [...prev.attendees, { userId, status: "invited" }] };
            }
        });
    };

    const addExternalEmail = () => {
        const email = externalEmailInput.trim().toLowerCase();
        if (!email) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }
        if (formData.externalAttendees.includes(email)) {
            toast.error("This email is already added");
            return;
        }
        setFormData(prev => ({ ...prev, externalAttendees: [...prev.externalAttendees, email] }));
        setExternalEmailInput("");
    };

    const removeExternalEmail = (email) => {
        setFormData(prev => ({ ...prev, externalAttendees: prev.externalAttendees.filter(e => e !== email) }));
    };

    const handleGenerateLink = async () => {
        if (!formData.title || !formData.scheduledAt) {
            toast.error("Please fill title and date first");
            return;
        }

        setIsGenerating(true);
        try {
            // Get attendee emails from internal staff
            const internalEmails = formData.attendees.map(a => {
                const person = staff.find(s => s._id === a.userId);
                return person ? person.email : null;
            }).filter(Boolean);

            // Merge with external emails
            const attendeeEmails = [...internalEmails, ...formData.externalAttendees];

            const link = await generateMeetLink({
                title: formData.title,
                description: formData.description,
                scheduledAt: new Date(formData.scheduledAt).getTime(),
                duration: formData.duration,
                attendeeEmails
            });

            if (link) {
                setFormData(prev => ({ ...prev, location: link }));
                toast.success("Meet link generated!");
            } else {
                toast.error("Generated link was empty. Please check n8n.");
            }
        } catch (error) {
            toast.error(error.message || "Failed to generate link");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await scheduleMeeting({
                ...formData,
                scheduledAt: new Date(formData.scheduledAt).getTime(),
                organizer: currentUser.id,
                requirementId: formData.requirementId || undefined,
                clientId: formData.clientId || undefined,
                externalAttendees: formData.externalAttendees.length > 0 ? formData.externalAttendees : undefined,
            });
            toast.success("Meeting scheduled successfully!");
            setIsModalOpen(false);
            setFormData({
                title: "",
                type: "general",
                scheduledAt: "",
                duration: 30,
                location: "",
                clientId: "",
                requirementId: "",
                attendees: [],
                externalAttendees: [],
                description: "",
            });
            setExternalEmailInput("");
        } catch (error) {
            toast.error(error.message || "Failed to schedule meeting");
        } finally {
            setLoading(false);
        }
    };

    // Client-specific auto-fill
    const userClient = useQuery(api.clients.getClientByUserId, { userId: currentUser.id });
    useEffect(() => {
        if (currentUser.role === 'client' && userClient) {
            setFormData(prev => ({ ...prev, clientId: userClient._id }));
        }
    }, [userClient, currentUser.role]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-accent selection:bg-primary/20 selection:text-secondary">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                    <h1 className="text-5xl font-black text-secondary tracking-tighter font-primary leading-tight">Meetings & Sync</h1>
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mt-2">Strategic alignment sessions and briefing history.</p>
                </div>

                {(currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'client') && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-secondary text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl shadow-secondary/10 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <Plus size={20} className="text-primary group-hover:rotate-90 transition-transform" />
                        Schedule Briefing
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.75rem] border border-border-accent shadow-2xl shadow-secondary/5 overflow-hidden">
                <div className="p-8 border-b border-border-accent flex flex-col md:flex-row items-center gap-6 bg-main-bg/20">
                    <div className="relative flex-1 w-full group">
                        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter briefing history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-8 py-4 rounded-2xl bg-white border border-border-accent focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm text-secondary placeholder:text-text-secondary/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-main-bg/50 text-text-secondary/40 text-[10px] font-black uppercase tracking-[0.2em] border-b border-border-accent">
                            <tr>
                                <th className="px-10 py-6">Briefing Scope</th>
                                <th className="px-10 py-6">Portfolio Account</th>
                                <th className="px-10 py-6">Timeline</th>
                                <th className="px-10 py-6">Personnel</th>
                                <th className="px-10 py-6">Access</th>
                                <th className="px-10 py-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-accent">
                            {!meetings ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Loader2 className="animate-spin text-secondary" size={32} />
                                            <span className="font-black uppercase tracking-widest text-[10px]">Synchronizing...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : meetings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Calendar size={40} className="text-secondary" />
                                            <span className="font-black uppercase tracking-widest text-[10px]">Project history empty</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : meetings.map((meeting) => (
                                <tr
                                    key={meeting._id}
                                    className="hover:bg-header-bg/10 transition-colors group cursor-pointer"
                                    onClick={() => navigate(`/meetings/${meeting._id}`)}
                                >
                                    <td className="px-10 py-8">
                                        <div className="font-black text-secondary group-hover:text-primary transition-colors uppercase tracking-tight text-base leading-tight">{meeting.title}</div>
                                        <div className="text-[10px] text-text-secondary/50 mt-2 uppercase font-black tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                                            {meeting.type.replace('-', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-xs font-black text-secondary uppercase tracking-tight">{meeting.companyName}</div>
                                        <div className="text-[10px] text-text-secondary/40 mt-1 uppercase font-bold tracking-widest truncate max-w-[150px]">{meeting.requirementName || "General Sync"}</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-sm font-black text-secondary mb-1">
                                            {new Date(meeting.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] text-text-secondary font-black uppercase tracking-widest flex items-center gap-2 px-2 py-1 bg-alt-bg/50 rounded-lg w-fit">
                                            <Clock size={10} className="text-primary" />
                                            {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-sm">
                                        <div className="flex -space-x-3 overflow-hidden">
                                            {meeting.attendeesWithDetails?.slice(0, 4).map((a, i) => (
                                                <div
                                                    key={i}
                                                    title={a.name}
                                                    className="h-9 w-9 rounded-2xl ring-4 ring-white bg-secondary flex items-center justify-center text-[10px] font-black text-primary border border-white/10"
                                                >
                                                    {a.name?.charAt(0) || '?'}
                                                </div>
                                            ))}
                                            {(meeting.attendeesWithDetails?.length || 0) > 4 && (
                                                <div className="h-9 w-9 rounded-2xl ring-4 ring-white bg-alt-bg flex items-center justify-center text-[10px] font-black text-text-secondary border border-white/10">
                                                    +{(meeting.attendeesWithDetails?.length || 0) - 4}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        {meeting.location ? (
                                            <a
                                                href={meeting.location.startsWith('http') ? meeting.location : `https://${meeting.location}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5 group/btn"
                                            >
                                                <Video size={18} className="group-hover/btn:scale-110 transition-transform" />
                                            </a>
                                        ) : (
                                            <div className="h-10 w-10 rounded-2xl bg-alt-bg/50 text-text-secondary/30 flex items-center justify-center border border-dashed border-border-accent">
                                                <MapPin size={16} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border ${meeting.status === 'scheduled' ? 'bg-header-bg/50 text-primary border-primary/10' :
                                            meeting.status === 'completed' ? 'bg-success/5 text-success border-success/10' :
                                                'bg-alt-bg text-text-secondary border-border-accent'
                                            }`}>
                                            {meeting.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-main-bg w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative scrollbar-hide border border-white/10">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-10 py-8 border-b border-border-accent flex items-center justify-between z-20">
                            <div>
                                <h3 className="text-3xl font-black text-secondary tracking-tighter font-primary leading-tight">Strategic Briefing</h3>
                                <p className="text-primary font-black uppercase tracking-widest text-[9px] mt-1">Initialize a new session in the tactical pipeline.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-alt-bg hover:bg-primary hover:text-white rounded-[1.25rem] transition-all text-text-secondary group rotate-0 hover:rotate-90">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Briefing Title</label>
                                    <input
                                        required
                                        name="title"
                                        placeholder="Project X - Strategic Milestone Review"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-secondary placeholder:text-text-secondary/20 shadow-inner"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1 text-primary">Mission Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-white font-black text-secondary transition-all cursor-pointer focus:border-primary/40 focus:ring-4 focus:ring-primary/5 appearance-none"
                                    >
                                        <option value="sales-call">Tactical Sales Call</option>
                                        <option value="kickoff">Strategic Kickoff</option>
                                        <option value="status-update">Sync / Progress</option>
                                        <option value="review">Quality Assessment</option>
                                        <option value="general">Standard Briefing</option>
                                        <option value="other">Misc. Ops</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Timeline Placement</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        name="scheduledAt"
                                        value={formData.scheduledAt}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-white font-black text-secondary transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Communication Channel</label>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <Video size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
                                            <input
                                                readOnly
                                                name="location"
                                                placeholder="Encrypted Link Required"
                                                value={formData.location}
                                                className="w-full pl-14 pr-6 py-4 rounded-[1.25rem] border border-border-accent bg-alt-bg text-secondary font-black text-sm cursor-not-allowed opacity-60"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateLink}
                                            disabled={isGenerating || !formData.title || !formData.scheduledAt}
                                            className="px-6 py-4 bg-secondary text-primary rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                            {isGenerating ? "Deploying..." : "Provision Link"}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Session Length (Min)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-white font-black text-secondary transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Portfolio Account</label>
                                    <select
                                        required
                                        name="clientId"
                                        value={formData.clientId}
                                        onChange={handleInputChange}
                                        disabled={currentUser.role === 'client'}
                                        className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-white font-black text-secondary transition-all cursor-pointer disabled:opacity-40 appearance-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                    >
                                        <option value="">Select Target Client</option>
                                        {clients?.map(c => (
                                            <option key={c._id} value={c._id}>{c.companyName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Associated Objective</label>
                                    <select
                                        name="requirementId"
                                        value={formData.requirementId}
                                        onChange={handleInputChange}
                                        disabled={!formData.clientId}
                                        className="w-full px-6 py-4 rounded-[1.25rem] border border-border-accent bg-white font-black text-secondary transition-all cursor-pointer disabled:opacity-40 appearance-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                    >
                                        <option value="">Full Project Sync</option>
                                        {selectedRequirements?.map(r => (
                                            <option key={r._id} value={r._id}>{r.requirementName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                                    <UsersIcon size={18} className="text-primary" />
                                    Active Personnel Assignment
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-8 bg-white border border-border-accent rounded-[2rem] max-h-56 overflow-y-auto shadow-inner">
                                    {staff?.map(person => (
                                        <button
                                            key={person._id}
                                            type="button"
                                            onClick={() => toggleAttendee(person._id)}
                                            className={`p-3.5 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all border flex items-center justify-between group ${formData.attendees.find(a => a.userId === person._id)
                                                ? "bg-secondary border-secondary text-primary shadow-xl shadow-secondary/20"
                                                : "bg-main-bg border-transparent text-text-secondary/60 hover:border-primary/30"
                                                }`}
                                        >
                                            <span className="truncate">{person.fullName}</span>
                                            {formData.attendees.find(a => a.userId === person._id) && <CheckCircle2 size={12} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* External Attendees */}
                            <div className="space-y-6">
                                <label className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                                    <Mail size={18} className="text-primary" />
                                    External Stakeholders
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="email"
                                        placeholder="external.partner@company.com"
                                        value={externalEmailInput}
                                        onChange={(e) => setExternalEmailInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExternalEmail(); } }}
                                        className="flex-1 px-6 py-4 rounded-[1.25rem] border border-border-accent bg-white font-black text-secondary transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={addExternalEmail}
                                        className="px-8 py-4 bg-header-bg text-primary border border-primary/10 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                                    >
                                        Enlist
                                    </button>
                                </div>
                                {formData.externalAttendees.length > 0 && (
                                    <div className="flex flex-wrap gap-3 p-6 bg-white border border-border-accent rounded-[2rem]">
                                        {formData.externalAttendees.map(email => (
                                            <span key={email} className="flex items-center gap-3 bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                {email}
                                                <button type="button" onClick={() => removeExternalEmail(email)} className="text-primary hover:text-white transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Internal Strategic Brief</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Define primary objectives, deliverables, and confidential blockers..."
                                    className="w-full px-6 py-4 rounded-[1.5rem] border border-border-accent bg-white font-black text-secondary transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5 shadow-inner resize-none text-sm leading-relaxed"
                                />
                            </div>

                            <div className="pt-10 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={loading || !formData.location}
                                    className="flex-1 bg-primary text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-4 disabled:opacity-40 disabled:bg-slate-300 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Calendar size={20} />}
                                    {loading ? "Initializing..." : formData.location ? "Confirm Deployment" : "Link Provision Required"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] text-text-secondary border border-border-accent hover:bg-alt-bg transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function Loader2(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
