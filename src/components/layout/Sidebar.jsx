import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { getMenuByRole } from "../../constants/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "../../services/auth.service";

export default function Sidebar({ collapsed, setCollapsed }) {
    const [open, setOpen] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const userRole = getUser()?.role;
    const sidebarMenu = getMenuByRole(userRole);

    const toggleSection = (label) => {
        setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (link) => location.pathname === link;

    return (
        <div
            className={`h-screen bg-white border-r z-[999] relative border-slate-200 transition-all duration-300 flex flex-col ${collapsed ? "w-16" : "w-64"
                }`}
        >
            {/* Header with Logo and Collapse Button */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
                {!collapsed && (
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            FlowX
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors ml-auto"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar py-4 px-3">
                <div className="space-y-1">
                    {sidebarMenu.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.link);

                        if (!item.children) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => navigate(item.link)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${active
                                            ? "bg-purple-50 text-purple-700"
                                            : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                    title={collapsed ? item.label : ""}
                                >
                                    <Icon
                                        size={20}
                                        className={active ? "text-purple-600" : "text-slate-500 group-hover:text-slate-900"}
                                    />
                                    {!collapsed && (
                                        <span className="text-sm font-medium">{item.label}</span>
                                    )}
                                </button>
                            );
                        }

                        const isAnyChildActive = item.children.some((child) => isActive(child.link));

                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => !collapsed && toggleSection(item.label)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${isAnyChildActive ? "text-purple-700 bg-purple-50/50" : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                    title={collapsed ? item.label : ""}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className={isAnyChildActive ? "text-purple-600" : "text-slate-500 group-hover:text-slate-900"} />
                                        {!collapsed && (
                                            <span className="text-sm font-medium">{item.label}</span>
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <div className={`transition-transform duration-200 ${open[item.label] ? "rotate-180" : ""}`}>
                                            <ChevronDown size={16} className="text-slate-400" />
                                        </div>
                                    )}
                                </button>

                                {/* Submenu */}
                                {open[item.label] && !collapsed && (
                                    <div className="mt-1 space-y-1 pl-6 border-l border-slate-200 ml-5">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            const activeChild = isActive(child.link);
                                            return (
                                                <button
                                                    key={child.label}
                                                    onClick={() => navigate(child.link)}
                                                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-colors ${activeChild
                                                            ? "bg-purple-50 text-purple-700 font-medium"
                                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    <ChildIcon
                                                        size={16}
                                                        className={activeChild ? "text-purple-600" : "text-slate-400"}
                                                    />
                                                    {child.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
