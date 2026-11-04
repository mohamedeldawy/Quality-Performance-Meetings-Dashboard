import React, { useRef, useState } from 'react';
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
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    currentUser,
    users,
    members,
    logout,
    activeMember,
    activeMeeting,
    syncStatus,
    lastUpdatedBy,
    lastUpdatedAt,
    refreshFromServer,
  } = useDashboard();

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(85); // Default comfortable scale 85% so all 6 columns fit gracefully!
  const mainScrollRef = useRef<HTMLElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const syncHorizontalScroll = (source: 'main' | 'bottom') => {
    const from = source === 'main' ? mainScrollRef.current : bottomScrollRef.current;
    const to = source === 'main' ? bottomScrollRef.current : mainScrollRef.current;
    if (from && to && Math.abs(from.scrollLeft - to.scrollLeft) > 1) to.scrollLeft = from.scrollLeft;
  };

  // If user is not authenticated, show the clean LoginScreen
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-sky-50 to-amber-50/50 text-slate-900 font-sans selection:bg-blue-700 selection:text-white">
      {/* Top Header Bar */}
      <header className="bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white border-b-2 border-amber-400 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg z-30">
        {/* Left: Elkheta Platform Logo & Dashboard Title */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg overflow-hidden border-2 border-amber-400 bg-sky-500 shadow-lg ring-1 ring-sky-200 flex items-center justify-center shrink-0">
            <img
              src="./logo.png"
              alt="شعار"
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
              {/* Requested exact title */}
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                <span>Elkheta Quality Performance Meetings Dashboard</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-amber-100 bg-white/10 border border-amber-300/40 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>v2.0 Active</span>
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-sky-100 flex items-center gap-1.5" dir="rtl">
              <span>مراجعة أداء فريق الـ Quality</span>
              <span className="text-white/40">·</span>
              {members.length > 0 ? <><strong className="text-white">{activeMember.name}</strong><span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded text-[9px] font-bold font-mono">{activeMember.seniority || 'Quality'}</span><span className="text-white/40">·</span><span className="text-amber-300 font-semibold">{activeMeeting.title}</span></> : <span className="text-amber-300">لا يوجد أعضاء مسجلون حاليًا</span>}
            </p>
          </div>
        </div>

        {/* Center: Live Sync & Scale Adjuster */}
        <div className="flex items-center gap-3">
          {/* Zoom / Scaling Control to comfortably fit all 6 columns */}
          <div className="flex items-center gap-1 bg-white/10 border border-white/20 p-1 rounded-lg text-xs shadow-2xs">
            <span className="text-[11px] text-sky-100 font-medium px-1.5" dir="rtl">
              حجم العرض:
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(70, zoomLevel - 5))}
              className="p-1 hover:bg-white/15 rounded text-white transition-colors"
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
              className="p-1 hover:bg-white/15 rounded text-white transition-colors"
              title="تكبير العرض"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(zoomLevel === 100 ? 85 : 100)}
              className="px-2 py-0.5 bg-amber-400 border border-amber-300 rounded text-[10px] font-bold text-slate-950 hover:bg-amber-300 shadow-2xs"
              title="تبديل ملاءمة الشاشة"
            >
              {zoomLevel === 100 ? 'ملاءمة الشاشة' : '100%'}
            </button>
          </div>

          {/* Sync Status Badge */}
          <div
            className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg text-[11px] text-sky-50 shadow-2xs"
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
            <span className="text-white/40">·</span>
            <span className="truncate max-w-[150px]">
              آخر تعديل: <strong className="text-white">{lastUpdatedBy}</strong>
            </span>
            <button
              onClick={() => refreshFromServer()}
              className="p-1 text-sky-100 hover:text-amber-300 transition-colors"
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 border border-amber-300 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-2xs"
            title="إدارة المستخدمين وكلمات المرور"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>المستخدمين</span>
            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-mono">
              {users.length}
            </span>
          </button>

          {/* Current User Info */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg shadow-2xs">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">
              {currentUser.photoUrl ? (
                <img src={currentUser.photoUrl} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                currentUser.name.slice(0, 2)
              )}
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
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold transition-colors shadow-2xs"
            title="تسجيل الخروج من الداشبورد"
          >
            <LogOut className="w-3.5 h-3.5 rotate-180" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Main 6 Columns Container */}
      <main ref={mainScrollRef} onScroll={() => syncHorizontalScroll('main')} className="flex-none h-[calc(100vh-150px)] min-h-0 p-3 overflow-x-hidden overflow-y-hidden">
        <div
          dir="ltr"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left', width: `${100 / (zoomLevel / 100)}%` }}
          className="flex flex-row items-stretch gap-3 h-[calc((100vh-74px)/var(--zoom-factor,1))]"
        >
          {/* Column 1: Quality (Indigo theme) */}
          <div className="w-[300px] shrink-0 h-full">
            <Column1Quality />
          </div>

          {members.length > 0 && <>
          {/* Column 2: Duration (Sky theme) */}
          <div className="w-[285px] shrink-0 h-full">
            <Column2Duration />
          </div>

          {/* Column 3: Total Tasks Screen (Amber theme) */}
          <div className="w-[325px] shrink-0 h-full">
            <Column3TotalTasks />
          </div>

          {/* Column 4: Overplanned Negotiation (Rose theme) */}
          <div className="w-[340px] shrink-0 h-full">
            <Column4Overplanned />
          </div>

          {/* Column 5: Tickets Screen (Emerald theme) */}
          <div className="w-[340px] shrink-0 h-full">
            <Column5Tickets />
          </div>

          {/* Column 6: Meeting Report (Purple theme) */}
          <div className="w-[335px] shrink-0 h-full">
            <Column6MeetingReport />
          </div>
          </>}
        </div>
      </main>

      {members.length > 0 && (
        <div ref={bottomScrollRef} onScroll={() => syncHorizontalScroll('bottom')} aria-label="Dashboard horizontal navigation" className="mx-3 mb-2 h-5 shrink-0 overflow-x-auto overflow-y-hidden rounded border border-slate-300 bg-slate-100 scrollbar-thin">
          <div className="h-1 w-[1985px]" />
        </div>
      )}

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
