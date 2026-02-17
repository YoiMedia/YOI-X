import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-700">
            <Toaster position="top-right" />

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed top-0 left-0 h-screen z-30">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] animate-in fade-in duration-300"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <div className="lg:hidden fixed left-0 top-0 h-screen z-50 animate-in slide-in-from-left duration-300">
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

                <main className="flex-1 p-4 lg:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </main>

                <footer className="bg-white border-t border-slate-200 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600">
                        <span>© 2025 FlowX</span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span>All rights reserved.</span>
                    </div>
                    <div
                        onClick={() => window.open("https://brandwar.in", "_blank")}
                        className="group flex items-center gap-2 cursor-pointer hover:text-purple-600 transition-colors"
                    >
                        <span>Designed and Developed by</span>
                        <img
                            className="h-4 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100"
                            src="https://www.brandwar.in/assets/images/resources/logo-1.png"
                            alt="Brandwar Logo"
                        />
                    </div>
                </footer>
            </div>
        </div>
    );
}
