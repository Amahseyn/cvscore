"use client";

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Building2, Briefcase, Phone, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/Button';
import { useTranslations, useLocale } from 'next-intl';

interface RegisterProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}

type Step = 'archetype' | 'credentials' | 'profile';

export const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
    const t = useTranslations('Auth.register');
    const locale = useLocale();
    const [step, setStep] = useState<Step>('archetype');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('recruiter');
    const [fullName, setFullName] = useState('');
    const [company, setCompany] = useState('');
    const [industry, setIndustry] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            email,
            password,
            role,
            full_name: fullName,
            company,
            industry,
            phone_number: phone
        };

        try {
            const resp = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                toast.success(t('success'));
                onSwitchToLogin();
            } else {
                const err = await resp.json();
                toast.error(err.detail || t('error'));
            }
        } catch (err) {
            toast.error(t('offline'));
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'archetype':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter">{t('archetype.title')}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('archetype.subtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'recruiter', label: t('archetype.recruiter.label'), desc: t('archetype.recruiter.desc'), icon: Briefcase },
                                { id: 'applier', label: t('archetype.candidate.label'), desc: t('archetype.candidate.desc'), icon: UserIcon }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                        setRole(opt.id);
                                        setStep('credentials');
                                    }}
                                    className={`group p-6 rounded-[2rem] border-2 text-left transition-all duration-300 flex items-center gap-6 ${role === opt.id
                                        ? 'bg-brand-500/5 border-brand-500 shadow-xl shadow-brand-500/10'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-brand-500/30'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role === opt.id ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-brand-500/10 group-hover:text-brand-500'
                                        }`}>
                                        <opt.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">{opt.label}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1">{opt.desc}</p>
                                    </div>
                                    <ArrowRight className={`ml-auto w-5 h-5 transition-transform ${role === opt.id ? 'translate-x-1 text-brand-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'} ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'credentials':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter">{t('credentials.title')}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('credentials.subtitle')}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder={t('credentials.email')}
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
                                    placeholder={t('credentials.password')}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                onClick={() => setStep('archetype')}
                                variant="outline"
                                className="flex-1"
                            >
                                <ArrowLeft className={`mr-2 w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} /> {t('back')}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    if (email && password) setStep('profile');
                                    else toast.warning(t('req'));
                                }}
                                variant="primary"
                                className="flex-[2] group"
                            >
                                {t('continue')} <ArrowRight className={`ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform ${locale === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                            </Button>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter">{t('profile.title')}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('profile.subtitle')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group col-span-2">
                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('profile.name')}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('profile.company')}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('profile.industry')}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                />
                            </div>
                            <div className="relative group col-span-2">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="tel"
                                    placeholder={t('profile.phone')}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                onClick={() => setStep('credentials')}
                                variant="outline"
                                className="flex-1"
                            >
                                <ArrowLeft className={`mr-2 w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} /> {t('back')}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                isLoading={loading}
                                variant="primary"
                                className="flex-[2]"
                            >
                                {t('profile.submit')} <CheckCircle2 className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    const handleGoogleLogin = () => {
        try {
            const params = new URLSearchParams({
                client_id: "996038162784-udrp3areaeda8o342cm8cij83uto0uu6.apps.googleusercontent.com",
                redirect_uri: `http://localhost:3000/${locale}`,
                response_type: "code",
                scope: "openid email profile",
                access_type: "offline",
                prompt: "select_account",
            });
            window.location.href = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
        } catch {
            toast.error(t('googleError'));
        }
    };

    return (
        <div className="w-full max-w-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-10 sm:p-14 rounded-[4rem] border border-white/20 dark:border-slate-800/50 shadow-2xl relative overflow-hidden">
            {/* Visual Accents */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>

            <div className="mt-8 space-y-6">
                <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    variant="white"
                    size="lg"
                    className="w-full dark:bg-slate-900 dark:border-slate-800"
                >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 mr-3 border border-slate-100">
                        <span className="text-base font-black text-brand-600">G</span>
                    </span>
                    {t('google')}
                </Button>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] px-4">
                    <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    <span>{t('flow')}</span>
                    <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>

                {renderStep()}

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    {t('alreadyAccount')}{' '}
                    <button onClick={onSwitchToLogin} className="text-brand-500 hover:text-brand-400 transition-colors inline-flex items-center gap-1">
                        {t('signIn')} <ArrowRight className={`w-3 h-3 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                </p>
            </div>
        </div>
    );
};
