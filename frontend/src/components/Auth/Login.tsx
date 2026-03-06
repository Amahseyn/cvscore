"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/Button';
import { useTranslations, useLocale } from 'next-intl';

interface LoginProps {
    onSuccess: () => void;
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
    const t = useTranslations('Auth.login');
    const locale = useLocale();
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
                authLogin(data.access_token, data.role, email, data.full_name, data.scans_remaining);
                toast.success("Access Granted");
                onSuccess();
            } else {
                const err = await resp.json();
                toast.error(err.detail || t('error'));
            }
        } catch (err) {
            toast.error(t('serverError'));
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
            toast.error(t('googleError'));
            setGoogleLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-12 sm:p-16 rounded-[4rem] border border-white/20 dark:border-slate-800/50 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
            {/* Background Decorative Elements */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse delay-1000"></div>

            <div className="relative z-10 space-y-12">
                <div className="text-center space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-brand-500/10 rounded-3xl border border-brand-500/20 shadow-inner">
                            <Cpu className="w-10 h-10 text-brand-500" />
                        </div>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder={t('email')}
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
                                placeholder={t('password')}
                                className="w-full pl-16 pr-6 py-6 bg-white/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:ring-8 focus:ring-brand-500/5 outline-none transition-all font-bold text-sm shadow-sm"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Button
                            type="button"
                            onClick={handleGoogleLogin}
                            isLoading={googleLoading}
                            disabled={loading}
                            variant="white"
                            size="lg"
                            className="w-full h-16 dark:bg-slate-800 dark:border-slate-700 dark:text-white !rounded-2xl"
                        >
                            {!googleLoading && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 mr-3 border border-slate-100">
                                    <span className="text-base font-black text-brand-600">G</span>
                                </span>
                            )}
                            {t('google')}
                        </Button>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] py-2 px-4">
                            <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            <span>{t('flow')}</span>
                            <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            disabled={googleLoading}
                            variant="primary"
                            size="lg"
                            className="w-full h-20 !rounded-[2.5rem] group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs">
                                {t('submit')} <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Button>
                    </div>
                </form>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-left">
                            {t('newHere')}{' '}
                            <button onClick={onSwitchToRegister} className="text-brand-500 hover:text-brand-400 transition-colors">
                                {t('createAccount')}
                            </button>
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{t('encrypted')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
