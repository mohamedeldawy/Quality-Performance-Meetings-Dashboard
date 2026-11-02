import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Column1Quality } from './components/columns/Column1Quality';
import { Column2Duration } from './components/columns/Column2Duration';
import { Column3TotalTasks } from './components/columns/Column3TotalTasks';
import { Column4Overplanned } from './components/columns/Column4Overplanned';
import { Column5Tickets } from './components/columns/Column5Tickets';
import { Column6MeetingReport } from './components/columns/Column6MeetingReport';
import {
  RotateCcw,
  User,
  Users,
  Plus,
  RefreshCw,
  CheckCircle2,
  Cloud,
  ChevronDown,
} from 'lucide-react';

const DashboardBoard: React.FC = () => {
  const {
    activeMember,
    users,
    currentUser,
    setCurrentUser,
    addUser,
    syncStatus,
    lastUpdatedBy,
    lastUpdatedAt,
    refreshFromServer,
    resetToDefaults,
  } = useDashboard();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Quality Engineer');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    await addUser(newUserName, newUserRole);
    setNewUserName('');
    setNewUserRole('Quality Engineer');
    setShowAddUserModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Top Bar Header with Elkheta Logo & Multi-User Switcher */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        {/* Left: Elkheta Platform Logo & Dashboard Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="لوجو منصة الخطة"
              className="h-full w-full object-contain p-0.5"
              onError={(e) => {
                // Fallback to external url if local path is unavailable
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('logopng-omega.vercel.app')) {
                  target.src = 'https://logopng-omega.vercel.app/file.png';
                }
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                منصة الخطة التعليمية
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Quality Review Dashboard
              </span>
            </div>
            <p className="text-[11px] text-slate-500" dir="rtl">
              داشبورد مشتركة لحساب أداء الكواليتي مع الحفظ والمزامنة المباشرة
            </p>
          </div>
        </div>

        {/* Center: Live Sync Status Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-600" dir="rtl">
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
          <span className="text-slate-300">·</span>
          <span>آخر تعديل: <strong className="text-slate-800">{lastUpdatedBy}</strong> ({lastUpdatedAt})</span>
          <button
            onClick={() => refreshFromServer()}
            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
            title="تحديث البيانات من السيرفر الآن"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Active User Selector & Add User */}
        <div className="flex items-center gap-2.5" dir="rtl">
          {/* Active User Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium px-1">المستخدم الآن:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              className="text-xs font-bold bg-white border border-slate-300 text-slate-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-colors"
              title="إضافة يوزر ثالث أو مستخدم إضافي"
            >
              <Plus className="w-3 h-3" />
              <span>يوزر جديد</span>
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              if (window.confirm('هل تريد استعادة البيانات الافتراضية؟')) {
                resetToDefaults();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="استعادة البيانات الافتراضية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main 6 Columns Side-by-Side strictly from Left to Right */}
      <main className="flex-1 p-4 overflow-x-auto scrollbar-thin">
        <div
          dir="ltr"
          className="flex flex-row items-stretch gap-4 h-[calc(100vh-85px)] min-w-[2100px]"
        >
          {/* Column 1: Quality */}
          <div className="w-[320px] min-w-[300px] shrink-0 h-full">
            <Column1Quality />
          </div>

          {/* Column 2: Duration */}
          <div className="w-[330px] min-w-[310px] shrink-0 h-full">
            <Column2Duration />
          </div>

          {/* Column 3: Total Tasks Screen */}
          <div className="w-[380px] min-w-[350px] shrink-0 h-full">
            <Column3TotalTasks />
          </div>

          {/* Column 4: Overplanned Negotiation */}
          <div className="w-[410px] min-w-[380px] shrink-0 h-full">
            <Column4Overplanned />
          </div>

          {/* Column 5: Tickets Screen */}
          <div className="w-[410px] min-w-[380px] shrink-0 h-full">
            <Column5Tickets />
          </div>

          {/* Column 6: Meeting Report */}
          <div className="w-[400px] min-w-[370px] shrink-0 h-full">
            <Column6MeetingReport />
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>إضافة مستخدم جديد للداشبورد</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-3">
              أضف يوزر ثالث أو شخص إضافي ليتمكن من التفاعل والمشاركة على الداشبورد:
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المستخدم *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: م. حسام الدين أو م. ياسمين"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المسمى أو الدور</label>
                <input
                  type="text"
                  placeholder="مثال: Technical Lead أو Quality Auditor"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                >
                  حفظ وتفعيل المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardBoard />
    </DashboardProvider>
  );
}
