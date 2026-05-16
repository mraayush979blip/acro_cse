
import React, { useState } from 'react';
import { Book, ShieldCheck, ArrowLeft, Info, ExternalLink, Languages, MessageSquare } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const LegalView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'manual' | 'license'>('manual');
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const navigate = useNavigate();

    const content = {
        en: {
            manual: `
# 📘 ACROPOLIS AMS - FULL USER MANUAL
**Version 2.5 | Enterprise Edition**

## 1. FACULTY DASHBOARD (Main Actions)
- **Select Slot (L1-L7)**: You MUST select a lecture slot before marking. Pulsing background means active.
- **Mark Button (Green/Red)**: Click student name card to toggle. Green = Present, Red = Absent.
- **Save Attendance**: Submits data to Supabase. Logs the exact time and your ID.
- **Request Overwrite**: If another teacher marked the slot, this sends a request to them.
- **Export Report**: Downloads current view as Excel.

## 2. ATTENDANCE HISTORY
- **View Date Filter**: Select a specific date to view past records.
- **Share Attendance**: Generates a WhatsApp-ready summary. Automatically lists multiple slots if conducted.
- **Delete Record**: Moves record to Recycle Bin (stays for 12 hours).

## 3. COORDINATOR & ADMIN
- **MST Marks Summary**: Compares marks side-by-side for the whole branch.
- **Import Students**: Upload CSV/Excel to bulk-create student profiles.
- **Recycle Bin**: Restore deleted records within 12h. Requires permission if slot is re-occupied.
- **Audit Trail**: View full system logs (Who, What, When).

## 4. SYSTEM STABILITY
- **PWA Install**: Tap "Install App" for a native, lag-free experience.
- **Error Screen**: Use "Reload Application" to clear cache and fix sync issues.
            `,
            license: `
# ⚖️ PROPRIETARY LICENSE
**Copyright (c) 2026 Aayush Sharma.**

1. **Ownership**: Source code belongs to Aayush Sharma.
2. **Usage**: Restricted to Acropolis Institute internal use.
3. **Redistribution**: Strictly Prohibited.
4. **Modifications**: Requires developer consent.
            `
        },
        hi: {
            manual: `
# 📘 ACROPOLIS AMS - FULL USER MANUAL (HINGLISH)
**Sabhi buttons aur features ki jaankari**

## 1. FACULTY DASHBOARD (Kaise use karein)
- **Select Slot (L1-L7)**: Attendance mark karne se pehle Lecture Slot select karna zaroori hai. Active slot chamkega (pulse karega).
- **Marking**: Student card par tap karein. Green matlab Present, Red matlab Absent.
- **Save Attendance**: Isse data save ho jayega aur background mein 'Audit Log' ban jayega.
- **Overwrite Request**: Agar kisi aur teacher ne pehle se wahan attendance bhar di hai, toh aap unhe request bhej sakte hain.

## 2. HISTORY AUR SHARING
- **Date Filter**: Puraani attendance dekhne ke liye date select karein.
- **Share Attendance**: WhatsApp par summary bhejta hai. Agar din mein 2 slots liye hain, toh dono ki list dikhayega.
- **Delete Record**: Attendance delete hone par Recycle Bin mein jati hai (12 ghante tak).

## 3. ADMIN AUR SAFETY
- **Recycle Bin**: Galti se delete hui attendance yahan se 'Restore' karein.
- **Audit Trail**: Admin dekh sakta hai ki kisne, kab aur kya badlav kiye.
- **Excel Export**: Report ko Excel file mein download karne ke liye.

## 4. APP INSTALLATION
- **Install App**: Isse app native app ki tarah chalega aur fast load hoga.
            `,
            license: `
# ⚖️ PROPRIETARY LICENSE
**Copyright (c) 2026 Aayush Sharma.**

1. **Ownership**: Ye code Aayush Sharma ki property hai.
2. **Usage**: Sirf Acropolis Institute ke liye allowed hai.
3. **Resell**: Isse kisi aur ko bechna ya share karna allowed nahi hai.
            `
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Support & Legal</h2>
                </div>

                <button
                    onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all"
                >
                    <Languages className="h-4 w-4" />
                    {lang === 'en' ? 'Switch to Hinglish' : 'Switch to English'}
                </button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Book className="h-4 w-4" />
                    User Manual
                </button>
                <button
                    onClick={() => setActiveTab('license')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'license' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ShieldCheck className="h-4 w-4" />
                    License
                </button>
            </div>

            <Card className="prose prose-slate max-w-none bg-white p-8 rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="whitespace-pre-wrap font-medium text-slate-600 leading-relaxed text-sm">
                    {activeTab === 'manual' ? content[lang].manual : content[lang].license}
                </div>
            </Card>

            <Card className="bg-slate-900 text-white border-none p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h4 className="font-black uppercase tracking-tight text-lg">Developer Contact</h4>
                    <p className="text-sm text-slate-400 mt-1 italic text-center sm:text-left">Aayush Sharma | mraayush979@gmail.com</p>
                    <p className="text-[10px] font-black text-emerald-400 mt-1 uppercase tracking-widest text-center sm:text-left">WhatsApp: +91 6266439162</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button 
                        onClick={() => window.open("https://wa.me/916266439162", "_blank")}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 border-none flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp Support
                    </Button>
                    <Button 
                        onClick={() => window.open("https://itsaayushsharma.vercel.app/", "_blank")}
                        className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 border-none flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Portfolio
                    </Button>
                </div>
            </Card>
        </div>
    );
};
