import React from "react";
import { Trophy, Users, Zap, Download, FileSearch, AlertCircle } from "lucide-react";
import { RadarAnalytics } from "./RadarAnalytics";

interface LeaderboardProps {
    results: any[];
    rankedResults: any[];
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    selectedIndices: number[];
    onToggleSelect: (index: number) => void;
    onExportExcel?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
    results,
    rankedResults,
    currentIndex,
    setCurrentIndex,
    selectedIndices,
    onToggleSelect,
    onExportExcel
}) => {
    if (results.length === 0) return null;

    // Derive candidates for comparison from selectedIndices
    const candidates = selectedIndices
        .map(index => results.find(r => r.originalIndex === index))
        .filter(Boolean); // Filter out any undefined results

    return (
        <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Talent Ranking</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Neural Baseline Scored</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={onExportExcel}
                        className="p-3 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-emerald-500 group/export"
                        title="Export to Excel"
                    >
                        <Download className="w-5 h-5 group-hover/export:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <th className="py-4 px-6">Candidate</th>
                            <th className="py-4 px-6">Level</th>
                            <th className="py-4 px-6">Score</th>
                            <th className="py-4 px-6">Compare</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedResults.map((res, i) => (
                            <tr
                                key={res.originalIndex}
                                className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${currentIndex === res.originalIndex ? 'bg-brand-50/20 dark:bg-brand-500/5' : ''}`}
                                onClick={() => setCurrentIndex(res.originalIndex)}
                            >
                                <td className="py-6 px-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${currentIndex === res.originalIndex
                                            ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                            : i === 0
                                                ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 group-hover:text-brand-600'
                                            }`}>
                                            {i === 0 ? <Trophy className="w-4 h-4" /> : i + 1}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-black truncate transition-colors ${currentIndex === res.originalIndex ? 'text-brand-700 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {res.ai_data?.full_name || `Candidate #${res.originalIndex + 1}`}
                                                </p>
                                                {i === 0 && (
                                                    <span className="text-[7px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-tighter shrink-0 animate-pulse">Top Match</span>
                                                )}
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
                                                {res.ai_data?.email || "No contact info"}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6 px-4">
                                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                            {res.ai_score?.seniority_level || res.ai_data?.seniority_level || "Unknown"}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-6 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden max-w-[100px]">
                                            <div
                                                className="h-full bg-brand-500 rounded-full group-hover:scale-x-110 transition-transform origin-left"
                                                style={{ width: `${res.score}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-black">{res.score}%</span>
                                    </div>
                                </td>
                                <td className="py-6 px-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleSelect(res.originalIndex); }}
                                        className={`p-3 rounded-2xl transition-all ${selectedIndices.includes(res.originalIndex) ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-500'}`}
                                    >
                                        <Users className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedIndices.length > 1 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => (window as any).showComparison()}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" /> Compare {selectedIndices.length} candidates
                    </button>
                </div>
            )}

            {/* Start of the new "Comparison Summary" block, conditionally rendered if candidates are selected */}
            {candidates.length > 0 && (
                <div className="space-y-12 mt-12">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            <Zap className="w-7 h-7 text-indigo-500" /> Comparison Summary
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{candidates.length} candidates selected</p>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(candidates.length, 3)} gap-8`}>
                        {candidates.map((c, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden group/card transition-all hover:border-brand-500/30">
                                {/* ... Content ... */}
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

                    <div className="bg-indigo-600 dark:bg-slate-950 p-12 rounded-[4rem] border border-indigo-500/30 shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-64 -mt-64"></div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                            <div className="shrink-0 w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center shadow-2xl">
                                <FileSearch className="w-12 h-12 text-indigo-600" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <h3 className="text-3xl font-black text-white">Comparative Intelligence Report</h3>
                                <p className="text-lg text-indigo-100 font-medium leading-relaxed max-w-4xl">
                                    The primary differentiator between the selected candidates lies in their <span className="text-white font-black underline decoration-indigo-300">Technical Depth</span> and <span className="text-white font-black underline decoration-indigo-300">Growth Potential</span>.
                                    while <span className="font-black text-white">{candidates[0]?.ai_data?.full_name}</span> leads in overall match percentage,
                                    {candidates.length > 1 && <span className="font-black text-white"> {candidates[1]?.ai_data?.full_name}</span>}
                                    provides a compelling alternative in terms of stability and soft skills alignment for long-term growth.
                                </p>
                                <div className="flex gap-4 pt-4">
                                    <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Delta Variance: {Math.abs(candidates[0]?.score - (candidates[1]?.score || 0))}%</span>
                                    <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Cohort Avg: {Math.round(candidates.reduce((a, b) => a + b.score, 0) / candidates.length)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* End of new "Comparison Summary" block */}
        </div>
    );
};
