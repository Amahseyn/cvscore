"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Users, UserPlus, Shield, Star, Briefcase, User as UserIcon,
    X, Search, MoreVertical, Trash2, ArrowRight, Loader2,
    LogOut, History, FileText, Calendar, ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

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
    const { token, logout, user } = useAuth();
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
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

    // History View State
    const [selectedUserHistory, setSelectedUserHistory] = useState<any[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const t = useTranslations('Admin');

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

    const handleChangeRole = async (userId: number, role: string) => {
        setUpdatingUserId(userId);
        try {
            const resp = await fetch(`http://localhost:8000/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role })
            });
            if (resp.ok) {
                toast.success('Role updated');
                fetchUsers();
            } else {
                const err = await resp.json();
                toast.error(err.detail || 'Failed to update role');
            }
        } catch (err) {
            toast.error('Admin Command Cluster Offline');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId: number, email: string) => {
        if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return;
        setDeletingUserId(userId);
        try {
            const resp = await fetch(`http://localhost:8000/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (resp.ok) {
                toast.success('User deleted');
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                const err = await resp.json();
                toast.error(err.detail || 'Failed to delete user');
            }
        } catch (err) {
            toast.error('Admin Command Cluster Offline');
        } finally {
            setDeletingUserId(null);
        }
    };

    const fetchUserHistory = async (targetUser: User) => {
        setSelectedUser(targetUser);
        setShowHistoryModal(true);
        setHistoryLoading(true);
        try {
            const resp = await fetch(`http://localhost:8000/admin/users/${targetUser.id}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setSelectedUserHistory(data);
            }
        } catch (err) {
            toast.error('Failed to retrieve user archives');
        } finally {
            setHistoryLoading(false);
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
        <div className="relative pt-32 pb-20 px-6 sm:px-10 min-h-screen bg-slate-950/10 flex flex-col items-center" suppressHydrationWarning>
            <div className={`bg-white dark:bg-slate-900 w-full max-w-6xl min-h-[80vh] rounded-[3rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500 mx-auto`}>
                {/* Header */}
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                            <Shield className="w-10 h-10 text-brand-500" /> Command Cluster
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.5em]">Neural Tier Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-8 py-4 bg-brand-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3"
                        >
                            <UserPlus className="w-4 h-4" /> Synthesize User
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
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${user.role === 'admin' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                            user.role === 'vip' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                                user.role === 'recruiter' ? 'bg-brand-50 border-brand-100 text-brand-500' :
                                                    'bg-slate-50 border-slate-100 text-slate-500'
                                            }`}>
                                            {getRoleIcon(user.role)}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{user.role}</span>
                                        </div>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            disabled={updatingUserId === user.id}
                                            className="mt-1 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                                        >
                                            <option value="applier">Free Trial • Candidate</option>
                                            <option value="recruiter">Free Tier • Recruiter</option>
                                            <option value="vip">VIP • High Bandwidth</option>
                                            <option value="admin">Admin</option>
                                        </select>
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
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => fetchUserHistory(user)}
                                            className="p-3 bg-brand-500/10 text-brand-500 rounded-xl hover:bg-brand-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <History className="w-4 h-4" /> {t('viewHistory')}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                            disabled={deletingUserId === user.id}
                                            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {deletingUserId === user.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter flex items-center gap-4">
                                    <FileText className="w-8 h-8 text-brand-500" /> {t('userVault')}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1">
                                    {selectedUser?.email} • {t('archiveSubtitle')}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {historyLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center animate-pulse">Scanning Archive...</p>
                                </div>
                            ) : selectedUserHistory.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                                        <History className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('noHistory')}</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {selectedUserHistory.map((item) => (
                                        <div key={item.id} className="group bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:bg-brand-500 group-hover:text-white transition-all">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-slate-900 dark:text-white">{item.full_name || item.filename}</h4>
                                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                                                        {item.score !== null && (
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-500/10 text-brand-500 rounded-full">
                                                                Neural Score: {item.score}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter line-clamp-1">{item.seniority_level || 'General Profile'}</p>
                                                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.years_of_experience ? `${item.years_of_experience}y Exp` : 'No Exp Listed'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex justify-end">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-95 transition-all"
                            >
                                {t('backToCluster')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
