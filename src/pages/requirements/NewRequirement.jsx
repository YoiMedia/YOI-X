import { useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getUser } from "../../services/auth.service";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Loader2,
    Save,
    Plus,
    Trash2,
    Video,
    Calendar,
    FileText,
    ArrowDownToLine,
    ArrowRight,
    Users as UsersIcon,
    Globe,
    Target,
    Layers,
    Share2,
    MessageSquare,
    Check,
    ChevronDown,
    ChevronUp,
    Package,
    IndianRupee,
    DollarSign,
    BadgeCheck,
    Sparkles,
    Crown,
    Zap,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    SERVICE_TYPES,
    SERVICE_PACKAGES,
    REGIONS,
    getHigherTierInclusions,
    formatPrice,
    formatPriceRange,
} from "../../constants/servicePackages";

const SERVICE_ICONS = {
    Globe, Target, Layers, Share2, MessageSquare,
};

const TIER_COLORS = [
    { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", ring: "ring-blue-500", icon: Zap, gradient: "from-blue-500 to-blue-600" },
    { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", ring: "ring-purple-500", icon: Sparkles, gradient: "from-purple-500 to-purple-600" },
    { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", ring: "ring-amber-500", icon: Crown, gradient: "from-amber-500 to-amber-600" },
    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", ring: "ring-emerald-500", icon: BadgeCheck, gradient: "from-emerald-500 to-emerald-600" },
];

export default function NewRequirement() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const isViewMode = !!id && id !== "new-requirement";
    const clientIdParam = searchParams.get("clientId");
    const currentUser = getUser();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [newItem, setNewItem] = useState("");
    const [showAddOns, setShowAddOns] = useState(false);
    const [showHigherInclusions, setShowHigherInclusions] = useState(false);
    const [dealPriceError, setDealPriceError] = useState("");

    // Fetch data
    const requirement = useQuery(api.requirements.getRequirementById, isViewMode ? { requirementId: id } : "skip");

    const clients = useQuery(api.clients.listClients, (currentUser.role === "sales") ? { salesPersonId: currentUser.id } : {});

    const createRequirement = useMutation(api.requirements.createRequirement);
    const updateRequirement = useMutation(api.requirements.updateRequirement);
    const generateUploadUrl = useAction(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const copyFileToEntity = useMutation(api.files.copyFileToEntity);
    const getFileUrl = useAction(api.files.getFileUrl);
    const existingFiles = useQuery(api.files.getFiles, isViewMode ? { entityType: "requirement", entityId: id } : "skip");

    const [formData, setFormData] = useState({
        requirementName: "",
        description: "",

        clientId: "",
        salesPersonId: currentUser.id,
        priority: "medium",
        estimatedBudget: "",
        estimatedHours: "",
        items: [],
        // New fields
        serviceType: "",
        packageTier: "",
        region: "india",
        currency: "₹",
        mrp: 0,
        dealPrice: "",
        selectedInclusions: [],
        selectedAddOns: [],
    });

    // Populate data if in view mode
    useEffect(() => {
        if (requirement) {
            setFormData({
                requirementName: requirement.requirementName,
                description: requirement.description || "",

                clientId: requirement.clientId,
                salesPersonId: requirement.salesPersonId,
                priority: requirement.priority || "medium",
                estimatedBudget: requirement.estimatedBudget?.toString() || "",
                estimatedHours: requirement.estimatedHours?.toString() || "",
                items: requirement.items || [],
                serviceType: requirement.serviceType || "",
                packageTier: requirement.packageTier || "",
                region: requirement.region || "india",
                currency: requirement.currency || "₹",
                mrp: requirement.mrp || 0,
                dealPrice: requirement.dealPrice?.toString() || "",
                selectedInclusions: requirement.selectedInclusions || [],
                selectedAddOns: requirement.selectedAddOns || [],
            });
        }
    }, [requirement]);

    // Fetch Meeting Outcomes for sidebar
    const contextMeetings = useQuery(api.meetings.getContextMeetings,
        formData.clientId ? { clientId: formData.clientId, onlyClientMeetings: true } : "skip"
    );



    // Auto-set client region as default when client changes
    useEffect(() => {
        if (formData.clientId && clients) {
            const client = clients.find(c => c._id === formData.clientId);
            if (client?.region) {
                const reg = REGIONS.find(r => r.id === client.region);
                if (reg) {
                    setFormData(prev => ({ ...prev, region: client.region, currency: reg.currency }));
                }
            }
        }
    }, [formData.clientId, clients]);

    // Recalculate MRP when service/tier/region changes
    useEffect(() => {
        if (formData.serviceType && formData.packageTier && formData.region) {
            const pkg = formData.serviceType ? SERVICE_PACKAGES[formData.serviceType] : null;
            if (pkg?.tiers) {
                const tier = pkg.tiers.find(t => t.id === formData.packageTier);
                if (tier) {
                    const pricing = tier.pricing[formData.region];
                    if (pricing) {
                        const reg = REGIONS.find(r => r.id === formData.region);
                        setFormData(prev => ({
                            ...prev,
                            mrp: pricing.mrp,
                            currency: reg?.currency || prev.currency,
                            // Set base inclusions when tier changes
                            selectedInclusions: tier.inclusions,
                        }));
                    }
                }
            }
        }
    }, [formData.serviceType, formData.packageTier, formData.region]);

    // Validate deal price
    useEffect(() => {
        const dp = Number(formData.dealPrice);
        if (formData.dealPrice && formData.mrp && dp < formData.mrp) {
            setDealPriceError(`Deal price cannot be below MRP (${formatPrice(formData.mrp, formData.region)})`);
        } else {
            setDealPriceError("");
        }
    }, [formData.dealPrice, formData.mrp, formData.region]);

    // Get current package data 
    const currentServicePkg = formData.serviceType ? SERVICE_PACKAGES[formData.serviceType] : null;
    const currentTier = currentServicePkg?.tiers.find(t => t.id === formData.packageTier);
    const higherTierInclusions = formData.serviceType && formData.packageTier
        ? getHigherTierInclusions(formData.serviceType, formData.packageTier)
        : [];
    const availableAddOns = currentServicePkg?.addOns || [];

    // Handlers
    const handleServiceTypeSelect = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            serviceType: serviceId,
            packageTier: "",
            mrp: 0,
            dealPrice: "",
            selectedInclusions: [],
            selectedAddOns: [],
        }));
    };

    const handleTierSelect = (tierId) => {
        setFormData(prev => ({ ...prev, packageTier: tierId, dealPrice: "" }));
    };

    const handleRegionChange = (regionId) => {
        const reg = REGIONS.find(r => r.id === regionId);
        setFormData(prev => ({ ...prev, region: regionId, currency: reg?.currency || prev.currency, dealPrice: "" }));
    };

    const handleToggleHigherInclusion = (inclusion) => {
        setFormData(prev => {
            const current = [...prev.selectedInclusions];
            if (current.includes(inclusion)) {
                current.splice(current.indexOf(inclusion), 1);
            } else {
                current.push(inclusion);
            }
            return { ...prev, selectedInclusions: current };
        });
    };

    const handleToggleAddOn = (addOn) => {
        setFormData(prev => {
            const current = [...prev.selectedAddOns];
            const existing = current.findIndex(a => a.id === addOn.id);
            if (existing >= 0) {
                current.splice(existing, 1);
            } else {
                const pricing = addOn.pricing[prev.region];
                current.push({
                    id: addOn.id,
                    name: addOn.name,
                    price: pricing?.min || 0,
                });
            }
            return { ...prev, selectedAddOns: current };
        });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { uploadUrl, key } = await generateUploadUrl({ contentType: file.type, fileName: file.name });
            await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
            setAttachedFiles(prev => [...prev, { fileName: file.name, fileType: file.type, fileSize: file.size, storageKey: key, isNewUpload: true }]);
            toast.success("File uploaded ready to attach");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    const handleImportFile = async (file) => {
        setAttachedFiles(prev => [...prev, { ...file, isImport: true, originalFileId: file._id }]);
        toast.success(`Marked ${file.fileName} for import`);
    };

    const handleDownload = async (storageKey) => {
        try {
            const url = await getFileUrl({ storageKey });
            window.open(url, '_blank');
        } catch (error) {
            toast.error("Failed to get file URL");
        }
    };

    const handleAddItem = () => {
        if (!newItem.trim()) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now().toString() + Math.random().toString(36).slice(2), title: newItem, description: "", priority: "medium", estimatedHours: 0 }]
        }));
        setNewItem("");
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.clientId) {
                toast.error("Please select a client first.");
                setLoading(false);
                return;
            }

            if (dealPriceError) {
                toast.error(dealPriceError);
                setLoading(false);
                return;
            }

            let reqId;
            const submitData = {
                requirementName: formData.requirementName,
                description: formData.description,
                estimatedBudget: Number(formData.estimatedBudget) || 0,
                estimatedHours: Number(formData.estimatedHours) || 0,
                items: formData.items,
                serviceType: formData.serviceType || undefined,
                packageTier: formData.packageTier || undefined,
                region: formData.region || undefined,
                currency: formData.currency || undefined,
                mrp: formData.mrp || undefined,
                dealPrice: Number(formData.dealPrice) || undefined,
                selectedInclusions: formData.selectedInclusions.length > 0 ? formData.selectedInclusions : undefined,
                selectedAddOns: formData.selectedAddOns.length > 0 ? formData.selectedAddOns : undefined,
            };

            if (isViewMode) {
                await updateRequirement({ requirementId: id, ...submitData });
                reqId = id;
            } else {
                reqId = await createRequirement({
                    ...submitData,
                    clientId: formData.clientId,

                    salesPersonId: formData.salesPersonId,
                });
            }

            // Process Attachments
            const newFiles = attachedFiles.filter(f => f.isNewUpload || f.isImport);
            if (newFiles.length > 0) {
                await Promise.all(newFiles.map(async (file) => {
                    if (file.isNewUpload) {
                        await saveFile({ fileName: file.fileName, fileType: file.fileType, fileSize: file.fileSize, storageKey: file.storageKey, uploadedBy: currentUser.id, entityType: "requirement", entityId: reqId, description: "Requirement attachment" });
                    } else if (file.isImport) {
                        await copyFileToEntity({ fileId: file.originalFileId, targetEntityType: "requirement", targetEntityId: reqId, userId: currentUser.id });
                    }
                }));
            }

            toast.success(isViewMode ? "Requirement updated successfully!" : "Requirement created successfully!");
            if (!isViewMode) navigate("/requirements");

        } catch (error) {
            toast.error(`Failed to ${isViewMode ? 'update' : 'create'} requirement: ` + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = isViewMode && (currentUser.role !== 'admin' && currentUser.role !== 'superadmin' && currentUser.role !== 'sales');

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <button
                onClick={() => navigate("/requirements")}
                className="flex items-center text-text-secondary hover:text-secondary transition-colors font-black uppercase tracking-widest text-[10px] group mb-6"
            >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Context Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Assigned Employees Section */}
                    {isViewMode && requirement?.assignedEmployeesDetails && (
                        <div className="bg-card-bg p-6 rounded-3xl border border-border-accent shadow-sm">
                            <h3 className="font-black text-secondary text-lg mb-4 flex items-center gap-2 font-primary">
                                <UsersIcon size={20} className="text-primary" />
                                Assigned Team
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {requirement.assignedEmployeesDetails.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No employees assigned yet.</p>
                                )}
                                {requirement.assignedEmployeesDetails.map(emp => (
                                    <div
                                        key={emp.id}
                                        className="rounded-full bg-header-bg border border-primary/20 flex px-3 py-1.5 items-center justify-center text-[10px] font-black uppercase tracking-widest text-primary shadow-sm"
                                        title={emp.name}
                                    >
                                        {emp.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pricing Summary Card - Hidden for Employees */}
                    {formData.serviceType && formData.packageTier && formData.mrp > 0 && (currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.role === 'sales') && (
                        <div className="bg-linear-to-br from-secondary to-[#1a1a1a] p-6 rounded-3xl shadow-xl text-white font-secondary">
                            <h3 className="font-black text-lg mb-4 flex items-center gap-2 font-primary">
                                <Package size={20} className="text-primary" />
                                Pricing Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Service</span>
                                    <span className="font-bold">{SERVICE_TYPES.find(s => s.id === formData.serviceType)?.label}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Package</span>
                                    <span className="font-bold capitalize">{currentTier?.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Region</span>
                                    <span className="font-bold">{REGIONS.find(r => r.id === formData.region)?.flag} {REGIONS.find(r => r.id === formData.region)?.label}</span>
                                </div>
                                <div className="border-t border-slate-700 pt-3 mt-3">
                                    {currentTier && (currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'superadmin') && (
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-slate-400 font-medium">Price Range</span>
                                            <span className="font-bold text-slate-300">
                                                {formatPriceRange(currentTier.pricing[formData.region].min, currentTier.pricing[formData.region].max, formData.region)}
                                            </span>
                                        </div>
                                    )}

                                    {(currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'superadmin') && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-primary font-bold text-sm">MRP (Fixed)</span>
                                            <span className="text-2xl font-black text-primary">{formatPrice(formData.mrp, formData.region)}</span>
                                        </div>
                                    )}

                                    {formData.dealPrice && !dealPriceError && (
                                        <div className={`flex justify-between items-center ${(currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'superadmin') ? 'mt-2' : ''}`}>
                                            <span className="text-green-400 font-bold text-sm">Deal Price</span>
                                            <span className="text-2xl font-black text-green-400">{formatPrice(Number(formData.dealPrice), formData.region)}</span>
                                        </div>
                                    )}
                                </div>
                                {formData.selectedAddOns.length > 0 && (
                                    <div className="border-t border-white/10 pt-3 mt-3">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Add-Ons</span>
                                        {formData.selectedAddOns.map(a => (
                                            <div key={a.id} className="flex justify-between text-xs mt-1">
                                                <span className="text-slate-400 truncate max-w-[150px]">{a.name}</span>
                                                <span className="text-slate-300 font-bold">{a.price ? formatPrice(a.price, formData.region) : "—"}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-card-bg p-6 rounded-3xl border border-border-accent shadow-sm sticky top-6 h-[calc(100vh-9rem)] flex flex-col">
                        <h3 className="font-black text-secondary text-lg mb-4 flex items-center gap-2 font-primary shrink-0">
                            <Video size={20} className="text-primary" />
                            Meeting Context
                        </h3>
                        <p className="text-[10px] text-text-secondary mb-6 font-bold uppercase tracking-widest shrink-0">Use insights from recent or linked meetings to define requirements.</p>

                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-2">
                            {!formData.clientId && (
                                <div className="text-center py-10 bg-alt-bg rounded-2xl border border-dashed border-border-accent">
                                    <UsersIcon size={32} className="text-text-secondary/20 mx-auto mb-2" />
                                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest px-4">
                                        Select a client first to see relevant meetings.
                                    </p>
                                </div>
                            )}
                            {formData.clientId && !contextMeetings && <div className="text-center py-10"><Loader2 className="animate-spin text-slate-400 mx-auto" /></div>}
                            {formData.clientId && contextMeetings?.length === 0 && <div className="text-slate-400 text-sm italic text-center">No relevant meetings found for this client.</div>}

                            {contextMeetings?.map(meeting => (
                                <MeetingContextCard
                                    key={meeting._id}
                                    meeting={meeting}
                                    onImportFile={handleImportFile}
                                    disabled={isReadOnly}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-2">
                    <div className="bg-card-bg p-8 md:p-12 rounded-[2rem] border border-border-accent shadow-sm font-secondary h-[calc(100vh-9rem)] flex flex-col">
                        <div className="mb-8 flex justify-between items-start shrink-0">
                            <div>
                                <h1 className="text-3xl font-black text-secondary tracking-tight font-primary">
                                    {isViewMode ? "Requirement Details" : "New Requirement"}
                                </h1>
                                <p className="text-text-secondary font-bold uppercase tracking-widest text-xs mt-1">
                                    {isViewMode ? `Viewing ${requirement?.requirementNumber || "Requirement"}` : "Define the requirements for a client."}
                                </p>
                            </div>
                            {isViewMode && (
                                <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest ${requirement?.status === 'approved' ? 'bg-success/10 text-success border-success/20' :
                                    requirement?.status === 'draft' ? 'bg-alt-bg text-text-secondary border-border-accent' :
                                        'bg-header-bg text-primary border-primary/20'
                                    }`}>
                                    {requirement?.status}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-4">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2 ml-1">Account Portfolio</label>
                                        <select
                                            required
                                            disabled={isViewMode}
                                            value={formData.clientId}
                                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                            className="w-full p-4 rounded-2xl border border-border-accent bg-alt-bg/30 font-bold text-secondary text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
                                        >
                                            <option value="">Select a Client</option>
                                            {clients?.map(client => (
                                                <option key={client._id} value={client._id}>
                                                    {client.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2 ml-1">Project Milestone Title</label>
                                        <input
                                            required
                                            disabled={isReadOnly}
                                            value={formData.requirementName}
                                            onChange={(e) => setFormData({ ...formData, requirementName: e.target.value })}
                                            className="w-full p-4 rounded-2xl border border-border-accent focus:outline-none focus:ring-2 focus:ring-primary/10 bg-alt-bg/50 font-black text-xl text-secondary placeholder:text-text-secondary/20 disabled:opacity-60"
                                            placeholder="e.g. Enterprise Authentication Suite"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2 ml-1">Technical Scope</label>
                                        <textarea
                                            disabled={isReadOnly}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="4"
                                            className="w-full p-4 rounded-2xl border border-border-accent bg-alt-bg/30 focus:outline-none focus:ring-2 focus:ring-primary/10 font-bold text-secondary text-sm placeholder:text-text-secondary/20 disabled:opacity-60"
                                            placeholder="Outline the technical and functional architecture..."
                                        />
                                    </div>
                                </div>

                                {/* ─── SERVICE TYPE SELECTION ─── */}
                                <div className="pt-6 border-t border-border-accent/30">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">
                                        Service Classification
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {SERVICE_TYPES.map((service) => {
                                            const IconComp = SERVICE_ICONS[service.icon] || Globe;
                                            const isActive = formData.serviceType === service.id;
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    disabled={isReadOnly}
                                                    onClick={() => handleServiceTypeSelect(service.id)}
                                                    className={`p-4 rounded-2xl border-2 text-left transition-all group ${isActive
                                                        ? "border-primary bg-header-bg ring-4 ring-primary/5 shadow-xl shadow-primary/5"
                                                        : "border-border-accent/50 bg-card-bg hover:border-primary/30 hover:bg-alt-bg/50"
                                                        } disabled:opacity-60`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-alt-bg text-text-secondary group-hover:bg-header-bg group-hover:text-primary"} transition-colors`}>
                                                            <IconComp size={20} />
                                                        </div>
                                                        <div>
                                                            <div className={`font-black text-sm ${isActive ? "text-secondary" : "text-secondary/70"}`}>{service.label}</div>
                                                            <div className="text-[10px] text-text-secondary/60 font-bold uppercase tracking-widest">{service.description}</div>
                                                        </div>
                                                        {isActive && (
                                                            <div className="ml-auto">
                                                                <Check size={18} className="text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ─── REGION SELECTOR ─── */}
                                {formData.serviceType && (
                                    <div className="pt-4">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                            Client Region
                                        </label>
                                        <div className="flex gap-2">
                                            {REGIONS.map(reg => (
                                                <button
                                                    key={reg.id}
                                                    type="button"
                                                    disabled={isReadOnly}
                                                    onClick={() => handleRegionChange(reg.id)}
                                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm text-center transition-all ${formData.region === reg.id
                                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                                                        }`}
                                                >
                                                    <span className="text-lg mr-1">{reg.flag}</span> {reg.label} ({reg.currency})
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ─── PACKAGE TIER SELECTION ─── */}
                                {formData.serviceType && currentServicePkg && (
                                    <div className="pt-4">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                                            Select Package Tier
                                        </label>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentServicePkg.tiers.map((tier, idx) => {
                                                const colors = TIER_COLORS[idx % TIER_COLORS.length];
                                                const TierIcon = colors.icon;
                                                const pricing = tier.pricing[formData.region];
                                                const isActive = formData.packageTier === tier.id;

                                                return (
                                                    <button
                                                        key={tier.id}
                                                        type="button"
                                                        disabled={isReadOnly}
                                                        onClick={() => handleTierSelect(tier.id)}
                                                        className={`p-5 rounded-2xl border-2 text-left transition-all ${isActive
                                                            ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}/20 shadow-lg`
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                            } disabled:opacity-60`}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.gradient} text-white shadow-md`}>
                                                                    <TierIcon size={18} />
                                                                </div>
                                                                <div>
                                                                    <div className={`font-black text-lg ${isActive ? colors.text : "text-slate-800"}`}>{tier.name}</div>
                                                                    {tier.platforms && <div className="text-[11px] text-slate-400 font-medium">{tier.platforms}</div>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Range</div>
                                                                <div className={`font-bold text-sm ${isActive ? colors.text : "text-slate-600"}`}>
                                                                    {pricing ? formatPriceRange(pricing.min, pricing.max, formData.region) : "—"}
                                                                </div>
                                                                {pricing?.mrp && (
                                                                    <div className={`font-black text-lg mt-0.5 ${isActive ? colors.text : "text-slate-800"}`}>
                                                                        MRP: {formatPrice(pricing.mrp, formData.region)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Preview inclusions when active */}
                                                        {isActive && (
                                                            <div className="mt-3 pt-3 border-t border-slate-200/50">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Included in this tier</div>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {tier.inclusions.map((inc, i) => (
                                                                        <div key={i} className="flex items-start gap-2 text-xs">
                                                                            <Check size={12} className={`${colors.text} mt-0.5 shrink-0`} />
                                                                            <span className="text-slate-600 font-medium">{inc}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ─── HIGHER TIER INCLUSIONS (add more) ─── */}
                                {currentTier && higherTierInclusions.length > 0 && (
                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowHigherInclusions(!showHigherInclusions)}
                                            className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors mb-3"
                                        >
                                            <Sparkles size={16} />
                                            Add Inclusions from Higher Tiers ({higherTierInclusions.length} available)
                                            {showHigherInclusions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {showHigherInclusions && (
                                            <div className="bg-purple-50/50 rounded-2xl border border-purple-100 p-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <p className="text-[11px] text-purple-500 font-medium mb-3">
                                                    These features are from higher tiers. Add them to customize your package.
                                                </p>
                                                {higherTierInclusions.map((inc, i) => {
                                                    const isSelected = formData.selectedInclusions.includes(inc);
                                                    return (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            disabled={isReadOnly}
                                                            onClick={() => handleToggleHigherInclusion(inc)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all text-sm ${isSelected
                                                                ? "bg-purple-100 border border-purple-200 text-purple-700"
                                                                : "bg-white border border-slate-100 text-slate-600 hover:border-purple-200 hover:bg-purple-50"
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${isSelected
                                                                ? "bg-purple-600 text-white"
                                                                : "border-2 border-slate-300"
                                                                }`}>
                                                                {isSelected && <Check size={12} />}
                                                            </div>
                                                            <span className="font-medium">{inc}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─── ADD-ONS ─── */}
                                {currentTier && availableAddOns.length > 0 && (
                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddOns(!showAddOns)}
                                            className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors mb-3"
                                        >
                                            <Plus size={16} />
                                            Add-Ons ({availableAddOns.length} available)
                                            {showAddOns ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {showAddOns && (
                                            <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                                                {availableAddOns.map((addOn) => {
                                                    const isSelected = formData.selectedAddOns.some(a => a.id === addOn.id);
                                                    const pricing = addOn.pricing[formData.region];
                                                    return (
                                                        <button
                                                            key={addOn.id}
                                                            type="button"
                                                            disabled={isReadOnly}
                                                            onClick={() => handleToggleAddOn(addOn)}
                                                            className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl text-left transition-all ${isSelected
                                                                ? "bg-amber-100 border border-amber-200"
                                                                : "bg-white border border-slate-100 hover:border-amber-200 hover:bg-amber-50"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${isSelected
                                                                    ? "bg-amber-600 text-white"
                                                                    : "border-2 border-slate-300"
                                                                    }`}>
                                                                    {isSelected && <Check size={12} />}
                                                                </div>
                                                                <div>
                                                                    <div className={`font-bold text-sm ${isSelected ? "text-amber-700" : "text-slate-700"}`}>{addOn.name}</div>
                                                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                                        {addOn.inclusions.slice(0, 2).join(" • ")}
                                                                        {addOn.inclusions.length > 2 && ` +${addOn.inclusions.length - 2} more`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {pricing && (
                                                                <div className="text-right shrink-0">
                                                                    <div className={`font-bold text-sm ${isSelected ? "text-amber-700" : "text-slate-600"}`}>
                                                                        {formatPriceRange(pricing.min, pricing.max, formData.region)}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-medium">per month</div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─── DEAL PRICE ─── */}
                                {currentTier && formData.mrp > 0 && (currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.role === 'sales') && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {(currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'superadmin') && (
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                                        MRP (Fixed)
                                                    </label>
                                                    <div className="w-full p-4 rounded-2xl border border-blue-200 bg-blue-50 font-black text-xl text-blue-700">
                                                        {formatPrice(formData.mrp, formData.region)}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Auto-calculated from selected package & region</p>
                                                </div>
                                            )}
                                            <div className={(currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'superadmin') ? '' : 'col-span-2'}>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                                    Deal Price ({formData.currency})
                                                </label>
                                                <input
                                                    type="number"
                                                    disabled={isReadOnly}
                                                    value={formData.dealPrice}
                                                    onChange={(e) => setFormData({ ...formData, dealPrice: e.target.value })}
                                                    className={`w-full p-4 rounded-2xl border font-bold text-lg disabled:bg-slate-50 ${dealPriceError ? "border-red-300 bg-red-50 text-red-700 focus:ring-red-500/20" : "border-slate-200 bg-white focus:ring-2 focus:ring-green-500/20"
                                                        }`}
                                                    placeholder={`Min ${formatPrice(formData.mrp, formData.region)}`}
                                                />
                                                {dealPriceError && (
                                                    <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-bold">
                                                        <AlertCircle size={14} />
                                                        {dealPriceError}
                                                    </div>
                                                )}
                                                {(currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'superadmin') && (
                                                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Cannot be lower than MRP</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Items Section */}
                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Additional Notes / Sub-Tasks</label>

                                    <div className="space-y-2 mb-3">
                                        {formData.items.length === 0 && <div className="text-xs text-slate-400 italic">No items added yet.</div>}
                                        {formData.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                                <span className="flex-1 font-bold text-slate-700">{item.title}</span>
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {!isReadOnly && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={newItem}
                                                onChange={(e) => setNewItem(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-slate-400"
                                                placeholder="Add a note or sub-task..."
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddItem}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-3 rounded-xl transition-colors"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Attachments Section */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Attachments</label>
                                        {!isReadOnly && (
                                            <label className="cursor-pointer text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1">
                                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                Upload File
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {((existingFiles && existingFiles.length > 0) || attachedFiles.length > 0) && (
                                        <div className="space-y-3 mb-4">
                                            {existingFiles?.map((file) => (
                                                <div key={file._id} className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16} className="text-blue-500" />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-700 leading-tight">{file.fileName}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">Uploaded by {file.uploaderName}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownload(file.storageKey)}
                                                        className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-600 transition-colors"
                                                    >
                                                        <ArrowDownToLine size={14} />
                                                        Download
                                                    </button>
                                                </div>
                                            ))}

                                            {attachedFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={16} className="text-slate-400" />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-700 leading-tight">{file.fileName}</span>
                                                            {file.isImport && <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Imported</span>}
                                                            {!file.isImport && <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">New Upload</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={isReadOnly}
                                                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                        className="text-slate-400 hover:text-red-500 disabled:opacity-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Estimated Hours */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Est. Hours</label>
                                        <input
                                            type="number"
                                            disabled={isReadOnly}
                                            value={formData.estimatedHours}
                                            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium disabled:bg-slate-50"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <div className="pt-6 border-t border-slate-100 flex justify-end shrink-0">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                        {isViewMode ? "Update Requirement" : "Save Requirement"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Child component for meeting card in sidebar
function MeetingContextCard({ meeting, onImportFile }) {
    const meetingFiles = useQuery(api.files.getFiles, { entityType: "meeting", entityId: meeting._id });
    const meetingOutcomes = useQuery(api.meetingOutcomes.listMeetingOutcomes, {
        meetingId: meeting._id,
        userId: undefined,
        role: undefined
    });
    const [expanded, setExpanded] = useState(false);

    const scheduledDate = new Date(meeting.scheduledAt);

    // Get shared outcomes (non-private) for preview
    const sharedOutcomes = meetingOutcomes?.filter(o => !o.isPrivate) || [];

    return (
        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:bg-white hover:shadow-md transition-all group">
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {meeting.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                        {scheduledDate.toLocaleDateString()}
                    </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{meeting.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="truncate max-w-[100px]">{meeting.organizerName}</span>
                    <span>•</span>
                    <span className="truncate max-w-[100px]">{meeting.companyName}</span>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 bg-white border-t border-slate-100 animate-in slide-in-from-top-2">
                    {/* Meeting Notes/Outcomes */}
                    {sharedOutcomes.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</div>
                            {sharedOutcomes.map(outcome => (
                                <div key={outcome._id} className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="font-bold text-slate-700 text-[10px] uppercase">{outcome.role}</span>
                                        {outcome.sentiment && (
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${outcome.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                outcome.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {outcome.sentiment}
                                            </span>
                                        )}
                                    </div>
                                    <p className="line-clamp-2">"{outcome.summary}"</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Files List */}
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Attachments</div>
                        {!meetingFiles || meetingFiles.length === 0 ? (
                            <div className="text-xs text-slate-400 italic">No files attached.</div>
                        ) : (
                            meetingFiles.map(file => (
                                <div key={file._id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText size={12} className="text-blue-500" />
                                        <span className="truncate max-w-[120px]">{file.fileName}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onImportFile(file); }}
                                        className="flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-1 rounded-lg font-bold text-[10px] transition-all"
                                        title="Import this file to requirement"
                                    >
                                        <Plus size={12} />
                                        Import
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {!expanded && (sharedOutcomes.length > 0 || (meetingFiles && meetingFiles.length > 0)) && (
                <div className="px-4 pb-2 flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    {sharedOutcomes.length > 0 && <span>{sharedOutcomes.length} note{sharedOutcomes.length !== 1 ? 's' : ''}</span>}
                    {sharedOutcomes.length > 0 && meetingFiles && meetingFiles.length > 0 && <span>•</span>}
                    {meetingFiles && meetingFiles.length > 0 && (
                        <>
                            <FileText size={10} /> {meetingFiles.length} file{meetingFiles.length !== 1 ? 's' : ''}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
