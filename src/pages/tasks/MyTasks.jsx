import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import {
    CheckSquare,
    Plus,
    ChevronDown,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
    MoreVertical,
    Layout,
    Briefcase,
    ListTodo,
    Send,
    MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";
import TaskQueries from "./TaskQueries";
import SubmissionModal from "./SubmissionModal";

export default function MyTasks() {
    const currentUser = getUser();
    const requirements = useQuery(api.requirements.listRequirements, {
        userId: currentUser.id,
        role: currentUser.role,
        assignedOnly: true
    });

    const [expandedRequirements, setExpandedRequirements] = useState(new Set());
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [activeRequirementId, setActiveRequirementId] = useState(null);
    const [queryTaskOpen, setQueryTaskOpen] = useState(null);
    const [submissionTask, setSubmissionTask] = useState(null); // { task, requirement }

    const toggleRequirement = (id) => {
        const next = new Set(expandedRequirements);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedRequirements(next);
    };

    const toggleTask = (id) => {
        const next = new Set(expandedTasks);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedTasks(next);
    };

    if (!requirements) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-9rem)] flex flex-col font-secondary">
            <div className="flex justify-between items-end shrink-0 mb-8 border-b border-border-accent/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight font-primary">My Workspace</h1>
                    <p className="text-text-secondary font-black uppercase tracking-widest text-[10px] mt-1">Manage assigned objectives and technical tasks.</p>
                </div>
                <div className="flex items-center gap-3 bg-card-bg px-4 py-2 rounded-2xl border border-border-accent shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{requirements.length} Active Assignments</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-4">
                {requirements.map((req) => (
                    <RequirementItem
                        key={req._id}
                        requirement={req}
                        isExpanded={expandedRequirements.has(req._id)}
                        onToggle={() => toggleRequirement(req._id)}
                        expandedTasks={expandedTasks}
                        onToggleTask={toggleTask}
                        onOpenQuery={setQueryTaskOpen}
                        onOpenSubmission={(task) => setSubmissionTask({ task, requirement: req })}
                    />
                ))}

                {requirements.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <CheckSquare size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No Assignments Found</h3>
                        <p className="text-slate-500">You don't have any requirements assigned to you at the moment.</p>
                    </div>
                )}
            </div>

            {/* Task Query Modal */}
            {queryTaskOpen && (
                <TaskQueries
                    task={queryTaskOpen}
                    onClose={() => setQueryTaskOpen(null)}
                />
            )}

            {/* Submission Modal */}
            {submissionTask && (
                <SubmissionModal
                    task={submissionTask.task}
                    requirement={submissionTask.requirement}
                    currentUser={currentUser}
                    onClose={() => setSubmissionTask(null)}
                />
            )}
        </div>
    );
}

function RequirementItem({ requirement, isExpanded, onToggle, expandedTasks, onToggleTask, onOpenQuery, onOpenSubmission }) {
    const tasks = useQuery(api.tasks.listTasks, { requirementId: requirement._id });
    const addTask = useMutation(api.tasks.addTask);
    const currentUser = getUser();
    const [showTaskInput, setShowTaskInput] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            await addTask({
                title: newTaskTitle,
                requirementId: requirement._id,
                assignedTo: currentUser.id,
                createdBy: currentUser.id,
                priority: "medium"
            });
            setNewTaskTitle("");
            setShowTaskInput(false);
            toast.success("Task added to your list");
        } catch (error) {
            toast.error("Failed to add task");
        }
    };

    return (
        <div className={`bg-card-bg rounded-[2rem] border transition-all overflow-hidden ${isExpanded ? 'border-primary/20 shadow-xl shadow-primary/5' : 'border-border-accent shadow-sm hover:border-primary/30'}`}>
            <div
                className={`p-6 flex items-center justify-between cursor-pointer group ${isExpanded ? 'bg-header-bg/50' : ''}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-primary text-white' : 'bg-alt-bg text-text-secondary group-hover:bg-header-bg group-hover:text-primary'}`}>
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md">Objective</span>
                            <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">{requirement.requirementNumber}</span>
                        </div>
                        <h3 className="text-lg font-black text-secondary leading-tight mt-1 font-primary tracking-tight">{requirement.requirementName}</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                <Briefcase size={12} className="text-primary" />
                                {requirement.clientName || "Unassigned"}
                            </div>
                            <span className="w-1 h-1 rounded-full bg-border-accent"></span>
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                <ListTodo size={12} className="text-primary" />
                                {tasks?.length || 0} Sub-Tasks
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${requirement.status === 'completed' ? 'bg-success/10 text-success' :
                        requirement.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                            'bg-alt-bg text-text-secondary'
                        }`}>
                        {requirement.status}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 pt-0 space-y-4 border-t border-border-accent/30 mt-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between bg-alt-bg/30 p-4 rounded-2xl">
                        <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-2 font-primary">
                            <CheckSquare size={16} className="text-primary" />
                            Technical Pipeline
                        </h4>
                        <button
                            onClick={() => setShowTaskInput(true)}
                            className="bg-card-bg text-primary border border-primary/10 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {tasks?.map(task => (
                            <TaskItem
                                key={task._id}
                                task={task}
                                isExpanded={expandedTasks.has(task._id)}
                                onToggle={() => onToggleTask(task._id)}
                                onOpenQuery={onOpenQuery}
                                onOpenSubmission={onOpenSubmission}
                            />
                        ))}

                        {showTaskInput && (
                            <form onSubmit={handleAddTask} className="flex gap-2 animate-in zoom-in-95 duration-200">
                                <input
                                    autoFocus
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Define sub-task scope..."
                                    className="flex-1 bg-card-bg border border-border-accent rounded-xl px-4 py-2 text-sm font-bold text-secondary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none shadow-sm placeholder:text-text-secondary/20"
                                />
                                <button type="submit" className="bg-secondary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/10">Add</button>
                                <button type="button" onClick={() => setShowTaskInput(false)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-secondary">Cancel</button>
                            </form>
                        )}

                        {!tasks && <div className="text-center py-4 text-slate-400 italic text-sm">Loading tasks...</div>}
                        {tasks && tasks.length === 0 && !showTaskInput && (
                            <div className="text-center py-8 bg-slate-50/30 rounded-2xl border border-dashed border-slate-100">
                                <p className="text-sm text-slate-400">No tasks created yet for this requirement.</p>
                                <button onClick={() => setShowTaskInput(true)} className="text-sm font-bold text-blue-600 mt-1 hover:underline">Click to add your first task</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function TaskItem({ task, isExpanded, onToggle, onOpenQuery, onOpenSubmission }) {
    const addSubtask = useMutation(api.tasks.addSubtask);
    const toggleSubtask = useMutation(api.tasks.toggleSubtask);
    const updateStatus = useMutation(api.tasks.updateTaskStatus);

    const [showSubInput, setShowSubInput] = useState(false);
    const [subTitle, setSubTitle] = useState("");

    const handleAddSub = async (e) => {
        e.preventDefault();
        if (!subTitle.trim()) return;
        await addSubtask({ taskId: task._id, title: subTitle });
        setSubTitle("");
        setShowSubInput(false);
    };

    const handleStatusChange = async (newStatus) => {
        await updateStatus({ taskId: task._id, status: newStatus });
    };

    return (
        <div className={`rounded-2xl border transition-all ${isExpanded ? 'border-border-accent shadow-md bg-card-bg' : 'border-border-accent/50 hover:border-primary/20'}`}>
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={() => handleStatusChange(task.status === 'done' ? 'todo' : 'done')}
                        className={`transition-colors ${task.status === 'done' ? 'text-success' : 'text-text-secondary/30 hover:text-primary'}`}
                    >
                        {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1 cursor-pointer" onClick={onToggle}>
                        <div className={`text-sm font-black uppercase tracking-tight ${task.status === 'done' ? 'text-text-secondary/40 line-through' : 'text-secondary'}`}>
                            {task.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">{task.taskNumber}</span>
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary">
                                <Clock size={10} />
                                {task.progress}% reach
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenQuery(task);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-header-bg text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all"
                        title="Raise a query about this task"
                    >
                        <MessageCircle size={14} />
                        Query
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenSubmission(task);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                        title="Submit your work for review"
                    >
                        <Send size={14} />
                        Submit
                    </button>

                    <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="text-[9px] font-black uppercase tracking-widest bg-alt-bg/50 border-none outline-none rounded-lg px-2 py-1 text-text-secondary cursor-pointer"
                    >
                        <option value="todo">Pending</option>
                        <option value="in-progress">Active</option>
                        <option value="review">Review</option>
                        <option value="blocked">Hold</option>
                        <option value="done">Release</option>
                    </select>
                    <button onClick={onToggle} className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-50 animate-in slide-in-from-top-1 duration-150">
                    <div className="mt-4 space-y-2 pl-8 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {task.subtasks?.map(st => (
                            <div key={st.id} className="flex items-center gap-3 py-1 bg-white">
                                <button
                                    onClick={() => toggleSubtask({ taskId: task._id, subtaskId: st.id })}
                                    className={`transition-colors ${st.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                                >
                                    {st.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </button>
                                <span className={`text-xs font-medium ${st.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                    {st.title}
                                </span>
                            </div>
                        ))}

                        {showSubInput ? (
                            <form onSubmit={handleAddSub} className="flex gap-2 mt-2">
                                <input
                                    autoFocus
                                    value={subTitle}
                                    onChange={(e) => setSubTitle(e.target.value)}
                                    placeholder="Add subtask..."
                                    className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20"
                                />
                                <button type="submit" className="text-xs font-bold text-blue-600">Add</button>
                                <button type="button" onClick={() => setShowSubInput(false)} className="text-xs font-bold text-slate-400">Cancel</button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowSubInput(true)}
                                className="text-xs font-bold text-blue-500 flex items-center gap-1.5 hover:underline py-2"
                            >
                                <Plus size={14} />
                                Add Subtask
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
