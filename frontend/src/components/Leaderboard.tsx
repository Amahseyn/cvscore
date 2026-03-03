import React from "react";
import { Trophy, Users, Zap } from "lucide-react";

interface LeaderboardProps {
    results: any[];
    rankedResults: any[];
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    selectedIndices: number[];
    onToggleSelect: (index: number) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
    results,
    rankedResults,
    currentIndex,
    setCurrentIndex,
    selectedIndices,
    onToggleSelect
}) => {
    if (results.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center mb-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-brand-500" /> Batch Alignment Monitor
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{results.length} Candidates Profiled</p>
                </div>
                {selectedIndices.length > 1 && (
                    <button
                        onClick={() => (window as any).showComparison()}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4" /> Compare {selectedIndices.length} Targets
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {rankedResults.map((res, i) => (
                    <button
                        key={res.originalIndex}
                        onClick={() => setCurrentIndex(res.originalIndex)}
                        className={`w-full group/row p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${currentIndex === res.originalIndex
                            ? 'bg-slate-900 border-slate-800 shadow-xl scale-[1.02] z-10'
                            : 'bg-white dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 hover:border-brand-500/30'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={selectedIndices.includes(res.originalIndex)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(res.originalIndex);
                                }}
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 checked:bg-brand-500 transition-all cursor-pointer"
                            />
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${currentIndex === res.originalIndex
                                ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                : i === 0
                                    ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover/row:bg-brand-50 dark:group-hover/row:bg-brand-500/10 group-hover/row:text-brand-600'
                                }`}>
                                {i === 0 ? <Trophy className="w-4 h-4" /> : i + 1}
                            </div>
                        </div>

                        <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                                <p className={`text-sm font-black truncate transition-colors ${currentIndex === res.originalIndex ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
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

                        <div className="flex items-center gap-4 px-2">
                            <div className="flex gap-0.5 items-end h-4">
                                {[...Array(5)].map((_, star) => (
                                    <div
                                        key={star}
                                        className={`w-1 rounded-full transition-all ${res.score > star * 20 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                                        style={{ height: `${20 + star * 20}%` }}
                                    ></div>
                                ))}
                            </div>
                            <div className={`text-2xl font-black italic transition-colors ${currentIndex === res.originalIndex ? 'text-white' : 'text-emerald-500 group-hover/row:text-emerald-400'}`}>
                                {res.score > 0 ? `${res.score}%` : (res.ai_score ? '0%' : '---')}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
