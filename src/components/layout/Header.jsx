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
        <header className="min-h-[80px] bg-header-bg border-b border-primary/10 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-20">
            {/* LEFT */}
            <div className="flex items-center gap-4 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 hover:bg-white/50 rounded-xl transition-all text-secondary"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h1 className="text-xl sm:text-2xl font-black font-primary text-secondary tracking-tight truncate max-w-[200px] sm:max-w-none leading-none">
                        {getPageInfo.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5 focus-within:ring-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">
                            {getPageInfo.subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative hidden lg:block group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-72 pl-11 pr-4 py-3 bg-white/60 border border-primary/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 text-sm font-medium placeholder:text-text-secondary/50 transition-all"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-3 hover:bg-white/50 rounded-2xl text-secondary transition-all shadow-sm hover:shadow-md">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-header-bg shadow-sm" />
                </button>

                {/* USER PROFILE */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-white/40 border border-primary/5 hover:bg-white/60 transition-all rounded-2xl shadow-sm hover:shadow-md"
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-black text-secondary leading-none">{user.name}</p>
                            <p className="text-[9px] text-primary uppercase tracking-widest font-black mt-1 leading-none">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/10 group overflow-hidden">
                            <User size={18} className="text-primary group-hover:scale-110 transition-transform" />
                        </div>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-primary/5 overflow-hidden z-40 animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                                <div className="px-5 py-5 border-b border-main-bg bg-header-bg/30">
                                    <p className="text-sm font-black text-secondary">{user.name}</p>
                                    <p className="text-[11px] font-bold text-text-secondary truncate mt-0.5">{user.email}</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error/5 rounded-xl transition-all"
                                    >
                                        <LogOut size={18} />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
