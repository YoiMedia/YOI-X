import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import CompleteProfileModal from "../modals/CompleteProfileModal";

export default function Layout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const currentUser = getUser();
    const isClient = currentUser?.role === "client";

    // For clients, fetch their user record to check if profile is completed
    const userRecord = useQuery(
        api.users.getUserByEmail,
        isClient && currentUser?.email ? { email: currentUser.email } : "skip"
    );

    // Show blocking modal if client hasn't completed their profile yet
    const showProfileModal = isClient && userRecord !== undefined && userRecord?.profileCompleted !== true;

    return (
        <div className="flex min-h-screen bg-main-bg font-accent selection:bg-primary/20 selection:text-secondary">
            {/* Blocking profile completion modal */}
            {showProfileModal && <CompleteProfileModal />}

            {/* Desktop Sidebar */}
            <div className={`hidden lg:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
                <Sidebar
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-secondary/60 z-40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <div className="lg:hidden fixed left-0 top-0 h-screen z-50 animate-in slide-in-from-left duration-300 shadow-2xl">
                        <Sidebar collapsed={false} setCollapsed={() => { }} />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300
        ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
            >
                <Header onMenuClick={() => setMobileSidebarOpen(true)} />

                <main className="flex-1 p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {children}
                </main>

                <footer className="bg-white border-t border-border-accent py-8 px-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                            <span className="text-primary font-black text-xs">Y</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-secondary font-primary leading-none">FlowX</span>
                            <span className="text-[10px] font-bold text-text-secondary mt-1">© 2026 Yoi Media. All rights reserved.</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="https://yoimedia.fun" target="_blank" className="text-[11px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">Yoi Media Home</a>
                        <a href="#" className="text-[11px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">Support Center</a>
                        <a href="#" className="text-[11px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">System API</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
