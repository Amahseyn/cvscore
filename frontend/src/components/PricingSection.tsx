"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import {
    Check,
    ArrowRight,
    Zap,
    Rocket,
    Crown,
    Layout,
    Shield
} from "lucide-react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const PricingSection: React.FC = () => {
    const t = useTranslations('Pricing');
    const locale = useLocale();
    const router = useRouter();
    const plans = [
        {
            id: 'basic',
            icon: <Layout className="w-8 h-8 text-slate-400" />,
            key: 'basic',
            popular: false,
            gradient: 'from-slate-200/10 to-slate-300/5',
            border: 'border-slate-100 dark:border-slate-800',
            cycle: 'demo'
        },
        {
            id: 'weekly',
            icon: <Zap className="w-8 h-8 text-brand-400" />,
            key: 'weekly',
            popular: false,
            gradient: 'from-slate-500/10 to-slate-500/5',
            border: 'border-slate-200 dark:border-slate-800',
            cycle: 'weekly'
        },
        {
            id: 'monthly',
            icon: <Rocket className="w-8 h-8 text-amber-500" />,
            key: 'monthly',
            popular: true,
            gradient: 'from-brand-500/10 to-brand-600/5',
            border: 'border-brand-500/30 dark:border-brand-500/20',
            cycle: 'monthly'
        },
        {
            id: 'yearly',
            icon: <Crown className="w-8 h-8 text-rose-500" />,
            key: 'yearly',
            popular: false,
            gradient: 'from-rose-500/10 to-rose-600/5',
            border: 'border-rose-200 dark:border-rose-800',
            cycle: 'yearly'
        }
    ];

    return (
        <section id="pricing" className="py-24 px-6 sm:px-10 bg-white dark:bg-slate-950 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
                        Choose Your <span className="text-brand-600 italic">Plan</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                        Transparent pricing designed to help teams and individuals grow fairly.
                    </p>
                </div>

                {/* Mission / Transparency Section */}
                <div className="max-w-3xl mx-auto mb-16 p-6 md:p-10 rounded-[3rem] bg-brand-500/5 border border-brand-500/10 text-center">
                    <div className="flex items-center justify-center gap-3 text-brand-600 mb-4">
                        <Shield className="w-5 h-5" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">{t('mission.title')}</h4>
                    </div>
                    <p className="text-sm md:text-md font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{t('mission.text')}"
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col ${plan.border} ${plan.popular ? 'lg:translate-y-4 ring-2 ring-brand-500/10' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-brand-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-brand-500/30">
                                    {t('popular')}
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${plan.gradient} mb-6`}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-2">
                                    {t(`plans.${plan.key}.name`)}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black tracking-tighter">
                                        ${t(`plans.${plan.key}.price`)}
                                    </span>
                                    {plan.id !== 'basic' && (
                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                            / {t(`cycles.${plan.cycle}`)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {(t.raw(`plans.${plan.key}.features`) as string[]).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-brand-600" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    if (plan.id === 'basic') {
                                        router.push(`/${locale}/register`);
                                    } else {
                                        router.push(`/${locale}/dashboard/purchase`);
                                    }
                                }}
                                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${plan.id === 'basic'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    : plan.popular
                                        ? 'bg-brand-500 text-white shadow-brand-500/20 hover:bg-brand-600'
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                                    }`}
                            >
                                {plan.id === 'basic' ? t('cycles.demo') : t('cta')} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
