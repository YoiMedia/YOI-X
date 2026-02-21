import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { getUser } from '../../services/auth.service'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    new: { label: 'New', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    contacted: { label: 'Contacted', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
    interested: { label: 'Interested', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    pitched: { label: 'Pitched', bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400' },
    'follow-up': { label: 'Follow Up', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
    converted: { label: 'Converted', bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500' },
    'not-interested': { label: 'Not Interested', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
    lost: { label: 'Lost', bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' },
}

const ACTIVITY_CONFIG = {
    called: {
        label: 'Called', bg: 'bg-blue-100', text: 'text-blue-700', icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        )
    },
    whatsapp: {
        label: 'WhatsApp', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        )
    },
    emailed: {
        label: 'Emailed', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        )
    },
    'status-change': {
        label: 'Status Changed', bg: 'bg-amber-100', text: 'text-amber-700', icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        )
    },
    'note-added': {
        label: 'Note Added', bg: 'bg-slate-100', text: 'text-slate-600', icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        )
    },
    assigned: {
        label: 'Assigned', bg: 'bg-purple-100', text: 'text-purple-700', icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        )
    },
    converted: {
        label: 'Converted', bg: 'bg-violet-100', text: 'text-violet-700', icon: (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
}

const formatDate = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    })
}

const formatDateShort = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    })
}

const getRelativeTime = (ts) => {
    if (!ts) return ''
    const diff = Date.now() - ts
    const s = Math.floor(diff / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    if (m > 0) return `${m}m ago`
    return 'just now'
}

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

const RoleBadge = ({ role }) => {
    const map = {
        sales: { label: 'Sales', bg: 'bg-blue-50', text: 'text-blue-600' },
        employee: { label: 'Employee', bg: 'bg-indigo-50', text: 'text-indigo-600' },
        admin: { label: 'Admin', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        superadmin: { label: 'Super Admin', bg: 'bg-purple-50', text: 'text-purple-600' },
    }
    const cfg = map[role] || { label: role, bg: 'bg-slate-50', text: 'text-slate-600' }
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LeadProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const currentUser = getUser()

    const [noteText, setNoteText] = useState('')
    const [isAddingNote, setIsAddingNote] = useState(false)

    const profile = useQuery(api.leads.getLeadFullProfile, { leadId: id })
    const addNoteMutation = useMutation(api.leads.addLeadNote)

    const handleAddNote = async () => {
        if (!noteText.trim()) return
        setIsAddingNote(true)
        try {
            await addNoteMutation({
                leadId: id,
                salesPersonId: currentUser?._id || currentUser?.id,
                description: noteText.trim(),
            })
            setNoteText('')
        } catch (e) {
            console.error('Failed to add note:', e)
            alert('Failed to add note')
        } finally {
            setIsAddingNote(false)
        }
    }

    // ── Loading / Not Found ───────────────────────────────────────────────────
    if (profile === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium">Loading lead profile…</p>
                </div>
            </div>
        )
    }

    if (profile === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-700">Lead not found</h2>
                    <p className="text-slate-400 text-sm mt-1">This lead may have been deleted.</p>
                    <button onClick={() => navigate('/leads')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                        Back to Leads
                    </button>
                </div>
            </div>
        )
    }

    const currentStatus = STATUS_CONFIG[profile.status] || STATUS_CONFIG.new
    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">

            <div className=" mx-auto pt-8 space-y-6">

                {/* ── HERO CARD ── */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Banner stripe */}
                    <div className={`h-2 w-full ${currentStatus.dot.replace('bg-', 'bg-')}`}
                        style={{ background: `linear-gradient(90deg, #3b82f6, #6366f1)` }} />
                    <div className="p-6">
                        <div className="flex items-start gap-5 flex-wrap">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                                {initials}
                            </div>

                            {/* Name + Status */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-black text-slate-900 leading-tight">{profile.name}</h1>
                                    <StatusBadge status={profile.status} />
                                    {profile.status === 'converted' && (
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-600 text-xs font-bold rounded-full border border-violet-200">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Client
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                    {profile.formattedPhoneNumber && (
                                        <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {profile.formattedPhoneNumber}
                                        </span>
                                    )}
                                    {profile.area && (
                                        <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {profile.area}
                                        </span>
                                    )}
                                    {profile.profession && (
                                        <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                                            </svg>
                                            {profile.profession}
                                        </span>
                                    )}
                                    {profile.website && (
                                        <a
                                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-blue-500 font-medium hover:underline"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                            </svg>
                                            {profile.website}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="flex gap-4 shrink-0">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-blue-600">{profile.contactCount || 0}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Contacts</div>
                                </div>
                                <div className="w-px h-10 bg-slate-100 self-center" />
                                <div className="text-center">
                                    <div className="text-2xl font-black text-purple-600">{profile.assignments?.length || 0}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Assigned To</div>
                                </div>
                                <div className="w-px h-10 bg-slate-100 self-center" />
                                <div className="text-center">
                                    <div className="text-2xl font-black text-slate-700">{profile.activities?.length || 0}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Activities</div>
                                </div>
                            </div>
                        </div>

                        {/* Meta info row */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500">
                            <span>
                                <span className="font-bold text-slate-700">Imported by:</span> {profile.importedByName}
                            </span>
                            <span>
                                <span className="font-bold text-slate-700">Created:</span> {formatDateShort(profile.createdAt)}
                            </span>
                            {profile.lastContactedAt && (
                                <span>
                                    <span className="font-bold text-slate-700">Last Contacted:</span> {formatDate(profile.lastContactedAt)}
                                </span>
                            )}
                            {profile.formattedAddress && (
                                <span>
                                    <span className="font-bold text-slate-700">Address:</span> {profile.formattedAddress}
                                </span>
                            )}
                            {profile.rating && (
                                <span>
                                    <span className="font-bold text-slate-700">Rating:</span> ⭐ {profile.rating} ({profile.userRatingsTotal || 0} reviews)
                                </span>
                            )}
                        </div>

                        {/* Notes */}
                        {profile.notes && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">Notes</span>
                                <p className="text-sm text-slate-700 leading-relaxed">{profile.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT: assignment history ── */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-800">Assigned To</h2>
                                    <p className="text-[10px] text-slate-400 font-semibold">{profile.assignments?.length || 0} salesperson{profile.assignments?.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {!profile.assignments || profile.assignments.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs text-slate-400 font-semibold">Not assigned yet</p>
                                    </div>
                                ) : profile.assignments.map((a) => (
                                    <div key={a._id} className="p-4 hover:bg-slate-50/60 transition-colors">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                                                {a.salespersonName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-slate-800 text-sm">{a.salespersonName}</span>
                                                    <RoleBadge role={a.salespersonRole} />
                                                </div>
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <StatusBadge status={a.status} />
                                                </div>
                                                {a.notes && (
                                                    <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 rounded-lg px-2.5 py-1.5 leading-relaxed">"{a.notes}"</p>
                                                )}
                                                <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                                                    <div><span className="font-semibold">Assigned by:</span> {a.assignedByName}</div>
                                                    <div><span className="font-semibold">Assigned:</span> {formatDateShort(a.assignedAt)}</div>
                                                    {a.lastContactedAt && (
                                                        <div><span className="font-semibold">Last contact:</span> {getRelativeTime(a.lastContactedAt)}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pitched services */}
                        {profile.pitchedServices && profile.pitchedServices.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-sm font-black text-slate-800">Pitched Services</h2>
                                </div>
                                <div className="p-4 space-y-2">
                                    {profile.pitchedServices.map((svc, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                                            <div>
                                                <div className="text-xs font-bold text-slate-800">{svc.packageName}</div>
                                                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{svc.region}</div>
                                            </div>
                                            <div className="text-sm font-black text-indigo-600">
                                                AED {svc.price.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between px-3 pt-2 border-t border-indigo-100">
                                        <span className="text-xs font-bold text-slate-600">Total</span>
                                        <span className="text-base font-black text-indigo-700">
                                            AED {profile.pitchedServices.reduce((s, x) => s + x.price, 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: activity timeline ── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-slate-800">Full Activity Timeline</h2>
                                        <p className="text-[10px] text-slate-400 font-semibold">{profile.activities?.length || 0} events</p>
                                    </div>
                                </div>
                            </div>

                            {/* Add note */}
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex gap-3 items-start">
                                    <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 mt-0.5">
                                        {(currentUser?.fullName || currentUser?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            value={noteText}
                                            onChange={e => setNoteText(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddNote()}
                                            placeholder="Add a note about this lead…"
                                            className="flex-1 text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition placeholder-slate-300"
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={isAddingNote || !noteText.trim()}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition shrink-0"
                                        >
                                            {isAddingNote ? '…' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="p-5 space-y-0 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {!profile.activities || profile.activities.length === 0 ? (
                                    <div className="py-14 text-center">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400 font-semibold text-sm">No activity yet</p>
                                        <p className="text-slate-300 text-xs mt-1">Actions taken on this lead will appear here</p>
                                    </div>
                                ) : profile.activities.map((act, idx) => {
                                    const cfg = ACTIVITY_CONFIG[act.type] || ACTIVITY_CONFIG['note-added']
                                    const isLast = idx === profile.activities.length - 1
                                    return (
                                        <div key={act._id || idx} className="flex gap-4 group">
                                            {/* Line + icon column */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.text} shadow-sm`}>
                                                    {cfg.icon}
                                                </div>
                                                {!isLast && (
                                                    <div className="w-px flex-1 bg-slate-100 my-1" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className={`flex-1 min-w-0 ${!isLast ? 'pb-5' : 'pb-2'}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>
                                                            {cfg.label}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded-md bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">
                                                                {(act.userName || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700">{act.userName}</span>
                                                            {act.userRole && (
                                                                <RoleBadge role={act.userRole} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-semibold shrink-0 mt-0.5" title={formatDate(act.createdAt)}>
                                                        {getRelativeTime(act.createdAt)}
                                                    </div>
                                                </div>

                                                {act.description && (
                                                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                                                        {act.description}
                                                    </p>
                                                )}

                                                {/* Status change pill */}
                                                {act.type === 'status-change' && act.previousStatus && act.newStatus && (
                                                    <div className="mt-1.5 flex items-center gap-2">
                                                        <StatusBadge status={act.previousStatus} />
                                                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                        </svg>
                                                        <StatusBadge status={act.newStatus} />
                                                    </div>
                                                )}

                                                <div className="mt-1 text-[10px] text-slate-400">
                                                    {formatDate(act.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
