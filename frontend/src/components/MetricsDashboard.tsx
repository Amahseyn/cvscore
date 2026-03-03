import React from "react";
import { Activity } from "lucide-react";

interface MetricsDashboardProps {
    currentResult: any;
    weightedScore: number;
    enabledMetrics: Record<string, boolean>;
    perfWeights: Record<string, number>;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
    currentResult,
    weightedScore,
    enabledMetrics,
    perfWeights
}) => {
    if (!currentResult?.ai_score?.performance_metrics) return null;

    return (
        <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 shadow-2xl border border-slate-800 mb-10 relative overflow-hidden group/metrics">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover/metrics:bg-brand-500/10 transition-all duration-700"></div>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Activity className="w-5 h-5 animate-pulse" /> Weighted Performance Engine
                </h3>
                <div className="flex items-center gap-4 bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-700">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Score</span>
                    <span className="text-2xl font-black text-white">{weightedScore}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                {[
                    { id: 'impact_score', label: 'Impact Factor', color: 'emerald' },
                    { id: 'technical_depth_score', label: 'Technical Depth', color: 'blue' },
                    { id: 'soft_skills_score', label: 'Soft Skills', color: 'indigo' },
                    { id: 'growth_potential_score', label: 'Growth Potential', color: 'amber' },
                    { id: 'stability_score', label: 'Stability Index', color: 'rose' },
                    { id: 'readability_score', label: 'Readability', color: 'slate' }
                ].map(m => enabledMetrics[m.id] && (
                    <div key={m.id} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex justify-between items-end px-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{m.label}</p>
                            <div className="flex flex-col items-end">
                                <p className={`text-[10px] font-black text-${m.color}-500 dark:text-${m.color}-400`}>WEIGHT: {perfWeights[m.id]}%</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-3">
                                <p className="text-5xl font-black text-white tracking-tighter">{currentResult.ai_score.performance_metrics[m.id]}<span className="text-xl text-slate-600">%</span></p>
                            </div>
                            <div className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-800/50 p-[1px]">
                                <div
                                    className={`h-full rounded-full bg-${m.color}-500 transition-all duration-1000 relative group/bar`}
                                    style={{
                                        width: `${currentResult.ai_score.performance_metrics[m.id]}%`,
                                        boxShadow: `0 0 20px rgba(59, 130, 246, 0.4)`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
