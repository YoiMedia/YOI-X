import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

export default function PlaceholderPage({ title = "Module" }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                <Construction size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500 max-w-md mb-8">
                This page is currently under development. Our team is working hard to bring you the best experience for managing your {(title || "this module").toLowerCase()}.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
                <ArrowLeft size={18} />
                Go Back
            </button>
        </div>
    );
}
