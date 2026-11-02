import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { MessageSquare, CheckSquare, Plus, Trash2, LifeBuoy } from 'lucide-react';

export const Column5Tickets: React.FC = () => {
  const {
    activeMember,
    updateTicketsDiscussion,
    addTicketsAction,
    toggleTicketsAction,
    deleteTicketsAction,
  } = useDashboard();

  const [newActionText, setNewActionText] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const discussion = activeMember.ticketsScreen.discussionNotes || '';
  const actions = activeMember.ticketsScreen.actions || [];

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    addTicketsAction(newActionText, newDueDate);
    setNewActionText('');
  };

  const pendingCount = actions.filter((a) => !a.done).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Column Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-mono font-bold">
            5
          </span>
          <div>
            <h2 className="text-xs font-bold capitalize">Tickets Screen</h2>
            <div className="text-[11px] text-slate-300 font-medium" dir="rtl">التيكتس سكرين</div>
          </div>
        </div>

        <span className="text-[11px] text-indigo-300 font-medium truncate max-w-[130px]" title={activeMember.name}>
          {activeMember.name}
        </span>
      </div>

      {/* Description */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 shrink-0" dir="rtl">
        خانة للنيجوشيشن ومراجعة التذاكر + خانة للأكشنز المتخذة:
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3.5 space-y-4 overflow-y-auto" dir="rtl">
        {/* الخانة الأولى: النيجوشيشن (Discussion / Negotiation) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>1. خانة النيجوشيشن (Negotiation / Discussion):</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">حفظ تلقائي</span>
          </label>
          <textarea
            rows={5}
            value={discussion}
            onChange={(e) => updateTicketsDiscussion(e.target.value)}
            placeholder="اكتب هنا تفاصيل النيجوشيشن والنقاش حول التذاكر والبلاغات ومشاكل الجودة..."
            className="w-full text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white leading-relaxed resize-none"
          />
        </div>

        {/* الخانة الثانية: الأكشنز (Actions) */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. خانة الأكشنز (Actions for tickets):</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {pendingCount} متبقي
            </span>
          </div>

          {/* Add Action Form */}
          <form onSubmit={handleAddAction} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
            <input
              type="text"
              required
              placeholder="اكتب الأكشن المطلوب للتيكتس والبلاغات..."
              value={newActionText}
              onChange={(e) => setNewActionText(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs p-1.5 bg-white border border-slate-300 rounded font-mono text-slate-700 focus:outline-none flex-1"
                title="تاريخ الاستحقاق"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة أكشن</span>
              </button>
            </div>
          </form>

          {/* Action Items List */}
          <div className="space-y-1.5">
            {actions.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                لا توجد أكشنات مسجلة للتذاكر بعد.
              </div>
            ) : (
              actions.map((act) => (
                <div
                  key={act.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                    act.done ? 'bg-slate-50/80 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <label className="flex items-start gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={act.done}
                      onChange={() => toggleTicketsAction(act.id)}
                      className="w-4 h-4 text-indigo-600 rounded mt-0.5 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className={`block font-medium ${act.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {act.text}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        {act.dueDate && <span>التنفيذ: {act.dueDate}</span>}
                        {act.createdBy && (
                          <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-sans">
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
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-mono shrink-0">
        {actions.length} أكشن مسجل للتيكتس
      </div>
    </div>
  );
};
