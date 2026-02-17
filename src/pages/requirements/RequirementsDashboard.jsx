import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Plus,
    Briefcase,
    Calendar,
    Layout,
    Users,
    Target,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    Loader2,
    X
} from "lucide-react";
import toast from "react-hot-toast";

export default function RequirementsDashboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = getUser();

    // Determine active tab from SearchParams or Role
    const defaultTab = currentUser.role === 'employee' ? 'requirements' : 'projects';
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || defaultTab);
    const [searchTerm, setSearchTerm] = useState("");

    // Sync state with search params
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && (tab === "projects" || tab === "requirements")) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const projects = useQuery(api.projects.listProjects, { userId: currentUser.id, role: currentUser.role });
    const requirements = useQuery(api.requirements.listRequirements, { userId: currentUser.id, role: currentUser.role });

    // Filter by project if param exists
    const projectFilter = searchParams.get("projectId");

    const handleProjectClick = (projectId) => {
        setSearchParams({ tab: "requirements", projectId });
    };

    const clearProjectFilter = () => {
        setSearchParams({ tab: "requirements" });
    };

    // Admin specific: Fetch employees for assignment
    const employees = useQuery(api.users.listUsers, { role: "employee" });
    const assignRequirement = useMutation(api.requirements.assignRequirement);

    const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, reqId: null, reqName: "" });

    const handleAssign = async (employeeId) => {
        if (!assignmentModal.reqId || !employeeId) return;
        try {
            await assignRequirement({ requirementId: assignmentModal.reqId, employeeId });
            toast.success("Requirement assigned successfully");
            setAssignmentModal(prev => ({
                ...prev,
                currentAssignees: [...(prev.currentAssignees || []), employeeId]
            }));
        } catch (error) {
            toast.error("Failed to assign: " + error.message);
        }
    };

    const filteredProjects = projects?.filter(p =>
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRequirements = requirements?.filter(r => {
        const matchesSearch = r.requirementName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.requirementNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = projectFilter ? r.projectId === projectFilter : true;
        return matchesSearch && matchesProject;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Hub</h1>
                    <p className="text-slate-500 text-lg font-medium mt-1">Manage projects and their detailed requirements.</p>
                </div>

                {(currentUser.role === 'sales' || currentUser.role === 'superadmin') && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate("/requirements/new-project")}
                            className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 hover:scale-105 transition-all"
                        >
                            <Plus size={18} />
                            New Project
                        </button>
                        <button
                            onClick={() => navigate("/requirements/new-requirement")}
                            className="bg-white text-blue-600 border-2 border-blue-100 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all"
                        >
                            <Plus size={18} />
                            Add Requirement
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b border-slate-100">
                <button
                    onClick={() => handleTabChange("projects")}
                    className={`pb-4 px-2 font-bold text-sm uppercase tracking-widest transition-all ${activeTab === "projects"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-slate-400 hover:text-slate-600"
                        }`}
                >
                    {currentUser.role === 'sales' ? 'My Projects' : (currentUser.role === 'employee' ? 'My Projects' : (currentUser.role === 'client' ? 'My Project' : 'Active Projects'))}
                </button>
                <button
                    onClick={() => handleTabChange("requirements")}
                    className={`pb-4 px-2 font-bold text-sm uppercase tracking-widest transition-all ${activeTab === "requirements"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-slate-400 hover:text-slate-600"
                        }`}
                >
                    {currentUser.role === 'sales' ? 'My Requirements' : (currentUser.role === 'employee' ? 'My Tasks' : (currentUser.role === 'client' ? 'Requirements' : 'All Requirements'))}
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {/* Search & Filter */}
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={activeTab === "projects" ? "Search projects..." : "Search requirements..."}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white shadow-xs"
                        />
                    </div>

                    {projectFilter && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Filter:</span>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                                <Layout size={14} />
                                Project View
                                <button
                                    onClick={clearProjectFilter}
                                    className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                                    title="Clear Filter"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Projects Grid - Grouped by Client */}
                {activeTab === "projects" && (
                    <div className="space-y-8">
                        {!projects && <div className="text-center py-20 text-slate-400"><Layout className="animate-pulse inline mb-2" /> Loading projects...</div>}

                        {projects && filteredProjects?.length === 0 && (
                            <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <div className="text-xl font-bold text-slate-900">No projects found</div>
                                <p className="mt-2 text-slate-500">
                                    {currentUser.role === 'sales' ? "You don't have any projects associated with your clients yet." : "Start a new project to get things moving."}
                                </p>
                            </div>
                        )}

                        {(() => {
                            // Group projects by Client
                            const groupedProjects = filteredProjects?.reduce((acc, project) => {
                                const client = project.clientName || "Unknown Client";
                                if (!acc[client]) acc[client] = [];
                                acc[client].push(project);
                                return acc;
                            }, {});

                            return Object.entries(groupedProjects || {}).map(([clientName, clientProjects]) => (
                                <div key={clientName} className="space-y-4">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <Briefcase size={20} className="text-blue-500" />
                                        {clientName}
                                        {currentUser.role === 'admin' && clientProjects[0]?.clientSalesPersonName && (
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg ml-2">
                                                Sales: {clientProjects[0].clientSalesPersonName}
                                            </span>
                                        )}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {clientProjects.map(project => (
                                            <div
                                                key={project._id}
                                                onClick={() => handleProjectClick(project._id)}
                                                className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowRight className="text-blue-500" />
                                                </div>

                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
                                                    ${project.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            project.status === 'planning' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}
                                                    `}>
                                                        {project.projectName.charAt(0)}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg text-slate-500">
                                                        {project.projectNumber}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                                                    {project.projectName}
                                                </h3>
                                                <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-2">
                                                    {project.description || "No description provided."}
                                                </p>

                                                <div className="space-y-3 border-t border-slate-50 pt-4">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                        <Users size={16} className="text-slate-400" />
                                                        Manager: {project.projectManagerName}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                        <Target size={16} className="text-slate-400" />
                                                        {project.requirementsCount || 0} Requirements
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}

                {/* Requirements List - Grouped by Project Only */}
                {activeTab === "requirements" && (
                    <div className="space-y-8">
                        {!requirements && <div className="text-center py-20 text-slate-400">Loading requirements...</div>}

                        {requirements && filteredRequirements?.length === 0 && (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 italic mb-4">No requirements found{projectFilter ? " for this project" : ""}.</p>
                                {projectFilter && (
                                    <button
                                        onClick={clearProjectFilter}
                                        className="text-blue-600 font-bold hover:underline"
                                    >
                                        Show all requirements
                                    </button>
                                )}
                            </div>
                        )}

                        {(() => {
                            // Grouping Logic: Project ONLY
                            const grouped = filteredRequirements?.reduce((acc, req) => {
                                const project = req.projectName || "Unassigned Project";
                                if (!acc[project]) acc[project] = [];
                                acc[project].push(req);
                                return acc;
                            }, {});

                            return Object.entries(grouped || {}).map(([projectName, reqs]) => (
                                <div key={projectName} className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Layout size={20} className="text-blue-500" />
                                        {projectName}
                                        <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                            {reqs.length} Req{reqs.length !== 1 && 's'}
                                        </span>
                                    </h3>

                                    <div className="space-y-3">
                                        {reqs.map(req => (
                                            <RequirementItem
                                                key={req._id}
                                                req={req}
                                                currentUser={currentUser}
                                                navigate={navigate}
                                                setAssignmentModal={setAssignmentModal}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            {assignmentModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200 px-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 mt-2">Assign Requirement</h3>
                        <p className="text-slate-500 mb-6 text-sm">Select employees to assign <strong>{assignmentModal.reqName}</strong> to.</p>

                        <div className="space-y-4">
                            {!employees && <div className="text-center py-4"><Loader2 className="animate-spin inline text-slate-400" /></div>}

                            {employees?.length === 0 && <div className="text-center text-slate-400 text-sm">No employees found.</div>}

                            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {employees?.map(emp => {
                                    const isAssigned = assignmentModal.currentAssignees?.includes(emp._id);
                                    return (
                                        <button
                                            key={emp._id}
                                            disabled={isAssigned}
                                            onClick={() => handleAssign(emp._id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all group w-full
                                                ${isAssigned
                                                    ? "bg-slate-50 border-slate-100 opacity-70 cursor-not-allowed"
                                                    : "hover:bg-blue-50 border-slate-100 hover:border-blue-200 cursor-pointer bg-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${isAssigned ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                                                    {emp.fullName.charAt(0)}
                                                </div>
                                                <span className={`font-bold text-sm truncate ${isAssigned ? 'text-slate-500' : 'text-slate-700 group-hover:text-blue-700'}`}>
                                                    {emp.fullName}
                                                </span>
                                            </div>
                                            {isAssigned ? (
                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">Assigned</span>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    <Plus size={14} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => setAssignmentModal({ isOpen: false, reqId: null, reqName: "", currentAssignees: [] })}
                            className="mt-6 w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function RequirementItem({ req, currentUser, navigate, setAssignmentModal }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const tasks = useQuery(api.tasks.listTasks, { requirementId: req._id });

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 transition-all ${isExpanded ? 'shadow-lg border-blue-200' : 'hover:border-blue-300'}`}>
            <div
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-2 h-2 rounded-full ${req.status === 'approved' ? 'bg-green-500' :
                        req.status === 'draft' ? 'bg-slate-300' : 'bg-blue-500'
                        }`}></div>
                    <div>
                        <div className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                            {req.requirementName}
                            {tasks && tasks.length > 0 && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">
                                    {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
                            {req.requirementNumber}
                            <span className="font-normal text-slate-300">•</span>
                            <span className="font-medium text-slate-400">{req.clientName}</span>
                            {req.assignedEmployeesDetails && req.assignedEmployeesDetails.length > 0 && (
                                <div className="flex space-x-2 items-center ml-2">
                                    {req.assignedEmployeesDetails.map((emp) => (
                                        <div
                                            key={emp.id}
                                            className="rounded-full bg-blue-100 border-2 border-white flex px-2 py-1 items-center justify-center text-[10px] font-bold text-blue-600 ring-1 ring-white"
                                            title={emp.name}
                                        >
                                            {emp.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    {req.estimatedBudget > 0 && <span>${req.estimatedBudget.toLocaleString()}</span>}

                    {currentUser.role === 'admin' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const currentIds = req.assignedEmployeesDetails?.map(u => u.id) || [];
                                setAssignmentModal({
                                    isOpen: true,
                                    reqId: req._id,
                                    reqName: req.requirementName,
                                    currentAssignees: currentIds
                                });
                            }}
                            className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                            title="Assign to Employee"
                        >
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                <Users size={14} />
                                Assign
                            </div>
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/requirements/${req._id}`);
                        }}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {isExpanded && tasks && tasks.length > 0 && (
                <div className="px-12 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-t border-slate-50 pt-4 mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Implementation Progress</h4>
                        <div className="grid gap-3">
                            {tasks.map(task => (
                                <div key={task._id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            <span className="text-xs font-bold text-slate-700">{task.title}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-blue-600">{task.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${task.status === 'done' ? 'bg-green-500' : 'bg-blue-600'}`}
                                            style={{ width: `${task.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{task.taskNumber}</span>
                                        <span className="text-[9px] font-bold text-slate-500 capitalize bg-white px-1.5 py-0.5 rounded border border-slate-100">{task.status.replace('-', ' ')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {isExpanded && tasks && tasks.length === 0 && (
                <div className="px-12 pb-6">
                    <div className="border-t border-slate-50 pt-4 text-center">
                        <p className="text-xs text-slate-400 italic">No implementation tasks created by the team yet.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
