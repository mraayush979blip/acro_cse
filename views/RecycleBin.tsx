import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AttendanceRecord, User } from '../types';
import { Trash2, RotateCcw, Loader2, AlertCircle, Calendar, User as UserIcon } from 'lucide-react';
import { Button } from '../components/UI';

export const RecycleBin: React.FC<{ branchId: string; metaData: any }> = ({ branchId, metaData }) => {
  const [deletedRecords, setDeletedRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    loadDeleted();
  }, [branchId]);

  const loadDeleted = async () => {
    setLoading(true);
    try {
      const data = await db.getDeletedAttendance(branchId);
      setDeletedRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    setRestoring(id);
    try {
      const result = await db.restoreAttendance([id]);
      
      if (result.status === 'CONFLICT') {
         if (confirm(`Slot is currently occupied by ${result.currentMarkedBy}. Send a request to them to restore this record?`)) {
            const allFaculty = await db.getFaculty();
            const targetUser = allFaculty.find(u => u.displayName === result.currentMarkedBy);
            
            if (targetUser) {
               await db.createNotification({
                  toUserId: targetUser.uid,
                  fromUserId: (metaData as any).currentUser?.uid || '',
                  fromUserName: (metaData as any).currentUser?.displayName || 'Faculty',
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
      alert("Failed to restore record");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-indigo-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4">
        <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100">
          <Trash2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-rose-900 uppercase tracking-tight">Recycle Bin</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Restore deleted records</p>
            <span className="w-1 h-1 bg-rose-300 rounded-full" />
            <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
              ⚠️ Auto-cleans every 12 hours
            </p>
          </div>
        </div>
      </div>

      {deletedRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
           <AlertCircle size={48} className="text-slate-200 mb-4" />
           <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Your recycle bin is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {deletedRecords.map((r) => {
            const student = metaData.students?.[r.studentId];
            const subject = metaData.subjects?.[r.subjectId];
            return (
              <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-indigo-600">{new Date(r.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 uppercase text-sm truncate">{student?.displayName || 'Unknown Student'}</h4>
                    <div className="flex flex-col">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{subject?.name || 'Extra Class'} • Slot {r.lectureSlot}</p>
                       {r.deletedAt && (
                          <div className="flex items-center gap-1 mt-1">
                             <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
                             <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                                Expires in: {(() => {
                                   const expiry = new Date(r.deletedAt).getTime() + (12 * 60 * 60 * 1000);
                                   const remaining = expiry - Date.now();
                                   if (remaining <= 0) return 'Just now';
                                   const h = Math.floor(remaining / (1000 * 60 * 60));
                                   const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                                   return `${h}h ${m}m`;
                                })()}
                             </p>
                          </div>
                       )}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleRestore(r.id)}
                  disabled={!!restoring}
                  variant="secondary"
                  className="w-full sm:w-auto !rounded-xl h-10 px-4 !bg-emerald-50 !text-emerald-600 !border-emerald-100 hover:!bg-emerald-600 hover:!text-white transition-all"
                >
                  {restoring === r.id ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  <span className="ml-2 font-black text-[10px] uppercase">Restore Record</span>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
