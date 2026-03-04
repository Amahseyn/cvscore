import React from "react";
import { Github, Linkedin, Mail, ExternalLink, Code2 } from "lucide-react";

export const AboutDeveloper: React.FC = () => {
    return (
        <section id="about-developer" className="py-24 px-10 bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full">
                                <Code2 className="w-4 h-4 text-brand-500" />
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">Architect & Visionary</span>
                            </div>
                            <h2 className="text-4xl font-black tracking-tight leading-tight">
                                Built for the <span className="text-brand-500">Pragmatic</span> Recruiter
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                I am a software architect passionate about bridging the gap between cutting-edge AI and everyday productivity. CVScore PRO was born out of the frustration of manual resume screening – designed to be fast, fair, and defensible.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all shadow-sm"
                            >
                                <Github className="w-5 h-5" /> GitHub
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all shadow-sm"
                            >
                                <Linkedin className="w-5 h-5" /> LinkedIn
                            </a>
                            <a
                                href="mailto:dev@cvscore.com"
                                className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                            >
                                <Mail className="w-5 h-5" /> Contact
                            </a>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500 to-indigo-500 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                        <div className="bg-white dark:bg-slate-850 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest italic">Core Philosophy</h4>
                                    <p className="text-xl font-black tracking-tight leading-snug text-slate-800 dark:text-slate-100">
                                        "Software should reduce cognitive load, not add to it. If it doesn't solve a problem in 10 seconds, it's irrelevant."
                                    </p>
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stack</p>
                                        <p className="text-xs font-bold">FastAPI / Next.js / OpenAI</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                        <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 self-center">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Open for SaaS Consulting
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
