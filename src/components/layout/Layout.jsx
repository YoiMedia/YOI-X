import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-main-bg font-secondary selection:bg-header-bg selection:text-primary">
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

                <footer className="bg-card-bg border-t border-border-accent py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5 font-bold text-text-main">
                        <span>© 2026 Yoi Media</span>
                        <span className="h-1 w-1 bg-border-accent rounded-full" />
                        <span>All rights reserved.</span>
                    </div>
                    <div
                        onClick={() => window.open("https://yoimedia.fun", "_blank")}
                        className="group flex items-center gap-2 cursor-pointer hover:text-primary transition-colors font-bold"
                    >
                        <span>Designed and Developed by Yoi Media</span>

                    </div>
                </footer>
            </div>
        </div>
    );
}
