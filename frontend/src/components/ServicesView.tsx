import React from "react";
import { Send, Calendar, CheckCircle2, Star, Briefcase, Zap, Search } from "lucide-react";

export const ServicesView: React.FC = () => {
    return (
        <section id="services" className="py-24 px-10 bg-white dark:bg-slate-950 transition-colors">
            <div className="max-w-6xl mx-auto space-y-20">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Career & Recruitment <span className="text-brand-500">Services</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Beyond the AI – we provide human expertise to help individuals grow and companies scale.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* For Candidates */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 space-y-10 group hover:border-brand-500/30 transition-all duration-500">
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:rotate-6 transition-transform">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight">For Candidates</h3>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Personalized Career Support</p>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {[
                                "Comprehensive CV Rewrite & Branding",
                                "AI-Optimized Job Market Strategy",
                                "Mock Interview & Technical Coaching",
                                "One-on-One Job Search Assistance"
                            ].map((s, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {s}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all shadow-sm flex items-center justify-center gap-3">
                            <Calendar className="w-4 h-4" /> Schedule Free Consultation
                        </button>
                    </div>

                    {/* For Companies */}
                    <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 blur-[100px] pointer-events-none"></div>

                        <div className="space-y-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:-rotate-6 transition-transform">
                                <Zap className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight">For Companies</h3>
                                <p className="text-xs font-black text-white/40 uppercase tracking-widest italic">Strategic Talent Acquisition</p>
                            </div>
                        </div>

                        <ul className="space-y-4 relative z-10">
                            {[
                                "End-to-End Executive Recruitment",
                                "Custom AI Screening Implementation",
                                "Technical Team Assessment Frameworks",
                                "High-Volume Batch Processing Support"
                            ].map((s, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-white/80">
                                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" /> {s}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-5 bg-brand-500 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-3 relative z-10">
                            <Send className="w-4 h-4" /> Request Quote / Consultation
                        </button>
                    </div>
                </div>

                {/* Simplified Contact Form */}
                <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 lg:p-16 space-y-10">
                    <div className="text-center space-y-2">
                        <h4 className="text-2xl font-black tracking-tight">Direct Inquiry</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect with our human team</p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input type="text" placeholder="FULL NAME" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-500/10 outline-none w-full" />
                            <input type="email" placeholder="WORK EMAIL" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-500/10 outline-none w-full" />
                        </div>
                        <select className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-500/10 outline-none w-full appearance-none">
                            <option>SERVICE INTEREST: CV REWRITE</option>
                            <option>SERVICE INTEREST: CORPORATE RECRUITING</option>
                            <option>SERVICE INTEREST: CUSTOM AI FLOW</option>
                            <option>OTHER INQUIRY</option>
                        </select>
                        <textarea placeholder="PROJECT DETAILS / MESSAGE" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-500/10 outline-none w-full h-32 resize-none"></textarea>

                        <button type="submit" className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] transition-all shadow-xl">
                            Transmit Inquiry
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};
