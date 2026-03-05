"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { Shield, Mail, MessageSquare, MapPin, Send, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
    const { user, token, logout } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd handle the form submission here
        alert("Message sent! (Simulation)");
    };

    return (
        <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-1000`}>
            <Navbar />

            <main className="max-w-7xl mx-auto pt-44 pb-20 px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Get in <span className="text-brand-600">touch</span></h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                                Have questions about CVScore? Our team is here to help you optimize your hiring process.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: <Mail />, title: "Email us", detail: "hello@cvscore.pro" },
                                { icon: <MessageSquare />, title: "Chat with sales", detail: "Available Mon-Fri, 9am-6pm" },
                                { icon: <MapPin />, title: "Visit us", detail: "Global Headquarters, Tech City" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-600/10 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">{item.title}</h4>
                                        <p className="text-xl font-bold">{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 p-10 md:p-12 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Name</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-colors" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                                    <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-colors" placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-colors" placeholder="How can we help?" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</label>
                                <textarea rows={4} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-colors resize-none" placeholder="Your message here..." required></textarea>
                            </div>
                            <Button type="submit" variant="primary" size="xl" className="w-full gap-3">
                                <Send className="w-4 h-4" /> Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
