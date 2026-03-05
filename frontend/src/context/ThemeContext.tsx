"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDark, setIsDark] = useState(false);

    // Initialize from localStorage or system preference
    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = localStorage.getItem("cvscore_dark");
        if (stored !== null) {
            const dark = stored === "true";
            setIsDark(dark);
            document.documentElement.classList.toggle("dark", dark);
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
            const applyPref = (e: MediaQueryListEvent | MediaQueryList) => {
                const dark = e.matches;
                setIsDark(dark);
                document.documentElement.classList.toggle("dark", dark);
                localStorage.setItem("cvscore_dark", String(dark));
            };

            applyPref(prefersDark);

            // Listen for changes
            prefersDark.addEventListener("change", applyPref);
            return () => prefersDark.removeEventListener("change", applyPref);
        }
    }, []);

    const applyTheme = (dark: boolean) => {
        setIsDark(dark);
        if (typeof window !== "undefined") {
            document.documentElement.classList.toggle("dark", dark);
            localStorage.setItem("cvscore_dark", String(dark));
        }
    };

    const toggleTheme = () => applyTheme(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme: applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
};

