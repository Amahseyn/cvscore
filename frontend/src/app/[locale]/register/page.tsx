"use client";

import React from 'react';
import { Register } from '@/components/Auth/Register';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useTranslations, useLocale } from 'next-intl';

export default function RegisterPage() {
    const t = useTranslations('Auth.register');
    const locale = useLocale();
    const { token } = useAuth();
    const router = useRouter();

    // If already logged in, redirect
    React.useEffect(() => {
        if (token) {
            router.push(`/${locale}/dashboard`);
        }
    }, [token, router, locale]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000">
            <Navbar />

            {/* Neural Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full animate-pulse transition-all duration-1000"></div>
                <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-1000 transition-all duration-1000"></div>
            </div>

            <Register
                onSuccess={() => router.push(`/${locale}/login`)}
                onSwitchToLogin={() => router.push(`/${locale}/login`)}
            />

            <p className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] relative z-10">
                {t('footer')}
            </p>
        </div>
    );
}
