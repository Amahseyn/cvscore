"use client";

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Loader2, ArrowRight, ArrowLeft, Building2, Briefcase, Phone, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface RegisterProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}

type Step = 'archetype' | 'credentials' | 'profile';

export const Register: React.FC<RegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
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
                toast.success('Identity Synthesized Successfully');
                onSwitchToLogin();
            } else {
                const err = await resp.json();
                toast.error(err.detail || 'Synthesis Failed');
            }
        } catch (err) {
            toast.error('Identity Forge Offline');
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
                            <h2 className="text-4xl font-black tracking-tighter">Choose Archetype</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Select your professional role</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'recruiter', label: 'Recruiter', desc: 'Batch analyze and rank talent dossiers', icon: Briefcase },
                                { id: 'applier', label: 'Candidate', desc: 'Optimize your CV against neural metrics', icon: UserIcon }
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
                                    <ArrowRight className={`ml-auto w-5 h-5 transition-transform ${role === opt.id ? 'translate-x-1 text-brand-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'credentials':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter">Core Access</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establish Secure Credentials</p>
                        </div>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Neural Identifier (Email)"
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
                                    placeholder="Access Key (Password)"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep('archetype')}
                                className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (email && password) setStep('profile');
                                    else toast.warning('Credentials Required');
                                }}
                                className="flex-[2] py-5 bg-brand-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter">Professional Profile</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Finalize Account Customization</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group col-span-2">
                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Full Legal Name"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Organization"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Industry Sector"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                />
                            </div>
                            <div className="relative group col-span-2">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="tel"
                                    placeholder="Phone Identifier"
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep('credentials')}
                                className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-[2] py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        Forge Identity <CheckCircle2 className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full max-w-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-10 sm:p-14 rounded-[4rem] border border-white/20 dark:border-slate-800/50 shadow-2xl relative overflow-hidden">
            {/* Visual Accents */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>

            <div className="relative z-10 transition-all duration-500">
                {renderStep()}

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Already have an identity?{' '}
                        <button onClick={onSwitchToLogin} className="text-brand-500 hover:underline inline-flex items-center gap-1">
                            Access Neural Hub <ArrowRight className="w-3 h-3" />
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
