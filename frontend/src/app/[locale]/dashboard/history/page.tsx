"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import {
    History, Search, FileText, Calendar, ArrowLeft,
    ExternalLink, Loader2, Filter, ChevronRight, X
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function HistoryPage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const t = useTranslations('History');
    const tCommon = useTranslations('Navbar');
    const locale = useLocale();

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [minScore, setMinScore] = useState(0);
    const [seniorityFilter, setSeniorityFilter] = useState('All');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [metricFilters, setMetricFilters] = useState({
        impact: 0,
        tech: 0,
        soft: 0,
        growth: 0,
        stability: 0,
        readability: 0
    });

    useEffect(() => {
        if (!token) {
            router.push(`/${locale}/login`);
            return;
        }
        fetchHistory();
    }, [token]);

    const fetchHistory = async () => {
        try {
            const resp = await fetch("http://localhost:8000/history", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setHistory(data || []);
            } else {
                toast.error("Failed to load your History");
            }
        } catch (err) {
            toast.error("Archive server unreachable");
        } finally {
            setLoading(false);
        }
    };

    const deleteHistoryItem = async (id: number) => {
        if (!confirm(t('confirmDelete'))) return;

        try {
            const resp = await fetch(`http://localhost:8000/history/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                toast.success(t('purged'));
                setHistory(history.filter(item => item.id !== id));
            } else {
                toast.error("Failed to delete entry");
            }
        } catch (err) {
            toast.error("Network error during deletion");
        }
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = (item.full_name?.toLowerCase() || item.filename?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (item.seniority_level?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesScore = (item.score || 0) >= minScore;
        const matchesSeniority = seniorityFilter === 'All' || item.seniority_level === seniorityFilter;

        const metrics = item.ai_score?.performance_metrics || {};
        const matchesMetrics =
            (metrics.impact_score || 0) >= metricFilters.impact &&
            (metrics.technical_depth_score || 0) >= metricFilters.tech &&
            (metrics.soft_skills_score || 0) >= metricFilters.soft &&
            (metrics.growth_potential_score || 0) >= metricFilters.growth &&
            (metrics.stability_score || 0) >= metricFilters.stability &&
            (metrics.readability_score || 0) >= metricFilters.readability;

        return matchesSearch && matchesScore && matchesSeniority && matchesMetrics;
    });

    const resetFilters = () => {
        setSearch('');
        setMinScore(0);
        setSeniorityFilter('All');
        setMetricFilters({
            impact: 0,
            tech: 0,
            soft: 0,
            growth: 0,
            stability: 0,
            readability: 0
        });
    };

    const seniorityLevels = ['All', ...Array.from(new Set(history.map(h => h.seniority_level).filter(Boolean)))];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-6 sm:px-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Breadcrumbs / Back button */}
                <button
                    onClick={() => router.push(`/${locale}/dashboard`)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Command Cluster
                </button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                            <History className="w-10 h-10 text-brand-500" /> {t('title')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 max-w-lg">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-80">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Quick Filters */}
                        <div className="flex items-center gap-4 px-6 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 shrink-0">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('filters.score')}</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={minScore}
                                    onChange={(e) => setMinScore(Number(e.target.value))}
                                    className="w-14 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                                />
                            </div>
                            <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 shrink-0"></div>
                            <select
                                value={seniorityFilter}
                                onChange={(e) => setSeniorityFilter(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer outline-none"
                            >
                                {seniorityLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                            </select>

                            <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 shrink-0"></div>

                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${showAdvanced ? 'bg-brand-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400'}`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Advanced</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvanced && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Neural Metric Thresholds</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Set minimum requirements for deep performance indicators</p>
                            </div>
                            <button
                                onClick={resetFilters}
                                className="text-[9px] font-black text-brand-500 uppercase tracking-[0.2em] hover:text-brand-600"
                            >
                                Reset All Parameters
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                            {[
                                { key: 'impact', label: t('filters.metrics.impact') },
                                { key: 'tech', label: t('filters.metrics.tech') },
                                { key: 'soft', label: t('filters.metrics.soft') },
                                { key: 'growth', label: t('filters.metrics.growth') },
                                { key: 'stability', label: t('filters.metrics.stability') },
                                { key: 'readability', label: t('filters.metrics.readability') }
                            ].map((metric) => (
                                <div key={metric.key} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</label>
                                        <span className="text-xs font-black text-brand-500 italic">{metricFilters[metric.key as keyof typeof metricFilters]}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={metricFilters[metric.key as keyof typeof metricFilters]}
                                        onChange={(e) => setMetricFilters(prev => ({ ...prev, [metric.key]: Number(e.target.value) }))}
                                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Table Content */}
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing Archive...</p>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="py-40 text-center space-y-4">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                                <History className="w-12 h-12 text-slate-300" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('noResults')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('table.candidate')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('table.score')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('table.seniority')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('table.experience')}</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('table.date')}</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {filteredHistory.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 dark:text-white tracking-tight">{item.full_name || item.filename}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{item.email || 'Private Identity'}</p>

                                                        {item.ai_score?.performance_metrics && (
                                                            <div className="flex gap-1 mt-3">
                                                                {Object.entries(item.ai_score.performance_metrics).filter(([k]) => k !== 'keyword_score').map(([key, val]: any) => (
                                                                    <div key={key} className="group/metric relative">
                                                                        <div
                                                                            className="w-1.5 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end"
                                                                            title={`${key.replace('_score', '')}: ${val}%`}
                                                                        >
                                                                            <div
                                                                                className={`w-full rounded-full ${val > 80 ? 'bg-emerald-500' : val > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                                                style={{ height: `${val}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        {/* Tooltip on hover */}
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded whitespace-nowrap opacity-0 group-hover/metric:opacity-100 pointer-events-none transition-opacity z-10">
                                                                            {key.replace('_score', '').replace('_', ' ')}: {val}%
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-brand-500/10 text-brand-500 px-4 py-2 rounded-xl text-xs font-black">
                                                        {item.score || 0}%
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                                        <div
                                                            className="h-full bg-brand-500 rounded-full"
                                                            style={{ width: `${item.score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        {item.seniority_level || 'General'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                                {item.years_of_experience || 0}y
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button
                                                        onClick={() => deleteHistoryItem(item.id)}
                                                        className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                                                        title={t('delete')}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/${locale}/dashboard?reload=${item.id}`)}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
                                                    >
                                                        {t('reload')} <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
