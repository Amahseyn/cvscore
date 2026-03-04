import React from "react";
import { CheckCircle2, AlertCircle, TrendingUp, Mail, Phone, Copy, Loader2, Cpu, Sparkles, ExternalLink, Zap, Trophy } from "lucide-react";
import { RadarAnalytics } from "./RadarAnalytics";

interface DossierViewProps {
    currentResult: any;
    loading: boolean;
    copyToClipboard: () => void;
    onGenerateInterview: () => void;
    interviewScript: any | null;
    isGeneratingInterview: boolean;
    score?: number;
    showRawText: boolean;
    setShowRawText: (v: boolean) => void;
}

export const DossierView: React.FC<DossierViewProps> = ({
    currentResult,
    loading,
    copyToClipboard,
    onGenerateInterview,
    interviewScript,
    isGeneratingInterview,
    score,
    showRawText,
    setShowRawText
}) => {
    const analysis = currentResult?.ai_data;
    const ai_score = currentResult?.ai_score;

    return (
        <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col min-h-[700px] overflow-hidden backdrop-blur-xl animate-in fade-in duration-700">
            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/40 dark:bg-slate-900/50 flex-wrap gap-4 relative z-20">
                <div className="flex gap-6 items-center flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-600 border-b-4 border-brand-500 pb-2">Analysis Hub</span>
                    {currentResult && !loading && score !== undefined && (
                        <div className="flex items-center gap-2 bg-brand-500/10 px-4 py-1.5 rounded-2xl border border-brand-500/20">
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Match:</span>
                            <span className="text-xl font-black text-brand-500 tracking-tighter">{score}%</span>
                        </div>
                    )}
                    {ai_score?.performance_metrics?.keyword_score !== undefined && !loading && (
                        <div className="flex items-center gap-2 bg-sky-500/10 px-4 py-1.5 rounded-2xl border border-sky-500/20">
                            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Keyword:</span>
                            <span className="text-xl font-black text-sky-500 tracking-tighter">{ai_score.performance_metrics.keyword_score}%</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {currentResult && !loading && (
                        <button
                            onClick={onGenerateInterview}
                            disabled={isGeneratingInterview}
                            className={`p-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border ${interviewScript ? 'text-indigo-500 border-indigo-500/30' : 'text-slate-400 border-slate-100 dark:border-slate-800'}`}
                            title="Generate Interview Script"
                        >
                            {isGeneratingInterview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        </button>
                    )}
                    {currentResult?.text && (
                        <button
                            onClick={copyToClipboard}
                            className="p-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-brand-500 shadow-sm border border-slate-100 dark:border-slate-800"
                            title="Copy Raw Text"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-10 overflow-auto relative z-10">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-10 py-20">
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                            <Loader2 className="w-12 h-12 text-brand-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-widest mb-3">Syncing Neural Data…</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Extracting core artifacts</p>
                        </div>
                    </div>
                ) : analysis ? (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right duration-700">
                        {/* Main Profile Header */}
                        <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] p-10 border border-slate-100/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden group/dossier">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover/dossier:bg-brand-500/10 transition-all duration-700"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10">
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-brand-500/30 group-hover/dossier:scale-110 transition-transform">
                                        {analysis.name?.[0] || 'C'}
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{analysis.full_name || analysis.name}</h2>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{analysis.seniority_level || ai_score?.seniority_level || "Level unknown"}</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{analysis.years_of_experience || ai_score?.years_of_experience || 0} YOE</p>
                                            </div>
                                            <span className="text-slate-300 dark:text-slate-700 mx-1">•</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{analysis.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={analysis.links?.[0] || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400 hover:text-brand-500 hover:scale-110 transition-all shadow-sm"
                                        >
                                            <ExternalLink className="w-6 h-6" />
                                        </a>
                                        <a
                                            href={`mailto:${analysis.email}`}
                                            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl"
                                        >
                                            Contact Profile
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Strategic Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl">
                                <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                    <Zap className="w-5 h-5" /> Executive Summary
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic border-l-4 border-brand-500 pl-6 text-lg">
                                    "{currentResult.ai_score?.recruiter_analysis?.executive_summary || currentResult.ai_data.summary}"
                                </p>
                            </div>

                            <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group/verdict">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                                <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3 relative z-10">
                                    <Trophy className="w-5 h-5" /> Neural Verdict
                                </h3>
                                <div className="space-y-6 relative z-10">
                                    <p className="text-white text-xl font-black tracking-tight leading-snug">
                                        {ai_score?.recruiter_analysis?.verdict}
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="px-5 py-2.5 bg-white/10 rounded-2xl border border-white/10">
                                            <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block mb-1">Impact Factor</span>
                                            <span className="text-xl font-black text-emerald-400">{ai_score?.performance_metrics?.impact_score}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Map */}
                        {ai_score && (
                            <div className="bg-slate-50 dark:bg-slate-950/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 text-center">Neural Capability Map</h3>
                                <RadarAnalytics metrics={ai_score.performance_metrics} />
                            </div>
                        )}

                        {/* Assets & Risks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 group/card">
                                <h4 className="flex items-center gap-3 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-8">
                                    <TrendingUp className="w-5 h-5 group-hover/card:scale-110 transition-transform" /> Strategic Assets
                                </h4>
                                <ul className="space-y-5">
                                    {(ai_score?.candidate_analysis?.resume_tips || ai_score?.pros || []).map((tip: string, i: number) => (
                                        <li key={i} className="flex gap-5 text-[15px] font-bold text-slate-700 dark:text-slate-300 items-start group/item">
                                            <div className="shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xs font-black border border-emerald-200 dark:border-emerald-500/30 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all shadow-sm">{i + 1}</div>
                                            <span className="pt-1">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-rose-50/50 dark:bg-rose-500/5 p-10 rounded-[3rem] border border-rose-100 dark:border-rose-500/10 shadow-xl">
                                <h4 className="flex items-center gap-3 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.3em] mb-8">
                                    <AlertCircle className="w-5 h-5" /> Risks and gaps
                                </h4>
                                <div className="space-y-4">
                                    {(ai_score?.recruiter_analysis?.hiring_risks || ai_score?.cons || []).map((topic: string, i: number) => (
                                        <div key={i} className="p-4 bg-white dark:bg-slate-950 rounded-[1.25rem] border border-rose-50 dark:border-rose-500/10 text-[13px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-4 shadow-sm hover:border-rose-500/30 transition-all">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        {ai_score?.candidate_analysis?.cover_letter && (
                            <div className="bg-indigo-50 dark:bg-indigo-500/5 p-10 rounded-[3rem] border border-indigo-100 dark:border-indigo-500/10 shadow-xl animate-in fade-in duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="flex items-center gap-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">
                                        <Sparkles className="w-5 h-5" /> Tailored Cover Letter
                                    </h4>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(ai_score.candidate_analysis.cover_letter);
                                            alert("Cover letter copied!");
                                        }}
                                        className="p-3 hover:bg-indigo-500/10 rounded-xl text-indigo-500 transition-all border border-indigo-200 dark:border-indigo-800"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-8 bg-white dark:bg-slate-950 rounded-3xl border border-indigo-50 dark:border-indigo-500/10 max-h-[500px] overflow-auto">
                                    <pre className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans italic">
                                        {ai_score.candidate_analysis.cover_letter}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Raw Archive */}
                        <div className="pt-10 space-y-4">
                            <button
                                onClick={() => setShowRawText(!showRawText)}
                                className="flex items-center gap-3 px-8 py-4 bg-slate-100 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-brand-500/50 transition-all"
                            >
                                <Cpu className="w-4 h-4" /> {showRawText ? "Deactivate Neural Archive" : "Activate Neural Archive (Raw Text)"}
                            </button>
                            {showRawText && (
                                <div className="bg-slate-900 text-slate-400 p-10 rounded-[3rem] border border-slate-800 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                                    <pre className="text-[13px] font-medium leading-relaxed font-mono whitespace-pre-wrap opacity-60">
                                        {currentResult.text}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-10 py-20 grayscale opacity-40">
                        <Cpu className="w-24 h-24 animate-float" />
                        <div className="text-center">
                            <h3 className="text-2xl font-black uppercase tracking-[0.4em] mb-4">Awaiting Signal</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Select a candidate from the ranking to view detailed neural analysis</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
