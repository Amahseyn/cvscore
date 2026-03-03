"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, UserPlus, Shield, Star, Briefcase, User as UserIcon, X, Search, MoreVertical, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface User {
    id: number;
    email: string;
    role: string;
    full_name: string | null;
    company: string | null;
}

interface AdminDashboardProps {
    onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // New User State
    const [newEmail, setNewEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newRole, setNewRole] = useState('recruiter');
    const [newName, setNewName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const resp = await fetch('http://localhost:8000/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setUsers(data);
            }
        } catch (err) {
            toast.error('Failed to fetch user database');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const resp = await fetch('http://localhost:8000/admin/users/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: newEmail,
                    password: newPass,
                    role: newRole,
                    full_name: newName
                })
            });
            if (resp.ok) {
                toast.success('User Synthesized Successfully');
                setShowAddModal(false);
                fetchUsers();
                // Reset form
                setNewEmail(''); setNewPass(''); setNewName('');
            } else {
                const err = await resp.json();
                toast.error(err.detail || 'Synthesis Failed');
            }
        } catch (err) {
            toast.error('Admin Command Cluster Offline');
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-rose-500" />;
            case 'vip': return <Star className="w-4 h-4 text-amber-500" />;
            case 'recruiter': return <Briefcase className="w-4 h-4 text-brand-500" />;
            default: return <UserIcon className="w-4 h-4 text-slate-400" />;
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.full_name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className={onClose ? "fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-10" : "min-h-screen bg-slate-950 p-6 sm:p-10"}>
            {onClose && <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>}

            <div className={`bg-white dark:bg-slate-900 w-full max-w-6xl ${onClose ? 'h-[85vh]' : 'min-h-[90vh]'} rounded-[3rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500 mx-auto`}>
                {/* Header */}
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                            <Shield className="w-10 h-10 text-brand-500" /> Command Cluster
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2">Neural Tier & Access Management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-8 py-4 bg-brand-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3"
                        >
                            <UserPlus className="w-4 h-4" /> Synthesize User
                        </button>
                        <button onClick={onClose} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Subheader / Search */}
                <div className="p-8 bg-white dark:bg-slate-950/30 flex items-center gap-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search identities by name or neural ID..."
                            className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                        <div className="flex -space-x-3">
                            {users.slice(0, 5).map(u => (
                                <div key={u.id} className="w-10 h-10 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white uppercase">
                                    {u.email[0]}
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                            {users.length} Identities Active
                        </p>
                    </div>
                </div>

                {/* Main Content / Table */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-900/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Synchronizing Registry...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="col-span-full py-32 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">No Identities Found in this sector</p>
                            </div>
                        ) : filteredUsers.map(user => (
                            <div key={user.id} className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-brand-500/10 flex items-center justify-center text-xl font-black text-brand-500 uppercase overflow-hidden">
                                        {user.full_name ? user.full_name[0] : user.email[0]}
                                    </div>
                                    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${user.role === 'admin' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                        user.role === 'vip' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                            user.role === 'recruiter' ? 'bg-brand-50 border-brand-100 text-brand-500' :
                                                'bg-slate-50 border-slate-100 text-slate-500'
                                        }`}>
                                        {getRoleIcon(user.role)}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{user.role}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight">{user.full_name || 'Anonymous Identity'}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Organization</p>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{user.company || 'Private Sector'}</p>
                                    </div>
                                    <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add User Modal Overlay */}
                {showAddModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
                            <div className="text-center mb-10">
                                <UserPlus className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                                <h3 className="text-3xl font-black tracking-tighter">Synthesize Identity</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manual Access Injection</p>
                            </div>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <input
                                    type="email" required placeholder="Neural ID (Email)"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                />
                                <input
                                    type="password" required placeholder="Access Code"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={newPass} onChange={e => setNewPass(e.target.value)}
                                />
                                <input
                                    type="text" placeholder="Full Name"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={newName} onChange={e => setNewName(e.target.value)}
                                />
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-bold text-sm"
                                    value={newRole} onChange={e => setNewRole(e.target.value)}
                                >
                                    <option value="recruiter">Recruiter</option>
                                    <option value="vip">VIP (High Bandwidth)</option>
                                    <option value="applier">Candidate</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button" onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit" disabled={submitting}
                                        className="flex-[2] py-4 bg-brand-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Complete Injection <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
