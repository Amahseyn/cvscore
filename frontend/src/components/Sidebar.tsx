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
    jdText: string;
    setJdText: (text: string) => void;
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
    currentResult,
    onShowHistory,
    jdText,
    setJdText
}) => {
    const { user, logout } = useAuth();

    return (
        <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-left duration-700">
            {user && (
                <div className="bg-slate-900 dark:bg-brand-600 p-6 rounded-[2rem] shadow-2xl border border-slate-800 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                            <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm truncate max-w-[150px]">{user.email}</p>
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">{user.role} account</p>
                        </div>
                    </div>
                    <div className="flex gap-2 relative z-10">
                        <button
                            onClick={onShowHistory}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all text-white"
                            title="Analysis history"
                        >
                            <History className="w-4 h-4" />
                        </button>
                        <button
                            onClick={logout}
                            className="p-3 bg-rose-500/20 hover:bg-rose-500/40 rounded-xl border border-rose-500/30 transition-all text-rose-200"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800 dark:text-white tracking-tight">
                    <Cpu className="w-7 h-7 text-brand-500" /> Neural Extract
                </h2>

                <form onSubmit={handleUpload} className="space-y-8">
                    {/* File Drop Area */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            Upload CV PDFs
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
                                className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center hover:border-brand-500/50 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Upload className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4 group-hover:scale-110 group-hover:text-brand-500 transition-all" />
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                    Drop CV PDFs, DOCX, or TXT here
                                </p>
                                <p className="text-[10px] text-slate-300 dark:text-slate-700 font-bold">PDF, DOCX, TXT • OCR enabled</p>
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
                    </div>

                    {/* Method Selection */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                            Extraction method
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

                    {/* Job Description Input */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">
                            Job Description (Optional)
                        </label>
                        <textarea
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste Job Description here for AI alignment scoring..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold dark:text-slate-300 focus:ring-4 focus:ring-brand-500/10 outline-none resize-none h-32"
                        />
                    </div>

                    {/* Tactical Weights & Presets */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tactical Presets</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.keys(PRESETS).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className="py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-500 hover:border-brand-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm active:scale-95"
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
                                    <div key={m.id} className="space-y-4 p-5 bg-slate-50/50 dark:bg-slate-950/30 rounded-[2rem] border border-slate-100/50 dark:border-slate-800/50 transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-6 rounded-full bg-${m.color}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${enabledMetrics[m.id] ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                    {m.label}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEnabledMetrics((prev: any) => ({ ...prev, [m.id]: !prev[m.id] }))}
                                                className={`w-11 h-6 rounded-full relative transition-all duration-500 flex items-center ${enabledMetrics[m.id] ? `bg-${m.color}` : 'bg-slate-200 dark:bg-slate-800'}`}
                                            >
                                                <div className={`absolute w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${enabledMetrics[m.id] ? 'right-1' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                                            <span>Power</span>
                                            <span className={enabledMetrics[m.id] ? `text-slate-900 dark:text-white font-black` : ''}>{perfWeights[m.id]}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={perfWeights[m.id]}
                                            disabled={!enabledMetrics[m.id]}
                                            onChange={(e) => setPerfWeights((prev: any) => ({ ...prev, [m.id]: parseInt(e.target.value) }))}
                                            className={`w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-${m.color} disabled:opacity-20 transition-all`}
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
                            Full Batch Analysis
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};
