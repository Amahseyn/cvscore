"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import {
    Check, ArrowRight, Zap, Rocket, Crown, Layout,
    Shield, HelpCircle, ChevronDown, ChevronUp, Sparkles,
    Coins, Zap as ZapIcon, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/Button";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function PricingPage() {
    const t = useTranslations('Pricing');
    const locale = useLocale();
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const plans = [
        {
            id: 'basic',
            icon: <Layout className="w-8 h-8 text-slate-400" />,
            key: 'basic',
            popular: false,
            gradient: 'from-slate-200/10 to-slate-200/5',
            border: 'border-slate-100 dark:border-slate-800',
            cycle: 'demo'
        },
        {
            id: 'weekly',
            icon: <ZapIcon className="w-8 h-8 text-brand-400" />,
            key: 'weekly',
            popular: false,
            gradient: 'from-brand-400/10 to-brand-500/5',
            border: 'border-slate-200 dark:border-slate-800',
            cycle: 'weekly'
        },
        {
            id: 'monthly',
            icon: <Rocket className="w-8 h-8 text-indigo-500" />,
            key: 'monthly',
            popular: true,
            gradient: 'from-indigo-500/10 to-indigo-600/5',
            border: 'border-brand-500/30 dark:border-brand-500/20',
            cycle: 'monthly'
        },
        {
            id: 'yearly',
            icon: <Crown className="w-8 h-8 text-amber-500" />,
            key: 'yearly',
            popular: false,
            gradient: 'from-amber-500/10 to-amber-600/5',
            border: 'border-slate-200 dark:border-slate-800',
            cycle: 'yearly'
        }
    ];

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 selection:bg-brand-500/30">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 sm:px-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
                </div>

                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 rounded-full border border-brand-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Pricing 2.0 • Grid Comparison</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Select Your <br />
                        <span className="text-brand-600 italic">Plan</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        Direct transparency. No toggles, just clear value across every cycle.
                    </p>
                </div>
            </section>

            {/* Pricing Grid */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`group bg-white dark:bg-slate-900 p-10 rounded-[4rem] border transition-all duration-500 hover:scale-[1.02] flex flex-col relative ${plan.border} ${plan.popular ? 'lg:translate-y-4 shadow-2xl shadow-brand-500/10 ring-2 ring-brand-500/5' : 'shadow-sm'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl">
                                    {t('popular')}
                                </div>
                            )}

                            <div className="mb-10">
                                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center bg-gradient-to-br ${plan.gradient} mb-6 group-hover:rotate-12 transition-transform duration-500`}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-2xl font-black tracking-tight mb-2">{t(`plans.${plan.key}.name`)}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tighter">${t(`plans.${plan.key}.price`)}</span>
                                    {plan.id !== 'basic' && (
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">/ {t(`cycles.${plan.cycle}`)}</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-5 mb-12 flex-1">
                                {(t.raw(`plans.${plan.key}.features`) as string[]).map((f, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-brand-600" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => router.push(`/${locale}/${plan.id === 'basic' ? 'register' : 'dashboard/purchase'}`)}
                                className={`w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${plan.id === 'basic'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200'
                                    : plan.popular
                                        ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20'
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}
                            >
                                {plan.id === 'basic' ? t('cycles.demo') : t('cta')} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-slate-50 dark:bg-slate-900/30 py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter">{t('faq.title')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">{t('faq.subtitle')}</p>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-300 ${openFaq === i ? 'border-brand-500/30 shadow-xl' : 'border-slate-100 dark:border-slate-800'}`}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-10 py-8 flex items-center justify-between text-left"
                                >
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{t(`faq.q${i}.q`)}</span>
                                    {openFaq === i ? <ChevronUp className="w-5 h-5 text-brand-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </button>
                                {openFaq === i && (
                                    <div className="px-10 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-brand-500/20 pl-6">
                                            {t(`faq.q${i}.a`)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Support / Mission Footer Teaser */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-10 h-10 text-brand-500" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter">{t('mission.title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                        "{t('mission.text')}"
                    </p>
                    <div className="pt-6">
                        <Button variant="outline" onClick={() => router.push(`/${locale}/contact`)}>
                            Contact Support Cluster
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
