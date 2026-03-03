"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, role: string) => void;
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

        if (savedToken && savedRole && savedEmail) {
            setToken(savedToken);
            setUser({ email: savedEmail, role: savedRole });
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, role: string) => {
        // We might want to fetch /auth/me here to get the email accurately, 
        // but for now we'll assume the login response provides enough info or we'll update it later.
        setToken(newToken);
        localStorage.setItem('cvscore_token', newToken);
        localStorage.setItem('cvscore_role', role);
        // Temporary: assume email for now or update after /auth/me
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('cvscore_token');
        localStorage.removeItem('cvscore_role');
        localStorage.removeItem('cvscore_email');
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
