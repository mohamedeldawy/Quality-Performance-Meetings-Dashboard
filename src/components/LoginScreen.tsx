import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, users } = useDashboard();
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

  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 p-6 text-center text-white relative">
          <div className="mx-auto w-16 h-16 bg-white rounded-xl p-1 shadow-md mb-3 flex items-center justify-center">
            <img
              src="/logo.png"
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
          <h1 className="text-lg font-bold">منصة الخطة التعليمية</h1>
          <p className="text-xs text-indigo-300 font-medium mt-0.5">
            داشبورد مراجعة أداء فريق الكواليتي (Quality Review)
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6" dir="rtl">
          <div className="mb-5 text-center">
            <h2 className="text-base font-bold text-slate-800">تسجيل الدخول للنظام</h2>
            <p className="text-xs text-slate-500 mt-1">
              أدخل اسم المستخدم وكلمة المرور المخصصة للوصول إلى الداشبورد
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
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
                  placeholder="مثال: dawy أو radwa"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
                  className="w-full text-xs pr-9 pl-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
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
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'جاري التحقق...' : 'دخول الداشبورد'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>

          {/* Quick Demo Access Hint */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-semibold mb-2 text-center">
              حسابات الدخول المعتمدة للنظام:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill('dawy', 'password123')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-right transition-colors"
              >
                <div className="text-xs font-bold text-slate-800">أحمد ضوي (مدير)</div>
                <div className="text-[10px] text-slate-500 font-mono">dawy / password123</div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('radwa', 'radwa123')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-right transition-colors"
              >
                <div className="text-xs font-bold text-slate-800">أ/ رضوى (سينيور)</div>
                <div className="text-[10px] text-slate-500 font-mono">radwa / radwa123</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              * يمكن للمدير إضافة يوزرات جديدة وتعديل كلمات المرور من داخل الداشبورد في أي وقت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
