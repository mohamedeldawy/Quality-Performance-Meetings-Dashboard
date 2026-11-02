import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useDashboard();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-center text-white relative border-b border-indigo-900/60">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl p-1.5 shadow-lg mb-3 flex items-center justify-center">
            <img
              src="./logo.png"
              alt="لوجو منصة الخطة"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('logopng-omega.vercel.app')) {
                  target.src = 'https://logopng-omega.vercel.app/file.png';
                }
              }}
            />
          </div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
            الخطة Quality Performance Meetings Dashboard
          </h1>
          <p className="text-xs text-indigo-300 font-medium mt-1">
            تسجيل الدخول للنظام وإدارة اجتماعات تقييم الأداء
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6" dir="rtl">
          <div className="mb-5 text-center">
            <h2 className="text-sm font-bold text-slate-800">أدخل بيانات الحساب للبدء</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              بيانات الدخول مشفرة ومحفوظة لحسابك
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المستخدم (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-2xs"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pr-9 pl-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono shadow-2xs"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'جاري التحقق...' : 'دخول الداشبورد'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>

          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              الخطة التعليمية · لوحة التحكم الخاصة بفريق الجودة (Quality Assurance)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
