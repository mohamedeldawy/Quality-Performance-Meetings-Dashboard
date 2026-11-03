import React, { useRef, useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  FileUp,
  FileText,
  Download,
  Trash2,
  Copy,
  Check,
  Printer,
  FileCheck,
  Send,
  User,
  CheckCircle,
} from 'lucide-react';

export const Column6MeetingReport: React.FC = () => {
  const {
    activeMember,
    activeMeeting,
    updateMeetingReportFile,
    updateMeetingReportNotes,
    updateMeetingReportRecipient,
    updateDepartmentReport,
  } = useDashboard();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Operation');
  const departmentOptions = ['Operation', 'Data Entry', 'Video Edit', 'Technical'];

  const report = activeMeeting.meetingReport || { fileUrl: null };
  const recipient = report.reportRecipient || '';

  const opActions = activeMeeting.overplannedNegotiation?.actions || [];
  const tkActions = activeMeeting.ticketsScreen?.actions || [];

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

    return `ملخص ميتينج مراجعة الأداء (${activeMeeting.title}) - منصة الخطة
--------------------------------------------------
عضو الكواليتي: ${activeMember.name} (${activeMember.seniority || 'QA'} - ${activeMember.role})
الفترة الزمنية: من ${dur.startDate || '25/9'} إلى ${dur.endDate || '26/10'}
المستلم لمتابعة التنفيذ: ${recipient}
حالة الاتفاق: تم الاتفاق على كافة الـ Actions وتم رفع التقرير لمتابعة التنفيذ.

1. أوفر بلاند نيجوشيشن (Overplanned Negotiation):
- تم تدوين ${op.actions.length} Actions
- تفاصيل النقاش: ${op.discussionNotes || 'لم تسجل ملاحظات'}
- الأكشنز:
${op.actions.map((a, i) => `  ${i + 1}. [${a.done ? 'مكتمل' : 'معلق'}] ${a.text} (الموعد: ${a.dueDate || '-'})`).join('\n') || '  لا توجد أكشنات'}

2. تيكتس سكرين (Tickets Screen):
- تم تدوين ${tk.actions.length} Actions
- تفاصيل النقاش: ${tk.discussionNotes || 'لم تسجل ملاحظات'}
- الأكشنز:
${tk.actions.map((a, i) => `  ${i + 1}. [${a.done ? 'مكتمل' : 'معلق'}] ${a.text} (الموعد: ${a.dueDate || '-'})`).join('\n') || '  لا توجد أكشنات'}

الملاحظات المرسلة للشخص:
${report.notes || 'لا توجد ملاحظات إضافية'}
`;
  };

  const handleExportHtml = () => {
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(activeMeeting.title)} - Quality Meeting Report</title><style>body{font-family:Arial,sans-serif;max-width:1000px;margin:32px auto;padding:0 20px;color:#172033;line-height:1.6}h1,h2{color:#172554}section{border:1px solid #cbd5e1;border-radius:12px;padding:18px;margin:16px 0;break-inside:avoid}pre{white-space:pre-wrap;font:inherit}.meta{color:#475569}</style></head><body><h1>Quality Meeting Report</h1><p class="meta">${escapeHtml(activeMember.name)} · ${escapeHtml(activeMeeting.title)} · ${escapeHtml(activeMeeting.meetingDate || 'Meeting date not set')}</p><section><h2>Complete Meeting Details</h2><pre>${escapeHtml(generateSummaryText())}</pre></section><section><h2>Departments Actions</h2><p>Overplanned: ${escapeHtml((activeMeeting.overplannedNegotiation?.departmentsActions || []).join(', ') || 'None')}</p><p>Tickets: ${escapeHtml((activeMeeting.ticketsScreen?.departmentsActions || []).join(', ') || 'None')}</p></section><section><h2>Department Reports</h2>${departmentOptions.map((department) => { const item = report.departmentReports?.[department]; return '<p><strong>' + escapeHtml(department) + ':</strong> ' + escapeHtml(item?.fileName || 'No report uploaded') + '</p>'; }).join('')}</section></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${activeMember.name.replace(/[^a-z0-9-_]/gi, '_')}_${activeMeeting.title.replace(/[^a-z0-9-_]/gi, '_')}_report.html`; link.click(); URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateSummaryText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Column Header (Purple / Violet Slate Theme) */}
      <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-400/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-mono font-bold shadow-xs">
            6
          </span>
          <h2 className="text-xs font-bold tracking-wide">Meeting Report</h2>
        </div>

      </div>

      {/* English Subtitle */}
      <div className="px-3 py-1.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-blue-950 font-sans truncate">
          Final Evaluation Summary & Sign-off Report
        </span>
      </div>

      {/* Content Form */}
      <div className="flex-1 p-3 space-y-3.5 overflow-y-auto" dir="rtl">
        {/* Recipient & Sign-off Agreement Box */}
        <div className="bg-gradient-to-br from-purple-50/90 to-indigo-50/60 p-3 rounded-xl border border-purple-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-purple-600" />
              <span>إرسال التقرير لمتابعة التنفيذ إلى:</span>
            </span>
          </div>

          <div className="text-xs font-semibold text-purple-900">Department reports are uploaded separately below.</div>

          {/* Action Count Badges (Overplanned & Tickets) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-center">
              <div className="text-[10px] text-rose-700 font-bold">الـ Overplanned:</div>
              <div className="text-xs font-black text-rose-950 font-mono mt-0.5">
                تم تدوين {opActions.length} Actions
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center">
              <div className="text-[10px] text-emerald-700 font-bold">الـ Tickets:</div>
              <div className="text-xs font-black text-emerald-950 font-mono mt-0.5">
                تم تدوين {tkActions.length} Actions
              </div>
            </div>
          </div>
        </div>

        {/* Department report uploads */}
        <div className="space-y-2 p-3 rounded-xl border border-indigo-200 bg-indigo-50/40">
          <label className="block text-xs font-bold text-slate-800">Department Report Upload</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg">
            {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*" className="w-full text-xs" onChange={(e) => {
            const file = e.target.files?.[0]; if (!file) return;
            const reader = new FileReader(); reader.onload = (event) => updateDepartmentReport(selectedDepartment, event.target?.result as string, file.name, (file.size / 1024).toFixed(1) + ' KB'); reader.readAsDataURL(file); e.target.value = '';
          }} />
          <div className="space-y-1">
            {departmentOptions.map((department) => { const item = report.departmentReports?.[department]; return <div key={department} className="flex items-center justify-between gap-2 text-[11px] bg-white border border-slate-200 rounded p-2"><span>{department}</span><span className={item?.fileUrl ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>{item?.fileName || 'No report uploaded'}</span>{item?.fileUrl && <button type="button" onClick={() => updateDepartmentReport(department, null)} className="text-rose-600">Remove</button>}</div>; })}
          </div>
        </div>

        {/* Upload Report Section */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileUp className="w-3.5 h-3.5 text-purple-600" />
            <span>ملف التقرير (Upload Report File):</span>
          </label>

          {report.fileUrl ? (
            /* Uploaded File Card */
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
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
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الملف</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-medium hover:bg-emerald-50 transition-colors"
                >
                  استبدال
                </button>
              </div>
            </div>
          ) : (
            /* Drop / Upload Button */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 rounded-xl p-4 text-center cursor-pointer transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
                <FileUp className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800 mb-0.5">
                اضغط لرفع ملف ريبورت الميتينج
              </div>
              <div className="text-[10px] text-slate-500">
                (PDF, Word, TXT, Excel, أو سكرين)
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
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>ملخص الميتينج ({activeMeeting.title}):</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={handleExportHtml} className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded text-[11px] font-semibold">Export HTML</button>
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-colors shadow-2xs"
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

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-mono space-y-1 leading-relaxed max-h-[170px] overflow-y-auto">
            <div>
              <strong>العضو:</strong> {activeMember.name} ({activeMember.seniority || 'QA'})
            </div>
            <div>
              <strong>الفترة:</strong> من {activeMeeting.duration?.startDate || '25/9'} إلى {activeMeeting.duration?.endDate || '26/10'}
            </div>
            <div>
              <strong>المستلم:</strong> {recipient}
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
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white resize-none shadow-2xs"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 bg-purple-50/50 border-t border-purple-100 text-[10px] text-purple-950 text-center font-mono shrink-0">
        Recipient: {recipient} · {report.fileUrl ? 'Report File Attached' : 'Awaiting File'}
      </div>
    </div>
  );
};
