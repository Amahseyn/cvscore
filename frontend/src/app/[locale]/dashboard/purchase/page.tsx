"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Zap, Shield, Crown, Check, ArrowRight, Sparkles,
    Star, Rocket, Layout, Clock, Infinity
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PurchasePage() {
    const t = useTranslations('Pricing');
    const [cycle, setCycle] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

    const getPrice = (base: string) => {
        return base;
    };

    const plans = [
        {
            id: 'basic',
            icon: <Layout className="w-8 h-8 text-slate-400" />,
            key: 'basic',
            popular: false,
            gradient: 'from-slate-200/10 to-slate-300/5',
            border: 'border-slate-100 dark:border-slate-800'
        },
        {
            id: 'weekly',
            icon: <Clock className="w-8 h-8 text-brand-400" />,
            key: 'weekly',
            popular: false,
            gradient: 'from-slate-500/10 to-slate-500/5',
            border: 'border-slate-200 dark:border-slate-800'
        },
        {
            id: 'monthly',
            icon: <Rocket className="w-8 h-8 text-amber-500" />,
            key: 'monthly',
            popular: true,
            gradient: 'from-brand-500/10 to-brand-600/5',
            border: 'border-brand-500/30 dark:border-brand-500/20'
        },
        {
            id: 'yearly',
            icon: <Crown className="w-8 h-8 text-rose-500" />,
            key: 'yearly',
            popular: false,
            gradient: 'from-rose-500/10 to-rose-600/5',
            border: 'border-rose-200 dark:border-rose-800'
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 sm:px-10 bg-slate-50/30 dark:bg-slate-950/20 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-40 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] animate-in slide-in-from-bottom duration-500">
                        <Sparkles className="w-4 h-4" /> {t('title')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white max-w-3xl mx-auto leading-[0.9]">
                        Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-rose-500">Neural Capability</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Mission / Transparency Section */}
                <div className="max-w-3xl mx-auto mb-20 p-8 rounded-[2.5rem] bg-brand-500/5 border border-brand-500/10 text-center animate-in fade-in duration-1000">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-600 mb-3 flex items-center justify-center gap-3">
                        <Shield className="w-4 h-4" /> {t('mission.title')}
                    </h2>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{t('mission.text')}"
                    </p>
                </div>

                {/* Cycle Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="p-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center relative">
                        {['weekly', 'monthly', 'yearly'].map((c) => (
                            <button
                                key={c}
                                onClick={() => setCycle(c as any)}
                                className={`relative z-10 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${cycle === c
                                    ? 'text-white'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                    }`}
                            >
                                {t(`cycles.${c}`)}
                                {c === 'yearly' && (
                                    <span className="absolute -top-3 -right-3 px-2 py-1 bg-rose-500 text-white text-[8px] rounded-full shadow-lg font-black whitespace-nowrap">
                                        {t('saveYear')}
                                    </span>
                                )}
                            </button>
                        ))}
                        {/* Animated Slider Backing */}
                        <div
                            className="absolute bg-brand-500 rounded-[1.5rem] h-[calc(100%-8px)] transition-all duration-500 ease-out shadow-lg shadow-brand-500/20"
                            style={{
                                left: cycle === 'weekly' ? '4px' : cycle === 'monthly' ? 'calc(33.33% + 1px)' : 'calc(66.66% - 1.5px)',
                                width: 'calc(33.33% - 2.5px)'
                            }}
                        />
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative group bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[3rem] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col ${plan.border} ${plan.popular ? 'lg:-translate-y-4 ring-2 ring-brand-500/20' : ''
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
                                            / {t(`cycles.${cycle}`)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {(t.raw(`plans.${plan.key}.features`) as string[]).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-4 group/item">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-500/20 group-hover/item:bg-brand-500 group-hover/item:text-white transition-all">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    if (plan.id === 'basic') {
                                        toast.info("Current core active. No synchronization required.");
                                    } else {
                                        toast.info("Neural link established. Redirecting to stripe...");
                                    }
                                }}
                                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${plan.id === 'basic'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                                    : plan.popular
                                        ? 'bg-brand-500 text-white shadow-brand-500/20 hover:bg-brand-600'
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/10'
                                    }`}
                            >
                                {plan.id === 'basic' ? "Active Core" : t('cta')} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Secure Trust Badge */}
                <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Neural Direct</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
