"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Shield, LayoutDashboard, History, LogOut, Menu, X, Zap, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from 'next-intl';
import { Globe, ChevronDown } from "lucide-react";

export const Navbar = () => {
    const { user, token, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('Navbar');
    const locale = useLocale();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        router.push(`/${locale}`);
        toast.info(t('profile.logout'));
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇦🇪' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    ];

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    const switchLanguage = (code: string) => {
        // Persist choice via the cookie next-intl middleware reads
        document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
        const segments = pathname.split('/');
        segments[1] = code;
        router.push(segments.join('/'));
        setIsLangOpen(false);
    };

    const navLinks = [
        { name: t('links.services'), href: `/${locale}#services` },
        { name: t('links.pricing'), href: `/${locale}/pricing` },
        { name: t('links.info'), href: `/${locale}/info` },
        { name: t('links.contact'), href: `/${locale}/contact` },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 h-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm`}>
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between relative">
                {/* Logo Section */}
                <Link href={`/${locale}`} className="flex items-center gap-4 group shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/20 group-hover:scale-110 transition-transform duration-500">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black tracking-tighter leading-none">
                            {t('brand')} <span className="text-brand-600">PRO</span>
                        </h2>
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-1">{t('intel')}</span>
                    </div>
                </Link>

                {/* Centered Navigation Cluster */}
                <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${pathname === link.href
                                ? "text-brand-600"
                                : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-brand-500 transition-all duration-300 ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{currentLang.code}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isLangOpen && (
                            <>
                                <div className="fixed inset-0 z-[-1]" onClick={() => setIsLangOpen(false)}></div>
                                <div className="absolute top-full right-0 mt-3 w-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-300">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => switchLanguage(lang.code)}
                                            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group ${locale === lang.code ? 'bg-brand-500/10 text-brand-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm">{lang.flag}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{lang.name}</span>
                                            </div>
                                            {locale === lang.code && <div className="w-1 h-1 rounded-full bg-brand-600"></div>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {token ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-black text-xs">
                                    {user?.full_name ? user.full_name[0] : user?.email?.[0]}
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white truncate max-w-[120px] tracking-tight">
                                        {user?.full_name || user?.email}
                                    </p>
                                </div>
                                <Menu className={`w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-3 w-56 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl p-3 animate-in fade-in zoom-in duration-300">
                                        <div className="space-y-1">
                                            {pathname !== `/${locale}/dashboard` && (
                                                <button
                                                    onClick={() => { router.push(`/${locale}/dashboard`); setIsProfileOpen(false); }}
                                                    className="w-full flex items-center gap-3 p-3 text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-500/5 rounded-2xl transition-all group"
                                                >
                                                    <LayoutDashboard className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('profile.dashboard')}</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { router.push(`/${locale}/dashboard/history`); setIsProfileOpen(false); }}
                                                className="w-full flex items-center gap-3 p-3 text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-500/5 rounded-2xl transition-all group"
                                            >
                                                <History className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('profile.history')}</span>
                                            </button>
                                            <button
                                                onClick={() => { toggleTheme(); }}
                                                className="w-full flex items-center gap-3 p-3 text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-500/5 rounded-2xl transition-all group"
                                            >
                                                {isDark ? (
                                                    <Sun className="w-4.5 h-4.5 text-amber-500 group-hover:rotate-90 transition-transform duration-500" />
                                                ) : (
                                                    <Moon className="w-4.5 h-4.5 text-indigo-500 group-hover:-rotate-12 transition-transform duration-500" />
                                                )}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{isDark ? "Light Mode" : "Dark Mode"}</span>
                                            </button>
                                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2"></div>
                                            <button
                                                onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                                                className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all group"
                                            >
                                                <LogOut className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/80">{t('profile.logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/${locale}/login`}
                                className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-brand-600 transition-all"
                            >
                                {t('auth.login')}
                            </Link>
                            <Button
                                onClick={() => router.push(`/${locale}/register`)}
                                variant="primary"
                                size="sm"
                                className="!rounded-xl !px-5 !py-2.5 !text-[9px] shadow-lg shadow-brand-500/10"
                            >
                                {t('auth.getStarted')}
                            </Button>
                        </div>
                    )}
                    <button
                        className="md:hidden p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-6 space-y-6 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</p>
                                <div className="flex gap-2">
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => switchLanguage(lang.code)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${locale === lang.code ? 'bg-brand-500/20 text-brand-600 ring-1 ring-brand-500' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                        >
                                            {lang.flag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Theme</p>
                                <button
                                    onClick={() => toggleTheme()}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center gap-3 active:scale-95 transition-all"
                                >
                                    {isDark ? (
                                        <>
                                            <Sun className="w-4 h-4 text-amber-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Light</span>
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="w-4 h-4 text-indigo-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Dark</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {token ? (
                                <>
                                    <Link
                                        href={`/${locale}/dashboard`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600"
                                    >
                                        <LayoutDashboard className="w-5 h-5" /> {t('profile.dashboard')}
                                    </Link>
                                    <Link
                                        href={`/${locale}/dashboard?view=history`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600"
                                    >
                                        <History className="w-5 h-5" /> {t('profile.history')}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 text-sm font-bold text-rose-500"
                                    >
                                        <LogOut className="w-5 h-5" /> {t('profile.logout')}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => { router.push(`/${locale}/login`); setIsMenuOpen(false); }}
                                        variant="secondary"
                                        className="w-full text-[10px]"
                                    >
                                        {t('auth.login')}
                                    </Button>
                                    <Button
                                        onClick={() => { router.push(`/${locale}/register`); setIsMenuOpen(false); }}
                                        variant="primary"
                                        className="w-full text-[10px]"
                                    >
                                        {t('auth.getStarted')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
