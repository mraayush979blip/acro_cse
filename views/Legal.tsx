import React, { useState } from 'react';
import { Book, ShieldCheck, ArrowLeft, ExternalLink, Languages, MessageSquare, Scale, Users, LayoutDashboard, Database, Smartphone, Zap } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const LegalView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'manual' | 'license'>('manual');
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const navigate = useNavigate();

    const renderManualItem = (icon: any, title: string, desc: string) => (
        <div className="flex gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors group">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-indigo-600 flex flex-col items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-1">{title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );

    const renderLicenseRule = (num: number, title: string, desc: string, isStrict = false) => (
        <div className={`flex gap-4 p-5 rounded-3xl border ${isStrict ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black flex-shrink-0 ${isStrict ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {num}
            </div>
            <div>
                <h4 className={`font-black uppercase tracking-tight text-sm mb-1 ${isStrict ? 'text-rose-900' : 'text-slate-900'}`}>{title}</h4>
                <p className={`text-sm ${isStrict ? 'text-rose-700 font-bold' : 'text-slate-600'}`}>{desc}</p>
            </div>
        </div>
    );

    const renderLegalTerm = (title: string, content: string) => (
        <div className="space-y-2">
            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{title}</h5>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{content}</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all text-slate-500 active:scale-95 shadow-sm">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">System & Legal</h2>
                </div>

                <button
                    onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95"
                >
                    <Languages className="h-4 w-4" />
                    {lang === 'en' ? 'Switch to Hinglish' : 'Switch to English'}
                </button>
            </div>

            <div className="flex p-1 bg-slate-200/50 rounded-[1.5rem] w-fit ml-2">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Book className="h-4 w-4" />
                    User Manual
                </button>
                <button
                    onClick={() => setActiveTab('license')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'license' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Scale className="h-4 w-4" />
                    License & Terms
                </button>
            </div>

            <Card className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border-slate-100 shadow-xl shadow-slate-200/50">
                {activeTab === 'license' ? (
                    <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-slate-100 pb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center justify-center sm:justify-start gap-3">
                                    <ShieldCheck className="h-8 w-8 text-indigo-600" />
                                    Software License
                                </h3>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">© 2026 ACRO-AMS | Developed by Aayush Sharma</p>
                            </div>
                            <div className="px-4 py-2 bg-indigo-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-indigo-200">
                                Enterprise Edition
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                           <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Core Restrictions</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {lang === 'en' ? (
                                   <>
                                       {renderLicenseRule(1, 'Intellectual Property', 'The entire source code, architecture, and design tokens remain the exclusive intellectual property of Aayush Sharma.')}
                                       {renderLicenseRule(2, 'Licensed Territory', 'This software is granted for use exclusively within the Acropolis Institute of Technology and Research.')}
                                       {renderLicenseRule(3, 'Zero-Redistribution', 'The software may NOT be resold, rented, or redistributed to any third party under any circumstances.', true)}
                                       {renderLicenseRule(4, 'Reverse Engineering', 'Deciphering, decompiling, or reverse engineering the software logic is strictly prohibited by law.')}
                                   </>
                               ) : (
                                   <>
                                       {renderLicenseRule(1, 'Ownership', 'Ye code poori tarah Aayush Sharma ki property hai aur unhi ke paas iske rights hain.')}
                                       {renderLicenseRule(2, 'Institute Usage', 'Isko sirf Acropolis Institute ke campus operations ke liye istemal kiya ja sakta hai.')}
                                       {renderLicenseRule(3, 'Resell Mana Hai', 'Is software ko kisi aur ko bechna ya code share karna legally mana hai.', true)}
                                       {renderLicenseRule(4, 'Permission', 'Kisi bhi code change ke liye developer ki written permission zaroori hai.')}
                                   </>
                               )}
                           </div>
                        </div>

                        <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-8">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Legal Terms & Conditions</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                {renderLegalTerm('Warranty', 'The software is provided "AS IS" without warranty of any kind, either expressed or implied.')}
                                {renderLegalTerm('Liability', 'In no event shall the developer be liable for any special, incidental, indirect, or consequential damages.')}
                                {renderLegalTerm('Termination', 'Violation of any license terms will result in immediate termination of the license grant.')}
                                {renderLegalTerm('Jurisdiction', 'All legal matters are subject to the jurisdiction of the developer\'s registered city.')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                        <div className="border-b border-slate-100 pb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center justify-center sm:justify-start gap-3">
                                    < Book className="h-8 w-8 text-indigo-600" />
                                    {lang === 'en' ? 'User Manual' : 'Margdarshika'}
                                </h3>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">
                                    {lang === 'en' ? 'Complete Guide to Acro AMS v2.5' : 'App kaise use karein?'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Section 1 */}
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                    <LayoutDashboard className="h-4 w-4" /> {lang === 'en' ? 'Faculty Dashboard' : 'Dashboard Ka Upyog'}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {lang === 'en' ? (
                                        <>
                                            {renderManualItem(<Zap size={18}/>, 'Select Slot (L1-L7)', 'You MUST select a lecture slot before marking. A pulsing background means it is active.')}
                                            {renderManualItem(<Users size={18}/>, 'Mark Attendance', 'Click a student name card to toggle. Green = Present, Red = Absent.')}
                                            {renderManualItem(<Database size={18}/>, 'Save Data', 'Submits data to Supabase safely. Logs the exact time and your ID for auditing.')}
                                            {renderManualItem(<MessageSquare size={18}/>, 'Request Overwrite', 'If another teacher marked the slot, this sends a direct request to them.')}
                                        </>
                                    ) : (
                                        <>
                                            {renderManualItem(<Zap size={18}/>, 'Slot Chune (L1-L7)', 'Attendance mark karne se pehle Lecture Slot select karna zaroori hai. Active slot chamkega.')}
                                            {renderManualItem(<Users size={18}/>, 'Attendance Lagana', 'Student card par tap karein. Green ka matlab Present, Red ka matlab Absent.')}
                                            {renderManualItem(<Database size={18}/>, 'Data Save Karna', 'Isse data save ho jayega aur background mein Audit Log ban jayega.')}
                                            {renderManualItem(<MessageSquare size={18}/>, 'Overwrite Request', 'Agar kisi aur teacher ne attendance bhar di hai, toh aap unhe request bhej sakte hain.')}
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Section 2 */}
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                    <ShieldCheck className="h-4 w-4" /> {lang === 'en' ? 'System & Safety' : 'Safety aur Setup'}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {lang === 'en' ? (
                                        <>
                                            {renderManualItem(<Database size={18}/>, 'Recycle Bin', 'Deleted records stay for 12 hours. Only the teacher who deleted it can restore it.')}
                                            {renderManualItem(<Smartphone size={18}/>, 'PWA Install', 'Tap "Install App" on your phone for a lag-free, native app experience.')}
                                        </>
                                    ) : (
                                        <>
                                            {renderManualItem(<Database size={18}/>, 'Recycle Bin', 'Delete ki hui attendance 12 ghante tak Recycle Bin mein rehti hai aur wapas a sakti hai.')}
                                            {renderManualItem(<Smartphone size={18}/>, 'App Install', 'Apne phone mein "Install App" button dabayein taki bina lag ke app chale.')}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Developer Contact Card - FIXED: Using div to ensure dark background */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 text-center md:text-left">
                    <h4 className="font-black uppercase tracking-tighter text-2xl text-white">Project Developer</h4>
                    <p className="text-sm text-slate-400 mt-1.5 italic font-medium">Aayush Sharma | mraayush979@gmail.com</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mt-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Support Line: +91 6266439162</span>
                    </div>
                </div>
                
                <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button 
                        onClick={() => window.open("https://wa.me/916266439162", "_blank")}
                        className="group w-full sm:w-auto h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white border-none flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
                    >
                        <MessageSquare className="h-4 w-4 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12" />
                        WhatsApp
                    </Button>
                    <Button 
                        onClick={() => window.open("https://itsaayushsharma.vercel.app/", "_blank")}
                        className="group w-full sm:w-auto h-14 px-8 bg-white/10 hover:bg-white hover:text-slate-900 text-white border border-white/20 flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all backdrop-blur-md active:scale-95"
                    >
                        <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                        Portfolio
                    </Button>
                </div>
            </div>
        </div>
    );
};
