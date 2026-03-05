"use client";

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 left-6 z-[100] flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-500 font-black text-[10px] uppercase tracking-widest select-none backdrop-blur-2xl shadow-2xl hover:scale-105 active:scale-95
                bg-white/80 border-slate-200 text-slate-500 hover:bg-white hover:text-brand-600 hover:border-brand-500/50
                dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-brand-500 dark:hover:border-brand-500/30"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                {isDark ? (
                    <Sun className="w-5 h-5 text-amber-400 transition-all duration-500 rotate-0 scale-100" />
                ) : (
                    <Moon className="w-5 h-5 text-indigo-600 transition-all duration-500 rotate-0 scale-100" />
                )}
            </div>
            <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>
    );
};
