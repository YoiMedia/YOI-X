import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, BarChart3, Users, FileCheck, MessageSquare, Calendar, Shield } from "lucide-react";

const features = [
    { icon: BarChart3, title: "Client Portal", desc: "Give clients real-time visibility into projects and requirements." },
    { icon: Calendar, title: "Meeting Sync", desc: "Schedule briefings and auto-generate Google Meet links in one click." },
    { icon: FileCheck, title: "Submissions", desc: "Review and approve deliverables with a structured approval workflow." },
    { icon: Users, title: "Team Management", desc: "Manage admins, sales, employees and clients from one dashboard." },
    { icon: MessageSquare, title: "Query Center", desc: "Centralise all client queries and internal communications." },
    { icon: Shield, title: "Role-based Access", desc: "Granular permissions so everyone sees exactly what they need." },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-main-bg text-text-main font-accent overflow-x-hidden">
            {/* ── NAV ── */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-accent">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/10">
                            <Zap size={20} className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-secondary font-primary leading-none">FlowX</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">by Yoi Media</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate("/auth/client-login")}
                            className="text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                        >
                            Client Login
                        </button>
                        <button
                            onClick={() => navigate("/auth/login")}
                            className="text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                        >
                            Staff Portal <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="relative pt-32 pb-32 px-6 text-center overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none opacity-50">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-header-bg rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-secondary text-primary text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full mb-10 shadow-lg shadow-secondary/5">
                        <Zap size={12} fill="currentColor" /> Internal Operations Platform
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-secondary font-primary leading-[0.9] mb-8">
                        The ultimate agency{" "}
                        <span className="text-primary italic">command centre.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 font-secondary leading-relaxed">
                        FlowX is Yoi Media's powerhouse for managing clients, meetings,
                        requirements, and team output with uncompromising speed.
                    </p>

                    <div className="flex items-center justify-center gap-6 flex-wrap">
                        <button
                            onClick={() => navigate("/auth/login")}
                            className="bg-secondary hover:bg-black text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl shadow-2xl shadow-secondary/20 transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center gap-3"
                        >
                            Sign In to Staff Portal <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => navigate("/auth/client-login")}
                            className="bg-white border-2 border-border-accent hover:border-primary text-secondary hover:text-primary font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl transition-all hover:scale-[1.05]"
                        >
                            Client Access
                        </button>
                    </div>
                </div>
            </section>

            {/* ── STATS / BRANDS (Minimalist) ── */}
            <section className="bg-header-bg py-16 border-y border-primary/10">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { label: "Requirements", val: "500+" },
                        { label: "Satisfied Clients", val: "120+" },
                        { label: "Active Team", val: "45+" },
                        { label: "Countries", val: "12" }
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className="text-3xl font-black text-secondary font-primary">{s.val}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES GRID ── */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center mb-20 text-center">
                        <h2 className="text-4xl md:text-6xl font-black text-secondary font-primary tracking-tighter mb-4 leading-none">
                            Tailored for <span className="text-primary">Performance.</span>
                        </h2>
                        <div className="w-20 h-2 bg-primary rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="group bg-main-bg border border-border-accent hover:border-primary rounded-3xl p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary group-hover:rotate-6 transition-all">
                                    <Icon size={24} className="text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-black text-secondary text-xl tracking-tight mb-3 font-primary">{title}</h3>
                                <p className="text-sm text-text-secondary font-medium leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BOTTOM CTA ── */}
            <section className="px-6 pb-32">
                <div className="max-w-5xl mx-auto bg-secondary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-secondary/30">
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6 font-primary leading-[0.9]">
                            Scale your <span className="text-primary italic">agency</span> output.
                        </h2>
                        <p className="text-white/40 text-lg md:text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">
                            Join the Yoi Media internal network and streamline your operations today.
                        </p>
                        <button
                            onClick={() => navigate("/auth/login")}
                            className="bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest text-sm px-12 py-5 rounded-2xl shadow-2xl shadow-primary/40 transition-all hover:scale-[1.05] mx-auto flex items-center gap-3"
                        >
                            Access Staff Portal <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-secondary py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 pt-12">
                    <div className="flex items-center gap-2">
                        <Zap size={20} className="text-primary" fill="currentColor" />
                        <span className="text-lg font-black tracking-tight text-white font-primary">FlowX</span>
                        <span className="ml-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">© 2026 Yoi Media</span>
                    </div>
                    <div className="flex gap-8">
                        {["System Status", "Support", "Privacy Policy", "Terms"].map(l => (
                            <a key={l} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors">{l}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
