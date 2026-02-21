import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Papa from "papaparse"; // CSV parser
import { getUser } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import {
  SERVICE_TYPES,
  SERVICE_PACKAGES,
} from "../../constants/servicePackages";
import { Check, CheckCheck, Layers } from "lucide-react";

// Hardcoded FREELANCERS removed - using Convex users instead

const SunIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="4" />
    <path
      strokeLinecap="round"
      d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
    />
  </svg>
);
const AfternoonIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.25l-1.591 1.591M3 12h2.25m.386-4.773l1.591 1.591M12 15a3 3 0 110-6 3 3 0 010 6z"
    />
  </svg>
);
const MoonIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  </svg>
);

const STATUS_CONFIG = {
  new: {
    label: "New",
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-400",
  },
  interested: {
    label: "Interested",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
  },
  pitched: {
    label: "Pitched",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    dot: "bg-indigo-400",
  },
  "follow-up": {
    label: "Follow Up",
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-400",
  },
  converted: {
    label: "Converted",
    bg: "bg-violet-50",
    text: "text-violet-600",
    dot: "bg-violet-500",
  },
  "not-interested-lost": {
    label: "Lost / Not Interested",
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
};

const getRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const getCurrentTimeSlot = () => {
  // Dubai is UTC+4.
  // We strive to get the hour in Dubai irrespective of local machine time.
  const dubaiTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Dubai",
  });
  const hour = new Date(dubaiTime).getHours();

  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "night";
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      <span className="ml-1 text-xs text-slate-500 font-medium">{rating}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export default function Leads() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const isSales = currentUser?.role === "sales";
  const isAdminOrSuper =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  // Convex queries and mutations
  const allLeads =
    useQuery(api.leads.getAllLeads, {
      status: undefined,
      area: undefined,
      profession: undefined,
      searchQuery: undefined,
    }) ?? [];

  const assignedLeads =
    useQuery(api.leads.getLeadsForSalesperson, {
      salesPersonId: currentUser?._id || currentUser?.id,
    }) ?? [];

  const leads = isSales ? assignedLeads : allLeads;

  const stats = useQuery(api.leads.getLeadStats) ?? {
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    pitched: 0,
    followUp: 0,
    converted: 0,
    notInterested: 0,
    lost: 0,
  };

  const filterOptions = useQuery(api.leads.getLeadFilterOptions) ?? {
    areas: [],
    professions: [],
  };

  // Mutations
  const createLeadMutation = useMutation(api.leads.createLead);
  const importLeadsMutation = useMutation(api.leads.importLeadsFromCSV);
  const updateLeadMutation = useMutation(api.leads.updateLead);
  const updateAssignmentStatusMutation = useMutation(
    api.leads.updateLeadAssignmentStatus,
  );
  const deleteLeadMutation = useMutation(api.leads.deleteLead);
  const assignLeadsMutation = useMutation(api.leads.assignLeadsToSalesperson);
  const logContactMutation = useMutation(api.leads.logLeadContact);
  const generateMeetLinkAction = useAction(api.meetings.generateMeetLink);

  // Local state
  const [selected, setSelected] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterProfession, setFilterProfession] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [selectedServices, setSelectedServices] = useState([]); // For pitched/converted
  const [assignTarget, setAssignTarget] = useState(null);
  const [importDrag, setImportDrag] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeContactDropdown, setActiveContactDropdown] = useState(null); // ID of lead with active dropdown
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'freelancer'
  const [freelancerFilterStatus, setFreelancerFilterStatus] =
    useState("interested");

  // ── Meet scheduling state ──
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [meetLead, setMeetLead] = useState(null);
  const [meetTitle, setMeetTitle] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [meetDuration, setMeetDuration] = useState(30);
  const [meetAttendeeInput, setMeetAttendeeInput] = useState("");
  const [meetAttendees, setMeetAttendees] = useState([]);
  const [meetLink, setMeetLink] = useState(null);
  const [isMeetLoading, setIsMeetLoading] = useState(false);
  const [meetError, setMeetError] = useState("");

  const fileInputRef = useRef();

  // Fetch actual freelancers/salespeople from Convex
  const allUsers = useQuery(api.users.listUsers, {}) ?? [];
  const freelancers = allUsers
    .filter((u) => u.role === "sales" || u.role === "employee")
    .map((u) => ({
      id: u._id,
      name: u.fullName,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      avatar: u.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2),
    }));

  // Grouped leads for freelancer view
  const groupedLeads =
    useQuery(api.leads.getFreelancerGroupedLeads, {
      status: freelancerFilterStatus,
    }) ?? [];

  // Filter leads based on search and filters
  const filtered = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.area?.toLowerCase().includes(q) ||
      l.profession?.toLowerCase().includes(q) ||
      l.formattedPhoneNumber?.includes(q);
    const matchesArea = filterArea === "all" || l.area === filterArea;
    const matchesProfession =
      filterProfession === "all" || l.profession === filterProfession;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "not-interested-lost"
        ? l.status === "not-interested" || l.status === "lost"
        : l.status === filterStatus);
    const matchesNoWebsite =
      !filterNoWebsite || !l.website || l.website.trim() === "";
    return (
      matchesSearch &&
      matchesArea &&
      matchesProfession &&
      matchesStatus &&
      matchesNoWebsite
    );
  });

  const allSelected =
    filtered.length > 0 && filtered.every((l) => selected.has(l._id));
  const someSelected = filtered.some((l) => selected.has(l._id));

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      filtered.forEach((l) => next.delete(l._id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((l) => next.add(l._id));
      setSelected(next);
    }
  };

  const handleAssign = async () => {
    if (!assignTarget) return;
    setIsLoading(true);
    try {
      const selectedArray = Array.from(selected);
      await assignLeadsMutation({
        leadIds: selectedArray,
        salesPersonId: assignTarget,
        userId: currentUser?._id || currentUser?.id,
      });
      alert(
        `Assigned ${selected.size} lead(s) to ${freelancers.find((f) => f.id === assignTarget)?.name}`,
      );
      setSelected(new Set());
      setShowAssignModal(false);
      setAssignTarget(null);
    } catch (error) {
      console.error("Error assigning leads:", error);
      alert("Failed to assign leads");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Meet handlers ──
  const handleAddMeetAttendee = () => {
    const email = meetAttendeeInput.trim().toLowerCase();
    if (!email || meetAttendees.includes(email)) {
      setMeetAttendeeInput("");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setMeetError("Invalid email address");
      return;
    }
    setMeetAttendees((prev) => [...prev, email]);
    setMeetAttendeeInput("");
    setMeetError("");
  };
  const handleRemoveMeetAttendee = (email) =>
    setMeetAttendees((prev) => prev.filter((e) => e !== email));
  const handleGenerateMeet = async () => {
    if (!meetDate || !meetTime) {
      setMeetError("Please pick a date and time.");
      return;
    }
    if (meetAttendees.length === 0) {
      setMeetError("Add at least one attendee email.");
      return;
    }
    setIsMeetLoading(true);
    setMeetError("");
    try {
      const scheduledAt = new Date(`${meetDate}T${meetTime}`).getTime();
      const link = await generateMeetLinkAction({
        title: meetTitle || `Lead Discussion – ${meetLead?.name}`,
        description: `Lead status: ${meetLead?.status || "new"} | Business: ${meetLead?.name} | Area: ${meetLead?.area || "N/A"} | Type: ${meetLead?.profession || "N/A"}`,
        scheduledAt,
        duration: meetDuration,
        attendeeEmails: meetAttendees,
      });
      setMeetLink(link);
    } catch (err) {
      console.error("Meet generation error:", err);
      setMeetError("Failed to generate meet link. Please try again.");
    } finally {
      setIsMeetLoading(false);
    }
  };

  const openStatusModal = (lead, nextStatus) => {
    setStatusTarget(lead);
    setNewStatus(nextStatus);
    setStatusNotes("");
    setSelectedServices(lead.pitchedServices || []);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusTarget || !newStatus) return;
    setIsLoading(true);
    try {
      const actualStatus =
        newStatus === "not-interested-lost" ? "not-interested" : newStatus;

      if (isSales) {
        await updateAssignmentStatusMutation({
          leadId: statusTarget._id,
          salesPersonId: currentUser?._id || currentUser?.id,
          status: actualStatus,
          notes: statusNotes,
          pitchedServices: selectedServices,
        });
      } else {
        await updateLeadMutation({
          leadId: statusTarget._id,
          status: actualStatus,
          notes: statusNotes,
          pitchedServices: selectedServices,
        });
      }

      if (actualStatus === "converted") {
        handleConvertToClient(statusTarget, selectedServices);
      }

      setShowStatusModal(false);
      setStatusTarget(null);
      setNewStatus("");
      setStatusNotes("");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToClient = (lead, services = []) => {
    navigate("/clients/add", {
      state: {
        leadId: lead._id,
        pitchedServices: services,
        prefill: {
          fullName: lead.name,
          companyName: lead.name,
          username: lead.name
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, ""),
          website: lead.website || "",
          phone: lead.formattedPhoneNumber || "",
          address: {
            street: lead.formattedAddress || "",
            city: lead.area || "",
            state: "",
            zipCode: "",
            country: "",
          },
        },
      },
    });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setImportDrag(false);
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (file) setImportFile(file);
  };

  const handleLogContact = async (lead, type) => {
    try {
      setIsLoading(true);
      await logContactMutation({
        leadId: lead._id,
        userId: currentUser?._id || currentUser?.id,
        type: type,
        note: `Contact attempt via ${type}`,
      });
      // Toast or notification would be nice here, but we'll stick to real-time update
    } catch (error) {
      console.error("Error logging contact:", error);
      alert("Failed to log contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!importFile) return;

    setIsLoading(true);
    try {
      Papa.parse(importFile, {
        complete: async (results) => {
          const headers = results.data[0];
          const rows = results.data
            .slice(1)
            .filter((row) => row.some((cell) => cell));

          const leadsToImport = rows
            .map((row) => {
              const lead = {};
              headers.forEach((header, index) => {
                const key = header.trim().toLowerCase().replace(/\s+/g, "_");
                const value = row[index];

                // Map CSV headers to database fields
                if (key === "name") lead.name = value;
                if (key === "formatted_phone_number" || key === "phone")
                  lead.formattedPhoneNumber = value;
                if (key === "website") lead.website = value;
                if (key === "formatted_address" || key === "address")
                  lead.formattedAddress = value;
                if (key === "rating") lead.rating = parseFloat(value);
                if (key === "user_ratings_total" || key === "reviews")
                  lead.userRatingsTotal = parseInt(value);
                if (key === "profession" || key === "type")
                  lead.profession = value;
                if (key === "area") lead.area = value;
                if (key === "notes") lead.notes = value;
              });
              return lead;
            })
            .filter((lead) => lead.name); // Only leads with names

          if (leadsToImport.length === 0) {
            alert("No valid leads found in CSV");
            return;
          }

          const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await importLeadsMutation({
            leads: leadsToImport,
            importBatchId: batchId,
            userId: currentUser?._id || currentUser?.id,
          });

          setImportSuccess(true);
          setTimeout(() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportSuccess(false);
          }, 1800);
        },
        error: (error) => {
          console.error("CSV parse error:", error);
          alert("Failed to parse CSV file");
        },
      });
    } catch (error) {
      console.error("Error importing leads:", error);
      alert("Failed to import leads");
    } finally {
      setIsLoading(false);
    }
  };

  const summaryStats = {
    total: stats.total || 0,
    new: stats.new || 0,
    warm:
      (stats.interested || 0) + (stats.followUp || 0) + (stats.pitched || 0),
    converted: stats.converted || 0,
  };

  const areas = ["all", ...filterOptions.areas];
  const professions = ["all", ...filterOptions.professions];
  const statuses = ["all", ...Object.keys(STATUS_CONFIG)];

  return (
    <div className=" font-sans">
      {/* ── CONSOLIDATED HEADER (Time + Stats + Actions) ── */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        {/* Timezone Section */}
        <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Global Time
            </span>
          </div>
          <div className="flex gap-4">
            {[
              { label: "IND", tz: "Asia/Kolkata" },
              { label: "DUBAI", tz: "Asia/Dubai" },
              { label: "USA", tz: "America/New_York" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 leading-none">
                  {item.label}
                </span>
                <span className="text-xs font-black text-slate-700 mt-0.5">
                  {new Date().toLocaleTimeString("en-US", {
                    timeZone: item.tz,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex-1 flex flex-wrap items-center gap-4">
          {[
            {
              label: "Total",
              value: summaryStats.total,
              color: "text-slate-700",
              bg: "bg-slate-50",
              icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
            },
            {
              label: "New",
              value: summaryStats.new,
              color: "text-blue-600",
              bg: "bg-blue-50/50",
              icon: "M12 4v16m8-8H4",
            },
            {
              label: "Warm",
              value: summaryStats.warm,
              color: "text-amber-600",
              bg: "bg-amber-50/50",
              icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
            },
            {
              label: "Converted",
              value: summaryStats.converted,
              color: "text-emerald-600",
              bg: "bg-emerald-50/50",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.bg} border border-slate-100`}
              >
                <svg
                  className={`w-3.5 h-3.5 ${s.color}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={s.icon}
                  />
                </svg>
              </div>
              <div>
                <div className={`text-sm font-black ${s.color} leading-none`}>
                  {s.value}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          {isAdminOrSuper && (
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                All Leads
              </button>
              <button
                onClick={() => setViewMode("freelancer")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "freelancer" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Freelancer View
              </button>
            </div>
          )}
          {isAdminOrSuper && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all shadow-sm shadow-blue-200"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              Import
            </button>
          )}
        </div>
      </div>

      {/* ── FILTERS + SEARCH ── */}
      {viewMode === "all" ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, area, phone..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
            />
          </div>

          <div className="w-px h-6 bg-slate-200" />

          {/* Area Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Area
            </span>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-slate-700"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a === "all" ? "All Areas" : a}
                </option>
              ))}
            </select>
          </div>

          {/* Profession Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Type
            </span>
            <select
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
              className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-slate-700"
            >
              {professions.map((p) => (
                <option key={p} value={p}>
                  {p === "all" ? "All Types" : p}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Status
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-slate-700"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Status" : STATUS_CONFIG[s]?.label || s}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-6 bg-slate-200 ml-1" />

          {/* Missing Website Toggle */}
          <div
            className="flex items-center gap-3 bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors rounded-xl px-4 py-2 cursor-pointer group"
            onClick={() => setFilterNoWebsite(!filterNoWebsite)}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Filter
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1">
                Missing Website
              </span>
            </div>
            <div
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${filterNoWebsite ? "bg-blue-600" : "bg-slate-200"}`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${filterNoWebsite ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </div>

          {(filterArea !== "all" ||
            filterProfession !== "all" ||
            filterStatus !== "all" ||
            filterNoWebsite ||
            searchQuery) && (
            <button
              onClick={() => {
                setFilterArea("all");
                setFilterProfession("all");
                setFilterStatus("all");
                setFilterNoWebsite(false);
                setSearchQuery("");
              }}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto text-sm text-slate-400 font-medium">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Filter status
            </span>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              {Object.keys(STATUS_CONFIG)
                .filter((s) => s !== "all")
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => setFreelancerFilterStatus(s)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${freelancerFilterStatus === s ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
            </div>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            {groupedLeads.length} freelancer
            {groupedLeads.length !== 1 ? "s" : ""} with active leads
          </div>
        </div>
      )}

      {/* ── BULK ACTION BAR ── */}
      {isAdminOrSuper && selected.size > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 mb-4 flex items-center gap-4 shadow-lg shadow-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">
              {selected.size}
            </div>
            <span className="text-sm font-semibold">
              {selected.size} lead{selected.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="w-px h-5 bg-white/30" />
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-white text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-blue-50 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Assign to Salesperson
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-white/70 hover:text-white text-sm transition"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {viewMode === "all" ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm table-fixed min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {isAdminOrSuper && (
                    <th className="pl-5 pr-3 py-3 w-14">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) =>
                          el &&
                          (el.indeterminate = someSelected && !allSelected)
                        }
                        onChange={toggleAll}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </th>
                  )}
                  <th
                    className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[20%] ${!isAdminOrSuper ? "pl-8" : ""}`}
                  >
                    Business
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[18%]">
                    Contact
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[14%]">
                    Area
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[8%]">
                    Type
                  </th>
                  {isAdminOrSuper && (
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[14%]">
                      Status
                    </th>
                  )}
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[20%]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <div className="text-slate-500 font-medium">
                          No leads found
                        </div>
                        <div className="text-slate-400 text-xs">
                          Try adjusting your filters
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <tr
                      key={lead._id}
                      className={`transition-colors hover:bg-blue-50/30 ${selected.has(lead._id) ? "bg-blue-50/50" : ""}`}
                    >
                      {isAdminOrSuper && (
                        <td className="pl-5 pr-3 py-3.5">
                          <input
                            type="checkbox"
                            checked={selected.has(lead._id)}
                            onChange={() => toggleSelect(lead._id)}
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                        </td>
                      )}
                      <td
                        className={`px-3 py-3.5 ${!isAdminOrSuper ? "pl-8" : ""}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                            {lead.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <div
                              className="font-semibold text-slate-800 leading-tight truncate"
                              title={lead.name}
                            >
                              {lead.name}
                            </div>
                            {lead.website && (
                              <div
                                className="text-xs text-blue-500 mt-0.5 truncate"
                                title={lead.website}
                              >
                                {lead.website}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <div
                            className="text-slate-700 font-semibold text-xs truncate"
                            title={lead.formattedPhoneNumber}
                          >
                            {lead.formattedPhoneNumber || "-"}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${lead.contactCount > 0 ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                              >
                                {lead.contactCount || 0}
                              </span>
                              <div className="flex items-center gap-1 bg-slate-50/80 px-1.5 py-0.5 rounded-md border border-slate-100/50">
                                {(() => {
                                  const history = lead.contactHistory || [];
                                  const currentSlot = getCurrentTimeSlot();
                                  const slots = {
                                    morning: {
                                      id: "morning",
                                      icon: <SunIcon />,
                                      active: false,
                                      label: "Morning (6am-12pm)",
                                      color: "text-amber-500",
                                    },
                                    afternoon: {
                                      id: "afternoon",
                                      icon: <AfternoonIcon />,
                                      active: false,
                                      label: "Afternoon (12pm-6pm)",
                                      color: "text-orange-500",
                                    },
                                    night: {
                                      id: "night",
                                      icon: <MoonIcon />,
                                      active: false,
                                      label: "Night (6pm-6am)",
                                      color: "text-indigo-500",
                                    },
                                  };

                                  history.forEach((h) => {
                                    // Use Dubai time for history slots too
                                    const hDate = new Date(
                                      h.timestamp,
                                    ).toLocaleString("en-US", {
                                      timeZone: "Asia/Dubai",
                                    });
                                    const hour = new Date(hDate).getHours();
                                    if (hour >= 6 && hour < 12)
                                      slots.morning.active = true;
                                    else if (hour >= 12 && hour < 18)
                                      slots.afternoon.active = true;
                                    else slots.night.active = true;
                                  });

                                  return Object.values(slots).map((slot) => (
                                    <div
                                      key={slot.id}
                                      className={`relative transition-all ${slot.active ? slot.color : "text-slate-200"} ${!slot.active && currentSlot === slot.id ? "animate-pulse" : ""}`}
                                      title={slot.label}
                                    >
                                      {slot.icon}
                                      {!slot.active &&
                                        currentSlot === slot.id && (
                                          <span
                                            className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-400 rounded-full border border-white"
                                            title="Try now!"
                                          ></span>
                                        )}
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>

                            {lead.lastContactedAt && (
                              <span className="text-[8px] text-slate-400 font-bold whitespace-nowrap">
                                {getRelativeTime(lead.lastContactedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <svg
                            className="w-3.5 h-3.5 text-slate-400 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span
                            className="text-slate-600 text-sm truncate"
                            title={lead.area}
                          >
                            {lead.area || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="overflow-hidden">
                          <span
                            className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-medium truncate inline-block max-w-full"
                            title={lead.profession}
                          >
                            {lead.profession || "-"}
                          </span>
                        </div>
                      </td>
                      {isAdminOrSuper && (
                        <td className="px-3 py-3.5">
                          <StatusBadge
                            status={
                              lead.status === "not-interested" ||
                              lead.status === "lost"
                                ? "not-interested-lost"
                                : lead.status
                            }
                          />
                        </td>
                      )}

                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          {isSales ? (
                            <>
                              <select
                                value={
                                  lead.status === "not-interested" ||
                                  lead.status === "lost"
                                    ? "not-interested-lost"
                                    : lead.status
                                }
                                onChange={(e) =>
                                  openStatusModal(lead, e.target.value)
                                }
                                className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {Object.keys(STATUS_CONFIG).map((s) => (
                                  <option key={s} value={s}>
                                    {STATUS_CONFIG[s].label}
                                  </option>
                                ))}
                              </select>

                              {lead.status !== "converted" && (
                                <button
                                  onClick={() =>
                                    openStatusModal(lead, "converted")
                                  }
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition border border-emerald-100"
                                  title="Convert to Client"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19 7.5L12 11.25L5 7.5M12 21V11.25M12 21L19 17.25V7.5M12 21L5 17.25V7.5M12 11.25L19 7.5M12 11.25L5 7.5"
                                    />
                                  </svg>
                                </button>
                              )}

                              <div className="relative">
                                <button
                                  disabled={isLoading}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveContactDropdown(
                                      activeContactDropdown === lead._id
                                        ? null
                                        : lead._id,
                                    );
                                  }}
                                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition border font-bold text-[10px] ${activeContactDropdown === lead._id ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"}`}
                                  title="Log Contact Attempt"
                                >
                                  {isLoading ? (
                                    <svg
                                      className="animate-spin h-3.5 w-3.5 text-blue-600"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  ) : (
                                    <>
                                      +1
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                        />
                                      </svg>
                                    </>
                                  )}
                                </button>

                                {/* Click-to-Open Dropdown */}
                                {activeContactDropdown === lead._id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() =>
                                        setActiveContactDropdown(null)
                                      }
                                    />
                                    <div className="absolute right-0 top-full mt-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-36 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                      <button
                                        onClick={() => {
                                          handleLogContact(lead, "called");
                                          setActiveContactDropdown(null);
                                        }}
                                        className="px-3 py-2.5 hover:bg-blue-50 text-slate-700 text-left text-xs font-semibold flex items-center gap-2 transition-colors"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>{" "}
                                        Call
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleLogContact(lead, "whatsapp");
                                          setActiveContactDropdown(null);
                                        }}
                                        className="px-3 py-2.5 hover:bg-emerald-50 text-slate-700 text-left text-xs font-semibold flex items-center gap-2 border-t border-slate-50 transition-colors"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>{" "}
                                        WhatsApp
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleLogContact(lead, "emailed");
                                          setActiveContactDropdown(null);
                                        }}
                                        className="px-3 py-2.5 hover:bg-amber-50 text-slate-700 text-left text-xs font-semibold flex items-center gap-2 border-t border-slate-50 transition-colors"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>{" "}
                                        Email
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelected(new Set([lead._id]));
                                setShowAssignModal(true);
                              }}
                              className="text-xs text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition border border-blue-200"
                            >
                              Assign
                            </button>
                          )}

                          {/* Schedule Meet button – visible for both admin and sales */}
                          <button
                            onClick={() => {
                              const userEmail = currentUser?.email || "";
                              setMeetLead(lead);
                              setMeetTitle(`Lead Discussion – ${lead.name}`);
                              setMeetAttendees(userEmail ? [userEmail] : []);
                              setMeetAttendeeInput("");
                              setMeetLink(null);
                              setMeetError("");
                              // default to tomorrow at 10:00
                              const tomorrow = new Date(Date.now() + 86400000);
                              setMeetDate(tomorrow.toISOString().split("T")[0]);
                              setMeetTime("10:00");
                              setMeetDuration(30);
                              setShowMeetModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition border border-emerald-100"
                            title="Schedule Google Meet"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M4 8a2 2 0 012-2h9a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedLeads.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No leads found
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                No freelancers have leads with status "
                {STATUS_CONFIG[freelancerFilterStatus]?.label}"
              </p>
            </div>
          ) : (
            groupedLeads.map((group) => (
              <div
                key={group.freelancerId}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-[500px]"
              >
                {/* Freelancer Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm ring-4 ring-blue-50">
                    {group.freelancerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-800 text-sm truncate leading-tight">
                      {group.freelancerName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {group.leads.length} Active Leads
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-xs border ${STATUS_CONFIG[freelancerFilterStatus]?.bg} ${STATUS_CONFIG[freelancerFilterStatus]?.text} border-current/10`}
                  >
                    {STATUS_CONFIG[freelancerFilterStatus]?.label}
                  </div>
                </div>

                {/* Leads List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 bg-slate-50/30">
                  {group.leads.map((lead) => (
                    <div
                      key={lead._id}
                      className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:border-blue-200 transition-colors group/lead"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className="font-bold text-slate-800 text-xs truncate pr-2 flex-1"
                          title={lead.name}
                        >
                          {lead.name}
                        </div>
                        <div className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase shrink-0">
                          {lead.profession || "Lead"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="w-3 h-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-[10px] font-bold text-slate-500">
                          {lead.formattedPhoneNumber || "No Phone"}
                        </span>
                      </div>

                      {/* Activity Timeline */}
                      <div className="pt-2 border-t border-slate-50 space-y-2">
                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">
                          Recent Activity
                        </div>
                        <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                          {lead.activities && lead.activities.length > 0 ? (
                            lead.activities.map((act, idx) => (
                              <div
                                key={act._id || idx}
                                className="flex gap-2 items-start group/act"
                              >
                                <div
                                  className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                                    act.type === "called"
                                      ? "bg-blue-50 text-blue-600"
                                      : act.type === "whatsapp"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : act.type === "emailed"
                                          ? "bg-indigo-50 text-indigo-600"
                                          : act.type === "status-change"
                                            ? "bg-amber-50 text-amber-600"
                                            : "bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  {act.type === "called" && (
                                    <svg
                                      className="w-2.5 h-2.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  )}
                                  {(act.type === "whatsapp" ||
                                    act.type === "whatsapp-sent") && (
                                    <svg
                                      className="w-2.5 h-2.5"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                  )}
                                  {act.type === "emailed" && (
                                    <svg
                                      className="w-2.5 h-2.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                  )}
                                  {act.type === "status-change" && (
                                    <svg
                                      className="w-2.5 h-2.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                  )}
                                  {act.type === "note-added" && (
                                    <svg
                                      className="w-2.5 h-2.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-bold text-slate-700 truncate">
                                      {act.userName.split(" ")[0]}
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-medium shrink-0">
                                      {getRelativeTime(act.createdAt)}
                                    </span>
                                  </div>
                                  <p
                                    className="text-[9px] text-slate-500 leading-tight mt-0.5 line-clamp-2 italic pr-1"
                                    title={act.description}
                                  >
                                    {act.description || "No notes"}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-2 text-center text-[9px] text-slate-300 font-bold uppercase tracking-tighter">
                              No Activity Found
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="w-full mt-2 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border border-transparent hover:border-slate-200"
                        >
                          Full Lead Profile
                          <svg
                            className="w-2.5 h-2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Table footer */}
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-slate-400">
          Showing {filtered.length} of {leads.length} leads
          {isAdminOrSuper && selected.size > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg font-bold">
              {selected.size} selected
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg transition font-medium">
            ← Prev
          </button>
          <span className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold">
            1
          </span>
        </div>
      </div>

      {/* ── ASSIGN MODAL ── */}
      {showAssignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(15,23,42,0.4)",
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Assign Leads
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Assigning{" "}
                    <span className="font-semibold text-blue-600">
                      {selected.size} lead{selected.size !== 1 ? "s" : ""}
                    </span>{" "}
                    to a salesperson
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignTarget(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {freelancers.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No eligible salespeople found
                </div>
              ) : (
                freelancers.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAssignTarget(f.id)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all text-left ${assignTarget === f.id ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${assignTarget === f.id ? "bg-blue-600" : "bg-slate-600"}`}
                    >
                      {f.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">
                        {f.name}
                      </div>
                      <div className="text-xs text-slate-500">{f.role}</div>
                    </div>
                    {assignTarget === f.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignTarget || isLoading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
              >
                {isLoading ? "Assigning..." : "Assign Leads"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS UPDATE MODAL ── */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Update Lead Status
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Changing{" "}
                  <span className="font-semibold text-slate-700">
                    {statusTarget?.name}
                  </span>{" "}
                  to
                  <span
                    className={`ml-1 font-bold ${STATUS_CONFIG[newStatus]?.text}`}
                  >
                    {STATUS_CONFIG[newStatus]?.label}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusTarget(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Notes Field - Required for all updates */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Update Notes / Progress
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add more context about this update..."
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-24 resize-none"
                />
                {isSales && !statusNotes.trim() && (
                  <p className="text-[10px] text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Adding notes is recommended for status tracking
                  </p>
                )}
              </div>

              {/* Service Selection - Only for Pitched/Converted */}
              {(newStatus === "pitched" || newStatus === "converted") && (
                <div className="animate-in fade-in duration-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                      Pitched Services
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {selectedServices.length} Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {SERVICE_TYPES.map((service) => (
                      <div key={service.id} className="space-y-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                          {service.label}
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {SERVICE_PACKAGES[service.id].tiers.map((tier) => {
                            const isSelected = selectedServices.some(
                              (s) =>
                                s.serviceId === service.id &&
                                s.packageId === tier.id,
                            );
                            return (
                              <button
                                key={tier.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedServices((prev) =>
                                      prev.filter(
                                        (s) =>
                                          !(
                                            s.serviceId === service.id &&
                                            s.packageId === tier.id
                                          ),
                                      ),
                                    );
                                  } else {
                                    setSelectedServices((prev) => [
                                      ...prev,
                                      {
                                        serviceId: service.id,
                                        packageId: tier.id,
                                        packageName: `${service.label} - ${tier.name}`,
                                        region: "india", // Default for now
                                        price: tier.pricing["india"].mrp,
                                      },
                                    ]);
                                  }
                                }}
                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="text-[11px] font-bold">
                                    {tier.name}
                                  </span>
                                  <span
                                    className={`text-[9px] font-medium ${isSelected ? "text-blue-100" : "text-slate-400"}`}
                                  >
                                    Standard Package
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-black ${isSelected ? "text-white" : "text-slate-900"}`}
                                  >
                                    ₹
                                    {tier.pricing["india"].mrp.toLocaleString()}
                                  </span>
                                  <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                      isSelected
                                        ? "bg-white border-white text-blue-600"
                                        : "border-slate-200"
                                    }`}
                                  >
                                    {isSelected && (
                                      <CheckCheck size={10} strokeWidth={4} />
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mt-2">
                    <p className="text-[10px] text-blue-600 font-bold mb-3 uppercase tracking-tight text-center">
                      Need more details?
                    </p>
                    <button
                      onClick={() => navigate("/services")}
                      className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm"
                    >
                      <Layers size={14} />
                      View Full Price List
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-2 flex gap-3 bg-slate-50/50">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isLoading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${isLoading ? "bg-slate-200 text-slate-400" : newStatus === "converted" ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"}`}
              >
                {isLoading
                  ? "Updating..."
                  : newStatus === "converted"
                    ? "Convert Now"
                    : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMPORT MODAL ── */}
      {showImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: "blur(4px)",
            background: "rgba(15,23,42,0.4)",
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Import Leads from CSV
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Upload a CSV file with your lead data
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5">
              {importSuccess ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    Import Successful!
                  </div>
                  <div className="text-sm text-slate-500">
                    Your leads have been imported to the database.
                  </div>
                </div>
              ) : (
                <>
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setImportDrag(true);
                    }}
                    onDragLeave={() => setImportDrag(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${importDrag ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileDrop}
                    />
                    {importFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="font-semibold text-slate-700">
                          {importFile.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {(importFile.size / 1024).toFixed(1)} KB · CSV file
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImportFile(null);
                          }}
                          className="text-xs text-red-500 hover:underline mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">
                            Drop your CSV here
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            or click to browse files
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expected columns */}
                  <div className="mt-4 bg-slate-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Expected CSV columns
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "name",
                        "phone",
                        "website",
                        "address",
                        "rating",
                        "reviews",
                        "profession",
                        "area",
                      ].map((col) => (
                        <span
                          key={col}
                          className="bg-white border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-lg font-mono"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!importSuccess && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportConfirm}
                  disabled={!importFile || isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
                >
                  {isLoading ? "Importing..." : "Import Leads"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMeetModal &&
        meetLead &&
        (() => {
          const statusCfg = STATUS_CONFIG[meetLead.status] || STATUS_CONFIG.new;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M4 8a2 2 0 012-2h9a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        Schedule Google Meet
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                        {meetLead.name}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                          />
                          {statusCfg.label}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowMeetModal(false);
                      setMeetLink(null);
                      setMeetError("");
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500"
                  >
                    ✕
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  {meetLink ? (
                    <div className="flex flex-col items-center py-6 gap-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-slate-800">
                          Meet Created!
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Invites have been sent to all attendees.
                        </p>
                      </div>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-emerald-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-blue-600 truncate flex-1">
                          {meetLink}
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(meetLink)
                          }
                          className="shrink-0 text-xs font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1 transition"
                        >
                          Copy
                        </button>
                      </div>
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                        Open Meet
                      </a>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                          Meeting Title
                        </label>
                        <input
                          value={meetTitle}
                          onChange={(e) => setMeetTitle(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          placeholder="e.g. Lead Discussion – Acme Corp"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                            Date
                          </label>
                          <input
                            type="date"
                            value={meetDate}
                            onChange={(e) => setMeetDate(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                            Time
                          </label>
                          <input
                            type="time"
                            value={meetTime}
                            onChange={(e) => setMeetTime(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Duration
                        </label>
                        <div className="flex gap-2">
                          {[15, 30, 45, 60, 90].map((d) => (
                            <button
                              key={d}
                              onClick={() => setMeetDuration(d)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${meetDuration === d ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600"}`}
                            >
                              {d}m
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                          Attendee Emails
                        </label>
                        <div className="flex gap-2">
                          <input
                            value={meetAttendeeInput}
                            onChange={(e) => {
                              setMeetAttendeeInput(e.target.value);
                              setMeetError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                handleAddMeetAttendee();
                              }
                            }}
                            placeholder="someone@example.com"
                            className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          />
                          <button
                            onClick={handleAddMeetAttendee}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                          >
                            Add
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Press Enter or comma to add multiple
                        </p>
                        {meetAttendees.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {meetAttendees.map((email) => (
                              <span
                                key={email}
                                className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                              >
                                {email}
                                <button
                                  onClick={() =>
                                    handleRemoveMeetAttendee(email)
                                  }
                                  className="text-emerald-400 hover:text-red-500 transition font-black leading-none"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {meetError && (
                        <div className="flex items-center gap-2 text-red-600 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                          <svg
                            className="w-3.5 h-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          {meetError}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!meetLink && (
                  <div className="px-6 pb-6 pt-2 flex gap-3">
                    <button
                      onClick={() => {
                        setShowMeetModal(false);
                        setMeetError("");
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateMeet}
                      disabled={isMeetLoading}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition shadow-sm shadow-emerald-200 flex items-center justify-center gap-2"
                    >
                      {isMeetLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M4 8a2 2 0 012-2h9a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                            />
                          </svg>
                          Generate Meet Link
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
