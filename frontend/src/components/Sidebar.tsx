import React from "react";
import { Upload, Cpu, BarChart3, ListChecks, ArrowLeft, LogOut, History, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
    role: "recruiter" | "applier" | null;
    setRole: (role: "recruiter" | "applier" | null) => void;
    files: File[];
    setFiles: (files: File[]) => void;
    method: string;
    setMethod: (method: string) => void;
    doAiScore: boolean;
    setDoAiScore: (v: boolean) => void;
    doAiExtract: boolean;
    setDoAiExtract: (v: boolean) => void;
    enabledMetrics: Record<string, boolean>;
    setEnabledMetrics: any;
    perfWeights: Record<string, number>;
    setPerfWeights: any;
    applyPreset: (p: any) => void;
    PRESETS: any;
    loading: boolean;
    handleUpload: (e: React.FormEvent) => void;
    currentResult: any;
    onShowHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    role,
    setRole,
    files,
    setFiles,
    method,
    setMethod,
    doAiScore,
    setDoAiScore,
    doAiExtract,
    setDoAiExtract,
    enabledMetrics,
    setEnabledMetrics,
    perfWeights,
    setPerfWeights,
    applyPreset,
    PRESETS,
    loading,
    handleUpload,
    currentResult,
    onShowHistory
}) => {
    const { user, logout } = useAuth();

    return (
        <div className="lg:col-span-4 space-y-6">
            {user && (
                <div className="bg-slate-900 dark:bg-brand-600 p-6 rounded-[2rem] shadow-2xl border border-slate-800 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                            <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm truncate max-w-[150px]">{user.email}</p>
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">{user.role} Access</p>
                        </div>
                    </div>
                    <div className="flex gap-2 relative z-10">
                        <button
                            onClick={onShowHistory}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all text-white"
                            title="Neural History"
                        >
                            <History className="w-4 h-4" />
                        </button>
                        <button
                            onClick={logout}
                            className="p-3 bg-rose-500/20 hover:bg-rose-500/40 rounded-xl border border-rose-500/30 transition-all text-rose-200"
                            title="Deactivate Session"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black mb-8 flex items-center gap-2 text-slate-800 dark:text-white">
                    <Cpu className="w-6 h-6 text-brand-500" /> Neural Control
                </h2>

                <form onSubmit={handleUpload} className="space-y-8">
                    {/* File Drop Area */}
                    <div
                        onClick={() => document.getElementById('fileInput')?.click()}
                        className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center hover:border-brand-500/50 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <input
                            id="fileInput"
                            type="file"
                            multiple
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                            className="hidden"
                        />
                        <Upload className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4 group-hover:scale-110 group-hover:text-brand-500 transition-all" />
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                            {files.length > 0 ? `${files.length} Files Targets Loaded` : "Deploy PDF Dossiers"}
                        </p>
                        <p className="text-[10px] text-slate-300 dark:text-slate-700 font-bold">PDF, DOCX (OCR Enabled)</p>
                    </div>

                    {/* Method Selection */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                            Neural Engine
                        </label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold dark:text-slate-300 focus:ring-4 focus:ring-brand-500/10 outline-none appearance-none cursor-pointer"
                        >
                            <option value="pymupdf">PyMuPDF (Turbo)</option>
                            <option value="pypdf">pypdf (Lean)</option>
                            <option value="pdfminer">pdfminer</option>
                            <option value="pdfplumber">pdfplumber</option>
                        </select>
                    </div>

                    {/* AI Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setDoAiScore(!doAiScore)}
                            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${doAiScore ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-400 hover:border-brand-200'}`}
                        >
                            <BarChart3 className={`w-5 h-5 ${doAiScore ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Score</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDoAiExtract(!doAiExtract)}
                            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${doAiExtract ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-400 hover:border-indigo-200'}`}
                        >
                            <ListChecks className={`w-5 h-5 ${doAiExtract ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Parse</span>
                        </button>
                    </div>

                    {/* Tactical Weights & Presets */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tactical Presets</p>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.keys(PRESETS).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className="py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-500 hover:border-brand-500/30 transition-all shadow-sm active:scale-95"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">Performance Factors</p>
                            <div className="space-y-4">
                                {[
                                    { id: 'impact_score', label: 'Impact Factor', color: 'emerald-500' },
                                    { id: 'technical_depth_score', label: 'Technical Depth', color: 'brand-500' },
                                    { id: 'soft_skills_score', label: 'Soft Skills', color: 'indigo-500' },
                                    { id: 'growth_potential_score', label: 'Growth Potential', color: 'amber-500' },
                                    { id: 'stability_score', label: 'Stability Index', color: 'rose-500' },
                                    { id: 'readability_score', label: 'Readability', color: 'slate-500' }
                                ].map(m => (
                                    <div key={m.id} className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-slate-200 dark:hover:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1 h-6 rounded-full bg-${m.color}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${enabledMetrics[m.id] ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                    {m.label}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEnabledMetrics((prev: any) => ({ ...prev, [m.id]: !prev[m.id] }))}
                                                className={`w-10 h-5 rounded-full relative transition-all duration-500 flex items-center ${enabledMetrics[m.id] ? `bg-${m.color}` : 'bg-slate-200 dark:bg-slate-800'}`}
                                            >
                                                <div className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg transition-all duration-300 ${enabledMetrics[m.id] ? 'right-1' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                            <span>Factor Weight</span>
                                            <span className={enabledMetrics[m.id] ? `text-slate-900 dark:text-white` : ''}>{perfWeights[m.id]}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={perfWeights[m.id]}
                                            disabled={!enabledMetrics[m.id]}
                                            onChange={(e) => setPerfWeights((prev: any) => ({ ...prev, [m.id]: parseInt(e.target.value) }))}
                                            className={`w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-${m.color} disabled:opacity-20 transition-all`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || files.length === 0}
                        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] text-white shadow-2xl transition-all duration-500 flex items-center justify-center gap-3 transform active:scale-95 overflow-hidden relative group ${loading || files.length === 0 ? 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed text-slate-400' : 'bg-slate-900 dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-700'}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            Process {files.length || ''} CVs
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};
