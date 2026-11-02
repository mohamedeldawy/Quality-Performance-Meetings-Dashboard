import React, { useRef, useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { FileUp, FileText, Download, Trash2, Copy, Check, Printer, FileCheck } from 'lucide-react';

export const Column6MeetingReport: React.FC = () => {
  const { activeMember, activeMeeting, updateMeetingReportFile, updateMeetingReportNotes } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const report = activeMeeting.meetingReport || { fileUrl: null };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
      updateMeetingReportFile(result, file.name, sizeKB);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadFile = () => {
    if (!report.fileUrl) return;
    const a = document.createElement('a');
    a.href = report.fileUrl;
    a.download = report.fileName || `${activeMember.name}_${activeMeeting.title}_report.pdf`;
    a.click();
  };

  const generateSummaryText = () => {
    const op = activeMeeting.overplannedNegotiation || { discussionNotes: '', actions: [] };
    const tk = activeMeeting.ticketsScreen || { discussionNotes: '', actions: [] };
    const dur = activeMeeting.duration || { startDate: '', endDate: '' };

    return `ملخص ميتينج مراجعة الأداء (${activeMeeting.title})
--------------------------------------------------
عضو الكواليتي: ${activeMember.name} (${activeMember.role})
الفترة الزمنية للتقييم: من ${dur.startDate || '25/9'} إلى ${dur.endDate || '26/10'}
${dur.notes ? `ملاحظات الدورة: ${dur.notes}` : ''}

1. أوفر بلاند نيجوشيشن (Overplanned Negotiation):
- تفاصيل النقاش: ${op.discussionNotes || 'لم تسجل ملاحظات'}
- الأكشنز المتفق عليها:
${op.actions.map((a, i) => `  ${i + 1}. [${a.done ? 'مكتمل' : 'معلق'}] ${a.text} (الموعد: ${a.dueDate || '-'})`).join('\n') || '  لا توجد أكشنات'}

2. تيكتس سكرين (Tickets Screen):
- تفاصيل النيجوشيشن: ${tk.discussionNotes || 'لم تسجل ملاحظات'}
- الأكشنز المتفق عليها:
${tk.actions.map((a, i) => `  ${i + 1}. [${a.done ? 'مكتمل' : 'معلق'}] ${a.text} (الموعد: ${a.dueDate || '-'})`).join('\n') || '  لا توجد أكشنات'}
`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateSummaryText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Column Header (English only) */}
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-mono font-bold">
            6
          </span>
          <h2 className="text-xs font-bold tracking-wide">Meeting Report</h2>
        </div>

        <span className="text-[11px] text-indigo-300 font-medium truncate max-w-[130px]" title={`${activeMember.name} - ${activeMeeting.title}`}>
          {activeMember.name} · {activeMeeting.title}
        </span>
      </div>

      {/* Description */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 shrink-0" dir="rtl">
        رفع تقرير ملخص الميتينج لتحميله وإرساله للشخص:
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3 space-y-3.5 overflow-y-auto" dir="rtl">
        {/* Upload Report Section */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>ملف التقرير (Upload Report File):</span>
          </label>

          {report.fileUrl ? (
            /* Uploaded File Card */
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate" title={report.fileName}>
                      {report.fileName || 'meeting_report.pdf'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {report.fileSize || 'ملف جاهز'} {report.uploadedAt && `· ${report.uploadedAt}`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateMeetingReportFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  title="حذف الملف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الملف</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded text-xs font-medium hover:bg-emerald-50 transition-colors"
                >
                  استبدال
                </button>
              </div>
            </div>
          ) : (
            /* Drop / Upload Button */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 rounded-xl p-4 text-center cursor-pointer transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-1.5">
                <FileUp className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800 mb-0.5">
                اضغط لرفع ملف ريبورت الميتينج
              </div>
              <div className="text-[10px] text-slate-500">
                (PDF, Word, TXT, Excel, أو صورة)
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Live Summary Preview & Fast Copy/Print */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>ملخص الميتينج ({activeMeeting.title}):</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors"
                title="نسخ ملخص الاجتماع"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                title="طباعة / حفظ كـ PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-mono space-y-1 leading-relaxed max-h-[190px] overflow-y-auto">
            <div>
              <strong>العضو:</strong> {activeMember.name}
            </div>
            <div>
              <strong>الفترة:</strong> من {activeMeeting.duration?.startDate || '25/9'} إلى {activeMeeting.duration?.endDate || '26/10'}
            </div>
            <div>
              <strong>الأوفر بلاند:</strong> {activeMeeting.overplannedNegotiation?.discussionNotes ? 'تم التدوين' : 'فارغ'} (
              {activeMeeting.overplannedNegotiation?.actions?.length || 0} أكشن)
            </div>
            <div>
              <strong>التيكتس:</strong> {activeMeeting.ticketsScreen?.discussionNotes ? 'تم التدوين' : 'فارغ'} (
              {activeMeeting.ticketsScreen?.actions?.length || 0} أكشن)
            </div>
            {activeMeeting.totalTasksScreen?.screenshotUrl && (
              <div className="text-emerald-700 font-semibold">✓ تم إرفاق سكرين شوت التاسكات</div>
            )}
          </div>
        </div>

        {/* Meeting Notes for Person */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-800">
            ملاحظات ختامية مرسلة للشخص:
          </label>
          <textarea
            rows={2}
            value={report.notes || ''}
            onChange={(e) => updateMeetingReportNotes(e.target.value)}
            placeholder="اكتب أي ملاحظة أو رسالة موجهة للشخص مع التقرير..."
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center font-mono shrink-0">
        {report.fileUrl ? 'الملف جاهز للإرسال' : 'بانتظار رفع ملف التقرير'}
      </div>
    </div>
  );
};
