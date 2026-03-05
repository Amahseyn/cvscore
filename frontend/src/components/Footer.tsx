import { Shield, Github, Linkedin, Mail } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export const Footer: React.FC = () => {
    const t = useTranslations('Footer');
    const locale = useLocale();

    return (
        <footer className="py-20 px-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight italic">CVScore <span className="text-brand-600">PRO</span></h2>
                    </div>
                    <p className="text-sm font-medium text-slate-500 max-w-sm">
                        {t('description')}
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:text-brand-600 transition-colors border border-slate-100 dark:border-slate-800">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:text-brand-600 transition-colors border border-slate-100 dark:border-slate-800">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:text-brand-600 transition-colors border border-slate-100 dark:border-slate-800">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('platform')}</h4>
                    <ul className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <li><Link href={`/${locale}/dashboard`} className="hover:text-brand-600 transition-colors">{t('launchApp')}</Link></li>
                        <li><Link href={`/${locale}#services`} className="hover:text-brand-600 transition-colors">{t('neuralServices')}</Link></li>
                        <li><Link href={`/${locale}/login`} className="hover:text-brand-600 transition-colors">{t('identityVault')}</Link></li>
                        <li><a href="#" className="hover:text-brand-600 transition-colors">{t('securitySpecs')}</a></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('governance')}</h4>
                    <ul className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <li><a href="#" className="hover:text-brand-600 transition-colors">{t('privacyProtocol')}</a></li>
                        <li><a href="#" className="hover:text-brand-600 transition-colors">{t('tos')}</a></li>
                        <li><a href="#" className="hover:text-brand-600 transition-colors">{t('cookiePolicy')}</a></li>
                        <li><Link href={`/${locale}#about-developer`} className="hover:text-brand-600 transition-colors">{t('architectInfo')}</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-50 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                    {t('copyright')}
                </p>
                <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {t('sslSecure')}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span> {t('aiVerified')}
                    </div>
                </div>
            </div>
        </footer>
    );
};
