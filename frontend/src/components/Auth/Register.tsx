"use client";

import React, { useState } from 'react';
import {
    UserPlus, Mail, Lock, Loader2, ArrowRight, ArrowLeft,
    Building2, Briefcase, Phone, User as UserIcon, CheckCircle2,
    Coins, LayoutGrid, Sparkles, Trophy
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Button } from '@/components/Button';
import { useTranslations, useLocale } from 'next-intl';

interface RegisterProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}

type Step = 'archetype' | 'credentials' | 'profile' | 'onboarding' | 'dossier' | 'reward';

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
    const [referralSource, setReferralSource] = useState('');
    const [usageIntent, setUsageIntent] = useState('');
    const [companySize, setCompanySize] = useState('');
    const [primarySkill, setPrimarySkill] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin, token: authToken } = useAuth();

    // Step 5: Candidate Dossier State
    const [preferredWorkingModel, setPreferredWorkingModel] = useState('remote');
    const [salaryMin, setSalaryMin] = useState(50000);
    const [salaryMax, setSalaryMax] = useState(120000);
    const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
    const [tempRole, setTempRole] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [tempSkill, setTempSkill] = useState('');
    const [careerGoals, setCareerGoals] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            email, password, role,
            full_name: fullName, company, industry,
            phone_number: phone, referral_source: referralSource,
            usage_intent: usageIntent, company_size: companySize,
            primary_skill: primarySkill
        };

        try {
            // 1. Register
            const resp = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const err = await resp.json();
                toast.error(err.detail || t('error'));
                setLoading(false);
                return;
            }

            // 2. Auto-Login to get token for Phase 3 Reward
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const loginResp = await fetch('http://localhost:8000/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (loginResp.ok) {
                const loginData = await loginResp.json();
                authLogin(loginData.access_token, loginData.role, email, loginData.full_name, loginData.scans_remaining);

                if (role === 'applier') {
                    setStep('dossier');
                    toast.success(t('success'));
                } else {
                    toast.success(t('success'));
                    onSuccess();
                }
            } else {
                // If auto-login fails, just go to login page (fallback)
                toast.success(t('success'));
                onSwitchToLogin();
            }
        } catch (err) {
            toast.error(t('offline'));
        } finally {
            setLoading(false);
        }
    };

    const handleDossierSubmit = async () => {
        setLoading(true);
        const dossierPayload = {
            preferred_working_model: preferredWorkingModel,
            salary_min: salaryMin,
            salary_max: salaryMax,
            preferred_roles: preferredRoles,
            skills: skills,
            career_goals: careerGoals
        };

        try {
            const resp = await fetch('http://localhost:8000/users/me/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cvscore_token')}`
                },
                body: JSON.stringify(dossierPayload)
            });

            if (resp.ok) {
                const refreshedUser = await resp.json();
                authLogin(
                    localStorage.getItem('cvscore_token')!,
                    refreshedUser.role,
                    refreshedUser.email,
                    refreshedUser.full_name,
                    refreshedUser.scans_remaining
                );
                setStep('reward');
            } else {
                toast.error("Unable to save dossier");
            }
        } catch (e) {
            toast.error("Connection failed");
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
                                onClick={() => {
                                    if (fullName) setStep('onboarding');
                                    else toast.warning(t('req'));
                                }}
                                variant="primary"
                                className="flex-[2] group"
                            >
                                {t('continue')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                );

            case 'onboarding':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter">{t('profile.onboarding.title')}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('profile.onboarding.subtitle')}</p>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.onboarding.referral')}</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={referralSource}
                                    onChange={(e) => setReferralSource(e.target.value)}
                                >
                                    <option value="">Select source...</option>
                                    <option value="linkedin">{t('profile.onboarding.sources.linkedin')}</option>
                                    <option value="friend">{t('profile.onboarding.sources.friend')}</option>
                                    <option value="search">{t('profile.onboarding.sources.search')}</option>
                                    <option value="other">{t('profile.onboarding.sources.other')}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.onboarding.intent')}</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={usageIntent}
                                    onChange={(e) => setUsageIntent(e.target.value)}
                                >
                                    <option value="">Select intent...</option>
                                    <option value="hiring">{t('profile.onboarding.intents.hiring')}</option>
                                    <option value="seeking">{t('profile.onboarding.intents.seeking')}</option>
                                    <option value="research">{t('profile.onboarding.intents.research')}</option>
                                </select>
                            </div>

                            {role === 'recruiter' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.onboarding.companySize')}</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                        value={companySize}
                                        onChange={(e) => setCompanySize(e.target.value)}
                                    >
                                        <option value="">Select size...</option>
                                        <option value="1-10">{t('profile.onboarding.sizes.1-10')}</option>
                                        <option value="11-50">{t('profile.onboarding.sizes.11-50')}</option>
                                        <option value="51-200">{t('profile.onboarding.sizes.51-200')}</option>
                                        <option value="201+">{t('profile.onboarding.sizes.201+')}</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.onboarding.skill')}</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Frontend Engineering"
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                        value={primarySkill}
                                        onChange={(e) => setPrimarySkill(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                onClick={() => setStep('profile')}
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
                                className="flex-[2] group"
                            >
                                {role === 'applier' ? t('continue') : t('profile.submit')}
                                {role === 'applier' ? <ArrowRight className="ml-2 w-4 h-4" /> : <CheckCircle2 className="ml-2 w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                );

            case 'dossier':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tighter">{t('profile.dossier.title')}</h2>
                                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">{t('profile.dossier.subtitle')}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20 animate-pulse">
                                <Coins className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-amber-600 uppercase">{t('dossier.reward.locked')}</span>
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Working Model */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.dossier.workingModel')}</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['remote', 'onsite', 'hybrid'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setPreferredWorkingModel(m)}
                                            className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all ${preferredWorkingModel === m
                                                ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-brand-500/30'}`}
                                        >
                                            {t(`profile.dossier.models.${m}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Salary Slider (Simplified with inputs for now for robustness) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.dossier.salary')}</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Min</p>
                                        <input
                                            type="number"
                                            value={salaryMin}
                                            onChange={(e) => setSalaryMin(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Max</p>
                                        <input
                                            type="number"
                                            value={salaryMax}
                                            onChange={(e) => setSalaryMax(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Roles (Tags) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.dossier.roles')}</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {preferredRoles.map(r => (
                                        <span key={r} onClick={() => setPreferredRoles(prev => prev.filter(i => i !== r))} className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-brand-500/20 transition-colors">
                                            {r} ×
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add role (Press Enter)..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs"
                                    value={tempRole}
                                    onChange={(e) => setTempRole(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && tempRole) {
                                            setPreferredRoles(prev => [...prev, tempRole]);
                                            setTempRole('');
                                        }
                                    }}
                                />
                            </div>

                            {/* Skills (Tags) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.dossier.skills')}</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {skills.map(s => (
                                        <span key={s} onClick={() => setSkills(prev => prev.filter(i => i !== s))} className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-indigo-500/20 transition-colors">
                                            {s} ×
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Add skill (Press Enter)..."
                                    className="w-full px-4 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl font-bold text-xs"
                                    value={tempSkill}
                                    onChange={(e) => setTempSkill(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && tempSkill) {
                                            setSkills(prev => [...prev, tempSkill]);
                                            setTempSkill('');
                                        }
                                    }}
                                />
                            </div>

                            {/* Career Goals */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('profile.dossier.goals')}</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs min-h-[100px]"
                                    placeholder="Where do you see yourself in 2 years?"
                                    value={careerGoals}
                                    onChange={(e) => setCareerGoals(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleDossierSubmit}
                                isLoading={loading}
                                className="w-full h-16 group"
                                variant="primary"
                            >
                                {t('profile.dossier.submit')} <Trophy className="ml-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </Button>
                        </div>
                    </div>
                );

            case 'reward':
                return (
                    <div className="py-10 text-center space-y-10 animate-in zoom-in duration-700">
                        <div className="relative mx-auto w-40 h-40">
                            <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full animate-pulse"></div>
                            <div className="relative z-10 w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-white/20">
                                <Trophy className="w-20 h-20 text-white drop-shadow-lg" />
                            </div>
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-800">
                                <Sparkles className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black tracking-tighter">{t('profile.dossier.reward.title')}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                                {t('profile.dossier.reward.desc')}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button variant="primary" size="lg" className="w-full h-16" onClick={onSuccess}>
                                {t('profile.dossier.reward.btn')}
                            </Button>
                            <div className="flex items-center justify-center gap-2">
                                <div className="px-3 py-1 bg-brand-500/10 rounded-lg border border-brand-500/20">
                                    <span className="text-[10px] font-black text-brand-500 uppercase">{t('dossier.systemStatus')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const handleGoogleLogin = () => {
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
