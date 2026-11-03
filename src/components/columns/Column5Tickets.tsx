import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { MessageSquare, CheckSquare, Plus, Trash2, Bug } from 'lucide-react';

export const Column5Tickets: React.FC = () => {
  const {
    activeMember,
    activeMeeting,
    updateTicketsDiscussion,
    addTicketsAction,
    toggleTicketsAction,
    deleteTicketsAction,
  } = useDashboard();

  const [newActionText, setNewActionText] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const discussion = activeMeeting.ticketsScreen?.discussionNotes || '';
  const actions = activeMeeting.ticketsScreen?.actions || [];

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    addTicketsAction(newActionText, newDueDate);
    setNewActionText('');
  };

  const pendingCount = actions.filter((a) => !a.done).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Column Header (Emerald / Teal Slate Theme) */}
      <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-400/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-mono font-bold shadow-xs">
            5
          </span>
          <h2 className="text-xs font-bold tracking-wide">Tickets Screen</h2>
        </div>

      </div>

      {/* English Subtitle */}
      <div className="px-3 py-1.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-blue-950 font-sans truncate">
          Open Tickets, Bug Review & QA Action Items
        </span>
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3 space-y-3.5 overflow-y-auto" dir="rtl">
        {/* الخانة الأولى: النيجوشيشن */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. خانة النيجوشيشن (Discussion):</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              حفظ فوري
            </span>
          </label>
          <textarea
            rows={5}
            value={discussion}
            onChange={(e) => updateTicketsDiscussion(e.target.value)}
            placeholder="اكتب هنا تفاصيل النيجوشيشن والنقاش حول التذاكر والبلاغات ومشاكل الجودة..."
            className="w-full text-xs text-slate-800 p-2.5 bg-emerald-50/30 border border-emerald-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed resize-none shadow-2xs"
          />
        </div>

        {/* الخانة الثانية: الأكشنز */}
        <div className="space-y-2 pt-2 border-t border-emerald-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. خانة الأكشنز (Actions for tickets):</span>
            </label>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-200">
              {pendingCount} متبقي
            </span>
          </div>

          {/* Add Action Form */}
          <form onSubmit={handleAddAction} className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200 space-y-2">
            <input
              type="text"
              required
              placeholder="اكتب الأكشن المطلوب للتيكتس والبلاغات..."
              value={newActionText}
              onChange={(e) => setNewActionText(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
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
                لا توجد أكشنات مسجلة للتذاكر بعد لهذا الميتينج.
              </div>
            ) : (
              actions.map((act) => (
                <div
                  key={act.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                    act.done
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-emerald-200 shadow-2xs hover:border-emerald-300'
                  }`}
                >
                  <label className="flex items-start gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={act.done}
                      onChange={() => toggleTicketsAction(act.id)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded mt-0.5 focus:ring-emerald-500 cursor-pointer"
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
                          <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-sans">
                            {act.createdBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>

                  <button
                    onClick={() => deleteTicketsAction(act.id)}
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
      </div>

      {/* Footer */}
      <div className="p-2 bg-emerald-50/50 border-t border-emerald-100 text-[10px] text-emerald-900 text-center font-mono shrink-0">
        {actions.length} Ticket Actions Logged
      </div>
    </div>
  );
};
