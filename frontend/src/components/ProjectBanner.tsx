import React from 'react';
import { Briefcase, Users, Star, Target, FileText, Settings, ChevronRight } from 'lucide-react';

interface ProjectBannerProps {
    project: {
        id: number;
        name: string;
        job_description?: string;
        created_at: string;
    } | null;
    stats: {
        totalCandidates: number;
        topMatches: number;
        avgScore: number;
    };
    onOpenSettings: () => void;
}

export const ProjectBanner: React.FC<ProjectBannerProps> = ({ project, stats, onOpenSettings }) => {
    if (!project) return (
        <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                        General <span className="text-brand-500">Candidate Pool</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                        Select a project from the sidebar to see position-specific intelligence.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Analysed</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalCandidates}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 mb-8 shadow-2xl shadow-slate-200/20 dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-700 group">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-brand-500/10 transition-colors duration-700"></div>

            <div className="relative space-y-8">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">Hiring Project</span>
                                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
                                    {project.name}
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                ● Active
                            </span>
                            <span className="px-3 py-1 bg-slate-50 dark:bg-slate-950 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                                Created {new Date(project.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={onOpenSettings}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all group/btn"
                        >
                            <Settings className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                            Project Intelligence
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50 rounded-3xl group/card hover:border-brand-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover/card:text-brand-500 transition-colors">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pool Size</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white">{stats.totalCandidates}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50 rounded-3xl group/card hover:border-brand-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover/card:text-brand-500 transition-colors">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Top Match (80%+)</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white">{stats.topMatches}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50 rounded-3xl group/card hover:border-brand-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover/card:text-brand-500 transition-colors">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Average Neural Score</p>
                                <p className="text-xl font-black text-slate-800 dark:text-white">{Math.round(stats.avgScore)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
