import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

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
        description: "",
    });


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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await scheduleMeeting({
                ...formData,
                scheduledAt: new Date(formData.scheduledAt).getTime(),
                organizer: currentUser.id,
                // Clean up empty optional fields
                requirementId: formData.requirementId || undefined,
                clientId: formData.clientId || undefined,
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
                description: "",
            });
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight font-primary">Meetings & Sync</h1>
                    <p className="text-text-secondary font-black uppercase tracking-widest text-[10px] mt-1">Track and schedule your strategic alignment sessions.</p>
                </div>

                {(currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'client') && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-secondary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={18} />
                        Schedule Briefing
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="bg-card-bg rounded-[2.5rem] border border-border-accent shadow-sm overflow-hidden font-secondary">
                <div className="p-6 border-b border-border-accent/30 flex items-center gap-4 bg-alt-bg/30">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                        <input
                            type="text"
                            placeholder="Filter briefing history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card-bg border border-border-accent/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-bold text-sm text-secondary placeholder:text-text-secondary/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-alt-bg/50 text-text-secondary/60 text-[10px] font-black uppercase tracking-widest border-b border-border-accent/30">
                            <tr>
                                <th className="px-8 py-5">Briefing Scope</th>
                                <th className="px-8 py-5">Portfolio Account</th>
                                <th className="px-8 py-5">Timeline</th>
                                <th className="px-8 py-5">Attendees</th>
                                <th className="px-8 py-5">Access</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {!meetings ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400 italic">Synchronizing meetings...</td>
                                </tr>
                            ) : meetings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-400">No meetings scheduled yet.</td>
                                </tr>
                            ) : meetings.map((meeting) => (
                                <tr
                                    key={meeting._id}
                                    className="hover:bg-header-bg/20 transition-colors group cursor-pointer border-b border-border-accent/20 last:border-0"
                                    onClick={() => navigate(`/meetings/${meeting._id}`)}
                                >
                                    <td className="px-8 py-6">
                                        <div className="font-black text-secondary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{meeting.title}</div>
                                        <div className="text-[10px] text-text-secondary/60 mt-1 uppercase font-bold tracking-widest">{meeting.type.replace('-', ' ')}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xs font-black text-secondary/80 uppercase tracking-tight">{meeting.companyName}</div>
                                        <div className="text-[10px] text-text-secondary/40 mt-1 uppercase font-bold tracking-widest">{meeting.requirementName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-800">
                                            {new Date(meeting.scheduledAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <span>({meeting.duration} min)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {meeting.attendeesWithDetails?.map((a, i) => (
                                                <div
                                                    key={i}
                                                    title={a.name}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600"
                                                >
                                                    {a.name?.charAt(0) || '?'}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {meeting.location ? (
                                            <a
                                                href={meeting.location.startsWith('http') ? meeting.location : `https://${meeting.location}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary hover:text-primary-dark font-black tracking-widest text-[10px] flex items-center gap-1.5 uppercase transition-colors"
                                            >
                                                <Video size={14} />
                                                Video Link
                                            </a>
                                        ) : (
                                            <span className="text-text-secondary/20 text-[10px] uppercase font-bold">In-Person</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${meeting.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                                            meeting.status === 'completed' ? 'bg-success/10 text-success' :
                                                'bg-alt-bg text-text-secondary'
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300">
                        <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Schedule New Meeting</h3>
                                <p className="text-slate-500 text-sm">Fill in details for the sync session.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Meeting Title *</label>
                                    <input
                                        required
                                        name="title"
                                        placeholder="Weekly Progress Review"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Meeting Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
                                    >
                                        <option value="sales-call">Sales Call</option>
                                        <option value="kickoff">Kickoff Call</option>
                                        <option value="status-update">Status Update</option>
                                        <option value="review">Review</option>
                                        <option value="general">General</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Google Meet Link</label>
                                    <div className="relative">
                                        <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            name="location"
                                            placeholder="meet.google.com/xxx-xxxx-xxx"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date & Time *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        name="scheduledAt"
                                        value={formData.scheduledAt}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Client *</label>
                                    <select
                                        required
                                        name="clientId"
                                        value={formData.clientId}
                                        onChange={handleInputChange}
                                        disabled={currentUser.role === 'client'}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <option value="">Select a Client</option>
                                        {clients?.map(c => (
                                            <option key={c._id} value={c._id}>{c.companyName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Requirement</label>
                                    <select
                                        name="requirementId"
                                        value={formData.requirementId}
                                        onChange={handleInputChange}
                                        disabled={!formData.clientId}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <option value="">Select Requirement (Optional)</option>
                                        {selectedRequirements?.map(r => (
                                            <option key={r._id} value={r._id}>{r.requirementName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <UsersIcon size={16} className="text-blue-500" />
                                    Assign Attendees (Admin & Employees)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                                    {staff?.map(person => (
                                        <button
                                            key={person._id}
                                            type="button"
                                            onClick={() => toggleAttendee(person._id)}
                                            className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center justify-between ${formData.attendees.find(a => a.userId === person._id)
                                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                                : "bg-white border-slate-200 text-slate-700 hover:border-blue-400"
                                                }`}
                                        >
                                            <span className="truncate">{person.fullName}</span>
                                            {formData.attendees.find(a => a.userId === person._id) && <CheckCircle2 size={12} />}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 italic">Freelancers and Admins listed here are available for selection.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Meeting Agenda / Internal Notes</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Discuss timeline, deliverables and blockers..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 resize-none"
                                />
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold font-sans shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Calendar size={20} />}
                                    {loading ? "Scheduling..." : "Create Meeting"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 rounded-2xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
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
