"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sun, Moon, ArrowLeft, ArrowRight, Shield, Users, UserCircle, History, X, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Components
import { Sidebar } from "@/components/Sidebar";
import { Leaderboard } from "@/components/Leaderboard";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { DossierView } from "@/components/DossierView";
import { ComparisonView } from "@/components/ComparisonView";
import { Login } from "@/components/Auth/Login";
import { Register } from "@/components/Auth/Register";
import { AdminDashboard } from "@/components/Auth/AdminDashboard";

const PRESETS = {
    balanced: {
        weights: { impact_score: 20, technical_depth_score: 20, soft_skills_score: 20, growth_potential_score: 15, stability_score: 15, readability_score: 10 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    technical: {
        weights: { impact_score: 15, technical_depth_score: 45, soft_skills_score: 10, growth_potential_score: 15, stability_score: 10, readability_score: 5 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    leadership: {
        weights: { impact_score: 30, technical_depth_score: 10, soft_skills_score: 40, growth_potential_score: 10, stability_score: 5, readability_score: 5 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    }
};

export default function Home() {
    const { user, token } = useAuth();

    // UI View State
    const [view, setView] = useState<"landing" | "main">("landing");

    // Persistent State
    const [isDark, setIsDark] = useState(false);
    const [role, setRole] = useState<"recruiter" | "applier" | null>(null);
    const [enabledMetrics, setEnabledMetrics] = useState<Record<string, boolean>>(PRESETS.balanced.enabled);
    const [perfWeights, setPerfWeights] = useState<Record<string, number>>(PRESETS.balanced.weights);

    // Volatile State
    const [files, setFiles] = useState<File[]>([]);
    const [method, setMethod] = useState("pymupdf");
    const [jdText, setJdText] = useState("");
    const [doAiScore, setDoAiScore] = useState(true);
    const [doAiExtract, setDoAiExtract] = useState(true);
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
    const [historySearch, setHistorySearch] = useState("");

    // Lifecycle: Handle Auth Redirection
    useEffect(() => {
        if (user) {
            setView("main");
            setRole(user.role as any);
        }
    }, [user]);

    // Global bridge for components
    useEffect(() => {
        (window as any).showComparison = () => setShowComparison(true);
    }, []);

    // Lifecycle: Load Persistence
    useEffect(() => {
        const savedDark = localStorage.getItem('cvscore_dark') === 'true';
        const savedWeights = localStorage.getItem('cvscore_weights');
        setIsDark(savedDark);
        if (savedWeights) setPerfWeights(JSON.parse(savedWeights));
    }, []);

    // Lifecycle: Save Persistence
    useEffect(() => {
        localStorage.setItem('cvscore_dark', String(isDark));
        localStorage.setItem('cvscore_weights', JSON.stringify(perfWeights));
    }, [isDark, perfWeights]);

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

    const getScoreForResult = (res: any) => {
        if (!res?.ai_score?.performance_metrics) return 0;
        const pm = res.ai_score.performance_metrics;
        let totalWeight = 0, weightedSum = 0;
        Object.keys(enabledMetrics).forEach(key => {
            if (enabledMetrics[key]) {
                weightedSum += (pm[key] || 0) * (perfWeights[key] || 0);
                totalWeight += (perfWeights[key] || 0);
            }
        });
        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    };

    const rankedResults = useMemo(() => {
        return [...results]
            .map((res, index) => ({ ...res, originalIndex: index, score: getScoreForResult(res) }))
            .sort((a, b) => b.score - a.score);
    }, [results, enabledMetrics, perfWeights]);

    // Auto-select Top Match
    useEffect(() => {
        if (rankedResults.length > 0 && results.length > 0) {
            setCurrentIndex(rankedResults[0].originalIndex);
        }
    }, [results]);

    const applyPreset = (p: keyof typeof PRESETS) => {
        setPerfWeights(PRESETS[p].weights);
        setEnabledMetrics(PRESETS[p].enabled);
        toast.info(`Applied ${p.charAt(0).toUpperCase() + p.slice(1)} Alignment Profile`);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setLoading(true);
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('method', method);
        formData.append('do_ai_score', String(doAiScore));
        formData.append('do_ai_extract', String(doAiExtract));
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
            setResults(data.results || []);
            toast.success(`Synthesized ${files.length} Neural Dossiers`);
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

    const copyToClipboard = () => {
        if (currentResult?.text) {
            navigator.clipboard.writeText(currentResult.text);
            toast.success("Dossier Data Copied to Internal Buffer");
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
        toast.success("Dossier Restored from Neural History");
    };

    if (view === "landing") {
        return (
            <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} flex items-center justify-center p-6 transition-colors duration-1000 relative overflow-hidden`}>
                {/* Neural Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-500/10 blur-[150px] rounded-full animate-pulse transition-all duration-1000"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse delay-1000 transition-all duration-1000"></div>
                </div>

                <div className="max-w-7xl w-full space-y-20 text-center animate-in fade-in zoom-in duration-1000 relative z-10">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-4 animate-bounce duration-[3000ms]">
                            <Shield className="w-4 h-4 text-brand-500" />
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">Enterprise Neural Logic v2.5.0</span>
                        </div>
                        <h1 className="text-[10rem] font-black tracking-tighter leading-none select-none">
                            CVScore <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-400 bg-clip-text text-transparent hover:tracking-normal transition-all duration-700 cursor-default">PRO</span>
                        </h1>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[1em] opacity-80">Next-Gen Neural Talent Intelligence</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <Link
                            href="/login"
                            className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] border border-slate-200/50 dark:border-slate-800/50 p-12 flex flex-col items-center gap-8 hover:border-brand-500 transition-all duration-500 shadow-2xl hover:shadow-brand-500/20 hover:-translate-y-4"
                        >
                            <div className="w-24 h-24 rounded-[2rem] bg-brand-500 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-brand-500/40">
                                <Users className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight">Intelligence Hub</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Instant Batch Alignment & Ranking</p>
                            </div>
                        </Link>

                        <Link
                            href="/login"
                            className="group bg-slate-900 dark:bg-brand-600 rounded-[4rem] p-12 flex flex-col items-center gap-8 hover:scale-[1.05] transition-all duration-500 shadow-2xl hover:shadow-indigo-500/30"
                        >
                            <div className="w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-brand-600 transition-all duration-500">
                                <UserCircle className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-2 text-white">
                                <h3 className="text-3xl font-black tracking-tight">Candidate Pro</h3>
                                <p className="text-[10px] font-black uppercase text-white/50 tracking-widest leading-relaxed">Self-Optimization & Neural Score</p>
                            </div>
                        </Link>

                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] border border-slate-200/50 dark:border-slate-800/50 p-12 flex flex-col items-center justify-center gap-8 shadow-2xl relative overflow-hidden group hover:-translate-y-4 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent"></div>
                            <div className="space-y-2 relative z-10 text-center">
                                <div className="p-3 bg-brand-500/10 rounded-2xl w-fit mx-auto mb-4 border border-brand-500/20 group-hover:rotate-12 transition-transform">
                                    <History className="w-6 h-6 text-brand-500" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">Neural Vault</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Identity Persistence & Archive</p>
                            </div>
                            <div className="flex flex-col gap-4 w-full relative z-10 mt-4">
                                <Link
                                    href="/login"
                                    className="group/btn bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20"
                                >
                                    Login Identity <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-slate-200 dark:hover:bg-slate-700 flex justify-center items-center"
                                >
                                    Forge Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 flex justify-center gap-12 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Quantum Encrypted</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal Logs</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-all duration-700 font-sans`}>
            <ToastContainer position="bottom-right" theme={isDark ? "dark" : "light"} />

            <nav className="fixed top-0 left-0 right-0 h-24 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl z-50 flex items-center px-10">
                <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button onClick={() => { setView('landing'); setRole(null); }} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                CVScore <span className="text-brand-500">PRO</span>
                            </h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Neural Artifact Evaluator</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setShowAdmin(true)}
                                className="px-6 py-3 bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" /> Admin Console
                            </button>
                        )}
                        <button onClick={() => setIsDark(!isDark)} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-brand-500/10 transition-all">
                            {isDark ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-500" />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto pt-32 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <Sidebar
                    role={role} setRole={setRole} files={files} setFiles={setFiles}
                    method={method} setMethod={setMethod} doAiScore={doAiScore} setDoAiScore={setDoAiScore}
                    doAiExtract={doAiExtract} setDoAiExtract={setDoAiExtract}
                    enabledMetrics={enabledMetrics} setEnabledMetrics={setEnabledMetrics}
                    perfWeights={perfWeights} setPerfWeights={setPerfWeights}
                    applyPreset={applyPreset} PRESETS={PRESETS}
                    loading={loading} handleUpload={handleUpload}
                    currentResult={currentResult}
                    onShowHistory={() => setShowHistory(true)}
                />

                <div className="lg:col-span-8 space-y-8">
                    <Leaderboard
                        results={results} rankedResults={rankedResults}
                        currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}
                        selectedIndices={selectedIndices} onToggleSelect={handleToggleSelect}
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

                        <div className="p-6 bg-white dark:bg-slate-950/30">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Identities..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {history.filter(item => item.filename.toLowerCase().includes(historySearch.toLowerCase())).length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Archived Dossiers Found</p>
                                </div>
                            ) : (
                                history.filter(item => item.filename.toLowerCase().includes(historySearch.toLowerCase())).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => loadFromHistory(item)}
                                        className="w-full group p-6 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-3xl border border-transparent hover:border-brand-500/30 transition-all flex items-center justify-between"
                                    >
                                        <div className="text-left flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 font-black">
                                                {item.filename[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white group-hover:text-brand-500 transition-colors">{item.filename}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()} — {item.ai_data?.full_name || 'Anonymous'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            {item.ai_score && (
                                                <div className="text-right">
                                                    <p className="text-2xl font-black italic text-emerald-500">{item.ai_score.total_score}%</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Alignment</p>
                                                </div>
                                            )}
                                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-all" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAdmin && (
                <AdminDashboard onClose={() => setShowAdmin(false)} />
            )}
        </div>
    );
}
