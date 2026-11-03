import React, { useRef, useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Upload, Trash2, Maximize2, X, ClipboardPaste, Image as ImageIcon } from 'lucide-react';

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
      className="flex flex-col h-full bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden focus:outline-none"
    >
      {/* Column Header (Amber / Orange Slate Theme) */}
      <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-400/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-mono font-bold shadow-xs">
            3
          </span>
          <h2 className="text-xs font-bold tracking-wide">Total Tasks Screen</h2>
        </div>

      </div>

      {/* English Subtitle */}
      <div className="px-3 py-1.5 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-amber-900 font-sans truncate">
          Sprint Tasks, Capacity & Performance Screenshot
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto" dir="rtl">
        {screenshot ? (
          /* Uploaded Screenshot Preview */
          <div className="space-y-3">
            <div className="relative group border border-amber-200 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[220px] shadow-inner">
              <img
                src={screenshot}
                alt="Total Tasks Screenshot"
                className="max-h-[300px] w-auto object-contain cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setIsZoomed(true)}
              />

              {/* Quick Actions Hover Bar */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs p-1 rounded-md text-white shadow-md">
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="p-1.5 hover:text-amber-400 transition-colors"
                  title="تكبير السكرين شوت"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateTotalTasksScreen(null)}
                  className="p-1.5 hover:text-rose-400 transition-colors"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
              <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                <ImageIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate font-mono font-medium">
                  {activeMeeting.totalTasksScreen?.fileName || 'tasks_screenshot.png'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-700 hover:text-amber-900 font-bold underline"
              >
                استبدال
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
            className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[230px] ${
              isDragging
                ? 'border-amber-500 bg-amber-100/60'
                : 'border-amber-300 hover:border-amber-500 bg-gradient-to-b from-amber-50/60 to-slate-50'
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 mb-1">
              اضغط لرفع سكرين شوت من السيستم
            </div>
            <div className="text-[11px] text-slate-500 mb-3">
              (إجمالي التاسكات، المنجز، والأوفر بلاند)
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-200 rounded-full text-[10px] text-amber-900 font-mono shadow-2xs">
              <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
              <span>يمكنك الضغط Ctrl+V للصق المباشر</span>
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
          {screenshot ? '✓ تم رفع السكرين شوت بنجاح' : 'جاهز لاستقبال سكرين شوت التاسكات لهذا الميتينج'}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && screenshot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
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

      {/* Footer */}
      <div className="p-2 bg-amber-50/50 border-t border-amber-100 text-[10px] text-amber-900 text-center font-mono shrink-0">
        {screenshot ? 'Screenshot Attached' : 'No Screenshot'}
      </div>
    </div>
  );
};
