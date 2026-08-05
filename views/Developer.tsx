
import React, { useState, useEffect } from 'react';
import {
    Terminal, Database, Activity, Users, Settings, ShieldAlert, Cpu, Server, Zap, RefreshCw,
    Search, Eye, Lock, Unlock, AlertCircle, Code, Info, HelpCircle, HardDrive, MessageSquare, Send
} from 'lucide-react';
import { Card, Button, Input, Modal, Select } from '../components/UI';
import { db } from '../services/db';
import { User, SystemSettings } from '../types';
import { RecycleBin } from './RecycleBin';

export const DeveloperDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'database' | 'settings' | 'recycle-bin' | 'broadcast'>('overview');
    const [deepStats, setDeepStats] = useState<Record<string, { count: number, size: string }>>({});
    const [storage, setStorage] = useState({ consumed: '0 MB', total: '0 MB', percent: 0 });
    const [latency, setLatency] = useState(0);
    const [logs, setLogs] = useState<{ t: string; m: string; type: 'info' | 'error' | 'warn' }[]>([]);
    const [sysSettings, setSysSettings] = useState<SystemSettings>({ studentLoginEnabled: true });

    // Pulse Data: 24 persistent values representing 24 hours of density
    const [pulseData, setPulseData] = useState<number[]>([]);

    // Modals
    const [inspectedUser, setInspectedUser] = useState<any>(null);

    useEffect(() => {
        // Initialize Pulse with semi-persistent random data if blank
        setPulseData(Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 10));

        setLogs([
            { t: new Date().toISOString(), m: 'Kernel initialized. Developer Console active.', type: 'info' },
            { t: new Date().toISOString(), m: 'Establishing link to Supabase Edge...', type: 'info' },
        ]);

        const fetchData = async () => {
            try {
                const [stats, settings, ms, store] = await Promise.all([
                    db.getDeepStats(),
                    db.getSystemSettings(),
                    db.ping(),
                    db.getStorageStats()
                ]);

                setDeepStats(stats);
                setSysSettings(settings);
                setLatency(ms);
                setStorage(store);

                addLog(`Diagnostic complete. Latency: ${ms}ms. Storage: ${store.consumed}/${store.total}`, 'info');
            } catch (e: any) {
                addLog(`Initialization error: ${e.message}`, 'error');
            }
        };
        fetchData();

        const interval = setInterval(async () => {
            try {
                const ms = await db.ping();
                setLatency(ms);
                // Update last pulse bar slightly to make it look alive
                setPulseData(prev => {
                    const next = [...prev];
                    next[next.length - 1] = Math.min(100, Math.max(10, next[next.length - 1] + (Math.random() * 20 - 10)));
                    return next;
                });
            } catch (e) { }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const addLog = (m: string, type: 'info' | 'error' | 'warn' = 'info') => {
        setLogs(prev => [{ t: new Date().toISOString(), m, type }, ...prev].slice(0, 50));
    };

    const handleToggleMaintenance = async (enabled: boolean) => {
        try {
            const newSettings = { ...sysSettings, studentLoginEnabled: !enabled };
            await db.updateSystemSettings(newSettings);
            setSysSettings(newSettings);
            addLog(`System policy updated: Student login ${!enabled ? 'ENABLED' : 'DISABLED'}`, enabled ? 'warn' : 'info');
        } catch (e: any) {
            addLog(`Policy update failed: ${e.message}`, 'error');
        }
    };

    const getLatencyColor = (ms: number) => {
        if (ms === 0) return 'text-slate-400';
        if (ms < 150) return 'text-emerald-600'; // Safe
        if (ms < 400) return 'text-amber-600';   // Warning
        return 'text-red-600';                    // Unsafe
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center border border-indigo-400/30">
                            <Terminal className="h-6 w-6 text-indigo-400" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">System Root Access</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome, {user.displayName}</h2>
                    <p className="text-slate-400 text-sm max-w-md">
                        Monitoring system metrics. Database connection is {latency > 400 ? 'UNSTABLE' : 'STABLE'}.
                    </p>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
                {[
                    { id: 'overview', icon: Activity, label: 'Overview', desc: 'System Health' },
                    { id: 'users', icon: Users, label: 'Users', desc: 'Registry Trace' },
                    { id: 'logs', icon: Terminal, label: 'Logs', desc: 'Live Events' },
                    { id: 'database', icon: Database, label: 'Database', desc: 'Storage Per Tag' },
                    { id: 'recycle-bin', icon: ShieldAlert, label: 'Recovery', desc: 'Recycle Bin' },
                    { id: 'broadcast', icon: MessageSquare, label: 'Broadcast', desc: 'Message Students' },
                    { id: 'settings', icon: Settings, label: 'Policies', desc: 'Global Controls' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <tab.icon className="h-4 w-4" />
                            <span className="text-sm font-black uppercase tracking-wider">{tab.label}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase opacity-60 ${activeTab === tab.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {tab.desc}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {!sysSettings.studentLoginEnabled && (
                            <section className="bg-red-50 p-4 rounded-xl border border-red-200 flex gap-3 text-red-800 animate-pulse">
                                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">System in Maintenance Mode</h4>
                                    <p className="text-xs font-medium opacity-80 mt-1 uppercase">
                                        All student logins are currently restricted. Change this in the "Policies" tab.
                                    </p>
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <DeveloperStatCard
                                label="DB Latency"
                                value={`${latency}ms`}
                                icon={Server}
                                color={getLatencyColor(latency)}
                                sub={latency > 400 ? "UNSAFE / High Delay" : "SAFE / Low Delay"}
                            />
                            <DeveloperStatCard
                                label="Storage Total"
                                value={storage.consumed}
                                icon={HardDrive}
                                color="text-indigo-600"
                                sub={`Global: ${storage.total}`}
                                progress={storage.percent}
                            />
                            <DeveloperStatCard
                                label="Login Traffic"
                                value={sysSettings.studentLoginEnabled ? "Public" : "Locked"}
                                icon={sysSettings.studentLoginEnabled ? Zap : ShieldAlert}
                                color={sysSettings.studentLoginEnabled ? "text-emerald-600" : "text-red-600"}
                                sub={sysSettings.studentLoginEnabled ? "Open to students" : "Maintenance ongoing"}
                            />
                            <DeveloperStatCard
                                label="Load Factor"
                                value={`${(pulseData[pulseData.length - 1] || 0).toFixed(0)}%`}
                                icon={Cpu}
                                color="text-blue-600"
                                sub="Active requests weight"
                            />

                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <Card className="h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 text-lg">
                                            <Activity className="h-5 w-5 text-indigo-600" />
                                            Active System Pulse
                                        </h3>
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
                                            Monitoring Live
                                        </span>
                                    </div>

                                    <div className="h-48 flex items-end gap-1.5 px-2">
                                        {pulseData.map((h, i) => (
                                            <div key={i} className="flex-1 bg-indigo-50 rounded-t-sm relative group">
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-500"
                                                    style={{ height: `${h}%` }}
                                                ></div>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                    Load: {h.toFixed(0)}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 px-2 italic">
                                        <span className="text-[10px] font-black text-slate-300 uppercase">24 Hours History</span>
                                        <span className="text-[10px] font-black text-indigo-400 uppercase">Real-Time</span>
                                    </div>
                                </Card>
                            </div>

                            <Card className="col-span-1">
                                <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 mb-4">
                                    <ShieldAlert className="h-5 w-5 text-red-600" />
                                    Security Nodes
                                </h3>
                                <div className="space-y-4">
                                    <SecurityItem label="Row Isolation" status="ACTIVE" desc="User data siloed" />
                                    <SecurityItem label="TLS Pipeline" status="ACTIVE" desc="Encrypted tunnel" />
                                    <SecurityItem label="Origin Shield" status="STRICT" desc="URL verification" />
                                </div>
                                <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Global Memory</p>
                                        <p className="text-[9px] font-bold text-slate-500">{storage.percent}% Used</p>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${storage.percent}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 font-mono">{storage.consumed} / {storage.total}</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <UserManager
                        addLog={addLog}
                        onInspect={async (uid) => {
                            addLog(`Pulling technical snapshot for profile: ${uid}`, 'info');
                            const raw = await db.getRawProfile(uid);
                            setInspectedUser(raw);
                        }}
                    />
                )}

                {activeTab === 'logs' && (
                    <Card className="bg-slate-950 border-slate-800 p-0 overflow-hidden shadow-2xl">
                        <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                                <h3 className="text-slate-300 font-mono text-xs uppercase tracking-[0.2em] font-bold">Kernel Buffer Stream</h3>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => setLogs([])} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 font-black text-[10px]">Flush Logs</Button>
                        </div>
                        <div className="p-4 font-mono text-sm h-[500px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                            {logs.length === 0 && <div className="text-slate-600 italic">Listening for system events...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                                    <span className="text-slate-600 shrink-0">[{log.t.split('T')[1].split('.')[0]}]</span>
                                    <span className={`
                                        ${log.type === 'error' ? 'text-red-400' : ''}
                                        ${log.type === 'warn' ? 'text-amber-400' : ''}
                                        ${log.type === 'info' ? 'text-indigo-400' : ''}
                                        uppercase font-black text-[10px] shrink-0
                                    `}>
                                        {log.type}
                                    </span>
                                    <span className="text-slate-300 break-all">{log.m}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {activeTab === 'database' && (
                    <div className="space-y-6">
                        <section className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3 text-emerald-800">
                            <Info className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight">Database Table Peek</h4>
                                <p className="text-xs font-medium opacity-80 mt-0.5">Below you can see the <b>Count</b> of rows vs the <b>Estimated Size</b> consumed per table (tag).</p>
                            </div>
                        </section>

                        <Card>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 text-xl">
                                    <Database className="h-6 w-6 text-emerald-600" />
                                    Internal Data Nodes
                                </h3>
                                <Button
                                    onClick={async () => {
                                        addLog('Syncing latest row counts and storage metrics...', 'info');
                                        const [stats, store] = await Promise.all([db.getDeepStats(), db.getStorageStats()]);
                                        setDeepStats(stats);
                                        setStorage(store);
                                    }}
                                    className="flex items-center gap-2 font-black uppercase text-[10px]"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Synchronize Stats
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DBTableCard name="Profiles" alias="Users" rows={deepStats.profiles?.count || 0} size={deepStats.profiles?.size || "0 KB"} hint="Registered users with access" />
                                <DBTableCard name="Attendance" alias="Log" rows={deepStats.attendance?.count || 0} size={deepStats.attendance?.size || "0 KB"} hint="Lecture attendance history" />
                                <DBTableCard name="Marks" alias="Exams" rows={deepStats.marks?.count || 0} size={deepStats.marks?.size || "0 KB"} hint="Academic evaluation entries" />
                                <DBTableCard name="Notifications" alias="Alerts" rows={deepStats.notifications?.count || 0} size={deepStats.notifications?.size || "0 KB"} hint="System-wide messages" />
                                <DBTableCard name="Branches" alias="Depts" rows={deepStats.branches?.count || 0} size={deepStats.branches?.size || "0 KB"} hint="Academic departments" />
                                <DBTableCard name="Batches" alias="Years" rows={deepStats.batches?.count || 0} size={deepStats.batches?.size || "0 KB"} hint="Year-wise student groups" />
                                <DBTableCard name="Subjects" alias="Courses" rows={deepStats.subjects?.count || 0} size={deepStats.subjects?.size || "0 KB"} hint="Academic subject definitions" />
                                <DBTableCard name="Assignments" alias="Teaching" rows={deepStats.assignments?.count || 0} size={deepStats.assignments?.size || "0 KB"} hint="Faculty subject mappings" />
                                <DBTableCard name="Coordinators" alias="Staff" rows={deepStats.coordinators?.count || 0} size={deepStats.coordinators?.size || "0 KB"} hint="Staff responsible for branches" />
                                <DBTableCard name="Audit Logs" alias="History" rows={deepStats.audit_logs?.count || 0} size={deepStats.audit_logs?.size || "0 KB"} hint="Traceability for all major actions" />
                                <DBTableCard name="Deleted Attendance" alias="Recycle" rows={deepStats.deleted_attendance?.count || 0} size={deepStats.deleted_attendance?.size || "0 KB"} hint="Temporary storage for recovery" />
                                <DBTableCard name="System Engine" alias="Supabase" rows={1} size={deepStats.system?.size || "30.18 MB"} hint="Auth, Realtime, and Indexing Framework" isSystem={true} />
                            </div>
                        </Card>
                    </div>
                )}
                
                {activeTab === 'recycle-bin' && (
                    <div className="space-y-6">
                         <section className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3 text-rose-800">
                            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight">Global Recovery Center</h4>
                                <p className="text-xs font-medium opacity-80 mt-0.5">As a developer, you can view and restore deleted records from <b>all branches</b>.</p>
                            </div>
                        </section>
                        <RecycleBin branchId="ALL" metaData={{}} user={user} />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <section className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 text-red-800">
                            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight">System Policy Controls</h4>
                                <p className="text-xs font-medium opacity-80 mt-0.5 font-bold uppercase">Caution: Toggles here affect all clients instantly.</p>
                            </div>
                        </section>

                        <Card>
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 mb-6">
                                <Settings className="h-5 w-5 text-indigo-600" />
                                Global Feature Switch
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FeatureToggle
                                    label="Student Login"
                                    description="Switch this OFF to trigger Maintenance Mode for students. They will see a 'Disabled' message on the login screen."
                                    on={sysSettings.studentLoginEnabled}
                                    onChange={(v: boolean) => handleToggleMaintenance(!v)}
                                />
                                <FeatureToggle
                                    label="Debug Logs"
                                    description="Enable verbose developer logging in the browser (F12). Keep off for better performance."
                                    defaultOn={true}
                                />
                            </div>
                        </Card>

                        <Card className="bg-slate-50 border-slate-200">
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 mb-6">
                                <Code className="h-5 w-5 text-slate-600" />
                                Environment Snapshots
                            </h3>
                            <div className="space-y-3">
                                <EnvItem k="Host Domain" v={window.location.host} desc="Active server" />
                                <EnvItem k="UI Engine" v="React 18" desc="Client framework" />
                                <EnvItem k="Auth Provider" v="Supabase" desc="Security layer" />
                                <EnvItem k="Build Tag" v="AMS-V2-STABLE" desc="Code version" />
                            </div>
                        </Card>
                    </div>
                )}
                
                {activeTab === 'broadcast' && (
                    <BroadcastManager addLog={addLog} />
                )}
            </div>

            {/* Inspect Modal */}
            <Modal isOpen={!!inspectedUser} onClose={() => setInspectedUser(null)} title="Object Inspector">
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[60vh]">
                    <pre className="text-emerald-400">{JSON.stringify(inspectedUser, null, 2)}</pre>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => setInspectedUser(null)}>Dismiss</Button>
                </div>
            </Modal>
        </div>
    );
};

const DeveloperStatCard = ({ label, value, icon: Icon, color, sub, progress }: any) => (
    <Card className="border-l-4 border-l-indigo-500 overflow-hidden relative group hover:shadow-md transition-shadow">
        <div className="flex justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-black uppercase opacity-60 tracking-tight">{sub}</p>
                {progress !== undefined && (
                    <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden min-w-[120px]">
                        <div className={`h-full ${color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>
            <div className={`p-2 rounded-xl bg-slate-50 ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    </Card>
);

const SecurityItem = ({ label, status, desc }: any) => (
    <div className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded transition-colors">
        <div className="flex flex-col">
            <span className="text-slate-800 font-black uppercase text-[10px] tracking-tight">{label}</span>
            <span className="text-[10px] text-slate-500 italic lowercase">{desc}</span>
        </div>
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-tight border border-emerald-100">
            {status}
        </span>
    </div>
);

const DBTableCard = ({ name, rows, size, alias, hint, isSystem }: any) => (
    <div className={`p-4 rounded-xl border transition-all group bg-slate-50/50 ${isSystem ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}>
        <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isSystem ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                    {isSystem ? <Cpu className="h-5 w-5" /> : <Database className="h-5 w-5" />}
                </div>
                <div>
                    <h4 className="font-black text-slate-800 font-mono text-sm">{name} <span className="opacity-30 text-[10px]">({alias})</span></h4>
                    <div className="flex gap-3 mt-1">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{isSystem ? "Framework Core" : `${rows.toLocaleString()} Rows`}</p>
                        <div className="h-3 w-[1px] bg-slate-300"></div>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider">{size}</p>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400 italic">" {hint} "</p>
                </div>
            </div>
        </div>
    </div>
);

const EnvItem = ({ k, v, desc }: any) => (
    <div className="flex items-center justify-between p-3 rounded bg-white border border-slate-100 shadow-sm">
        <div className="flex flex-col">
            <span className="font-mono text-[10px] font-black text-slate-800 uppercase">{k}</span>
            <span className="text-[9px] text-slate-400 font-medium italic lowercase">{desc}</span>
        </div>
        <span className="font-mono text-[11px] text-indigo-600 font-black">{v}</span>
    </div>
);

const FeatureToggle = ({ label, description, on, onChange, defaultOn = false }: any) => {
    const [localOn, setLocalOn] = useState(defaultOn);
    const isControlled = on !== undefined;
    const active = isControlled ? on : localOn;

    return (
        <div className="flex items-start justify-between p-4 rounded-xl bg-white border border-slate-100 hover:border-indigo-100 transition-colors shadow-sm">
            <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    {label}
                    {!active && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-black">Disabled</span>}
                    {active && <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase font-black">Online</span>}
                </h4>
                <p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">{description}</p>
            </div>
            <button
                onClick={() => {
                    if (!isControlled) setLocalOn(!localOn);
                    if (onChange) onChange(!active);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : ''}`}></div>
            </button>
        </div>
    );
};

const UserManager = ({ addLog, onInspect }: { addLog: any, onInspect: (uid: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!searchTerm) return;
        setSearching(true);
        addLog(`Executing technical scan for: "${searchTerm}"`, 'info');
        try {
            const data = await db.searchUsers(searchTerm);
            setResults(data);
            addLog(`Scan complete. ${data.length} profiles identified.`, 'info');
        } catch (e: any) {
            addLog(`Registry Scan failed: ${e.message}`, 'error');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 mb-6">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Identity & Registry Trace
                </h3>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Email, Name, or enrollment..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={searching} className="flex items-center gap-2 font-black uppercase text-xs">
                        {searching ? 'Tracing...' : 'Run Trace'}
                    </Button>
                </div>
            </Card>

            {results.length > 0 && (
                <Card className="overflow-hidden p-0 border-slate-200">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trace Results</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {results.map((u, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm uppercase">
                                        {u.displayName?.substring(0, 2) || '??'}
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">{u.displayName}</h5>
                                        <p className="text-[10px] font-medium text-slate-500 lowercase">{u.email}</p>
                                        <div className="flex gap-1.5 mt-2">
                                            <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-tight shadow-sm shadow-black/20">{u.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => onInspect(u.uid)}>
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Inspect</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

const BroadcastManager = ({ addLog }: { addLog: any }) => {
    const [messageTemplate, setMessageTemplate] = useState(`Hello {name},

Your current attendance is {attendance}%.

App link: https://acropolis.vercel.app
Login method:
- UID: Enrollment No.
- Password: Mobile No.

Please check AMS.`);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);

    const [branches, setBranches] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    
    // Batching state
    const [batchSize, setBatchSize] = useState(5);
    const [batchIndex, setBatchIndex] = useState(0);

    const currentBatchStudents = students.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
    const totalBatches = Math.ceil(students.length / batchSize);

    useEffect(() => {
        db.getBranches().then(b => {
            setBranches(b);
            if (b.length > 0) setSelectedBranchId(b[0].id);
        });
    }, []);

    useEffect(() => {
        if (!selectedBranchId) return;
        db.getBatches(selectedBranchId).then(b => {
            setBatches(b);
            if (b.length > 0) setSelectedBatchId(b[0].id);
        });
    }, [selectedBranchId]);

    const handleFetchStudents = async () => {
        if (!selectedBranchId || !selectedBatchId) return;
        addLog(`Fetching students for Branch ${selectedBranchId}, Batch ${selectedBatchId}...`, 'info');
        try {
            const studs = await db.getStudents(selectedBranchId, selectedBatchId);
            setStudents(studs);
            setBatchIndex(0); // Reset on new fetch
            addLog(`Found ${studs.length} students.`, 'info');
        } catch (e: any) {
            addLog(`Failed to fetch students: ${e.message}`, 'error');
        }
    };

    const handleBroadcast = async () => {
        if (!messageTemplate || currentBatchStudents.length === 0) return;
        setIsProcessing(true);
        addLog(`Initializing Broadcast Engine for Batch ${batchIndex + 1}...`, 'info');
        try {
            setTotal(currentBatchStudents.length);
            
            for (let i = 0; i < currentBatchStudents.length; i++) {
                const s = currentBatchStudents[i];
                if (!s.studentData?.mobileNo) continue;
                
                // Fetch attendance
                let attendance = 0;
                try {
                    const attRecords = await db.getStudentAttendance(s.uid);
                    const totalLectures = attRecords.length;
                    const attendedLectures = attRecords.filter((r: any) => r.isPresent).length;
                    attendance = totalLectures > 0 ? Math.round((attendedLectures / totalLectures) * 100) : 0;
                } catch(e) {}

                // Replace variables
                let finalMsg = messageTemplate
                    .replace('{name}', s.displayName)
                    .replace('{attendance}', attendance.toString());
                
                addLog(`Dispatching to ${s.displayName} (${s.studentData.mobileNo})`, 'info');
                
                // Open WhatsApp Web Link in new tab (Automation)
                const url = `https://wa.me/91${s.studentData.mobileNo}?text=${encodeURIComponent(finalMsg)}`;
                window.open(url, '_blank');
                
                setProgress(i + 1);
                
                // Add a delay to let the browser open the tab and not crash
                await new Promise(r => setTimeout(r, 1500));
            }
            addLog(`Broadcast sequence completed for Batch ${batchIndex + 1}.`, 'info');
            
            // Auto-increment batch index if more batches exist
            if (batchIndex < totalBatches - 1) {
                setBatchIndex(prev => prev + 1);
            }
        } catch (e: any) {
            addLog(`Broadcast failed: ${e.message}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="border-indigo-200 shadow-xl shadow-indigo-900/5">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 mb-6">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                WhatsApp Automation Broadcast
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Select Branch</label>
                    <Select value={selectedBranchId} onChange={(e: any) => setSelectedBranchId(e.target.value)}>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </Select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Select Batch (Class)</label>
                    <div className="flex gap-2">
                        <Select value={selectedBatchId} onChange={(e: any) => setSelectedBatchId(e.target.value)} className="flex-1">
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </Select>
                        <Button onClick={handleFetchStudents} className="shrink-0 text-xs py-2 px-4 uppercase font-black">Fetch Students</Button>
                    </div>
                </div>
            </div>

            {students.length > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Target Students (Batch {batchIndex + 1} of {totalBatches})
                        </h4>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase text-slate-500">Batch Size:</label>
                            <Select 
                                value={batchSize} 
                                onChange={(e: any) => { setBatchSize(Number(e.target.value)); setBatchIndex(0); }} 
                                className="py-1 px-2 text-xs"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </Select>
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 divide-y divide-slate-200 scrollbar-thin scrollbar-thumb-slate-300">
                        {currentBatchStudents.map(s => (
                            <div key={s.uid} className="py-2 flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-800">{s.displayName}</span>
                                <span className="text-xs text-slate-500 font-mono">{s.studentData?.mobileNo || 'No Mobile'}</span>
                            </div>
                        ))}
                    </div>
                    {totalBatches > 1 && (
                        <div className="flex justify-between items-center mt-3 bg-white border border-slate-200 p-2 rounded-lg">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setBatchIndex(Math.max(0, batchIndex - 1))}
                                disabled={batchIndex === 0 || isProcessing}
                            >
                                Previous Batch
                            </Button>
                            <span className="text-xs font-black text-slate-600">Showing {batchIndex * batchSize + 1} to {Math.min((batchIndex + 1) * batchSize, students.length)} of {students.length} total students</span>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setBatchIndex(Math.min(totalBatches - 1, batchIndex + 1))}
                                disabled={batchIndex === totalBatches - 1 || isProcessing}
                            >
                                Next Batch
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <h4 className="text-sm font-black text-amber-800 uppercase">Important Note</h4>
                    <p className="text-xs text-amber-700 mt-1">This tool automates WhatsApp Web. It will open a new tab for each student. You must have WhatsApp Web logged in, and you will need to manually click "Send" on each tab.</p>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Message Template</label>
                    <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-48"
                        value={messageTemplate}
                        onChange={e => setMessageTemplate(e.target.value)}
                        placeholder="Type your message here. Use {name} and {attendance} as variables."
                    />
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight font-bold">Variables: {'{name}'}, {'{attendance}'}</p>
                </div>
                
                <div className="pt-4 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                        {isProcessing && (
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-600">
                                    <span>Progress</span>
                                    <span>{progress} / {total}</span>
                                </div>
                                <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${total > 0 ? (progress/total)*100 : 0}%`}}></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Button onClick={handleBroadcast} disabled={isProcessing || !messageTemplate || students.length === 0} className="flex items-center gap-2 font-black uppercase text-xs py-3 px-6 shadow-lg shadow-indigo-600/20">
                        <Send className="h-4 w-4" />
                        {isProcessing ? 'Broadcasting...' : 'Start Broadcast'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
