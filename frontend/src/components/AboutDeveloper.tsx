import { Github, Linkedin, Mail, Code2 } from "lucide-react";
import { useTranslations } from 'next-intl';

export const AboutDeveloper: React.FC = () => {
    const t = useTranslations('AboutDeveloper');

    return (
        <section id="about-developer" className="py-24 px-10 bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full">
                                <Code2 className="w-4 h-4 text-brand-500" />
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em]">{t('badge')}</span>
                            </div>
                            <h2 className="text-4xl font-black tracking-tight leading-tight">
                                {t('title')}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                {t('description')}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm active:scale-95"
                            >
                                <Github className="w-5 h-5" /> GitHub
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm active:scale-95"
                            >
                                <Linkedin className="w-5 h-5" /> LinkedIn
                            </a>
                            <a
                                href="mailto:dev@cvscore.com"
                                className="flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                <Mail className="w-5 h-5" /> {t('contact')}
                            </a>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-brand-600 to-amber-500 rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                        <div className="bg-white/80 dark:bg-slate-950/80 rounded-[2.5rem] p-10 border border-slate-200/50 dark:border-brand-500/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">{t('philosophyTitle')}</h4>
                                    <p className="text-xl font-black tracking-tight leading-snug text-slate-900 dark:text-slate-50 italic">
                                        {t('philosophy')}
                                    </p>
                                </div>
                                <div className="flex gap-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{t('stack')}</p>
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">FastAPI / Next.js / OpenAI</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{t('status')}</p>
                                        <p className="text-xs font-black text-emerald-500 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                            {t('statusText')}
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
