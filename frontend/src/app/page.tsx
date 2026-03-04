"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sun, Moon, ArrowLeft, ArrowRight, Shield, Users, UserCircle, History, X, Search, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// Components
import { Sidebar } from "@/components/Sidebar";
import { Leaderboard } from "@/components/Leaderboard";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { DossierView } from "@/components/DossierView";
import { ComparisonView } from "@/components/ComparisonView";
import { Login } from "@/components/Auth/Login";
import { Register } from "@/components/Auth/Register";
import { AdminDashboard } from "@/components/Auth/AdminDashboard";
import { AboutDeveloper } from "@/components/AboutDeveloper";
import { ServicesView } from "@/components/ServicesView";
import { Footer } from "@/components/Footer"; // Assuming a footer component exists or will be added

const PRESETS = {
    balanced: {
        weights: { impact_score: 20, technical_depth_score: 20, soft_skills_score: 20, growth_potential_score: 15, stability_score: 15, readability_score: 10 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    technical: {
        weights: { impact_score: 15, technical_depth_score: 45, soft_skills_score: 10, growth_potential_score: 15, stability_score: 10, readability_score: 5 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    },
    leadership: {
        weights: { impact_score: 30, technical_depth_score: 10, soft_skills_score: 40, growth_potential_score: 10, stability_score: 5, readability_score: 5 },
        enabled: { impact_score: true, technical_depth_score: true, soft_skills_score: true, growth_potential_score: true, stability_score: true, readability_score: true }
    }
};

export default function Home() {
    const { user, token, logout, login: authLogin } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    // The redirect is removed to allow authenticated users to view the landing page
    // useEffect(() => {
    //     if (token) {
    //         router.push("/dashboard");
    //     }
    // }, [token, router]);

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
                authLogin(data.access_token, data.role, data.email, data.full_name);
                toast.success("Signed in with Google");
                router.replace("/dashboard");
            } catch (e) {
                toast.error("Unable to complete Google sign-in");
            }
        };

        exchange();
    }, [token, authLogin, router]);

    return (
        <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-1000 relative overflow-hidden`}>
            {/* Fixed Header for Landing Page */}
            <nav className="fixed top-0 left-0 right-0 h-24 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl z-50 flex items-center px-10">
                <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight">CVScore <span className="text-brand-500">PRO</span></h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav className="hidden lg:flex items-center gap-8 mr-12 border-r border-slate-200/50 dark:border-slate-800/50 pr-8">
                            <a href="#services" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-500 transition-colors">Services</a>
                            <a href="#about-developer" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-500 transition-colors">About</a>
                        </nav>
                        <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm hover:shadow-brand-500/10 transition-all mr-2">
                            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                        </button>

                        <div className="flex items-center gap-3">
                            {token ? (
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={() => window.location.href = "http://localhost:8000/auth/google"}
                                        className="hidden md:flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        <Users className="w-4 h-4 text-brand-500" /> Sign in with Google
                                    </button>
                                    <Link href="/login" className="px-5 py-3 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-brand-500 transition-all">Login</Link>
                                    <Link href="/register" className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Join</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Background accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-500/10 blur-[150px] rounded-full animate-pulse transition-all duration-1000"></div>
                <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse delay-1000 transition-all duration-1000"></div>
            </div>

            <div className="max-w-7xl w-full pt-44 pb-20 space-y-20 text-center animate-in fade-in zoom-in duration-1000 relative z-10 mx-auto">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full mb-4">
                        <Shield className="w-4 h-4 text-brand-500" />
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">Shortlist better hires, faster</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight select-none px-4">
                        Structured, fair CV review for modern hiring teams
                    </h1>
                    <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-300 max-w-2xl mx-auto px-4">
                        CVScore helps you turn a pile of CVs into a clear, defensible shortlist – with consistent scoring,
                        transparent criteria, and interview-ready notes for every candidate.
                    </p>
                    <div className="pt-8">
                        <Link
                            href="/dashboard"
                            className="px-12 py-6 bg-brand-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-500/40 hover:bg-brand-600 hover:scale-105 transition-all inline-block"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                    <Link
                        href="/login"
                        className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] border border-slate-200/50 dark:border-slate-800/50 p-12 flex flex-col items-center gap-8 hover:border-brand-500 transition-all duration-500 shadow-2xl hover:shadow-brand-500/20 hover:-translate-y-4"
                    >
                        <div className="w-24 h-24 rounded-[2rem] bg-brand-500 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-brand-500/40">
                            <Users className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tight">For hiring teams</h3>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Upload CVs, rank candidates, share shortlists</p>
                        </div>
                    </Link>

                    <Link
                        href="/login"
                        className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] border border-slate-200/50 dark:border-slate-800/50 p-12 flex flex-col items-center gap-8 hover:border-brand-500 transition-all duration-500 shadow-2xl hover:shadow-brand-500/20 hover:-translate-y-4"
                    >
                        <div className="w-24 h-24 rounded-[2rem] bg-brand-500 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-brand-500/40">
                            <UserCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">For candidates</h3>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">See how your CV measures up</p>
                        </div>
                    </Link>

                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] border border-slate-200/50 dark:border-slate-800/50 p-12 flex flex-col items-center justify-center gap-8 shadow-2xl relative overflow-hidden group hover:-translate-y-4 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent"></div>
                        <div className="space-y-2 relative z-10 text-center">
                            <div className="p-3 bg-brand-500/10 rounded-2xl w-fit mx-auto mb-4 border border-brand-500/20 group-hover:rotate-12 transition-transform">
                                <History className="w-6 h-6 text-brand-500" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">Search your history</h3>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Reopen previous evaluations any time</p>
                        </div>
                        <div className="flex flex-col gap-4 w-full relative z-10 mt-4">
                            <Link
                                href="/login"
                                className="group/btn bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20"
                            >
                                Login Identity <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/register"
                                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-slate-200 dark:hover:bg-slate-700 flex justify-center items-center"
                            >
                                Forge Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Product Story / How It Works */}
                <section className="max-w-5xl mx-auto mt-24 space-y-12 px-4">
                    <div className="space-y-3 text-center">
                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">
                            How it works
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                            From raw CVs to a shortlist you trust
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                            Upload PDF resumes, tune what “great” looks like for this role, and let the engine
                            extract structured data, score candidates, and surface interview-ready shortlists in seconds.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 text-left space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                01 • Ingest
                            </p>
                            <h3 className="text-xl font-black">Upload your CVs</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Drag-and-drop one or many PDF resumes. CVScore normalises layouts, runs OCR when needed,
                                and converts each profile into a consistent internal format.
                            </p>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 text-left space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                02 • Align
                            </p>
                            <h3 className="text-xl font-black">Define what “great” means</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Paste your job description, pick a profile preset, and dial in the scoring weights
                                across impact, depth, communication, stability, and more.
                            </p>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 text-left space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                03 • Decide
                            </p>
                            <h3 className="text-xl font-black">Rank, compare, and brief</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Instantly see ranked candidates, compare profiles side-by-side, and generate structured
                                interview guides that keep every conversation consistent.
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
