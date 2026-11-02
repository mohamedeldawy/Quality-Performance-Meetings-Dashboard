import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Calendar, Clock, Info } from 'lucide-react';

export const Column2Duration: React.FC = () => {
  const { activeMember, activeMeeting, updateMemberDuration } = useDashboard();

  const startDate = activeMeeting.duration.startDate || '2026-09-25';
  const endDate = activeMeeting.duration.endDate || '2026-10-26';
  const notes = activeMeeting.duration.notes || '';

  // Calculate day difference
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Column Header (English only) */}
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-mono font-bold">
            2
          </span>
          <h2 className="text-xs font-bold tracking-wide">Duration</h2>
        </div>

        <span className="text-[11px] text-indigo-300 font-medium truncate max-w-[130px]" title={`${activeMember.name} - ${activeMeeting.title}`}>
          {activeMember.name} · {activeMeeting.title}
        </span>
      </div>

      {/* Description */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 shrink-0" dir="rtl">
        الفترة الزمنية المحددة لمحاسبة الشخص في البرفورمانس:
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3 space-y-3.5 overflow-y-auto" dir="rtl">
        {/* Date Inputs */}
        <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>من تاريخ (Start Date):</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => updateMemberDuration(e.target.value, endDate, notes)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>إلى تاريخ (End Date):</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => updateMemberDuration(startDate, e.target.value, notes)}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Calculated Duration Display */}
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-2.5 text-center">
          <div className="text-[11px] text-indigo-700 font-medium flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>إجمالي الفترة الزمنية للتقييم:</span>
          </div>
          <div className="text-lg font-bold font-mono text-indigo-950 mt-0.5 tabular-nums">
            {diffDays > 0 ? `${diffDays} يوماً` : 'تاريخ غير صالح'}
          </div>
          {diffDays > 0 && (
            <div className="text-[10px] text-indigo-600">
              ({diffWeeks > 0 ? `${diffWeeks} أسابيع` : ''}{remainingDays > 0 ? ` و ${remainingDays} أيام` : ''})
            </div>
          )}
        </div>

        {/* Notes / Context */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>ملاحظات الدورة أو السبرنت:</span>
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => updateMemberDuration(startDate, endDate, e.target.value)}
            placeholder="مثلاً: دورة تقييم سبرنت من 25/9 إلى 26/10..."
            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center font-mono shrink-0">
        من {startDate} إلى {endDate}
      </div>
    </div>
  );
};
