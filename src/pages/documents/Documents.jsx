import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  IndianRupee,
  DollarSign,
  ChevronRight
} from "lucide-react";
import { getUser } from "../../services/auth.service";
import CreateDocumentModal from "./CreateDocumentModal";

const DOCUMENT_TABS = [
  { id: "proposal", label: "Proposals", icon: FileText },
  { id: "nda", label: "NDA", icon: FileText },
  { id: "invoice", label: "Invoices", icon: FileText },
  { id: "onboarding", label: "Onboarding", icon: FileText },
];

export default function Documents() {
  const currentUser = getUser();
  const [activeTab, setActiveTab] = useState("proposal");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const documents = useQuery(api.documents.listDocuments, { 
    salesPersonId: currentUser?.id,
    type: activeTab 
  });

  const filteredDocs = documents?.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-600";
      case "sent": return "bg-blue-100 text-blue-600";
      case "signed": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-secondary font-primary tracking-tighter leading-none">Intelligence Archive</h1>
          <p className="text-primary font-black uppercase tracking-[0.25em] text-[9px] mt-3">
            Legal Documentation & Financial Assets Management
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Create {DOCUMENT_TABS.find(t => t.id === activeTab)?.label.slice(0, -1) || activeTab}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-border-accent pb-1">
        {DOCUMENT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-black uppercase tracking-widest text-[10px] transition-all relative ${
                isActive ? "text-primary" : "text-text-secondary hover:text-secondary"
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search documents by ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border-accent bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-border-accent bg-white font-black uppercase tracking-widest text-[10px] text-text-secondary hover:text-secondary transition-all shadow-sm">
          <Filter size={16} />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {!filteredDocs ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-border-accent p-20 text-center shadow-sm">
            <div className="w-16 h-16 bg-main-bg rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-secondary/20">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-black text-secondary">No documents found</h3>
            <p className="text-text-secondary font-bold text-sm mt-2">Try adjusting your search or create a new document.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div 
              key={doc._id}
              className="bg-white rounded-3xl border border-border-accent p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-secondary/5 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 shadow-lg shadow-secondary/5 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-secondary text-lg leading-none">{doc.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {doc.documentNumber}
                    </p>
                    {doc.amount && (
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-0.5">
                        {doc.currency === 'INR' ? <IndianRupee size={10} /> : <DollarSign size={10} />}
                        {doc.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-3 bg-main-bg text-text-secondary rounded-xl hover:bg-primary hover:text-white transition-all">
                  <Download size={18} />
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-primary transition-all">
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </button>
                <button className="p-3 text-text-secondary/30 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <CreateDocumentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedType={activeTab}
        onCreated={() => {
          // Query will auto-refresh thanks to Convex
        }}
      />
    </div>
  );
}
