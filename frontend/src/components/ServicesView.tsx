import { Send, Calendar, CheckCircle2, Briefcase, Zap } from "lucide-react";
import { useTranslations } from 'next-intl';

export const ServicesView: React.FC = () => {
    const t = useTranslations('Services');

    return (
        <section id="services" className="py-24 px-10 bg-white dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-20">

                {/* Section Header */}
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                        {t('title')} <span className="text-brand-600">{t('subtitle')}</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                {/* Two Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* For Candidates */}
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 space-y-10 group hover:border-brand-500/30 transition-all duration-500">
                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-brand-600/10 flex items-center justify-center text-brand-600 transition-transform">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('forCandidates.title')}</h3>
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">{t('forCandidates.subtitle')}</p>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {[
                                t('forCandidates.items.i1'),
                                t('forCandidates.items.i2'),
                                t('forCandidates.items.i3'),
                                t('forCandidates.items.i4')
                            ].map((s, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {s}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-600 hover:text-white hover:border-brand-600 dark:hover:bg-brand-600 dark:hover:border-brand-600 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-95">
                            <Calendar className="w-4 h-4" /> {t('forCandidates.cta')}
                        </button>
                    </div>

                    {/* For Companies */}
                    <div className="bg-brand-500/5 dark:bg-slate-900 border border-brand-500/20 dark:border-slate-800 rounded-[3.5rem] p-12 space-y-10 relative overflow-hidden group hover:border-brand-500/40 dark:hover:border-brand-500/30 transition-all duration-500">
                        {/* glow accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/15 blur-[100px] pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-brand-600/10 flex items-center justify-center text-brand-600 border border-brand-600/20 transition-transform">
                                <Zap className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('forCompanies.title')}</h3>
                                <p className="text-xs font-black text-brand-500/70 dark:text-brand-400/60 uppercase tracking-widest italic">{t('forCompanies.subtitle')}</p>
                            </div>
                        </div>

                        <ul className="space-y-4 relative z-10">
                            {[
                                t('forCompanies.items.i1'),
                                t('forCompanies.items.i2'),
                                t('forCompanies.items.i3'),
                                t('forCompanies.items.i4')
                            ].map((s, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" /> {s}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-brand-600/30 flex items-center justify-center gap-3 relative z-10 active:scale-95">
                            <Send className="w-4 h-4" /> {t('forCompanies.cta')}
                        </button>
                    </div>
                </div>

                {/* Contact / Inquiry Form */}
                <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 lg:p-16 space-y-10">
                    <div className="text-center space-y-2">
                        <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{t('contact.title')}</h4>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {t('contact.subtitle')}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                type="text"
                                placeholder={t('contact.namePlaceholder')}
                                aria-label="Full Name"
                                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/40 outline-none w-full transition"
                            />
                            <input
                                type="email"
                                placeholder={t('contact.emailPlaceholder')}
                                aria-label="Email Address"
                                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/40 outline-none w-full transition"
                            />
                        </div>
                        <select
                            aria-label="Service you are interested in"
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/40 outline-none w-full appearance-none transition"
                        >
                            <option value="">{t('contact.helpOptions.label')}</option>
                            <option value="cv-rewrite">{t('contact.helpOptions.cv')}</option>
                            <option value="corporate">{t('contact.helpOptions.corporate')}</option>
                            <option value="custom-ai">{t('contact.helpOptions.ai')}</option>
                            <option value="other">{t('contact.helpOptions.other')}</option>
                        </select>
                        <textarea
                            placeholder={t('contact.messagePlaceholder')}
                            aria-label="Your message"
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/40 outline-none w-full h-32 resize-none transition"
                        />

                        <button
                            type="submit"
                            className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-brand-600/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Send className="w-4 h-4" /> {t('contact.submit')}
                        </button>
                    </form>
                </div>

            </div>
        </section>
    );
};
