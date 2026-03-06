import React from "react";
import { Upload, Cpu, BarChart3, ListChecks, ArrowLeft, History, Zap, Shield, Settings, Briefcase, ChevronRight, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
    role: "recruiter" | "applier" | null;
    setRole: (role: "recruiter" | "applier" | null) => void;
    files: File[];
    setFiles: (files: File[]) => void;
    method: string;
    setMethod: (method: string) => void;
    enabledMetrics: Record<string, boolean>;
    setEnabledMetrics: any;
    perfWeights: Record<string, number>;
    setPerfWeights: any;
    applyPreset: (p: any) => void;
    PRESETS: any;
    loading: boolean;
    handleUpload: (e: React.FormEvent) => void;
    handleExportExcel: () => void;
    currentResult: any;
    jdText: string;
    setJdText: (text: string) => void;
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    // Projects
    projects: any[];
    selectedProjectId: number | null;
    setSelectedProjectId: (id: number | null) => void;
    isCreatingProject: boolean;
    setIsCreatingProject: (show: boolean) => void;
    newProjectName: string;
    setNewProjectName: (name: string) => void;
    handleCreateProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    role,
    setRole,
    files,
    setFiles,
    method,
    setMethod,
    enabledMetrics,
    setEnabledMetrics,
    perfWeights,
    setPerfWeights,
    applyPreset,
    PRESETS,
    loading,
    handleUpload,
    handleExportExcel,
    currentResult,
    jdText,
    setJdText,
    showSettings,
    setShowSettings,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isCreatingProject,
    setIsCreatingProject,
    newProjectName,
    setNewProjectName,
    handleCreateProject
}) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const locale = useLocale();

    return (
        <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-left duration-700">
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl">
                <h2 className="text-2xl font-black mb-8 flex items-center justify-between text-slate-800 dark:text-white tracking-tight">
                    <div className="flex items-center gap-3">
                        <Cpu className="w-7 h-7 text-brand-500" /> Neural Extract
                    </div>
                </h2>

                <div className="space-y-8">
                    {/* Project/Position Management */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                                Strategic Positions
                            </h3>
                            <button
                                onClick={() => setIsCreatingProject(!isCreatingProject)}
                                className={`text-[10px] font-black uppercase tracking-widest transition-all ${isCreatingProject ? 'text-rose-500' : 'text-brand-500 hover:text-brand-600'}`}
                            >
                                {isCreatingProject ? "Cancel" : "+ New Position"}
                            </button>
                        </div>

                        {isCreatingProject ? (
                            <div className="p-6 bg-brand-500/5 dark:bg-brand-500/10 rounded-[2rem] border border-brand-500/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-brand-500 uppercase tracking-widest ml-1">Position Title</label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="e.g. Lead Product Designer"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-xs font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateProject}
                                    className="w-full py-4 bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-4 h-4 fill-white" />
                                    Launch Project
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.length === 0 ? (
                                    <div
                                        onClick={() => setIsCreatingProject(true)}
                                        className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center hover:border-brand-500/30 hover:bg-brand-500/5 transition-all cursor-pointer group"
                                    >
                                        <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3 group-hover:scale-110 group-hover:text-brand-500 transition-all" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Positions</p>
                                        <p className="text-[9px] text-slate-300 font-bold mt-1">Click to initialize your first project</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedProjectId(null)}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${selectedProjectId === null ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-brand-500/30'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Target className={`w-4 h-4 ${selectedProjectId === null ? 'text-white' : 'text-slate-400'}`} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Global Pool</span>
                                            </div>
                                            {selectedProjectId === null && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                        </button>

                                        {projects.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedProjectId(p.id)}
                                                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${selectedProjectId === p.id ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-brand-500/30'}`}
                                            >
                                                <div className="flex items-center gap-3 truncate">
                                                    <Briefcase className={`w-4 h-4 shrink-0 ${selectedProjectId === p.id ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
                                                    <span className="text-[11px] font-black uppercase tracking-widest truncate">{p.name}</span>
                                                </div>
                                                <ChevronRight className={`w-3 h-3 transition-transform ${selectedProjectId === p.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* File Drop Area */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            Upload CVs (PDF, DOCX, TXT)
                        </label>

                        {files.length > 0 ? (
                            <div className="space-y-3">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl group animate-in slide-in-from-left-2 duration-300">
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-brand-500 shrink-0">
                                                <Upload className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                                            className="p-2 hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ArrowLeft className="w-4 h-4 rotate-45" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('fileInput')?.click()}
                                    className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-brand-500/50 hover:text-brand-500 transition-all flex items-center justify-center gap-2"
                                >
                                    + Add More CVs
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => document.getElementById('fileInput')?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('border-brand-500', 'bg-brand-500/5');
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-brand-500', 'bg-brand-500/5');
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-brand-500', 'bg-brand-500/5');
                                    const droppedFiles = Array.from(e.dataTransfer.files);
                                    const validFiles = droppedFiles.filter(f =>
                                        f.name.toLowerCase().endsWith('.pdf') ||
                                        f.name.toLowerCase().endsWith('.docx') ||
                                        f.name.toLowerCase().endsWith('.txt')
                                    );
                                    setFiles([...files, ...validFiles]);
                                }}
                                className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center hover:border-brand-500/50 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Upload className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4 group-hover:scale-110 group-hover:text-brand-500 transition-all" />
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                    Drop CVs here (PDF, DOCX, TXT)
                                </p>
                                <p className="text-[10px] text-slate-300 dark:text-slate-700 font-bold uppercase tracking-widest">Neural extraction enabled</p>
                            </div>
                        )}
                        <input
                            id="fileInput"
                            type="file"
                            multiple
                            accept=".pdf,.docx,.txt"
                            onChange={(e) => {
                                const newFiles = Array.from(e.target.files || []);
                                setFiles([...files, ...newFiles]);
                            }}
                            className="hidden"
                        />

                        {files.length > 0 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Zap className="w-4 h-4 fill-white" />
                                    {loading ? "Analyzing..." : "Analyze Batch"}
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-500 transition-all"
                                    title="Export Excel"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation & Quick Actions */}
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl space-y-4">
                        <button
                            onClick={() => router.push(`/${locale}/dashboard/history`)}
                            className="w-full py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-brand-500/30 hover:text-brand-500 transition-all flex items-center justify-center gap-3"
                        >
                            <History className="w-4 h-4" /> CV Library
                        </button>
                        <button
                            onClick={() => router.push(`/${locale}/dashboard/purchase`)}
                            className="w-full py-4 bg-gradient-to-r from-brand-500 to-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-500/20"
                        >
                            <Zap className="w-4 h-4 fill-white" /> Upgrade Plan
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2"></div>
                        <button
                            onClick={() => logout()}
                            className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Analysis Settings Drawer / Panel */}
                    {showSettings && (
                        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black flex items-center gap-3 tracking-tight">
                                    <Cpu className="w-6 h-6 text-brand-500" /> Calibration
                                </h2>
                                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                    <ArrowLeft className="w-4 h-4 rotate-90" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Role (JD)</label>
                                    <textarea
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                        placeholder="Paste Job Description..."
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold resize-none h-40 focus:ring-4 focus:ring-brand-500/10 transition-all"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Profile Presets</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(PRESETS).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => applyPreset(p)}
                                                className="py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-500 hover:border-brand-500/50 transition-all shadow-sm"
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Weighting Logic</p>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'impact_score', label: 'Impact', color: 'emerald-500' },
                                            { id: 'technical_depth_score', label: 'Technical', color: 'brand-500' },
                                            { id: 'soft_skills_score', label: 'Soft Skills', color: 'indigo-500' },
                                            { id: 'growth_potential_score', label: 'Growth', color: 'amber-500' },
                                            { id: 'stability_score', label: 'Stability', color: 'rose-500' }
                                        ].map(m => (
                                            <div key={m.id} className="p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{m.label}</span>
                                                    <span className="text-[10px] font-black text-brand-500">{perfWeights[m.id]}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    value={perfWeights[m.id]}
                                                    onChange={(e) => setPerfWeights((prev: any) => ({ ...prev, [m.id]: parseInt(e.target.value) }))}
                                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
