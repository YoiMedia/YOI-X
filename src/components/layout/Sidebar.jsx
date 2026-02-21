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
            className={`h-screen bg-secondary border-r z-999 relative border-white/5 shadow-2xl transition-all duration-300 flex flex-col ${collapsed ? "w-16" : "w-64"
                }`}
        >
            {/* Header with Logo and Collapse Button */}
            <div className="h-20 px-4 flex items-center justify-between border-b border-white/5">
                {!collapsed && (
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                            Y
                        </div>
                        <span className="text-xl font-black font-primary text-white tracking-tighter">
                            FlowX
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all ml-auto"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar py-6 px-4">
                <div className="space-y-1.5">
                    {sidebarMenu.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.link);

                        if (!item.children) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => navigate(item.link)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group relative ${active
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-white/50 hover:bg-white/5 hover:text-white"
                                        }`}
                                    title={collapsed ? item.label : ""}
                                >
                                    <Icon
                                        size={18}
                                        className={active ? "text-white" : "text-white/40 group-hover:text-primary transition-colors"}
                                    />
                                    {!collapsed && (
                                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                    )}
                                    {active && !collapsed && (
                                        <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                </button>
                            );
                        }

                        const isAnyChildActive = item.children.some((child) => isActive(child.link));

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => !collapsed && toggleSection(item.label)}
                                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all group ${isAnyChildActive ? "text-primary bg-white/5" : "text-white/50 hover:bg-white/5 hover:text-white"
                                        }`}
                                    title={collapsed ? item.label : ""}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isAnyChildActive ? "text-primary" : "text-white/40 group-hover:text-primary transition-colors"} />
                                        {!collapsed && (
                                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <div className={`transition-transform duration-300 ${open[item.label] ? "rotate-180" : ""}`}>
                                            <ChevronDown size={14} className="text-white/20" />
                                        </div>
                                    )}
                                </button>

                                {open[item.label] && !collapsed && (
                                    <div className="mt-1 space-y-1 pl-6 border-l border-white/10 ml-5">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            const activeChild = isActive(child.link);
                                            return (
                                                <button
                                                    key={child.label}
                                                    onClick={() => navigate(child.link)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all ${activeChild
                                                        ? "text-primary font-bold bg-primary/5"
                                                        : "text-white/30 hover:text-white hover:bg-white/5"
                                                        }`}
                                                >
                                                    <ChildIcon
                                                        size={14}
                                                        className={activeChild ? "text-primary" : "text-white/20"}
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
