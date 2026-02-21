import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { X, Loader2, User, Search, CheckCircle2, FileText, Briefcase, Globe, Target, Layers, Share2, Mail, Phone, Calendar, IndianRupee, DollarSign, CreditCard } from "lucide-react";
import { getUser } from "../../services/auth.service";
import toast from "react-hot-toast";

const DOCUMENT_TYPES = [
  { id: "proposal", label: "Proposal", icon: FileText },
  { id: "nda", label: "NDA", icon: FileText },
  { id: "invoice", label: "Invoice", icon: CreditCard },
  { id: "onboarding", label: "Onboarding", icon: Briefcase },
];

export default function CreateDocumentModal({ isOpen, onClose, selectedType, onCreated }) {
  const currentUser = getUser();
  const clients = useQuery(api.clients.listClients, { salesPersonId: currentUser?.id });
  const createDocument = useMutation(api.documents.createDocument);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [docType, setDocType] = useState(selectedType || "proposal");

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedType) setDocType(selectedType);
  }, [selectedType]);

  const filteredClients = clients?.filter(c => 
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientSelect = (client) => {
    setSelectedClientId(client._id);
    
    // Pre-fill form data based on client and docType
    if (docType === "proposal") {
      setFormData({
        clientLegalName: client.user?.fullName || "",
        brandName: client.companyName || "",
        industry: client.industry || "",
        registeredAddress: client.user?.address?.street || "",
        contactPersonName: client.user?.fullName || "",
        engagementType: "Retainer",
        platforms: [],
        primaryBusinessObjective: "",
        monthlyRetainerAmount: "",
        currency: "INR",
        executionStartDate: new Date().toISOString().split('T')[0],
      });
    } else if (docType === "onboarding") {
      setFormData({
        clientLegalName: client.user?.fullName || "",
        primaryContactEmail: client.user?.email || "",
        primaryContactPhone: client.user?.phone || "",
        websiteUrl: client.user?.website || "",
        websitePlatform: "WordPress",
        crmPlatformName: "",
        adAccountStatus: "Existing",
        preferredCommunicationEmail: client.user?.email || "",
        monthlyReviewCallPreference: "Yes",
      });
    } else if (docType === "nda") {
        setFormData({
            clientLegalEntityName: client.companyName || "",
            clientRegisteredAddress: client.user?.address?.street || "",
            authorizedSignatoryName: client.user?.fullName || "",
            authorizedSignatoryDesignation: "",
            ndaStartDate: new Date().toISOString().split('T')[0],
        });
    } else if (docType === "invoice") {
        setFormData({
            clientLegalName: client.user?.fullName || "",
            billingAddress: client.user?.address?.street || "",
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            invoiceIssueDate: new Date().toISOString().split('T')[0],
            invoiceDueDate: "",
            serviceDescription: "",
            servicePeriod: "",
            amount: "",
            currency: "INR",
            gstApplicable: "No",
        });
    }
    
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
        const platforms = formData.platforms || [];
        if (checked) {
            setFormData({ ...formData, platforms: [...platforms, value] });
        } else {
            setFormData({ ...formData, platforms: platforms.filter(p => p !== value) });
        }
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDocument({
        title: `${docType.toUpperCase()} - ${formData.clientLegalName || formData.clientLegalEntityName || "Doc"}`,
        type: docType,
        clientId: selectedClientId,
        content: formData,
        amount: formData.monthlyRetainerAmount ? Number(formData.monthlyRetainerAmount) : (formData.amount ? Number(formData.amount) : undefined),
        currency: formData.currency,
        dueDate: formData.invoiceDueDate ? new Date(formData.invoiceDueDate).getTime() : undefined,
      });
      toast.success(`${docType.charAt(0).toUpperCase() + docType.slice(1)} created successfully`);
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create document");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-border-accent animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-main-bg transition-colors z-10"
        >
          <X size={20} className="text-text-secondary" />
        </button>

        <div className="p-8 border-b border-alt-bg bg-main-bg/30">
          <h2 className="text-2xl font-black text-secondary font-primary tracking-tight">
            {step === 1 ? "Select Client" : `Create ${docType.charAt(0).toUpperCase() + docType.slice(1)}`}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">
            {step === 1 ? "Initialization Phase 01" : `Parameters Deployment Phase 02`}
          </p>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border-accent bg-main-bg/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredClients?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-text-secondary font-bold">No clients found</p>
                  </div>
                ) : (
                  filteredClients?.map((client) => (
                    <button
                      key={client._id}
                      onClick={() => handleClientSelect(client)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-border-accent hover:border-primary hover:bg-primary/5 transition-all group text-left"
                    >
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                        <User size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-secondary text-sm">{client.companyName}</h4>
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{client.user?.fullName}</p>
                      </div>
                      <CheckCircle2 size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {docType === "proposal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Client Legal Name</label>
                    <input name="clientLegalName" value={formData.clientLegalName} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Brand Name</label>
                    <input name="brandName" value={formData.brandName} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Industry</label>
                    <input name="industry" value={formData.industry} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Registered Address</label>
                    <textarea name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} className="input-field min-h-[80px]" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Contact Person</label>
                    <input name="contactPersonName" value={formData.contactPersonName} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Engagement Type</label>
                    <select name="engagementType" value={formData.engagementType} onChange={handleInputChange} className="input-field" required>
                      <option value="Retainer">Retainer</option>
                      <option value="Website-Software">Website-Software</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Platforms</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-main-bg/30 rounded-2xl border border-border-accent">
                      {["Meta", "Google", "YouTube", "SEO", "Email"].map(platform => (
                        <label key={platform} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            name="platforms" 
                            value={platform} 
                            checked={formData.platforms?.includes(platform)} 
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-border-accent text-primary focus:ring-primary/20"
                          />
                          <span className="text-xs font-bold text-secondary group-hover:text-primary transition-colors">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Primary Business Objective</label>
                    <input name="primaryBusinessObjective" value={formData.primaryBusinessObjective} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-1">
                        Monthly Retainer <IndianRupee size={10} />
                    </label>
                    <input name="monthlyRetainerAmount" type="number" value={formData.monthlyRetainerAmount} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleInputChange} className="input-field">
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Start Date</label>
                    <input name="executionStartDate" type="date" value={formData.executionStartDate} onChange={handleInputChange} className="input-field" required />
                  </div>
                </div>
              )}

              {docType === "onboarding" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Client Legal Name</label>
                    <input name="clientLegalName" value={formData.clientLegalName} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Contact Email</label>
                    <input name="primaryContactEmail" type="email" value={formData.primaryContactEmail} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Contact Phone</label>
                    <input name="primaryContactPhone" value={formData.primaryContactPhone} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Website URL</label>
                    <input name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Website Platform</label>
                    <select name="websitePlatform" value={formData.websitePlatform} onChange={handleInputChange} className="input-field">
                      <option value="WordPress">WordPress</option>
                      <option value="Shopify">Shopify</option>
                      <option value="Custom">Custom</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">CRM / Email Platform</label>
                    <input name="crmPlatformName" value={formData.crmPlatformName} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Ad Account Status</label>
                    <select name="adAccountStatus" value={formData.adAccountStatus} onChange={handleInputChange} className="input-field">
                        <option value="Existing">Existing</option>
                        <option value="New">New</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Preferred Comm Email</label>
                    <input name="preferredCommunicationEmail" value={formData.preferredCommunicationEmail} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Review Call Pref (Monthly)</label>
                    <select name="monthlyReviewCallPreference" value={formData.monthlyReviewCallPreference} onChange={handleInputChange} className="input-field">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                  </div>
                </div>
              )}

              {docType === "nda" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Client Legal Entity Name</label>
                    <input name="clientLegalEntityName" value={formData.clientLegalEntityName} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Registered Address</label>
                    <textarea name="clientRegisteredAddress" value={formData.clientRegisteredAddress} onChange={handleInputChange} className="input-field min-h-[80px]" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Authorized Signatory</label>
                    <input name="authorizedSignatoryName" value={formData.authorizedSignatoryName} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Designation</label>
                    <input name="authorizedSignatoryDesignation" value={formData.authorizedSignatoryDesignation} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">NDA Start Date</label>
                    <input name="ndaStartDate" type="date" value={formData.ndaStartDate} onChange={handleInputChange} className="input-field" required />
                  </div>
                </div>
              )}

              {docType === "invoice" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Client Legal Name</label>
                    <input name="clientLegalName" value={formData.clientLegalName} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Billing Address</label>
                    <input name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Invoice Number</label>
                    <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Issue Date</label>
                    <input name="invoiceIssueDate" type="date" value={formData.invoiceIssueDate} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Due Date</label>
                    <input name="invoiceDueDate" type="date" value={formData.invoiceDueDate} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Service Description</label>
                    <input name="serviceDescription" value={formData.serviceDescription} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Service Period</label>
                    <input name="servicePeriod" value={formData.servicePeriod} onChange={handleInputChange} className="input-field" placeholder="e.g. Feb 2024" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Amount</label>
                    <input name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="input-field" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleInputChange} className="input-field">
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">GST Applicable</label>
                    <select name="gstApplicable" value={formData.gstApplicable} onChange={handleInputChange} className="input-field">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-alt-bg flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-border-accent hover:bg-main-bg transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <span>Generate Document</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          border: 1px solid #E2E8F0;
          background-color: #F8FAFC;
          outline: none;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #000;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
