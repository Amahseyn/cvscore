import React from "react";
import { X, Trophy, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { RadarAnalytics } from "./RadarAnalytics";

interface ComparisonViewProps {
    candidates: any[];
    onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ candidates, onClose }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] p-10 overflow-auto animate-in fade-in duration-500">
            <div className="max-w-[1800px] mx-auto space-y-10">
                <div className="flex justify-between items-center bg-white/10 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                    <div>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Intelligence Delta</h2>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.4em]">Side-by-Side Performance Comparison</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-5 bg-white/10 hover:bg-rose-500 text-white rounded-3xl transition-all shadow-xl hover:shadow-rose-500/30 group"
                    >
                        <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-${Math.min(candidates.length, 3)} gap-8`}>
                    {candidates.map((c, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden group/card transition-all hover:border-brand-500/30">
                            {i === 0 && (
                                <div className="absolute top-8 right-8 bg-amber-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/30 z-10">
                                    <Trophy className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Alpha Candidate</span>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-brand-500/20">
                                        {c.ai_data?.full_name?.[0] || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{c.ai_data?.full_name || "Unidentified"}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-brand-500/20">
                                                Rank #{i + 1}
                                            </div>
                                            <div className="text-xl font-black text-slate-400 italic">
                                                {c.score}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {c.ai_score && (
                                    <div className="space-y-8">
                                        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 px-2 text-center">Neural Capabilities Map</p>
                                            <RadarAnalytics metrics={c.ai_score.performance_metrics} />
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500" /> Strategic Strengths
                                            </h4>
                                            <div className="space-y-3">
                                                {(c.ai_score.performance_metrics ?
                                                    Object.entries(c.ai_score.performance_metrics)
                                                        .sort(([, a]: any, [, b]: any) => b - a)
                                                        .slice(0, 3)
                                                    : []).map(([key, val]: any, k) => (
                                                        <div key={k} className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                                                            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{key.replace('_', ' ')}</span>
                                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{val}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-rose-500" /> Identifying Risks
                                            </h4>
                                            <div className="space-y-3">
                                                {(c.ai_score.recruiter_analysis?.hiring_risks || []).slice(0, 2).map((risk: string, k: number) => (
                                                    <div key={k} className="p-4 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-500/10 text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        • {risk}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Final Verdict</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                                                "{c.ai_score.recruiter_analysis?.verdict}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
