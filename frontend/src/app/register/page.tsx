"use client";

import React from 'react';
import { Register } from '@/components/Auth/Register';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterPage() {
    const { token } = useAuth();
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();

    // If already logged in, redirect
    React.useEffect(() => {
        if (token) {
            router.push('/dashboard');
        }
    }, [token, router]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-lg hover:shadow-brand-500/20 transition-all backdrop-blur-xl flex items-center justify-center"
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 text-amber-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-indigo-500" />
                    )}
                </button>
            </div>

            {/* Neural Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full animate-pulse transition-all duration-1000"></div>
                <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-1000 transition-all duration-1000"></div>
            </div>

            <div className="mb-12 relative z-10">
                <Link href="/" className="group flex items-center gap-2 px-6 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-full hover:border-brand-500 transition-all">
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white">Return to Base</span>
                </Link>
            </div>

            <Register
                onSuccess={() => router.push('/login')}
                onSwitchToLogin={() => router.push('/login')}
            />

            <p className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] relative z-10">
                Identity Synthesis Mode • CVScore PRO v2.5
            </p>
        </div>
    );
}
