import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { LoginScreen } from './components/LoginScreen';
import { UsersManagementModal } from './components/UsersManagementModal';
import { Column1Quality } from './components/columns/Column1Quality';
import { Column2Duration } from './components/columns/Column2Duration';
import { Column3TotalTasks } from './components/columns/Column3TotalTasks';
import { Column4Overplanned } from './components/columns/Column4Overplanned';
import { Column5Tickets } from './components/columns/Column5Tickets';
import { Column6MeetingReport } from './components/columns/Column6MeetingReport';
import {
  Users,
  LogOut,
  RefreshCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    currentUser,
    users,
    logout,
    activeMember,
    activeMeeting,
    syncStatus,
    lastUpdatedBy,
    lastUpdatedAt,
    refreshFromServer,
    resetToDefaults,
  } = useDashboard();

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(85); // Default comfortable scale 85% so all 6 columns fit gracefully!

  // If user is not authenticated, show the LoginScreen
  if (!currentUser) {
    return <LoginScreen />;
  }

  const zoomScaleClass =
    zoomLevel === 75
      ? 'scale-75 origin-top-left'
      : zoomLevel === 80
      ? 'scale-80 origin-top-left'
      : zoomLevel === 85
      ? 'scale-85 origin-top-left'
      : zoomLevel === 90
      ? 'scale-90 origin-top-left'
      : 'scale-100 origin-top-left';

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-900 font-sans selection:bg-blue-700 selection:text-white">
      {/* Top Header Bar */}
      <header className="bg-blue-950 border-b-2 border-yellow-400 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg shadow-blue-950/15 z-30 text-white">
        {/* Left: Elkheta Platform Logo & Dashboard Title */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-yellow-400 bg-sky-500 shadow-lg shadow-blue-950/40 ring-1 ring-blue-800 flex items-center justify-center shrink-0">
            <img
              src="./logo.png"
              alt="شعار المنصة"
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('logopng-omega.vercel.app')) {
                  target.src = 'https://logopng-omega.vercel.app/file.png';
                }
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Quality Performance Meetings Dashboard
              </span>
            </div>
            <p className="text-[11px] text-sky-100" dir="rtl">
              مراجعة أداء فريق الكواليتي · {activeMember.name} ({activeMeeting.title})
            </p>
          </div>
        </div>

        {/* Center: Live Sync & Scale Adjuster */}
        <div className="flex items-center gap-3">
          {/* Zoom / Scaling Control to comfortably fit all columns without zooming out browser */}
          <div className="flex items-center gap-1 bg-blue-900 border border-blue-700 p-1 rounded-lg text-xs">
            <span className="text-[11px] text-sky-100 font-medium px-1.5" dir="rtl">
              حجم العرض:
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(75, zoomLevel - 5))}
              className="p-1 hover:bg-blue-800 rounded text-white transition-colors"
              title="تصغير العرض"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-white px-1">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(100, zoomLevel + 5))}
              className="p-1 hover:bg-blue-800 rounded text-white transition-colors"
              title="تكبير العرض"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(zoomLevel === 100 ? 85 : 100)}
              className="px-1.5 py-0.5 bg-yellow-400 border border-yellow-300 rounded text-[10px] font-bold text-blue-950 hover:bg-yellow-300"
              title="تبديل ملاءمة الشاشة"
            >
              {zoomLevel === 100 ? 'ملاءمة الشاشة' : '100%'}
            </button>
          </div>

          {/* Sync Status Badge */}
          <div
            className="hidden md:flex items-center gap-2 bg-blue-900 border border-blue-700 px-2.5 py-1 rounded-lg text-[11px] text-sky-100"
            dir="rtl"
          >
            <span className="flex items-center gap-1 font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500'
                    : syncStatus === 'saving'
                    ? 'bg-amber-500 animate-pulse'
                    : syncStatus === 'syncing'
                    ? 'bg-indigo-500 animate-spin'
                    : 'bg-rose-500'
                }`}
              />
              <span>{syncStatus === 'saving' ? 'جاري الحفظ...' : syncStatus === 'syncing' ? 'مزامنة...' : 'محفوظ ومشترك'}</span>
            </span>
            <span className="text-blue-400">·</span>
            <span className="truncate max-w-[150px]">
              آخر تعديل: <strong className="text-white">{lastUpdatedBy}</strong>
            </span>
            <button
              onClick={() => refreshFromServer()}
              className="p-1 text-sky-200 hover:text-yellow-300 transition-colors"
              title="تحديث البيانات من السيرفر"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: User Management Tab, Profile & Logout */}
        <div className="flex items-center gap-2" dir="rtl">
          {/* Users Management Button */}
          <button
            type="button"
            onClick={() => setShowUsersModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 border border-yellow-300 hover:bg-yellow-300 text-blue-950 rounded-lg text-xs font-bold transition-all shadow-sm"
            title="إدارة المستخدمين وكلمات المرور"
          >
            <Users className="w-3.5 h-3.5 text-blue-950" />
            <span>المستخدمين</span>
            <span className="px-1.5 py-0.2 bg-white/80 text-blue-950 rounded-full text-[10px] font-mono">
              {users.length}
            </span>
          </button>

          {/* Current User Info */}
          <div className="flex items-center gap-2 bg-blue-900 border border-blue-700 px-2.5 py-1 rounded-lg">
            <div className={`w-6 h-6 rounded-full ${currentUser.color || 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-[10px]`}>
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-sky-100 leading-tight">
                {currentUser.role}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-medium transition-colors"
            title="تسجيل الخروج من الداشبورد"
          >
            <LogOut className="w-3.5 h-3.5 rotate-180" />
            <span>خروج</span>
          </button>

          {/* Reset to defaults (accessible by manager) */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل تريد استعادة البيانات الافتراضية للداشبورد؟')) {
                resetToDefaults();
              }
            }}
            className="p-1.5 text-sky-200 hover:text-yellow-300 hover:bg-blue-800 rounded-lg transition-colors"
            title="استعادة البيانات الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main 6 Columns Container */}
      <main className="flex-1 p-3 overflow-x-auto overflow-y-hidden scrollbar-thin bg-sky-50">
        <div
          dir="ltr"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: `${100 / (zoomLevel / 100)}%` }}
          className="flex flex-row items-stretch gap-3 h-[calc((100vh-68px)/var(--zoom-factor,1))]"
        >
          {/* Column 1: Quality */}
          <div className="w-[280px] shrink-0 h-full">
            <Column1Quality />
          </div>

          {/* Column 2: Duration */}
          <div className="w-[290px] shrink-0 h-full">
            <Column2Duration />
          </div>

          {/* Column 3: Total Tasks Screen */}
          <div className="w-[320px] shrink-0 h-full">
            <Column3TotalTasks />
          </div>

          {/* Column 4: Overplanned Negotiation */}
          <div className="w-[340px] shrink-0 h-full">
            <Column4Overplanned />
          </div>

          {/* Column 5: Tickets Screen */}
          <div className="w-[340px] shrink-0 h-full">
            <Column5Tickets />
          </div>

          {/* Column 6: Meeting Report */}
          <div className="w-[330px] shrink-0 h-full">
            <Column6MeetingReport />
          </div>
        </div>
      </main>

      {/* Users Management Modal */}
      <UsersManagementModal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
