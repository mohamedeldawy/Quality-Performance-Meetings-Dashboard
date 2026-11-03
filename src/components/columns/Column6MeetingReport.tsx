import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { FileText, Copy, Check, Printer, Trash2, Eye, Upload } from 'lucide-react';

type StoredFile = { fileUrl: string; fileName?: string; fileSize?: string; uploadedAt?: string };

export const Column6MeetingReport: React.FC = () => {
  const { activeMember, activeMeeting, updateMeetingReportNotes, updateDepartmentReport, updateQualityReport, updateSummaryReport } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Operation');
  const [preview, setPreview] = useState<{ title: string; file: StoredFile } | null>(null);
  const [uploadError, setUploadError] = useState('');
  const departmentOptions = ['Operation', 'Data Entry', 'Video Edit', 'Technical'];
  const report = activeMeeting.meetingReport || { fileUrl: null };
  const departmentReports = report.departmentReports || {};
  const qualityReport = report.qualityReport || null;
  const summaryReport = report.summaryReport || null;
  const readFile = (file: File, save: (url: string, name: string, size: string) => void) => {
    setUploadError('');
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('File is larger than 4 MB. Please compress it before uploading.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') save(reader.result, file.name, (file.size / 1024).toFixed(1) + ' KB');
      else setUploadError('Could not read this file. Please try again.');
    };
    reader.onerror = () => setUploadError('Could not read this file. Please try again.');
    reader.readAsDataURL(file);
  };
  const generateSummaryText = () => {
    const op = activeMeeting.overplannedNegotiation || { discussionNotes: '', actions: [] };
    const tk = activeMeeting.ticketsScreen || { discussionNotes: '', actions: [] };
    const actionLines = (items: any[]) => items.map((item, index) => `  ${index + 1}. [${item.done ? 'Completed' : 'Pending'}] ${item.text} (Due: ${item.dueDate || '-'})`).join('\n') || '  No actions recorded';
    const deptLines = (items: any[]) => items.map((item) => `  - ${item.department}: due ${item.dueDate || '-'}`).join('\n') || '  None';
    return `QUALITY PERFORMANCE MEETING REPORT
Meeting: ${activeMeeting.title}
Member: ${activeMember.name}
Meeting completion date: ${activeMeeting.meetingDate || 'Not set'}

OVERPLANNED NEGOTIATION
Quality Discussion: ${op.discussionNotes || 'None'}
Quality Actions: ${op.noAction ? 'No action will be taken' : actionLines(op.actions || [])}
Departments Actions:
${deptLines(op.departmentsActions || [])}

TICKETS SCREEN
Quality Discussion: ${tk.discussionNotes || 'None'}
Quality Actions: ${tk.noAction ? 'No action will be taken' : actionLines(tk.actions || [])}
Departments Actions:
${deptLines(tk.departmentsActions || [])}

MEETING REPORT
Departments Reports:
${departmentOptions.map((department) => `  - ${department}: ${departmentReports[department]?.fileName || 'No file'}`).join('\n')}
Quality Report: ${qualityReport?.fileName || 'No file'}
Closing Notes: ${report.notes || 'None'}`;
  };
  const handleExport = () => {
    const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
    const reportLinks = departmentOptions.map((department) => {
      const item = departmentReports[department];
      return item?.fileUrl ? `<p>${escape(department)}: <a href="${item.fileUrl}" download="${escape(item.fileName || department)}">${escape(item.fileName || 'Download')}</a></p>` : `<p>${escape(department)}: No report uploaded</p>`;
    }).join('');
    const qualityLink = qualityReport?.fileUrl ? `<p><a href="${qualityReport.fileUrl}" download="${escape(qualityReport.fileName || 'quality-report')}">${escape(qualityReport.fileName || 'Quality Report')}</a></p>` : '<p>No quality report uploaded</p>';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Quality Meeting Report</title><style>*{box-sizing:border-box}body{font:14px/1.65 Arial;background:#edf3fa;max-width:1050px;margin:28px auto;padding:0 22px;color:#172033}.hero{display:flex;align-items:center;gap:18px;background:linear-gradient(120deg,#101d3d,#173d70,#25618c);color:white;padding:24px;border-radius:18px}.hero h1{color:white;font-size:22px}.logo{width:68px;height:68px;object-fit:contain;background:white;border-radius:12px;padding:5px}.member{display:block;background:white}.avatar{width:100px;height:100px;object-fit:cover;border-radius:14px;border:3px solid #e5b84c}h2{color:#173e70}section{background:white;border:1px solid #d4e0ef;border-radius:14px;padding:18px;margin:16px 0;box-shadow:0 4px 15px #102c4c0d}pre{white-space:pre-wrap;font:inherit;background:#f5f8fc;padding:14px;border-radius:10px}a{color:#1e5ca2;font-weight:bold}@media print{body{background:white}.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><header class="hero"><img class="logo" src="https://logopng-omega.vercel.app/file.png" alt="Dashboard logo"><div><h1>QUALITY PERFORMANCE MEETING DASHBOARD</h1><p>Meeting execution report</p></div></header><section class="member">${activeMember.photoUrl ? `<img class="avatar" src="${activeMember.photoUrl}" alt="Member photo">` : ''}<h2>${escape(activeMember.name)}</h2><p>${escape(activeMember.role || '—')} · ${escape(activeMember.seniority || '—')}</p><p>Subject: ${escape((activeMember.subject || []).join(' · '))} | Stages: ${escape(activeMember.stages || '—')}</p><p>Summary Grades: ${escape((activeMember.summaryGrades || []).join(' · '))} | Quiz Grades: ${escape((activeMember.quizGrades || []).join(' · '))}</p><p>Courses Reviewed: ${escape((activeMember.coursesReviewed || []).join(' · '))} | Courses Produced: ${escape((activeMember.coursesProduced || []).join(' · '))}</p><p>Meeting date: ${escape(activeMeeting.meetingDate || '—')} · Duration: ${escape(activeMeeting.duration?.startDate || '—')} → ${escape(activeMeeting.duration?.endDate || '—')}</p></section><section><h2>Complete Meeting Details</h2><pre>${escape(generateSummaryText())}</pre></section><section><h2>Departments Reports</h2>${reportLinks}</section><section><h2>Quality Report</h2>${qualityLink}</section></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'quality-meeting-report.html'; link.click(); URL.revokeObjectURL(url);
  };
  const copySummary = async () => {
    await navigator.clipboard.writeText(generateSummaryText()); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };
  const renderUpload = (title: string, file: StoredFile | null, save: (url: string, name: string, size: string) => void, remove: () => void) => (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-xs font-bold text-slate-800">{title}</div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100">
        <Upload className="h-4 w-4" /> {file ? 'Replace file' : 'Upload / Attach file'}
        <input type="file" accept=".pdf,application/pdf,image/*,.doc,.docx,.xls,.xlsx" className="sr-only" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) readFile(selected, save); event.target.value = ''; }} />
      </label>
      {file && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 text-[11px]"><span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{file.fileName} <span className="font-normal text-slate-400">({file.fileSize || ''})</span></span><button type="button" onClick={() => setPreview({ title, file })} className="flex items-center gap-1 rounded bg-blue-700 px-2 py-1 text-white"><Eye className="h-3 w-3" /> Preview</button><button type="button" onClick={remove} className="text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div>}
    </div>
  );
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-amber-400/80 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 p-3 text-white"><div className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-slate-950">6</span><h2 className="text-xs font-bold">Meeting Report</h2></div></div>
      <div className="shrink-0 border-b border-blue-100 bg-blue-50/90 px-3 py-1.5 text-[10px] font-semibold text-blue-950">Department Reports & Quality Report</div>
      <div className="flex-1 space-y-3.5 overflow-y-auto p-3" dir="rtl">
        <section className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3">
          <h3 className="text-xs font-bold text-indigo-950">Departments Report</h3>
          <label className="block text-[11px] font-semibold text-slate-700">Select department</label>
          <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs">{departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}</select>
          {renderUpload(`${selectedDepartment} Report`, departmentReports[selectedDepartment] || null, (url, name, size) => updateDepartmentReport(selectedDepartment, url, name, size), () => updateDepartmentReport(selectedDepartment, null))}
          <div className="space-y-1">{departmentOptions.map((department) => { const item = departmentReports[department]; return <div key={department} className="flex justify-between gap-2 text-[10px] text-slate-600"><span>{department}</span><span className={item ? 'font-semibold text-emerald-700' : 'text-slate-400'}>{item?.fileName || 'No file attached'}</span></div>; })}</div>
        </section>
        <section className="space-y-2 rounded-xl border border-purple-200 bg-purple-50/40 p-3">
          <h3 className="text-xs font-bold text-purple-950">Quality Report</h3>
          {renderUpload('Quality Report File', qualityReport, (url, name, size) => updateQualityReport(url, name, size), () => updateQualityReport(null))}
        </section>
        {uploadError && <p className="rounded-lg bg-rose-50 p-2 text-[11px] text-rose-700">{uploadError}</p>}
        <section className="space-y-2 rounded-xl border border-sky-200 bg-sky-50/50 p-3"><h3 className="text-xs font-bold text-sky-950">Meeting Summary</h3>{renderUpload('Meeting Summary File', summaryReport, (url, name, size) => updateSummaryReport(url, name, size), () => updateSummaryReport(null))}</section>
        <section className="space-y-2 border-t border-slate-200 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-bold text-slate-800">Meeting Summary</h3><div className="flex gap-1.5"><button type="button" onClick={handleExport} className="rounded bg-indigo-700 px-2.5 py-1 text-[11px] font-semibold text-white">Export HTML</button><button type="button" onClick={copySummary} className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-[11px] text-white">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? 'Copied' : 'Copy'}</button><button type="button" onClick={() => window.print()} className="rounded bg-slate-100 p-1 text-slate-700"><Printer className="h-3.5 w-3.5" /></button></div></div>

        </section>
        <section className="space-y-1"><label className="text-xs font-bold text-slate-800">Closing Notes</label><textarea rows={3} value={report.notes || ''} onChange={(event) => updateMeetingReportNotes(event.target.value)} placeholder="Enter final meeting notes..." className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500" /></section>
      </div>
      <div className="shrink-0 border-t border-purple-100 bg-purple-50/50 p-2 text-center text-[10px] text-purple-950">{Object.values(departmentReports).filter(Boolean).length} Department Reports · {qualityReport ? 'Quality Report attached' : 'No Quality Report'}</div>
      {preview && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label="File preview"><div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-3"><div className="truncate text-xs font-bold text-slate-800">{preview.title} · {preview.file.fileName}</div><button type="button" onClick={() => setPreview(null)} className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Close</button></div><div className="min-h-0 flex-1 bg-slate-100">{preview.file.fileUrl.startsWith('data:application/pdf') ? <iframe title="Report PDF preview" src={preview.file.fileUrl} className="h-full w-full" /> : preview.file.fileUrl.startsWith('data:image/') ? <img src={preview.file.fileUrl} alt="Uploaded report preview" className="h-full w-full object-contain" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-600"><FileText className="h-10 w-10" />Preview is available for PDF and image files. Download this file to open it in its native application.</div>}</div></div></div>}
    </div>
  );
};
