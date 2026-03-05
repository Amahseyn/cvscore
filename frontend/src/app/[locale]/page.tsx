"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRight, Shield, History, Upload, Zap, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Navbar } from "@/components/Navbar";
import { AboutDeveloper } from "@/components/AboutDeveloper";
import { ServicesView } from "@/components/ServicesView";
import { Footer } from "@/components/Footer";
import { useTranslations, useLocale } from 'next-intl';

export default function Home() {
    const t = useTranslations('Home');
    const locale = useLocale();
    const { user, token, logout, login: authLogin } = useAuth();
    const router = useRouter();

    // Handle Google OAuth redirect (authorization code on root URL)
    useEffect(() => {
        if (token) return;
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (!code) return;

        const exchange = async () => {
            try {
                const resp = await fetch("http://localhost:8000/auth/google/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    toast.error(err.detail || "Google authentication failed");
                    return;
                }
                const data = await resp.json();
                authLogin(data.access_token, data.role, data.email, data.full_name, data.scans_remaining);
                toast.success("Signed in with Google");
                router.replace(`/${locale}/dashboard`);
            } catch (e) {
                toast.error("Unable to complete Google sign-in");
            }
        };

        exchange();
    }, [token, authLogin, router]);

    const { isDark } = useTheme();

    const [scanFile, setScanFile] = React.useState<File | null>(null);
    const [scanLoading, setScanLoading] = React.useState(false);
    const [scanResult, setScanResult] = React.useState<any>(null);

    const handleQuickScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!token) {
            toast.info(t('engine.lockedDesc'));
            router.push(`/${locale}/register`);
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        setScanFile(file);
        setScanLoading(true);
        setScanResult(null);

        const formData = new FormData();
        formData.append("files", file);
        formData.append("do_ai_score", "true");
        formData.append("do_ai_extract", "true");

        try {
            const resp = await fetch("http://localhost:8000/extract", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });
            const data = await resp.json();

            if (!resp.ok) {
                toast.error(data.detail || "Scan failed.");
                return;
            }

            if (data.results?.[0]) {
                setScanResult(data.results[0]);
                toast.success("Neural scan complete!");

                if (user && user.role !== 'admin' && user.scans_remaining !== undefined) {
                    const newScans = Math.max(0, user.scans_remaining - 1);
                    authLogin(token, user.role, user.email, user.full_name, newScans);
                }

                // Redirect to dashboard after a short delay so the user sees the success state
                setTimeout(() => {
                    router.push(`/${locale}/dashboard`);
                }, 1500);
            }
        } catch (error) {
            toast.error("Scan failed. Is the neural engine online?");
        } finally {
            setScanLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-1000 relative overflow-hidden">

            {/* Background accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-500/10 blur-[150px] rounded-full animate-pulse transition-all duration-1000"></div>
                <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse delay-1000 transition-all duration-1000"></div>
            </div>

            {/* Hero Section with Split Layout */}
            <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                {/* Left Column: Value Prop */}
                <div className="text-left space-y-10 animate-in fade-in slide-in-from-left-10 duration-1000">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full">
                            <Zap className="w-4 h-4 text-brand-500" />
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">{t('hero.badge')}</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] select-none">
                            {t('hero.titlePart1')} <br /> <span className="text-brand-600 italic">{t('hero.titlePart2')}</span> {t('hero.titlePart3')}
                        </h1>
                        <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-300 max-w-xl leading-relaxed">
                            {t('hero.description')}
                        </p>
                    </div>

                </div>

                {/* Right Column: Hero interactive upload area */}
                <div className="relative animate-in fade-in slide-in-from-right-10 duration-[1200ms]">
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative overflow-hidden group">
                        {/* Interactive Background Accents */}
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-500/10 blur-[100px] rounded-full group-hover:bg-brand-500/20 transition-all duration-1000"></div>
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full"></div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black tracking-tight">{t('engine.title')}</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('engine.subtitle')}</p>
                                </div>
                                {token && (
                                    <div className="px-5 py-2.5 bg-brand-500/10 rounded-2xl border border-brand-500/20">
                                        <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest">{t('engine.balance')}</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{user?.scans_remaining ?? 0} {t('engine.scans')}</p>
                                    </div>
                                )}
                            </div>

                            {!token ? (
                                <div className="py-12 space-y-10 text-center">
                                    <div className="space-y-8">
                                        <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-700 mx-auto">
                                            <Shield className="w-12 h-12 opacity-50" />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-2xl font-black tracking-tight">{t('engine.locked')}</h4>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed text-center">{t('engine.lockedDesc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full gap-4 items-center">
                                        <Button
                                            variant="primary"
                                            onClick={() => router.push(`/${locale}/register`)}
                                            className="w-full h-16 text-md font-black uppercase tracking-widest"
                                        >
                                            {t('engine.unlockBtn')}
                                        </Button>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">{t('engine.unlockSub')}</p>
                                    </div>
                                </div>
                            ) : scanLoading ? (
                                /* ── LOADING PANEL ── */
                                <div className="py-8 space-y-8 animate-in fade-in duration-500">
                                    {/* Spinner ring */}
                                    <div className="flex justify-center">
                                        <div className="relative w-28 h-28">
                                            {/* outer slow ring */}
                                            <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
                                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" style={{ animationDuration: '1.2s' }} />
                                            {/* inner fast ring */}
                                            <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{ animationDuration: '0.7s', animationDirection: 'reverse' }} />
                                            {/* centre icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-brand-500 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <div className="text-center space-y-1">
                                        <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white animate-pulse">
                                            {t('engine.active')}
                                        </p>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            {scanFile?.name ?? ''}
                                        </p>
                                    </div>

                                    {/* Animated stage bars */}
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Parsing artifact', delay: '0ms', width: '100%' },
                                            { label: 'Extracting neural data', delay: '300ms', width: '85%' },
                                            { label: 'Scoring alignment', delay: '600ms', width: '60%' },
                                        ].map(({ label, delay, width }) => (
                                            <div key={label} className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                                                    <Zap className="w-3 h-3 text-brand-500 animate-pulse" style={{ animationDelay: delay }} />
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full animate-pulse"
                                                        style={{ width, animationDelay: delay, animationDuration: '1.5s' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : !scanResult ? (
                                <label className="block w-full">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleQuickScan}
                                        disabled={scanLoading}
                                    />
                                    <div className="border-2 border-dashed rounded-[3.5rem] p-20 flex flex-col items-center gap-8 transition-all cursor-pointer bg-white/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-white dark:hover:bg-slate-900/50">
                                        <div className="w-24 h-24 rounded-3xl bg-brand-600 flex items-center justify-center text-white shadow-2xl shadow-brand-600/30 group-hover:scale-110 transition-transform duration-500">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-xl font-black text-slate-800 dark:text-white">
                                                {t('engine.dropCV')}
                                            </p>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">
                                                {t('engine.awaiting')}
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            ) : (
                                <div className="space-y-10 animate-in fade-in zoom-in duration-500">
                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative group/dossier">
                                        <div className="absolute top-6 right-6">
                                            <div className="w-20 h-20 rounded-full border-4 border-brand-500/20 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                                                <span className="text-3xl font-black text-brand-600 italic">{scanResult.ai_score?.total_score || 0}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dossier.title')}</p>
                                                <h4 className="text-3xl font-black tracking-tighter">{scanResult.ai_data?.full_name || t('dossier.anonymous')}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{scanResult.ai_data?.seniority_level}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{scanResult.ai_data?.years_of_experience}y {t('dossier.exp')}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dossier.observation')}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                                                    "{scanResult.ai_score?.overall_feedback?.substring(0, 180)}..."
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" className="flex-1 h-16 text-sm font-black uppercase tracking-widest" onClick={() => setScanResult(null)}>{t('dossier.newAnalysis')}</Button>
                                        <Button variant="primary" className="flex-1 h-16 text-sm font-black uppercase tracking-widest" onClick={() => router.push(`/${locale}/dashboard`)}>{t('dossier.universalDashboard')}</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full pb-20 space-y-20 text-center animate-in fade-in slide-in-from-bottom-5 duration-1000 relative z-10 mx-auto">
                {token && (
                    <div className="max-w-4xl mx-auto px-4 mt-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] border border-slate-200/50 dark:border-slate-800/50 p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
                                <div className="p-5 bg-brand-500/10 rounded-3xl border border-brand-500/20 group-hover:rotate-12 transition-transform duration-500">
                                    <History className="w-10 h-10 text-brand-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black tracking-tight">{t('history.title')}</h3>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed text-center md:text-left">{t('history.subtitle')}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 w-full md:w-auto relative z-10">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => router.push(`/${locale}/dashboard`)}
                                    className="gap-3 min-w-[200px]"
                                >
                                    {t('history.btn')} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Story / How It Works */}
                <section className="max-w-5xl mx-auto mt-24 space-y-12 px-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-24 text-center">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em] text-center">
                            {t('howItWorks.badge')}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center">
                            {t('howItWorks.title')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-medium text-center">
                            {t('howItWorks.description')}
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 text-left space-y-3 text-center md:text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center md:text-left">
                                {t('howItWorks.step1.badge')}
                            </p>
                            <h3 className="text-xl font-black">{t('howItWorks.step1.title')}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t('howItWorks.step1.desc')}
                            </p>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 text-left space-y-3 text-center md:text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center md:text-left">
                                {t('howItWorks.step2.badge')}
                            </p>
                            <h3 className="text-xl font-black">{t('howItWorks.step2.title')}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t('howItWorks.step2.desc')}
                            </p>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 text-left space-y-3 text-center md:text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center md:text-left">
                                {t('howItWorks.step3.badge')}
                            </p>
                            <h3 className="text-xl font-black">{t('howItWorks.step3.title')}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t('howItWorks.step3.desc')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* New Sections */}
                <ServicesView />
                <AboutDeveloper />

                <Footer />
            </div>
            <ToastContainer position="bottom-right" theme={isDark ? "dark" : "light"} />
        </div>
    );
}
