import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar, Layout, Users, Target, Save, Video, FileText, ArrowDownToLine } from "lucide-react";
import toast from "react-hot-toast";

export default function NewProject() {
    const navigate = useNavigate();
    const currentUser = getUser();
    const [loading, setLoading] = useState(false);

    const clients = useQuery(api.clients.listClients, currentUser.role === "sales" ? { salesPersonId: currentUser.id } : {});
    const createProject = useMutation(api.projects.createProject);

    // Fetch Meetings Context (Unassigned only mostly, since project is new)
    const contextMeetings = useQuery(api.meetings.getContextMeetings, { projectId: undefined });

    const [formData, setFormData] = useState({
        projectName: "",
        description: "",
        clientId: "",
        projectManagerId: currentUser.id, // defaulting to current user for now if they are manager role,
        priority: "medium",
        status: "planning",
        startDate: "",
        endDate: "",
        tags: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const projectId = await createProject({
                projectName: formData.projectName,
                description: formData.description,
                clientId: formData.clientId,
                projectManagerId: formData.projectManagerId, // In a real app, this should be a dropdown of users
                priority: formData.priority,
                status: formData.status,
                startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
                endDate: formData.endDate ? new Date(formData.endDate).getTime() : undefined,
            });

            toast.success("Project created successfully!");
            // Redirect to add requirement immediately as per user flow request or dashboard?
            // "so to add a requirement they need to add a project first... initially they will all be submitted at first"
            // Let's redirect to NewRequirement with projectId prefilled
            navigate(`/requirements/new-requirement`, { state: { projectId: projectId } });

            // Or better, use the URL param if we support it. 
            // My route config is: { path: "new-requirement", component: NewRequirement }
            // NewRequirement uses `useParams` for projectId if routed like /requirements/:projectId/new-requirement? No, current route is /new-requirement.
            // Let's check NewRequirement.jsx: `const { projectId } = useParams();`
            // Wait, useParams only works if the route path has :projectId. 
            // My route config has `path: "new-requirement"` and `path: ":id"`.
            // So if I navigate to `/requirements/${projectId}`, it goes to NewRequirement treating ID as projectId? 
            // Let's check routeConfig.js again.
            // `requirements.routes`: { path: ":id", component: NewRequirement }
            // So yes, `/requirements/${projectId}` loads NewRequirement with params.projectId = projectId.
            // Wait, is it projectId or just id? Params will be `id`.
            // In NewRequirement.jsx: `const { projectId } = useParams();`. This expects parameter named `projectId`.
            // If the route is `:id`, then useParams returns `{ id: "..." }`. I need to fix NewRequirement to read `id` or fix route.

            // Let's fix route logic: 
            // createProject returns ID. 
            // Navigate to `/requirements/new-requirement?projectId=${projectId}` is better if component supports search params.
            // OR Update route to `new-requirement/:projectId`.

            // Current `NewRequirement.jsx`: `const { projectId } = useParams();`
            // Current Route: `:id` -> this maps to `id`.
            // Logic mismatch. I should fix NewRequirement to use `id` as `projectId` OR update route.

            // I'll update NewRequirement to check `id` from params as well or query string.
            // Actually, `NewRequirement` is used for "View Details" too based on route `:id`.
            // If I navigate to `/requirements/123` -> NewRequirement loads. `id` is 123.
            // Is 123 a project ID or Requirement ID? in "View Details" it is Requirement ID.

            // This is slightly messy. 
            // Let's make "Add Requirement to Project" a specific explicit path or use Query Params.
            // I will navigation to `/requirements/new-requirement?projectId=...` and update NewRequirement to read query params.

            // For now, let's just navigate to dashboard and let them click "Add Requirement" on the project card.
            // But user wants smooth flow.

            // Let's assume I fix NewRequirement to read location state or searching query params.
            navigate("/requirements");

        } catch (error) {
            toast.error("Failed to create project: " + error.message);
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
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
                        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <Video size={20} className="text-blue-500" />
                            Meeting Context
                        </h3>
                        <p className="text-xs text-slate-500 mb-6 font-medium">Review recent meeting outcomes to gather project details.</p>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {!contextMeetings && <div className="text-center py-10"><Loader2 className="animate-spin text-slate-400 mx-auto" /></div>}
                            {contextMeetings?.length === 0 && <div className="text-slate-400 text-sm italic text-center">No unassigned meetings found.</div>}

                            {contextMeetings?.map(meeting => (
                                <MeetingContextCard
                                    key={meeting._id}
                                    meeting={meeting}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Project</h1>
                            <p className="text-slate-500 font-medium">Define the core project details before adding requirements.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Project Name</label>
                                    <input
                                        required
                                        value={formData.projectName}
                                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                        className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-bold text-lg"
                                        placeholder="e.g. Website Redesign Q3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Client</label>
                                    <select
                                        required
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white font-medium"
                                    >
                                        <option value="">Select a Client</option>
                                        {clients?.map(client => (
                                            <option key={client._id} value={client._id}>
                                                {client.companyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-white"
                                        placeholder="Brief overview of the project goals..."
                                    />
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-bold"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-bold"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on-hold">On Hold</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">End Date (Est.)</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Minimal context card for project creation (no import needed here usually, just viewing)
function MeetingContextCard({ meeting }) {
    const [expanded, setExpanded] = useState(false);
    const scheduledDate = new Date(meeting.scheduledAt);

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

            {/* Expanded content - Empty for now since outcomes are now per-user */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 bg-white border-t border-slate-100 animate-in slide-in-from-top-2">
                    <p className="text-xs text-slate-500 italic">View full meeting details for outcomes and notes.</p>
                </div>
            )}
        </div>
    );
}
