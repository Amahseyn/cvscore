"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sun, Moon, ArrowLeft, Shield, LogOut, History, X, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// Components
import { Sidebar } from "@/components/Sidebar";
import { Leaderboard } from "@/components/Leaderboard";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { DossierView } from "@/components/DossierView";
import { ComparisonView } from "@/components/ComparisonView";

const PRESETS = {
    balanced: {
        weights: { impact_score: 20, technical_depth_score: 20, soft_skills_score: 20, growth_potential_score: 15, stability_score: 15, readability_score: 10 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    technical: {
        weights: { impact_score: 10, technical_depth_score: 50, soft_skills_score: 10, growth_potential_score: 15, stability_score: 10, readability_score: 5 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    leadership: {
        weights: { impact_score: 35, technical_depth_score: 5, soft_skills_score: 45, growth_potential_score: 5, stability_score: 5, readability_score: 5 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    junior: {
        weights: { impact_score: 10, technical_depth_score: 10, soft_skills_score: 20, growth_potential_score: 40, stability_score: 10, readability_score: 10 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    specialist: {
        weights: { impact_score: 15, technical_depth_score: 55, soft_skills_score: 5, growth_potential_score: 10, stability_score: 10, readability_score: 5 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    }
};

export default function DashboardPage() {
    const { user, token, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    // UI View State
    const [role, setRole] = useState<"recruiter" | "applier" | null>(null);
    const [enabledMetrics, setEnabledMetrics] = useState<Record<string, boolean>>(PRESETS.balanced.enabled);
    const [perfWeights, setPerfWeights] = useState<Record<string, number>>(PRESETS.balanced.weights);

    // Volatile State
    const [files, setFiles] = useState<File[]>([]);
    const [method, setMethod] = useState("pymupdf");
    const [jdText, setJdText] = useState("");
    const [showRawText, setShowRawText] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [interviewScripts, setInterviewScripts] = useState<Record<number, any>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);

    // History State
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [adminUsers, setAdminUsers] = useState<any[] | null>(null);
    const [adminUsersLoading, setAdminUsersLoading] = useState(false);

    // Auth Guard
    useEffect(() => {
        if (!loading && !token) {
            router.push('/login');
        } else if (user) {
            setRole(user.role as any);
        }
    }, [user, token, router]);

    // Global bridge for components
    useEffect(() => {
        (window as any).showComparison = () => setShowComparison(true);
    }, []);

    // Lifecycle: Load Persistence
    useEffect(() => {
        const savedWeights = typeof window !== "undefined"
            ? localStorage.getItem('cvscore_weights')
            : null;
        if (savedWeights) setPerfWeights(JSON.parse(savedWeights));
    }, []);

    // Lifecycle: Save Persistence
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem('cvscore_weights', JSON.stringify(perfWeights));
        }
    }, [perfWeights]);

    // Fetch History
    const fetchHistory = async () => {
        if (!token) return;
        try {
            const resp = await fetch("http://localhost:8000/history", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            setHistory(data || []);
        } catch (err) {
            toast.error("Failed to load history");
        }
    };

    useEffect(() => {
        if (showHistory) fetchHistory();
    }, [showHistory]);

    // Fetch Admin User Overview
    useEffect(() => {
        const fetchAdminUsers = async () => {
            if (!token || user?.role !== "admin") return;
            setAdminUsersLoading(true);
            try {
                const resp = await fetch("http://localhost:8000/admin/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    toast.error(err.detail || "Failed to load user registry overview");
                    return;
                }
                const data = await resp.json();
                setAdminUsers(data || []);
            } catch {
                toast.error("Admin monitoring endpoint unreachable");
            } finally {
                setAdminUsersLoading(false);
            }
        };

        fetchAdminUsers();
    }, [token, user]);

    // Dynamic Weighting Logic
    const rankedResults = useMemo(() => {
        if (!results.length) return [];

        const mapped = results.map((res, originalIndex) => {
            let totalScore = 0;
            let activeWeightSum = 0;

            Object.entries(perfWeights).forEach(([key, weight]) => {
                if (enabledMetrics[key]) {
                    const metricVal = res.ai_score?.performance_metrics?.[key] || 0;
                    totalScore += (metricVal * weight) / 100;
                    activeWeightSum += weight;
                }
            });

            // Normalize if sum of active weights isn't 100
            const normalizedScore = activeWeightSum > 0 ? Math.round((totalScore / activeWeightSum) * 100) : 0;

            return {
                ...res,
                originalIndex,
                score: normalizedScore,
                weightedScore: normalizedScore
            };
        });

        return [...mapped].sort((a, b) => b.score - a.score);
    }, [results, perfWeights, enabledMetrics]);

    // Auto-select Top Match
    useEffect(() => {
        if (rankedResults.length > 0 && results.length > 0) {
            setCurrentIndex(rankedResults[0].originalIndex);
        }
    }, [results]);

    const applyPreset = (p: keyof typeof PRESETS) => {
        setPerfWeights(PRESETS[p].weights);
        setEnabledMetrics(PRESETS[p].enabled);
        toast.info(`Applied ${p.charAt(0).toUpperCase() + p.slice(1)} profile`);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setLoading(true);
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('method', method);
        formData.append('do_ai_score', 'true');
        formData.append('do_ai_extract', 'true');
        if (jdText) formData.append('jd_text', jdText);

        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const resp = await fetch("http://localhost:8000/extract", {
                method: 'POST',
                headers: headers,
                body: formData
            });
            const data = await resp.json();
            if (!resp.ok) {
                toast.error(data.detail || "Neural Link Failure: Request rejected by engine");
                return;
            }
            setResults(data.results || []);
            const successCount = data.batch_summary?.success || 0;
            toast.success(`Synthesized ${successCount} Neural Dossiers`);
        } catch (err) {
            toast.error("Neural Link Failure: Connection to Backend Lost");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInterview = async () => {
        const currentRes = rankedResults.find(r => r.originalIndex === currentIndex);
        if (!currentRes || interviewScripts[currentIndex]) return;

        setIsGeneratingInterview(true);
        try {
            const resp = await fetch("http://localhost:8000/interview", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cv_text: currentRes.text,
                    dossier_summary: currentRes.ai_score?.recruiter_analysis?.executive_summary || "",
                    jd_text: jdText
                })
            });
            const data = await resp.json();
            setInterviewScripts(prev => ({ ...prev, [currentIndex]: data }));
            toast.success("AI Interview Script Synthesized");
        } catch (err) {
            toast.error("Interview generation failed");
        } finally {
            setIsGeneratingInterview(false);
        }
    };

    const handleToggleSelect = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const currentResult = rankedResults.find(r => r.originalIndex === currentIndex);
    const weightedScore = currentResult?.score || 0;

    const totalUsers = adminUsers?.length ?? 0;
    const adminCount = adminUsers?.filter((u: any) => u.role === "admin").length ?? 0;
    const vipCount = adminUsers?.filter((u: any) => u.role === "vip").length ?? 0;
    const recruiterCount = adminUsers?.filter((u: any) => u.role === "recruiter").length ?? 0;
    const applierCount = adminUsers?.filter((u: any) => u.role === "applier").length ?? 0;

    const copyToClipboard = () => {
        if (currentResult?.text) {
            navigator.clipboard.writeText(currentResult.text);
            toast.success("CV text copied");
        }
    };

    const loadFromHistory = (item: any) => {
        setResults([{
            filename: item.filename,
            text: item.text,
            ai_data: item.ai_data,
            ai_score: item.ai_score,
            method: 'history',
            duration: 0
        }]);
        setShowHistory(false);
        toast.success("Previous result restored");
    };

    const handleExportExcel = async () => {
        if (!token) return;
        try {
            const resp = await fetch("http://localhost:8000/export/excel", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                toast.error(err.detail || "Export failed");
                return;
            }
            const blob = await resp.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cvscore_evaluations_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Excel report generated successfully");
        } catch (err) {
            toast.error("Failed to generate Excel report");
        }
    };

    if (!token && !loading) return null;

    return (
        <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-all duration-700 font-outfit`}>
            <ToastContainer position="bottom-right" theme={isDark ? "dark" : "light"} />

            <nav className="fixed top-0 left-0 right-0 h-24 glass z-50 flex items-center px-10">
                <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/')}
                            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group shadow-sm bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800"
                            title="Return Home"
                        >
                            <ArrowLeft className="w-6 h-6 group-active:-translate-x-1 transition-transform" />
                        </button>
                        <Link href="/" className="group">
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                CVScore <span className="text-brand-500 group-hover:text-brand-600 transition-colors">PRO</span>
                            </h1>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-1 group-hover:tracking-[0.5em] transition-all">Neural Artifact Evaluator</p>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden lg:flex items-center gap-8 mr-12 border-r border-slate-200/50 dark:border-slate-800/50 pr-8">
                            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-500 transition-colors">Home</Link>
                            <a href="#history" onClick={(e) => { e.preventDefault(); setShowHistory(true); }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-500 transition-colors">Vault</a>
                            <button
                                onClick={handleExportExcel}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-3.5 h-3.5" /> Export Data
                            </button>
                        </nav>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="px-6 py-3 bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all flex items-center gap-2 shadow-xl shadow-brand-500/10"
                            >
                                <Shield className="w-4 h-4" /> Admin Console
                            </button>
                        )}
                        <button onClick={toggleTheme} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-brand-500/10 transition-all">
                            {isDark ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-500" />}
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                router.push('/');
                                toast.info("Logged out successfully");
                            }}
                            className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-brand-500/10 transition-all text-slate-400 hover:text-rose-500"
                            title="Logout"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto pt-32 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {user?.role === "admin" && (
                    <section className="lg:col-span-12 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">
                                    Admin Telemetry
                                </p>
                                <h2 className="text-xl md:text-2xl font-black tracking-tight">
                                    User Registry & Role Distribution
                                </h2>
                            </div>
                            <button
                                onClick={() => router.push('/admin')}
                                className="px-5 py-3 bg-brand-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-md shadow-brand-500/30 hover:bg-brand-600 active:scale-95 transition-all"
                            >
                                Open Full Admin Console
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    Total Identities
                                </p>
                                <p className="mt-3 text-3xl font-black tracking-tight">
                                    {adminUsersLoading ? "…" : totalUsers}
                                </p>
                                <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                    Across all roles
                                </p>
                            </div>
                            <div className="rounded-3xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100/80 dark:border-rose-900 p-5">
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em]">
                                    Admins
                                </p>
                                <p className="mt-3 text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                                    {adminUsersLoading ? "…" : adminCount}
                                </p>
                                <p className="mt-1 text-[9px] font-bold text-rose-400 uppercase tracking-[0.3em]">
                                    Full control
                                </p>
                            </div>
                            <div className="rounded-3xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900 p-5">
                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">
                                    VIP
                                </p>
                                <p className="mt-3 text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                                    {adminUsersLoading ? "…" : vipCount}
                                </p>
                                <p className="mt-1 text-[9px] font-bold text-amber-400 uppercase tracking-[0.3em]">
                                    High bandwidth
                                </p>
                            </div>
                            <div className="rounded-3xl bg-brand-50/80 dark:bg-sky-950/30 border border-brand-100/80 dark:border-sky-900 p-5">
                                <p className="text-[9px] font-black text-brand-500 uppercase tracking-[0.3em]">
                                    Recruiters
                                </p>
                                <p className="mt-3 text-3xl font-black tracking-tight text-brand-600">
                                    {adminUsersLoading ? "…" : recruiterCount}
                                </p>
                                <p className="mt-1 text-[9px] font-bold text-brand-400 uppercase tracking-[0.3em]">
                                    Free tier
                                </p>
                            </div>
                            <div className="rounded-3xl bg-slate-50/80 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                    Candidates
                                </p>
                                <p className="mt-3 text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                                    {adminUsersLoading ? "…" : applierCount}
                                </p>
                                <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                    Free trial
                                </p>
                            </div>
                        </div>
                    </section>
                )}
                <Sidebar
                    role={role} setRole={setRole} files={files} setFiles={setFiles}
                    method={method} setMethod={setMethod}
                    enabledMetrics={enabledMetrics} setEnabledMetrics={setEnabledMetrics}
                    perfWeights={perfWeights} setPerfWeights={setPerfWeights}
                    applyPreset={applyPreset} PRESETS={PRESETS}
                    loading={loading} handleUpload={handleUpload}
                    currentResult={currentResult}
                    onShowHistory={() => setShowHistory(true)}
                    jdText={jdText}
                    setJdText={setJdText}
                />

                <div className="lg:col-span-8 space-y-8">
                    <Leaderboard
                        results={results} rankedResults={rankedResults}
                        currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}
                        selectedIndices={selectedIndices} onToggleSelect={handleToggleSelect}
                        onExportExcel={handleExportExcel}
                    />

                    {currentResult && (
                        <MetricsDashboard
                            currentResult={currentResult} weightedScore={weightedScore}
                            enabledMetrics={enabledMetrics} perfWeights={perfWeights}
                        />
                    )}

                    <DossierView
                        currentResult={currentResult} loading={loading}
                        copyToClipboard={copyToClipboard}
                        onGenerateInterview={handleGenerateInterview}
                        interviewScript={interviewScripts[currentIndex]}
                        isGeneratingInterview={isGeneratingInterview}
                        score={weightedScore}
                        showRawText={showRawText}
                        setShowRawText={setShowRawText}
                    />
                </div>
            </main>

            {showComparison && (
                <ComparisonView
                    candidates={rankedResults.filter(res => selectedIndices.includes(res.originalIndex))}
                    onClose={() => setShowComparison(false)}
                />
            )}

            {showHistory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[80vh] rounded-[3rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <History className="w-6 h-6 text-brand-500" /> Neural Vault
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Persistent Dossier Archive</p>
                            </div>
                            <button onClick={() => setShowHistory(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-8 space-y-4">
                            {history.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <History className="w-12 h-12 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">No evaluations found in current sector</p>
                                </div>
                            ) : (
                                history.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => loadFromHistory(item)}
                                        className="w-full text-left p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-500/5 flex items-center justify-center text-brand-500">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 dark:text-white group-hover:text-brand-500 transition-colors">{item.filename}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{new Date(item.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Score</p>
                                                <p className="text-xl font-black text-emerald-500 italic">{item.ai_score?.total_score || 0}%</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
