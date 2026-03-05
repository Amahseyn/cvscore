"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { Shield, Sparkles, Zap, Target, BarChart3, Users, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function InfoPage() {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
    const { user, token, logout } = useAuth();

    return (
        <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-1000`}>
            <Navbar />

            <main className="max-w-7xl mx-auto pt-44 pb-20 px-6">
                <div className="text-center space-y-8 mb-24">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                        Intelligent CV Analysis <br /> <span className="text-brand-600">Reimagined</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-medium">
                        CVScore is not just an OCR tool. It's a comprehensive hiring assistant that uses advanced data extraction and scoring algorithms to help you find the perfect candidate.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { icon: <Sparkles />, title: "AI-Powered Extraction", desc: "Our engine intelligently identifies experience, education, and skills even from complex PDF layouts." },
                        { icon: <Target />, title: "Custom Scoring", desc: "Define your own criteria and weights to score candidates based on what matters most for the role." },
                        { icon: <Zap />, title: "Instant Comparisons", desc: "Compare multiple candidates side-by-side with structured data and visual metrics." },
                        { icon: <BarChart3 />, title: "Rich Analytics", desc: "Visualize candidate strengths and weaknesses with radar charts and growth potential metrics." },
                        { icon: <Users />, title: "Team Collaboration", desc: "Share shortlists and evaluation notes with your hiring team seamlessly." },
                        { icon: <Shield />, title: "Fair & Transparent", desc: "Reduce bias with consistent scoring criteria applied equally to every applicant." },
                    ].map((feature, i) => (i < 6 && (
                        <div key={i} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 p-10 space-y-6 hover:border-brand-500 transition-all duration-500 group">
                            <div className="w-16 h-16 rounded-2xl bg-brand-600/10 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {React.cloneElement(feature.icon as React.ReactElement, { className: "w-8 h-8" })}
                            </div>
                            <h3 className="text-2xl font-black">{feature.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    )))}
                </div>

                <div className="mt-32 bg-slate-900 dark:bg-slate-100 rounded-[4rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-600/10 pointer-events-none"></div>
                    <h2 className="text-4xl md:text-5xl font-black text-white dark:text-slate-900 relative z-10">Ready to transform your hiring?</h2>
                    <div className="flex flex-wrap justify-center gap-6 relative z-10">
                        <Button variant="primary" size="xl" onClick={() => window.location.href = '/register'}>Get Started Free</Button>
                        <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10 dark:border-slate-300 dark:text-slate-900 dark:hover:bg-slate-200">View Demo</Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
