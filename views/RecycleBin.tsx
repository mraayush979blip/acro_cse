import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AttendanceRecord, User } from '../types';
import { Trash2, RotateCcw, Loader2, AlertCircle, Calendar, Users, ArrowLeft, XCircle } from 'lucide-react';
import { Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const RecycleBin: React.FC<{ branchId: string; metaData: any; user: User }> = ({ branchId, metaData, user }) => {
  const [deletedRecords, setDeletedRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [metaCache, setMetaCache] = useState<{
    branches: Record<string, string>;
    batches: Record<string, string>;
    subjects: Record<string, string>;
    subjectTypes: Record<string, string>;
    faculty: Record<string, string>;
  }>({ branches: {}, batches: {}, subjects: {}, subjectTypes: {}, faculty: {} });

  const navigate = useNavigate();

  useEffect(() => {
    loadDeleted();
  }, [branchId]);

  const loadDeleted = async () => {
    setLoading(true);
    try {
      const [data, branches, batches, subjects, faculty] = await Promise.all([
         db.getDeletedAttendance(branchId),
         db.getBranches(),
         db.getBatches(),
         db.getSubjects(),
         db.getFaculty()
      ]);

      const bMap: Record<string, string> = {};
      branches.forEach(b => bMap[b.id] = b.name);
      
      const baMap: Record<string, string> = {};
      batches.forEach(b => baMap[b.id] = b.name);
      
      const sMap: Record<string, string> = {};
      const sTypeMap: Record<string, string> = {};
      subjects.forEach(s => {
         sMap[s.id] = s.name;
         sTypeMap[s.id] = s.type;
      });
      
      const fMap: Record<string, string> = {};
      faculty.forEach(f => fMap[f.uid] = f.displayName);

      setMetaCache({ branches: bMap, batches: baMap, subjects: sMap, subjectTypes: sTypeMap, faculty: fMap });

      const filtered = user.role === 'ADMIN' ? data : data.filter(r => r.markedBy === user.uid);
      setDeletedRecords(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const groupedRecords = React.useMemo(() => {
    const groups: Record<string, {
      groupId: string;
      date: string;
      lectureSlot: number;
      subjectId: string;
      branchId: string;
      batchId: string;
      markedBy: string;
      records: AttendanceRecord[];
      deletedAt: string;
    }> = {};

    for (const r of deletedRecords) {
      const subjectType = metaData?.subjects?.[r.subjectId]?.type || metaCache.subjectTypes[r.subjectId];
      const effectiveBatchId = (subjectType === 'theory' || subjectType === 'THEORY') ? 'ALL' : (r.batchId || 'ALL');

      const groupId = `${r.date}_${r.lectureSlot}_${r.subjectId}_${r.branchId}_${effectiveBatchId}`;
      if (!groups[groupId]) {
        groups[groupId] = {
          groupId,
          date: r.date,
          lectureSlot: r.lectureSlot || 0,
          subjectId: r.subjectId,
          branchId: r.branchId,
          batchId: effectiveBatchId,
          markedBy: r.markedBy,
          records: [],
          deletedAt: r.deletedAt || new Date().toISOString()
        };
      }
      groups[groupId].records.push(r);
    }
    return Object.values(groups).sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  }, [deletedRecords, metaData, metaCache]);

  const handleRestoreGroup = async (groupRecords: AttendanceRecord[], groupId: string) => {
    const ids = groupRecords.map(r => r.id);
    setRestoring(groupId);
    try {
      const result = await db.restoreAttendance(ids);
      
      if (result.status === 'CONFLICT') {
         if (confirm(`Slot is currently occupied by ${result.currentMarkedBy}. Send a request to them to restore this record?`)) {
            const allFaculty = await db.getFaculty();
            const targetUser = allFaculty.find(u => u.displayName === result.currentMarkedBy);
            
            if (targetUser) {
               await db.createNotification({
                  toUserId: targetUser.uid,
                  fromUserId: user.uid,
                  fromUserName: user.displayName,
                  type: 'RESTORE_REQUEST',
                  status: 'PENDING',
                  data: {
                     date: result.conflictData.date,
                     slot: result.conflictData.lectureSlot,
                     subjectName: 'Restoration Request',
                     branchId: result.conflictData.branchId,
                     payload: [result.conflictData]
                  },
                  timestamp: Date.now()
               });
               alert("Request sent to " + result.currentMarkedBy);
            }
         }
      } else {
         await loadDeleted();
      }
    } catch (e) {
      console.error("Restore Error:", e);
      alert("Failed to restore record");
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDeleteGroup = async (groupRecords: AttendanceRecord[]) => {
      if (confirm("Are you sure you want to permanently delete this session? This cannot be undone.")) {
         const ids = groupRecords.map(r => r.id);
         try {
            await db.permanentlyDeleteAttendance(ids);
            await loadDeleted();
         } catch(e) {
            alert("Failed to permanently delete records");
         }
      }
  };

  const handleEmptyBin = async () => {
      if (confirm("Are you sure you want to permanently delete ALL records? This cannot be undone.")) {
         const ids = deletedRecords.map(r => r.id);
         try {
            await db.permanentlyDeleteAttendance(ids);
            await loadDeleted();
         } catch(e) {
            alert("Failed to empty recycle bin");
         }
      }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-indigo-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 px-2">
         <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all text-slate-500 active:scale-95 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
         </button>
         <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Recovery</h2>
      </div>

      <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100 flex-shrink-0">
               <Trash2 size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-rose-900 uppercase tracking-tight">Recycle Bin</h2>
               <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Deleted Sessions</p>
                  <span className="w-1 h-1 bg-rose-300 rounded-full hidden sm:block" />
                  <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                     ⚠️ Auto-cleans every 12 hours
                  </p>
               </div>
            </div>
        </div>
        {deletedRecords.length > 0 && (
            <button onClick={handleEmptyBin} className="w-full sm:w-auto px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 whitespace-nowrap border border-rose-200">
               Empty Bin
            </button>
        )}
      </div>

      {groupedRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
           <AlertCircle size={48} className="text-slate-200 mb-4" />
           <p className="font-black text-slate-400 uppercase tracking-widest text-xs text-center px-4">Your recycle bin is empty or you have no ownership</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groupedRecords.map((group) => {
            const subjectName = metaData?.subjects?.[group.subjectId]?.name || metaCache.subjects[group.subjectId] || 'Extra Class';
            const branchName = metaData?.branches?.[group.branchId] || metaCache.branches[group.branchId] || group.branchId;
            const batchName = metaData?.batches?.[group.batchId] || metaCache.batches[group.batchId] || group.batchId;
            const teacherName = metaData?.faculty?.[group.markedBy] || metaCache.faculty[group.markedBy] || group.markedBy;

            return (
              <div key={group.groupId} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-slate-400 mb-1" />
                    <span className="text-[11px] font-black text-indigo-600 leading-none">{new Date(group.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            Slot {group.lectureSlot}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest truncate">
                            {branchName}
                        </span>
                        {group.batchId !== 'ALL' && (
                           <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest truncate">
                               Batch {batchName}
                           </span>
                        )}
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest truncate">
                            {teacherName}
                        </span>
                    </div>
                    <h4 className="font-black text-slate-800 uppercase text-sm truncate leading-tight mb-1">{subjectName}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                       <div className="flex items-center gap-1.5 text-slate-500">
                           <Users size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-tight">{group.records.length} Students</span>
                       </div>
                       
                       <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                             Expires in: {(() => {
                                const expiry = new Date(group.deletedAt).getTime() + (12 * 60 * 60 * 1000);
                                const remaining = expiry - Date.now();
                                if (remaining <= 0) return 'Just now';
                                const h = Math.floor(remaining / (1000 * 60 * 60));
                                const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                                return `${h}h ${m}m`;
                             })()}
                          </p>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handlePermanentDeleteGroup(group.records)}
                      className="flex-1 md:flex-none p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 flex items-center justify-center gap-2"
                      title="Permanently Delete"
                    >
                      <XCircle size={18} />
                      <span className="md:hidden text-[10px] font-black uppercase">Delete</span>
                    </button>
                    <Button
                      onClick={() => handleRestoreGroup(group.records, group.groupId)}
                      disabled={!!restoring}
                      variant="secondary"
                      className="flex-1 md:flex-none !rounded-xl h-11 px-6 !bg-emerald-50 !text-emerald-600 !border-emerald-100 hover:!bg-emerald-600 hover:!text-white transition-all shadow-sm"
                    >
                      {restoring === group.groupId ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />}
                      <span className="ml-2 font-black text-[10px] uppercase">Restore Session</span>
                    </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
