import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Users, UserPlus, Trash2, KeyRound, Shield, Check, X, AlertCircle } from 'lucide-react';

interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useDashboard();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Quality Engineer');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) return;

    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setStatusMessage('اسم المستخدم موجود بالفعل، يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    await addUser(name.trim(), username.trim(), password.trim(), role.trim());
    setName('');
    setUsername('');
    setPassword('');
    setRole('Quality Engineer');
    setShowAddForm(false);
    setStatusMessage('تمت إضافة المستخدم بنجاح!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSavePassword = async (userId: string) => {
    if (!newPasswordValue.trim()) return;
    await updateUser(userId, { password: newPasswordValue.trim() });
    setEditingUserId(null);
    setNewPasswordValue('');
    setStatusMessage('تم تحديث كلمة المرور بنجاح!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (users.length <= 1) {
      alert('لا يمكن حذف المستخدم الوحيد في النظام.');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟ لن يتمكن من تسجيل الدخول بعد ذلك.`)) {
      await deleteUser(userId);
      setStatusMessage('تم حذف المستخدم بنجاح.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">إدارة مستخدمي الداشبورد (Users Management)</h3>
              <p className="text-[11px] text-slate-400">
                إجمالي {users.length} مستخدمين معتمدين لدخول الداشبورد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'إلغاء الإضافة' : 'إضافة يوزر جديد'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Add New User Form */}
          {showAddForm && (
            <form onSubmit={handleCreateUser} className="bg-slate-50 border border-indigo-200 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>إضافة مستخدم جديد وتحديد كلمة المرور:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: م. حسام الدين"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الدور / المسمى الوظيفي</label>
                  <input
                    type="text"
                    placeholder="مثال: Quality Lead أو Auditor"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المستخدم للدخول (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: hossam"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور (Password) *</label>
                  <input
                    type="text"
                    required
                    placeholder="حدد كلمة المرور للمستخدم"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  تأكيد وحفظ المستخدم
                </button>
              </div>
            </form>
          )}

          {/* List of Registered Users */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700">قائمة المستخدمين الحاليين:</div>
            
            {users.map((u) => {
              const isCurrentUser = currentUser?.id === u.id;
              const isEditing = editingUserId === u.id;

              return (
                <div
                  key={u.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrentUser ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full ${u.color || 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                        {u.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{u.name}</span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-semibold rounded-full">
                              حسابك الحالي
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span>{u.role}</span>
                          <span>·</span>
                          <span className="font-mono text-slate-700">يوزر: <strong>{u.username}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            setEditingUserId(null);
                          } else {
                            setEditingUserId(u.id);
                            setNewPasswordValue(u.password);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-medium transition-colors"
                        title="تغيير كلمة المرور"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'إلغاء' : 'تغيير كلمة المرور'}</span>
                      </button>

                      {users.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Password Change Form */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center gap-2 bg-white p-2.5 rounded-lg border border-indigo-200">
                      <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                        كلمة المرور الجديدة:
                      </span>
                      <input
                        type="text"
                        value={newPasswordValue}
                        onChange={(e) => setNewPasswordValue(e.target.value)}
                        placeholder="اكتب الباسورد الجديد..."
                        className="flex-1 text-xs p-1.5 bg-slate-50 border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePassword(u.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors"
                      >
                        حفظ
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          يتم حفظ جميع التعديلات ومزامنتها تلقائياً مع السيرفر ولجميع المستخدمين.
        </div>
      </div>
    </div>
  );
};
