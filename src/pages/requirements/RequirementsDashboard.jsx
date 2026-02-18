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
    X,
    Package
} from "lucide-react";
import toast from "react-hot-toast";
import { SERVICE_TYPES, formatPrice } from "../../constants/servicePackages";

export default function RequirementsDashboard() {
    const navigate = useNavigate();
    const currentUser = getUser();
    const requirements = useQuery(api.requirements.listRequirements, { userId: currentUser.id, role: currentUser.role });
    const [searchTerm, setSearchTerm] = useState("");

    // Admin specific: Fetch employees for assignment
    const employees = useQuery(api.users.listUsers, { role: "employee" });
    const assignRequirement = useMutation(api.requirements.assignRequirement);

    const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, reqId: null, reqName: "", currentAssignees: [] });

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

    // Filter only by search term
    const filteredRequirements = requirements?.filter(r => {
        const matchesSearch = (r.requirementName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.requirementNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.clientName || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight font-primary">Requirements Hub</h1>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mt-1">Manage Detailed Requirements & Technical Tasks.</p>
                </div>

                {(currentUser.role === 'sales' || currentUser.role === 'superadmin') && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate("/requirements/new-requirement")}
                            className="bg-secondary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Plus size={16} />
                            Create Specification
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {/* Search */}
                <div className="relative font-secondary">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search specifications or client records..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border-accent focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 bg-card-bg shadow-sm text-secondary font-bold text-sm placeholder:text-text-secondary/20"
                    />
                </div>

                {/* Requirements List - Grouped by Client */}
                <div className="space-y-8">
                    {!requirements && <div className="text-center py-20 text-slate-400">Loading requirements...</div>}

                    {requirements && filteredRequirements?.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 italic mb-4">No requirements found.</p>
                        </div>
                    )}

                    {(() => {
                        // Grouping Logic: Client
                        const grouped = filteredRequirements?.reduce((acc, req) => {
                            const client = req.clientName || "Unassigned Client";
                            if (!acc[client]) acc[client] = [];
                            acc[client].push(req);
                            return acc;
                        }, {});

                        return Object.entries(grouped || {}).map(([clientName, reqs]) => (
                            <div key={clientName} className="bg-alt-bg/40 rounded-[2rem] p-6 border border-border-accent shadow-sm font-secondary">
                                <h3 className="text-lg font-black text-secondary mb-4 flex items-center gap-2 font-primary uppercase tracking-tight">
                                    <Users size={20} className="text-primary" />
                                    {clientName}
                                    <span className="text-[10px] font-black text-text-secondary/40 bg-card-bg px-2 py-1 rounded-lg border border-border-accent/50 uppercase tracking-widest">
                                        {reqs.length} Portfolio {reqs.length !== 1 ? 'Items' : 'Item'}
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
            </div>

            {/* Assignment Modal */}
            {assignmentModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200 px-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 mt-2">Assign Requirement</h3>
                        <p className="text-slate-500 mb-6 text-sm">Select employees to assign <strong>{assignmentModal.reqName}</strong> to.</p>

                        <div className="space-y-6">
                            {/* Requesters Section */}
                            {assignmentModal.requesters?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} />
                                        Interested Employees ({assignmentModal.requesters?.length || 0})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {assignmentModal.requesters?.map(r => {
                                            const isAssigned = assignmentModal.currentAssignees?.includes(r.id);
                                            return (
                                                <button
                                                    key={r.id}
                                                    disabled={isAssigned}
                                                    onClick={() => handleAssign(r.id)}
                                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-2 ${isAssigned
                                                        ? "bg-green-50 text-green-600 border-green-100 cursor-default"
                                                        : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                                        }`}
                                                >
                                                    {r.name}
                                                    {!isAssigned && <Plus size={10} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="border-t border-slate-100 pt-3"></div>
                                </div>
                            )}

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
                </div>
            )}
        </div>
    );
}

function RequirementItem({ req, currentUser, navigate, setAssignmentModal }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const tasks = useQuery(api.tasks.listTasks, { requirementId: req._id });
    const requestTask = useMutation(api.tasks.requestTaskAssignment);
    const assignTask = useMutation(api.tasks.assignTask);

    const requestRequirement = useMutation(api.requirements.requestRequirementAssignment);

    return (
        <div className={`bg-card-bg rounded-2xl border transition-all font-secondary ${isExpanded ? 'shadow-xl border-primary/20 scale-[1.01]' : 'border-border-accent hover:border-primary/30'}`}>
            <div
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-2 h-2 rounded-full ${req.status === 'approved' ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        req.status === 'draft' ? 'bg-text-secondary/30' : 'bg-primary shadow-[0_0_8px_rgba(241,90,36,0.5)]'
                        }`}></div>
                    <div>
                        <div className="font-black text-secondary group-hover:text-primary transition-colors flex items-center gap-2 text-sm uppercase tracking-tight">
                            {req.requirementName}
                            {tasks && tasks.length > 0 && (
                                <span className="text-[9px] bg-header-bg text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-primary/20">
                                    {tasks.length} {tasks.length === 1 ? 'Objective' : 'Objectives'}
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

                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    {req.serviceType && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-black uppercase tracking-wider flex items-center gap-1">
                            <Package size={10} />
                            {SERVICE_TYPES.find(s => s.id === req.serviceType)?.label?.split(' ')[0] || req.serviceType}
                            {req.packageTier && <span className="text-purple-400 font-medium">·{req.packageTier}</span>}
                        </span>
                    )}
                    {/* Pricing Visibility */}
                    {(currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'superadmin') && (
                        <div className="flex items-center gap-2">
                            {req.mrp > 0 && req.region && (
                                <span className={`${req.dealPrice ? 'text-[11px] text-slate-400 ' : 'font-bold text-blue-600'}`}>
                                    {formatPrice(req.mrp, req.region)}
                                    {!req.dealPrice && <span className="ml-1 text-[10px] font-medium opacity-60">MRP</span>}
                                </span>
                            )}
                            {req.dealPrice > 0 && req.region && (
                                <span className="font-bold text-green-600">{formatPrice(req.dealPrice, req.region)}</span>
                            )}
                        </div>
                    )}

                    {currentUser.role === 'client' && req.dealPrice > 0 && req.region && (
                        <span className="font-bold text-green-600">{formatPrice(req.dealPrice, req.region)}</span>
                    )}

                    {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                        <div className="flex items-center gap-2">
                            {/* Requirement Requests for Admin */}
                            {req.requesterDetails?.length > 0 && !req.assignedEmployeesDetails?.some(e => e.id === currentUser.id) && (
                                <div className="flex -space-x-2 mr-2">
                                    {req.requesterDetails.slice(0, 3).map(r => (
                                        <div key={r.id} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold" title={`${r.name} requested this`}>
                                            {r.name?.charAt(0)}
                                        </div>
                                    ))}
                                    {req.requesterDetails.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] text-slate-600 font-bold">
                                            +{req.requesterDetails.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIds = req.assignedEmployeesDetails?.map(u => u.id) || [];
                                    setAssignmentModal({
                                        isOpen: true,
                                        reqId: req._id,
                                        reqName: req.requirementName,
                                        currentAssignees: currentIds,
                                        requesters: req.requesterDetails || []
                                    });
                                }}
                                className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-lg transition-colors relative"
                                title="Assign to Employee"
                            >
                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                    <Users size={14} />
                                    Assign
                                    {req.requesterDetails?.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                            </button>
                        </div>
                    )}

                    {currentUser.role === 'employee' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                requestRequirement({ requirementId: req._id, userId: currentUser.id })
                                    .then(() => toast.success("Request sent for this requirement!"))
                                    .catch(err => toast.error("Failed: " + err.message));
                            }}
                            disabled={req.requestedBy?.includes(currentUser.id) || req.assignedEmployeesDetails?.some(e => e.id === currentUser.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${req.assignedEmployeesDetails?.some(e => e.id === currentUser.id)
                                ? "bg-green-50 text-green-600 border border-green-100 cursor-default"
                                : req.requestedBy?.includes(currentUser.id)
                                    ? "bg-slate-100 text-slate-400 cursor-default"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 ring-offset-2 hover:ring-2 hover:ring-blue-500/20"
                                }`}
                        >
                            {req.assignedEmployeesDetails?.some(e => e.id === currentUser.id)
                                ? "Assigned"
                                : req.requestedBy?.includes(currentUser.id) ? "Requested" : "Request to Assign"}
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
                        <div className="grid gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2 pb-2">
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

                                    {/* Task Assignment Controls */}
                                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            {task.assignedTo ? (
                                                <div className="text-[10px] text-slate-500">
                                                    Assigned to: <span className="font-bold text-slate-700">{task.assignedToName || "User"}</span>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 inline-block">
                                                    Unassigned
                                                </div>
                                            )}

                                            {/* Employee: Request Assignment */}
                                            {currentUser.role === 'employee' && !task.assignedTo && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        requestTask({ taskId: task._id, userId: currentUser.id })
                                                            .then(() => toast.success("Request sent!"))
                                                            .catch(e => toast.error("Failed: " + e.message));
                                                    }}
                                                    disabled={task.requestedBy?.includes(currentUser.id)}
                                                    className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${task.requestedBy?.includes(currentUser.id)
                                                        ? "bg-slate-100 text-slate-400 cursor-default"
                                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                        }`}
                                                >
                                                    {task.requestedBy?.includes(currentUser.id) ? "Requested" : "Request Assign"}
                                                </button>
                                            )}
                                        </div>

                                        {/* Admin/Superadmin: View Requests & Assign */}
                                        {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && !task.assignedTo && task.requesterDetails?.length > 0 && (
                                            <div className="bg-white border boundary-slate-100 rounded-lg p-2">
                                                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Requests:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {task.requesterDetails.map(r => (
                                                        <button
                                                            key={r.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                assignTask({ taskId: task._id, userId: r.id })
                                                                    .then(() => toast.success(`Assigned to ${r.name}`))
                                                                    .catch(e => toast.error("Failed: " + e.message));
                                                            }}
                                                            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-medium transition-colors border border-blue-100"
                                                        >
                                                            <Users size={10} />
                                                            Assign {r.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
