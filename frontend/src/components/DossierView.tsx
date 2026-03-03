import { CheckCircle2, AlertCircle, TrendingUp, Mail, Phone, Copy, Loader2, Cpu, Sparkles } from "lucide-react";
import { RadarAnalytics } from "./RadarAnalytics";

interface DossierViewProps {
    currentResult: any;
    loading: boolean;
    copyToClipboard: () => void;
    onGenerateInterview: () => void;
    interviewScript: any | null;
    isGeneratingInterview: boolean;
    score?: number;
}

export const DossierView: React.FC<DossierViewProps> = ({
    currentResult,
    loading,
    copyToClipboard,
    onGenerateInterview,
    interviewScript,
    isGeneratingInterview,
    score
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col min-h-[700px] overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/40 dark:bg-slate-900/50">
                <div className="flex gap-10 items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-600 border-b-4 border-brand-500 pb-2">Intelligence Dossier</span>
                    {currentResult && !loading && score !== undefined && (
                        <div className="flex items-center gap-2 bg-brand-500/10 px-4 py-1.5 rounded-2xl border border-brand-500/20 mb-2">
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Match Score:</span>
                            <span className="text-xl font-black text-brand-500 tracking-tighter">{score}%</span>
                        </div>
                    )}
                    {currentResult && !loading && (
                        <button
                            onClick={onGenerateInterview}
                            disabled={isGeneratingInterview}
                            className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all pb-2 flex items-center gap-2 ${interviewScript ? 'text-indigo-600 border-b-4 border-indigo-500' : 'text-slate-400 hover:text-indigo-500 hover:border-b-4 hover:border-indigo-500/30'}`}
                        >
                            {isGeneratingInterview ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Sparkles className="w-3 h-3" />
                            )}
                            Interview Guide
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {currentResult?.text && (
                        <button
                            onClick={copyToClipboard}
                            className="p-3 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-brand-500 shadow-sm border border-slate-100 dark:border-slate-800"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-12 overflow-auto">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-10">
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
                            <Loader2 className="w-12 h-12 text-brand-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-widest mb-3">SYNTHESIZING...</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Cross-Referencing Neural Artifacts</p>
                        </div>
                    </div>
                ) : currentResult ? (
                    <div className="space-y-12">
                        {currentResult.ai_data && (
                            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-brand-500/30">
                                                <span className="text-3xl font-black text-white">{currentResult.ai_data.full_name?.[0] || 'D'}</span>
                                            </div>
                                            <div className="pt-2">
                                                <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-none mb-4">{currentResult.ai_data.full_name || "Unidentified Dossier"}</h2>
                                                <div className="flex flex-wrap gap-4 mb-6">
                                                    {currentResult.ai_data.email && <span className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400"><Mail className="w-4 h-4 text-brand-500" /> {currentResult.ai_data.email}</span>}
                                                    {currentResult.ai_data.phone && <span className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400"><Phone className="w-4 h-4 text-brand-500" /> {currentResult.ai_data.phone}</span>}
                                                </div>
                                                {currentResult.ai_score && (
                                                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Capabilities Signature</p>
                                                        <RadarAnalytics metrics={currentResult.ai_score.performance_metrics} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Recruiter Verdict</h4>
                                                <span className="text-[9px] font-black text-white/40 uppercase">Classified Analysis</span>
                                            </div>
                                            <p className="text-xl font-black text-white mb-6 leading-relaxed">
                                                "{currentResult.ai_score.recruiter_analysis?.verdict || "No verdict issues."}"
                                            </p>
                                            <div className="mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70 text-white">Career Advantage</p>
                                                <p className="text-sm font-bold text-white/90">{currentResult.ai_score.candidate_analysis?.career_growth || "Advise: Focus on leadership roles."}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 group/card">
                                                <h4 className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-8">
                                                    <TrendingUp className="w-5 h-5 group-hover/card:scale-110 transition-transform" /> Strategic Advantages
                                                </h4>
                                                <ul className="space-y-5">
                                                    {(currentResult.ai_score.candidate_analysis?.resume_tips || currentResult.ai_score.pros).map((tip: string, i: number) => (
                                                        <li key={i} className="flex gap-5 text-[15px] font-bold text-slate-700 dark:text-slate-300 items-start group/item">
                                                            <div className="shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xs font-black border border-emerald-200 dark:border-emerald-500/30 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all shadow-sm">{i + 1}</div>
                                                            <span className="pt-1">{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Detailed Recruiter Intel */}
                                        <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                                            <div>
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Executive Summary</h5>
                                                <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                                                    {currentResult.ai_score.recruiter_analysis?.executive_summary}
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Technical Fit</h5>
                                                <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                                                    {currentResult.ai_score.recruiter_analysis?.technical_fit}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-rose-50/50 dark:bg-rose-500/5 p-8 rounded-[2rem] border border-rose-100 dark:border-rose-500/10 shadow-xl">
                                            <h4 className="flex items-center gap-2 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.3em] mb-8">
                                                <AlertCircle className="w-5 h-5" /> Critical Gaps & Risks
                                            </h4>
                                            <div className="space-y-4">
                                                {(currentResult.ai_score.recruiter_analysis?.hiring_risks || currentResult.ai_score.cons || []).map((topic: string, i: number) => (
                                                    <div key={i} className="p-4 bg-white dark:bg-slate-950 rounded-[1.25rem] border border-rose-50 dark:border-rose-500/10 text-[13px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-4 shadow-sm hover:border-rose-500/30 transition-all">
                                                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                                        {topic}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interview Script View */}
                        {interviewScript && (
                            <div className="space-y-8 animate-in slide-in-from-right-10 fade-in duration-700">
                                <div className="bg-indigo-950/90 p-10 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl relative overflow-hidden group/interview">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover/interview:bg-indigo-500/20 transition-all"></div>
                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                                            <Sparkles className="w-5 h-5" /> Context-Aware Screening Script
                                        </h3>
                                        <div className="bg-indigo-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Targeted Phase 1</div>
                                    </div>

                                    <p className="text-xl font-black text-white italic mb-10 leading-relaxed border-l-4 border-indigo-500 pl-6">
                                        "{interviewScript.intro}"
                                    </p>

                                    <div className="space-y-4">
                                        {interviewScript.questions.map((q: any, i: number) => (
                                            <div key={i} className="bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/5 transition-all group/q">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded-lg">{q.category}</span>
                                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">Signal Target</span>
                                                </div>
                                                <p className="text-md font-bold text-white mb-4 group-hover/q:text-indigo-200 transition-colors">
                                                    {q.question}
                                                </p>
                                                <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-white/5 text-[11px] font-medium text-slate-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                    {q.expected_signal}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 text-center">
                                        <p className="text-sm font-bold text-indigo-200 italic">"{interviewScript.closing}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Raw Data Stream */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Raw Data Stream</h4>
                            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                <pre className="text-[13px] font-medium leading-relaxed font-mono whitespace-pre-wrap text-slate-600 dark:text-slate-400 opacity-80">
                                    {currentResult.text}
                                </pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6">
                        <Cpu className="w-20 h-20 opacity-10 animate-pulse" />
                        <div className="text-center">
                            <h3 className="text-xl font-black uppercase tracking-widest opacity-30">Neural Hub Standby</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-20">Awaiting Batch Deployment</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
