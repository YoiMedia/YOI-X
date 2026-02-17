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
    MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";
import TaskQueries from "./TaskQueries";

export default function MyTasks() {
    const currentUser = getUser();
    const requirements = useQuery(api.requirements.listRequirements, {
        userId: currentUser.id,
        role: currentUser.role
    });

    const [expandedRequirements, setExpandedRequirements] = useState(new Set());
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [activeRequirementId, setActiveRequirementId] = useState(null);
    const [queryTaskOpen, setQueryTaskOpen] = useState(null);

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
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Workspace</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your assigned requirements and personal tasks.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-600">{requirements.length} Active Assignments</span>
                </div>
            </div>

            <div className="space-y-4">
                {requirements.map((req) => (
                    <RequirementItem
                        key={req._id}
                        requirement={req}
                        isExpanded={expandedRequirements.has(req._id)}
                        onToggle={() => toggleRequirement(req._id)}
                        expandedTasks={expandedTasks}
                        onToggleTask={toggleTask}
                        onOpenQuery={setQueryTaskOpen}
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
        </div>
    );
}

function RequirementItem({ requirement, isExpanded, onToggle, expandedTasks, onToggleTask, onOpenQuery }) {
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
        <div className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${isExpanded ? 'border-blue-200 shadow-xl shadow-blue-50/50' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}>
            <div
                className={`p-6 flex items-center justify-between cursor-pointer group ${isExpanded ? 'bg-blue-50/30' : ''}`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Requirement</span>
                            <span className="text-xs font-bold text-slate-400">{requirement.requirementNumber}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">{requirement.requirementName}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <Briefcase size={14} className="text-slate-400" />
                                {requirement.projectName || "Unassigned"}
                            </div>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <ListTodo size={14} className="text-slate-400" />
                                {tasks?.length || 0} Tasks
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${requirement.status === 'completed' ? 'bg-green-100 text-green-700' :
                        requirement.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {requirement.status}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 pt-0 space-y-4 border-t border-slate-50 mt-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between items-center bg-slate-50/50 p-4 rounded-2xl">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <CheckSquare size={16} className="text-blue-500" />
                            Implementation Tasks
                        </h4>
                        <button
                            onClick={() => setShowTaskInput(true)}
                            className="bg-white text-blue-600 border border-blue-100 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
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
                            />
                        ))}

                        {showTaskInput && (
                            <form onSubmit={handleAddTask} className="flex gap-2 animate-in zoom-in-95 duration-200">
                                <input
                                    autoFocus
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="What needs to be done?..."
                                    className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">Add</button>
                                <button type="button" onClick={() => setShowTaskInput(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
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

function TaskItem({ task, isExpanded, onToggle, onOpenQuery }) {
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
        <div className={`rounded-2xl border transition-all ${isExpanded ? 'border-slate-200 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <button
                        onClick={() => handleStatusChange(task.status === 'done' ? 'todo' : 'done')}
                        className={`transition-colors ${task.status === 'done' ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                    >
                        {task.status === 'done' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1 cursor-pointer" onClick={onToggle}>
                        <div className={`text-sm font-bold ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{task.taskNumber}</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                                <Clock size={10} />
                                {task.progress}% done
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
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                        title="Raise a query about this task"
                    >
                        <MessageCircle size={14} />
                        Query
                    </button>
                    <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="text-[10px] font-black uppercase tracking-wider bg-slate-50 border-none outline-none rounded-lg px-2 py-1 text-slate-500 cursor-pointer"
                    >
                        <option value="todo">Todo</option>
                        <option value="in-progress">Doing</option>
                        <option value="review">Review</option>
                        <option value="blocked">Blocked</option>
                        <option value="done">Done</option>
                    </select>
                    <button onClick={onToggle} className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:bg-slate-50'}`}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-50 animate-in slide-in-from-top-1 duration-150">
                    <div className="mt-4 space-y-2 pl-8">
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
