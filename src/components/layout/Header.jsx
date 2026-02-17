import { Menu, Search, User, X, Bell, LogOut } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMenuByRole } from "../../constants/sidebar";
import { getUser, logout } from "../../services/auth.service";
import toast from "react-hot-toast";

export default function Header({ onMenuClick }) {
    const [searchValue, setSearchValue] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const user = getUser();

    const navigate = useNavigate();
    const location = useLocation();

    if (!user) {
        return null;
    }

    // Get page title/subtitle from sidebar config
    const getPageInfo = useMemo(() => {
        const currentPath = location.pathname;
        const menu = getMenuByRole(user?.role);

        const findInMenu = (items) => {
            for (const item of items) {
                if (item.link === currentPath) {
                    return {
                        title: item.pageTitle || item.label,
                        subtitle: item.subtitle || "",
                    };
                }
                if (item.children) {
                    const found = findInMenu(item.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return (
            findInMenu(menu) || {
                title: "Dashboard",
                subtitle: "Welcome back",
            }
        );
    }, [location.pathname, user?.role]);

    const handleLogout = () => {
        toast.promise(
            new Promise((resolve) => {
                setTimeout(() => {
                    logout();
                    resolve();
                }, 1000);
            }),
            {
                loading: "Logging out...",
                success: "Logged out successfully",
                error: "Logout failed",
            }
        ).then(() => {
            const redirectPath = user?.role === "superadmin" ? "/auth/login-superadmin" : "/auth/login";
            navigate(redirectPath);
        });
    };

    return (
        <header className="min-h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            {/* LEFT */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                    <Menu size={20} />
                </button>

                <div>
                    <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                        {getPageInfo.title}
                    </h1>
                    <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-none">
                        {getPageInfo.subtitle}
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                    />
                    {searchValue && (
                        <button
                            onClick={() => setSearchValue("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                {/* USER PROFILE */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2.5 pl-3 pr-2 py-1 border-l border-slate-200 hover:bg-slate-50 transition-colors rounded-lg"
                    >
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-sm">
                            <User size={16} className="text-white" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{user?.role}</p>
                        </div>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-40 animate-in fade-in zoom-in duration-200">
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
