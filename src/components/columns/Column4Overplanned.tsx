import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { MessageSquare, CheckSquare, Plus, Trash2, AlertCircle } from 'lucide-react';

export const Column4Overplanned: React.FC = () => {
  const {
    activeMember,
    activeMeeting,
    updateOverplannedDiscussion,
    addOverplannedAction,
    toggleOverplannedAction,
    deleteOverplannedAction,
    updateOverplannedDepartments,
    setOverplannedNoAction,
  } = useDashboard();

  const [newActionText, setNewActionText] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const discussion = activeMeeting.overplannedNegotiation?.discussionNotes || '';
  const actions = activeMeeting.overplannedNegotiation?.actions || [];
  const departments = activeMeeting.overplannedNegotiation?.departmentsActions || [];
  const noAction = activeMeeting.overplannedNegotiation?.noAction || false;
  const departmentOptions = ['Operation', 'Data Entry', 'Video Edit', 'Technical'];

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    addOverplannedAction(newActionText, newDueDate);
    setNewActionText('');
  };

  const pendingCount = actions.filter((a) => !a.done).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Column Header (Rose / Crimson Slate Theme) */}
      <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-400/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-mono font-bold shadow-xs">
            4
          </span>
          <h2 className="text-xs font-bold tracking-wide">Overplanned Negotiation</h2>
        </div>

      </div>

      {/* English Subtitle */}
      <div className="px-3 py-1.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-blue-950 font-sans truncate">
          Overplanned Hours Analysis & Negotiation Actions
        </span>
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3 space-y-3.5 overflow-y-auto" dir="rtl">
        {/* الجزء الأول: تفاصيل النقاش */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
              <span>1. Quality Discussion:</span>
            </span>
            <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
              حفظ فوري
            </span>
          </label>
          <textarea
            rows={5}
            value={discussion}
            onChange={(e) => updateOverplannedDiscussion(e.target.value)}
            placeholder="اكتب هنا تفاصيل النقاش اللي دار بينك وبين الشخص بتاع الكواليتي حول أسباب الأوفر بلاند..."
            className="w-full text-xs text-slate-800 p-2.5 bg-rose-50/30 border border-rose-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed resize-none shadow-2xs"
          />
        </div>

        {/* الجزء الثاني: الأكشنز */}
        <div className="space-y-2 pt-2 border-t border-rose-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
              <span>2. Quality Actions:</span>
            </label>
            <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-mono font-bold border border-rose-200">
              {pendingCount} متبقي
            </span>
          </div>

          {/* Add Action Form */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={noAction} onChange={(e) => setOverplannedNoAction(e.target.checked)} className="rounded" /> لا يوجد — لن يتم اتخاذ أي Action</label>
          <form onSubmit={handleAddAction} className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200 space-y-2">
            <input
              type="text"
              required
              placeholder="اكتب الأكشن المطلوب لحل الأوفر بلاند..."
              value={newActionText}
              disabled={noAction}
              onChange={(e) => setNewActionText(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-700 focus:outline-none flex-1"
                title="تاريخ الاستحقاق"
              />
              <button
                type="submit"
                disabled={noAction}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة أكشن</span>
              </button>
            </div>
          </form>

          {/* Action Items List */}
          <div className="space-y-1.5">
            {actions.length === 0 ? (
              <div className="text-center py-3 text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                لا توجد أكشنات مسجلة بعد لهذا الميتينج.
              </div>
            ) : (
              actions.map((act) => (
                <div
                  key={act.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                    act.done
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-rose-200 shadow-2xs hover:border-rose-300'
                  }`}
                >
                  <label className="flex items-start gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={act.done}
                      onChange={() => toggleOverplannedAction(act.id)}
                      className="w-3.5 h-3.5 text-rose-600 rounded mt-0.5 focus:ring-rose-500 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`block font-medium ${
                          act.done ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {act.text}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        {act.dueDate && <span>التنفيذ: {act.dueDate}</span>}
                        {act.createdBy && (
                          <span className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded font-sans">
                            {act.createdBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>

                  <button
                    onClick={() => deleteOverplannedAction(act.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                    title="حذف الأكشن"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-800">Departments Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {departmentOptions.map((department) => (
              <label key={department} className="flex items-center gap-2 text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2">
                <input type="checkbox" checked={departments.includes(department)} onChange={(e) => updateOverplannedDepartments(e.target.checked ? [...departments, department] : departments.filter((item) => item !== department))} />
                {department}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 bg-rose-50/50 border-t border-rose-100 text-[10px] text-rose-900 text-center font-mono shrink-0">
        {actions.length} Actions Logged
      </div>
    </div>
  );
};
