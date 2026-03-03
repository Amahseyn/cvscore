"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Login } from '@/components/Auth/Login';
import { AdminDashboard } from '@/components/Auth/AdminDashboard';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const { user, loading, token } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Synchronizing Admin Cluster...</p>
            </div>
        );
    }

    // If not logged in or not an admin, show specialized login
    if (!token || user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full animate-pulse"></div>
                </div>

                <div className="mb-12 flex flex-col items-center gap-4 relative z-10">
                    <Link href="/" className="group flex items-center gap-2 px-6 py-2 bg-slate-900 border border-slate-800 rounded-full hover:border-brand-500 transition-all">
                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">Return to Base</span>
                    </Link>
                    <div className="flex items-center gap-4 mt-8">
                        <Shield className="w-12 h-12 text-rose-500" />
                        <h1 className="text-4xl font-black tracking-tighter text-white">Security Gateway</h1>
                    </div>
                </div>

                <Login
                    onSuccess={() => { window.location.reload(); }}
                    onSwitchToRegister={() => { }}
                />

                <p className="mt-12 text-[10px] font-black text-rose-500/50 uppercase tracking-[0.4em] relative z-10 animate-pulse">
                    Restricted Neural Sector • Authorization Required
                </p>
            </div>
        );
    }

    // If logged in as admin, show dashboard
    return (
        <div className="min-h-screen bg-slate-950">
            {/* The AdminDashboard currently has its own overlay and fixed positioning. 
                We'll wrap it and pass a dummy onClose or modify it if needed. */}
            <AdminDashboard onClose={() => { window.location.href = '/'; }} />
        </div>
    );
}
