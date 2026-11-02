import React, { useRef, useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Upload, Trash2, Maximize2, X, ClipboardPaste } from 'lucide-react';

export const Column3TotalTasks: React.FC = () => {
  const { activeMember, activeMeeting, updateTotalTasksScreen } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const screenshot = activeMeeting.totalTasksScreen?.screenshotUrl;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة أو سكرين شوت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateTotalTasksScreen(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileChange(file);
          break;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onPaste={handlePaste}
      tabIndex={0}
      className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden focus:outline-none"
    >
      {/* Column Header (English only) */}
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-mono font-bold">
            3
          </span>
          <h2 className="text-xs font-bold tracking-wide">Total Tasks Screen</h2>
        </div>

        <span className="text-[11px] text-indigo-300 font-medium truncate max-w-[130px]" title={`${activeMember.name} - ${activeMeeting.title}`}>
          {activeMember.name} · {activeMeeting.title}
        </span>
      </div>

      {/* Description */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 shrink-0" dir="rtl">
        رفع سكرين شوت من السيستم (إجمالي المهام، المنجز، والأوفر بلاند):
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto" dir="rtl">
        {screenshot ? (
          /* Uploaded Screenshot Preview */
          <div className="space-y-2.5">
            <div className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center min-h-[200px]">
              <img
                src={screenshot}
                alt="Total Tasks Screenshot"
                className="max-h-[300px] w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setIsZoomed(true)}
              />

              {/* Quick Actions Hover Bar */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs p-1 rounded-md text-white">
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="p-1 hover:text-indigo-400 transition-colors"
                  title="تكبير السكرين شوت"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateTotalTasksScreen(null)}
                  className="p-1 hover:text-rose-400 transition-colors"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="truncate max-w-[160px] font-mono">
                {activeMeeting.totalTasksScreen?.fileName || 'screenshot.png'}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                استبدال الصورة
              </button>
            </div>
          </div>
        ) : (
          /* Empty State / Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[220px] ${
              isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-800 mb-1">
              اضغط لرفع سكرين شوت من السيستم
            </div>
            <div className="text-[11px] text-slate-500 mb-2.5">
              أو اسحب الصورة وأفلتها هنا
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 font-mono">
              <ClipboardPaste className="w-3 h-3 text-indigo-600" />
              <span>يمكنك الضغط Ctrl+V للصق السكرين شوت</span>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div className="mt-2 text-[10px] text-slate-400 text-center">
          {screenshot ? 'تم رفع السكرين شوت بنجاح' : 'جاهز لاستقبال سكرين شوت التاسكات لهذا الميتينج'}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && screenshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2 flex items-center gap-1 text-xs font-bold"
            >
              <X className="w-5 h-5" />
              <span>إغلاق</span>
            </button>
            <img
              src={screenshot}
              alt="Tasks Full Preview"
              className="max-h-[85vh] max-w-full object-contain rounded-lg border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
