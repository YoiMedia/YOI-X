import React, { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import Papa from 'papaparse' // CSV parser
import { getUser } from '../../services/auth.service'
import { useNavigate } from 'react-router-dom'

// Hardcoded FREELANCERS removed - using Convex users instead

const STATUS_CONFIG = {
    new: { label: "New", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    contacted: { label: "Contacted", bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
    interested: { label: "Interested", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
    "not-interested": { label: "Not Interested", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
    "follow-up": { label: "Follow Up", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
    converted: { label: "Converted", bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-500" },
    lost: { label: "Lost", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
}

const StarRating = ({ rating }) => {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className={`w-3 h-3 ${i <= full ? 'text-amber-400' : i === full + 1 && half ? 'text-amber-300' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="ml-1 text-xs text-slate-500 font-medium">{rating}</span>
        </div>
    )
}

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

export default function Leads() {
    const navigate = useNavigate()
    const currentUser = getUser()
    const isSales = currentUser?.role === "sales"
    const isAdminOrSuper = currentUser?.role === "admin" || currentUser?.role === "superadmin"

    // Convex queries and mutations
    const allLeads = useQuery(api.leads.getAllLeads, {
        status: undefined,
        area: undefined,
        profession: undefined,
        searchQuery: undefined,
    }) ?? []

    const assignedLeads = useQuery(api.leads.getLeadsForSalesperson, {
        salesPersonId: currentUser?._id || currentUser?.id
    }) ?? []

    const leads = isSales ? assignedLeads : allLeads

    const stats = useQuery(api.leads.getLeadStats) ?? {
        total: 0,
        new: 0,
        contacted: 0,
        interested: 0,
        notInterested: 0,
        followUp: 0,
        converted: 0,
        lost: 0,
    }

    const filterOptions = useQuery(api.leads.getLeadFilterOptions) ?? {
        areas: [],
        professions: [],
    }

    // Mutations
    const createLeadMutation = useMutation(api.leads.createLead)
    const importLeadsMutation = useMutation(api.leads.importLeadsFromCSV)
    const updateLeadMutation = useMutation(api.leads.updateLead)
    const updateAssignmentStatusMutation = useMutation(api.leads.updateLeadAssignmentStatus)
    const deleteLeadMutation = useMutation(api.leads.deleteLead)
    const assignLeadsMutation = useMutation(api.leads.assignLeadsToSalesperson)

    // Local state
    const [selected, setSelected] = useState(new Set())
    const [searchQuery, setSearchQuery] = useState("")
    const [filterArea, setFilterArea] = useState("all")
    const [filterProfession, setFilterProfession] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [assignTarget, setAssignTarget] = useState(null)
    const [importDrag, setImportDrag] = useState(false)
    const [importFile, setImportFile] = useState(null)
    const [importSuccess, setImportSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef()

    // Fetch actual freelancers/salespeople from Convex
    const allUsers = useQuery(api.users.listUsers, {}) ?? []
    const freelancers = allUsers.filter(u => u.role === "sales").map(u => ({
        id: u._id,
        name: u.fullName,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        avatar: u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }))

    // Filter leads based on search and filters
    const filtered = leads.filter(l => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = !q || l.name.toLowerCase().includes(q) || l.area?.toLowerCase().includes(q) || l.profession?.toLowerCase().includes(q) || l.formattedPhoneNumber?.includes(q)
        const matchesArea = filterArea === "all" || l.area === filterArea
        const matchesProfession = filterProfession === "all" || l.profession === filterProfession
        const matchesStatus = filterStatus === "all" || l.status === filterStatus
        return matchesSearch && matchesArea && matchesProfession && matchesStatus
    })

    const allSelected = filtered.length > 0 && filtered.every(l => selected.has(l._id))
    const someSelected = filtered.some(l => selected.has(l._id))

    const toggleSelect = (id) => {
        const next = new Set(selected)
        next.has(id) ? next.delete(id) : next.add(id)
        setSelected(next)
    }

    const toggleAll = () => {
        if (allSelected) {
            const next = new Set(selected)
            filtered.forEach(l => next.delete(l._id))
            setSelected(next)
        } else {
            const next = new Set(selected)
            filtered.forEach(l => next.add(l._id))
            setSelected(next)
        }
    }

    const handleAssign = async () => {
        if (!assignTarget) return
        setIsLoading(true)
        try {
            const selectedArray = Array.from(selected)
            await assignLeadsMutation({
                leadIds: selectedArray,
                salesPersonId: assignTarget,
                userId: currentUser?._id || currentUser?.id,
            })
            alert(`Assigned ${selected.size} lead(s) to ${freelancers.find(f => f.id === assignTarget)?.name}`)
            setSelected(new Set())
            setShowAssignModal(false)
            setAssignTarget(null)
        } catch (error) {
            console.error("Error assigning leads:", error)
            alert("Failed to assign leads")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (leadId, newStatus) => {
        try {
            if (isSales) {
                await updateAssignmentStatusMutation({
                    leadId,
                    salesPersonId: currentUser?._id || currentUser?.id,
                    status: newStatus
                })
            } else {
                await updateLeadMutation({
                    leadId,
                    status: newStatus
                })
            }
        } catch (error) {
            console.error("Error updating status:", error)
            alert("Failed to update status")
        }
    }

    const handleConvertToClient = (lead) => {
        navigate("/clients/add", {
            state: {
                leadId: lead._id,
                prefill: {
                    fullName: lead.name,
                    companyName: lead.name,
                    username: lead.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                    website: lead.website || "",
                    phone: lead.formattedPhoneNumber || "",
                    address: {
                        street: lead.formattedAddress || "",
                        city: lead.area || "",
                        state: "",
                        zipCode: "",
                        country: ""
                    }
                }
            }
        })
    }

    const handleFileDrop = (e) => {
        e.preventDefault()
        setImportDrag(false)
        const file = e.dataTransfer?.files[0] || e.target.files?.[0]
        if (file) setImportFile(file)
    }

    const handleImportConfirm = async () => {
        if (!importFile) return

        setIsLoading(true)
        try {
            Papa.parse(importFile, {
                complete: async (results) => {
                    const headers = results.data[0]
                    const rows = results.data.slice(1).filter(row => row.some(cell => cell))

                    const leadsToImport = rows.map((row) => {
                        const lead = {}
                        headers.forEach((header, index) => {
                            const key = header.trim().toLowerCase().replace(/\s+/g, '_')
                            const value = row[index]

                            // Map CSV headers to database fields
                            if (key === 'name') lead.name = value
                            if (key === 'formatted_phone_number' || key === 'phone') lead.formattedPhoneNumber = value
                            if (key === 'website') lead.website = value
                            if (key === 'formatted_address' || key === 'address') lead.formattedAddress = value
                            if (key === 'rating') lead.rating = parseFloat(value)
                            if (key === 'user_ratings_total' || key === 'reviews') lead.userRatingsTotal = parseInt(value)
                            if (key === 'profession' || key === 'type') lead.profession = value
                            if (key === 'area') lead.area = value
                            if (key === 'notes') lead.notes = value
                        })
                        return lead
                    }).filter(lead => lead.name) // Only leads with names

                    if (leadsToImport.length === 0) {
                        alert("No valid leads found in CSV")
                        return
                    }

                    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    await importLeadsMutation({
                        leads: leadsToImport,
                        importBatchId: batchId,
                        userId: currentUser?._id || currentUser?.id,
                    })

                    setImportSuccess(true)
                    setTimeout(() => {
                        setShowImportModal(false)
                        setImportFile(null)
                        setImportSuccess(false)
                    }, 1800)
                },
                error: (error) => {
                    console.error("CSV parse error:", error)
                    alert("Failed to parse CSV file")
                },
            })
        } catch (error) {
            console.error("Error importing leads:", error)
            alert("Failed to import leads")
        } finally {
            setIsLoading(false)
        }
    }

    const summaryStats = {
        total: stats.total || 0,
        new: stats.new || 0,
        interested: (stats.interested || 0) + (stats.followUp || 0),
        converted: stats.converted || 0,
    }

    const areas = ["all", ...filterOptions.areas]
    const professions = ["all", ...filterOptions.professions]
    const statuses = ["all", ...Object.keys(STATUS_CONFIG)]

    return (
        <div className=" bg-slate-50 font-sans">

            {isAdminOrSuper && (
                <button
                    onClick={() => setShowImportModal(true)}
                    className="ml-auto flex mb-2 items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Import CSV
                </button>
            )}


            <div className=" max-w-screen-2xl mx-auto">

                {/* ── STATS SUMMARY ── */}
                {isAdminOrSuper && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                        {[
                            { label: "Total Leads", value: summaryStats.total, color: "text-slate-700", bg: "bg-white", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
                            { label: "New", value: summaryStats.new, color: "text-blue-600", bg: "bg-blue-50", icon: "M12 4v16m8-8H4" },
                            { label: "Warm", value: summaryStats.interested, color: "text-amber-600", bg: "bg-amber-50", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
                            { label: "Converted", value: summaryStats.converted, color: "text-emerald-600", bg: "bg-emerald-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                        ].map(s => (
                            <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border border-slate-100 flex items-center gap-4`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                                    <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── FILTERS + SEARCH ── */}
                <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-48">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search name, area, phone..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                        />
                    </div>

                    <div className="w-px h-6 bg-slate-200" />

                    {/* Area Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Area</span>
                        <select
                            value={filterArea}
                            onChange={e => setFilterArea(e.target.value)}
                            className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-slate-700"
                        >
                            {areas.map(a => <option key={a} value={a}>{a === "all" ? "All Areas" : a}</option>)}
                        </select>
                    </div>

                    {/* Profession Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Type</span>
                        <select
                            value={filterProfession}
                            onChange={e => setFilterProfession(e.target.value)}
                            className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-slate-700"
                        >
                            {professions.map(p => <option key={p} value={p}>{p === "all" ? "All Types" : p}</option>)}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition text-slate-700"
                        >
                            {statuses.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : STATUS_CONFIG[s]?.label || s}</option>)}
                        </select>
                    </div>

                    {(filterArea !== "all" || filterProfession !== "all" || filterStatus !== "all" || searchQuery) && (
                        <button
                            onClick={() => { setFilterArea("all"); setFilterProfession("all"); setFilterStatus("all"); setSearchQuery("") }}
                            className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                            Clear filters
                        </button>
                    )}

                    <div className="ml-auto text-sm text-slate-400 font-medium">
                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* ── BULK ACTION BAR ── */}
                {isAdminOrSuper && selected.size > 0 && (
                    <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 mb-4 flex items-center gap-4 shadow-lg shadow-blue-200">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">
                                {selected.size}
                            </div>
                            <span className="text-sm font-semibold">{selected.size} lead{selected.size !== 1 ? "s" : ""} selected</span>
                        </div>
                        <div className="w-px h-5 bg-white/30" />
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="flex items-center gap-2 bg-white text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-blue-50 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

                {/* ── TABLE ── */}
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
                                                ref={el => el && (el.indeterminate = someSelected && !allSelected)}
                                                onChange={toggleAll}
                                                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                            />
                                        </th>
                                    )}
                                    <th className={`px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[25%] ${!isAdminOrSuper ? 'pl-8' : ''}`}>Business</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[15%]">Contact</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[15%]">Area</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[15%]">Type</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[12%]">Rating</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[10%]">Status</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[15%]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                                <div className="text-slate-500 font-medium">No leads found</div>
                                                <div className="text-slate-400 text-xs">Try adjusting your filters</div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(lead => (
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
                                        <td className={`px-3 py-3.5 ${!isAdminOrSuper ? 'pl-8' : ''}`}>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                                                    {lead.name.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="font-semibold text-slate-800 leading-tight truncate" title={lead.name}>{lead.name}</div>
                                                    {lead.website && (
                                                        <div className="text-xs text-blue-500 mt-0.5 truncate" title={lead.website}>{lead.website}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <div className="text-slate-700 font-medium truncate" title={lead.formattedPhoneNumber}>{lead.formattedPhoneNumber || "-"}</div>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-slate-600 text-sm truncate" title={lead.area}>{lead.area || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <div className="overflow-hidden">
                                                <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-medium truncate inline-block max-w-full" title={lead.profession}>
                                                    {lead.profession || "-"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            {lead.rating ? (
                                                <>
                                                    <StarRating rating={lead.rating} />
                                                    <div className="text-xs text-slate-400 mt-0.5">{lead.userRatingsTotal || 0} reviews</div>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 text-xs">No rating</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-3 py-3.5">
                                            {isSales ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={lead.status}
                                                        onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                                                        className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        {Object.keys(STATUS_CONFIG).map(s => (
                                                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                        ))}
                                                    </select>
                                                    {lead.status !== 'converted' && (
                                                        <button
                                                            onClick={() => handleConvertToClient(lead)}
                                                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition border border-emerald-100"
                                                            title="Convert to Client"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5L12 11.25L5 7.5M12 21V11.25M12 21L19 17.25V7.5M12 21L5 17.25V7.5M12 11.25L19 7.5M12 11.25L5 7.5" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelected(new Set([lead._id])); setShowAssignModal(true) }}
                                                    className="text-xs text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition border border-blue-200"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                            <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg transition font-medium">← Prev</button>
                            <span className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold">1</span>
                            <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg transition font-medium">Next →</button>
                        </div>
                    </div>
                </div>

                {/* ── ASSIGN MODAL ── */}
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(4px)", background: "rgba(15,23,42,0.4)" }}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Assign Leads</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">Assigning <span className="font-semibold text-blue-600">{selected.size} lead{selected.size !== 1 ? "s" : ""}</span> to a salesperson</p>
                                    </div>
                                    <button onClick={() => { setShowAssignModal(false); setAssignTarget(null) }} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500">✕</button>
                                </div>
                            </div>
                            <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {freelancers.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500 text-sm">No eligible salespeople found</div>
                                ) : freelancers.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setAssignTarget(f.id)}
                                        className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 transition-all text-left ${assignTarget === f.id ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${assignTarget === f.id ? "bg-blue-600" : "bg-slate-600"}`}>
                                            {f.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-800">{f.name}</div>
                                            <div className="text-xs text-slate-500">{f.role}</div>
                                        </div>
                                        {assignTarget === f.id && (
                                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="px-6 pb-6 pt-2 flex gap-3">
                                <button onClick={() => { setShowAssignModal(false); setAssignTarget(null) }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">Cancel</button>
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

                {/* ── IMPORT MODAL ── */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(4px)", background: "rgba(15,23,42,0.4)" }}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Import Leads from CSV</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">Upload a CSV file with your lead data</p>
                                </div>
                                <button onClick={() => { setShowImportModal(false); setImportFile(null) }} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500">✕</button>
                            </div>

                            <div className="px-6 py-5">
                                {importSuccess ? (
                                    <div className="flex flex-col items-center py-8 gap-3">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-lg font-bold text-slate-800">Import Successful!</div>
                                        <div className="text-sm text-slate-500">Your leads have been imported to the database.</div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Drop zone */}
                                        <div
                                            onDragOver={e => { e.preventDefault(); setImportDrag(true) }}
                                            onDragLeave={() => setImportDrag(false)}
                                            onDrop={handleFileDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${importDrag ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"}`}
                                        >
                                            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileDrop} />
                                            {importFile ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="font-semibold text-slate-700">{importFile.name}</div>
                                                    <div className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB · CSV file</div>
                                                    <button onClick={e => { e.stopPropagation(); setImportFile(null) }} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-700">Drop your CSV here</div>
                                                        <div className="text-sm text-slate-400 mt-1">or click to browse files</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expected columns */}
                                        <div className="mt-4 bg-slate-50 rounded-xl p-4">
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Expected CSV columns</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {["name", "phone", "website", "address", "rating", "reviews", "profession", "area"].map(col => (
                                                    <span key={col} className="bg-white border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-lg font-mono">{col}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {!importSuccess && (
                                <div className="px-6 pb-6 flex gap-3">
                                    <button onClick={() => { setShowImportModal(false); setImportFile(null) }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">Cancel</button>
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
            </div>
        </div>
    )
}
