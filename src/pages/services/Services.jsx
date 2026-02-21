import React, { useState } from 'react';
import {
    REGIONS,
    SERVICE_TYPES,
    SERVICE_PACKAGES,
    formatPriceRange,
    formatPrice
} from '../../constants/servicePackages';
import {
    Globe,
    Target,
    Layers,
    Share2,
    MessageSquare,
    Check,
    Zap,
    Crown,
    Rocket,
    Currency,
    Layout
} from 'lucide-react';

const ICON_MAP = {
    Globe: Globe,
    Target: Target,
    Layers: Layers,
    Share2: Share2,
    MessageSquare: MessageSquare,
};

export default function Services() {
    const [region, setRegion] = useState('india');
    const selectedRegion = REGIONS.find(r => r.id === region);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 pt-8 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <Layout size={18} />
                                </div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Service Catalogue</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                Solutions & <span className="text-blue-600">Pricing</span>
                            </h1>
                            <p className="text-slate-500 mt-2 max-w-xl font-medium">
                                Explore our comprehensive range of services, specialized tiers, and custom add-ons designed for global growth.
                            </p>
                        </div>

                        {/* Region Selector */}
                        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
                            {REGIONS.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setRegion(r.id)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${region === r.id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <span className="text-lg">{r.flag}</span>
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8">
                <div className="space-y-20">
                    {SERVICE_TYPES.map((service) => {
                        const Icon = ICON_MAP[service.icon];
                        const pkg = SERVICE_PACKAGES[service.id];

                        return (
                            <section key={service.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{service.label}</h2>
                                        <p className="text-slate-500 text-sm font-medium">{service.description}</p>
                                    </div>
                                </div>

                                {/* Tiers Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {pkg.tiers.map((tier, idx) => {
                                        const tierPricing = tier.pricing[region];
                                        const isPremium = idx === pkg.tiers.length - 1;

                                        return (
                                            <div
                                                key={tier.id}
                                                className={`relative bg-white rounded-[2.5rem] border transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${isPremium
                                                        ? 'border-blue-100 ring-4 ring-blue-50/50'
                                                        : 'border-slate-100 shadow-sm'
                                                    }`}
                                            >
                                                {isPremium && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-200 flex items-center gap-1.5 whitespace-nowrap">
                                                        <Crown size={12} /> Recommended for Scale
                                                    </div>
                                                )}

                                                <div className="p-8 pb-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${idx === 0 ? 'bg-slate-100 text-slate-500' :
                                                                idx === 1 ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {tier.name}
                                                        </span>
                                                        {idx === 0 ? <Rocket size={20} className="text-slate-300" /> :
                                                            idx === 1 ? <Zap size={20} className="text-amber-400" /> :
                                                                <Crown size={20} className="text-blue-500" />}
                                                    </div>

                                                    <div className="mb-6">
                                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                                                            {formatPrice(tierPricing.mrp, region)}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                            Base Monthly / {selectedRegion.currency}
                                                        </div>
                                                        <div className="mt-3 px-3 py-1.5 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-500 border border-slate-100 text-center">
                                                            Range: {formatPriceRange(tierPricing.min, tierPricing.max, region)}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 pt-6 border-t border-slate-50 flex-1">
                                                        {tier.inclusions.map((inc, i) => (
                                                            <div key={i} className="flex gap-2.5 items-start">
                                                                <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isPremium ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                    <Check size={10} strokeWidth={4} />
                                                                </div>
                                                                <span className="text-[12px] text-slate-600 font-medium leading-tight">
                                                                    {inc}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="px-8 pb-8">
                                                    <button className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isPremium
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                                                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100'
                                                        }`}>
                                                        Select Plan
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add-ons if any */}
                                {pkg.addOns && pkg.addOns.length > 0 && (
                                    <div className="mt-12 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                                        <div className="flex items-center gap-2 mb-8">
                                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                                <Zap size={18} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Available Add-ons</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {pkg.addOns.map((addon) => (
                                                <div key={addon.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{addon.name}</h4>
                                                        <div className="text-xs font-black text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-50 shadow-sm whitespace-nowrap">
                                                            + {formatPrice(addon.pricing[region].min, region)}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5 flex flex-wrap gap-x-3">
                                                        {addon.inclusions.slice(0, 3).map((inc, i) => (
                                                            <div key={i} className="flex items-center gap-1.5">
                                                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{inc}</span>
                                                            </div>
                                                        ))}
                                                        {addon.inclusions.length > 3 && (
                                                            <span className="text-[10px] text-slate-400 font-bold tracking-widest">+ {addon.inclusions.length - 3} MORE</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
