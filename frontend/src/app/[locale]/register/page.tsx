"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { UserPlus, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

export default function RegisterPage() {
    const t = useTranslations('Auth.register');
    const locale = useLocale();
    const router = useRouter();
    const { login: authLogin, token } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect
    React.useEffect(() => {
        if (token) {
            router.push(`/${locale}/dashboard`);
        }
    }, [token, router, locale]);

    const handleQuickRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            email,
            password,
            role: 'recruiter',
            full_name: email.split('@')[0],
        };

        try {
            const resp = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                const formData = new URLSearchParams();
                formData.append('username', email);
                formData.append('password', password);

                const loginResp = await fetch('http://localhost:8000/auth/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });

                if (loginResp.ok) {
                    const data = await loginResp.json();
                    authLogin(data.access_token, data.role, email, data.full_name, data.scans_remaining);
                    toast.success("Welcome aboard!");
                    router.push(`/${locale}/dashboard`);
                }
            } else {
                const err = await resp.json();
                toast.error(err.detail || "Registration failed");
            }
        } catch (err) {
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000">
            <Navbar />

            {/* Premium Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-500/10 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 sm:p-16 rounded-[4rem] border border-white/20 dark:border-slate-800/50 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center space-y-4 mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20 shadow-inner">
                            <UserPlus className="w-10 h-10 text-brand-500" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Quick Start
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] max-w-xs mx-auto">
                        Neural Access Initialization
                    </p>
                </div>

                <form onSubmit={handleQuickRegister} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="Business Email"
                                className="w-full pl-16 pr-6 py-6 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:ring-8 focus:ring-brand-500/5 outline-none transition-all font-bold text-sm shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                className="w-full pl-16 pr-6 py-6 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:ring-8 focus:ring-brand-500/5 outline-none transition-all font-bold text-sm shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-6">
                        <Button
                            type="submit"
                            isLoading={loading}
                            variant="primary"
                            size="lg"
                            className="w-full h-20 !rounded-[2.5rem] group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs">
                                Create My Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Button>

                        <div className="flex items-center justify-center gap-6 pt-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Safe & Encrypted</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">3 Free Scans Included</span>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Already part of the neural link?{' '}
                        <button
                            onClick={() => router.push(`/${locale}/login`)}
                            className="text-brand-500 hover:text-brand-400 transition-colors"
                        >
                            Sign In Here
                        </button>
                    </p>
                </div>
            </div>

            <p className="mt-12 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                CVScore PRO • Neural Assessment System v2.0
            </p>
        </div>
    );
}
