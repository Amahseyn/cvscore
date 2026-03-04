"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    email: string;
    role: string;
    full_name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, role: string, email: string, full_name?: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('cvscore_token');
        const savedRole = localStorage.getItem('cvscore_role');
        const savedEmail = localStorage.getItem('cvscore_email');
        const savedName = localStorage.getItem('cvscore_full_name');

        if (savedToken && savedRole && savedEmail) {
            setToken(savedToken);
            setUser({ email: savedEmail, role: savedRole, full_name: savedName || undefined });
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, role: string, email: string, full_name?: string) => {
        setToken(newToken);
        setUser({ email, role, full_name });
        localStorage.setItem('cvscore_token', newToken);
        localStorage.setItem('cvscore_role', role);
        localStorage.setItem('cvscore_email', email);
        if (full_name) localStorage.setItem('cvscore_full_name', full_name);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('cvscore_token');
        localStorage.removeItem('cvscore_role');
        localStorage.removeItem('cvscore_email');
        localStorage.removeItem('cvscore_full_name');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
