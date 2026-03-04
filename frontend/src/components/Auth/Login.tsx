"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'react-toastify';

interface LoginProps {
    onSuccess: () => void;
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
    const { login: authLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const resp = await fetch('http://localhost:8000/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (resp.ok) {
                const data = await resp.json();
                authLogin(data.access_token, data.role, email, data.full_name);
                toast.success('Signed in successfully');
                onSuccess();
            } else {
                const err = await resp.json();
                toast.error(err.detail || 'Unable to sign in');
            }
        } catch (err) {
            toast.error('Unable to reach the server');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        try {
            const params = new URLSearchParams({
                client_id: "996038162784-udrp3areaeda8o342cm8cij83uto0uu6.apps.googleusercontent.com",
                redirect_uri: "http://localhost:3000",
                response_type: "code",
                scope: "openid email profile",
                access_type: "offline",
                prompt: "select_account",
            });
            window.location.href = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
        } catch {
            toast.error("Unable to initiate Google sign-in");
            setGoogleLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-10 sm:p-14 rounded-[4rem] border border-white/20 dark:border-slate-800/50 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
            {/* Background Decorative Elements */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>

            <div className="relative z-10 space-y-10">
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20">
                            <Cpu className="w-10 h-10 text-brand-500" />
                        </div>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter">Welcome back</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="Email"
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-brand-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Establish Neural Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                            <span>Or continue with</span>
                            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading || googleLoading}
                            className="w-full py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-[0.3em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {googleLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white">
                                        <span className="text-base font-black text-[#4285F4]">G</span>
                                    </span>
                                    Sign in with Google
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">
                            New here?{' '}
                            <button onClick={onSwitchToRegister} className="text-brand-500 hover:text-brand-400 transition-colors">
                                Create an account
                            </button>
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Biometric Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
