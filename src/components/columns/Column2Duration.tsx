import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Calendar, Clock, Info, CalendarDays, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Column Header (Sky / Slate Theme) */}
      <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-400/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-mono font-bold shadow-xs">
            2
          </span>
          <h2 className="text-xs font-bold tracking-wide">Duration</h2>
        </div>

      </div>

      {/* English Subtitle */}
      <div className="px-3 py-1.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-blue-950 font-sans truncate">
          Performance Evaluation Timeframe & Assessment Window
        </span>
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3 space-y-3.5 overflow-y-auto" dir="rtl">
        {/* Date Inputs Card */}
        <div className="space-y-3 bg-gradient-to-br from-sky-50/60 to-slate-50 p-3 rounded-xl border border-sky-200/80 shadow-2xs">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>من تاريخ (Start Date):</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => updateMemberDuration(e.target.value, endDate, notes)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
              <span>إلى تاريخ (End Date):</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => updateMemberDuration(startDate, e.target.value, notes)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Calculated Duration Display */}
        <div className="bg-gradient-to-br from-sky-100/70 to-indigo-50 border border-sky-200 rounded-xl p-3 text-center shadow-2xs">
          <div className="text-[11px] text-sky-800 font-bold flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>إجمالي الفترة الزمنية للتقييم:</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-sky-950 mt-1 tabular-nums">
            {diffDays > 0 ? `${diffDays} يوماً` : 'تاريخ غير صالح'}
          </div>
          {diffDays > 0 && (
            <div className="text-[11px] text-sky-700 font-medium mt-0.5">
              ({diffWeeks > 0 ? `${diffWeeks} أسابيع` : ''}
              {remainingDays > 0 ? ` و ${remainingDays} أيام` : ''})
            </div>
          )}
        </div>

        {/* Notes / Context */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Duration notes:</span>
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => updateMemberDuration(startDate, endDate, e.target.value)}
            placeholder="مثلاً: دورة تقييم سبرنت من 25/9 إلى 26/10..."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white resize-none leading-relaxed shadow-2xs"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 bg-sky-50/50 border-t border-sky-100 text-[10px] text-sky-900 text-center font-mono shrink-0">
        Window: {startDate} → {endDate}
      </div>
    </div>
  );
};
