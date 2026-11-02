import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AppUser } from '../types/dashboard';
import { Users, UserPlus, Trash2, Pencil, Shield, Check, X } from 'lucide-react';

interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const userRoles = ['Quality Manager', 'Senior Quality', 'Middle Quality', 'Junior Quality', 'Quality Engineer'];

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useDashboard();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Quality Engineer');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Pick<AppUser, 'name' | 'username' | 'password' | 'role'> | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!trimmedName || !trimmedUsername || !trimmedPassword) return;

    if (users.some((user) => user.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      setStatusMessage('اسم المستخدم موجود بالفعل، يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    await addUser(trimmedName, trimmedUsername, trimmedPassword, role);
    setName('');
    setUsername('');
    setPassword('');
    setRole('Quality Engineer');
    setShowAddForm(false);
    showStatus('تمت إضافة المستخدم بنجاح!');
  };

  const startEditing = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditDraft({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
    });
  };

  const handleSaveUser = async (e: React.FormEvent, user: AppUser) => {
    e.preventDefault();
    if (!editDraft) return;
    const trimmedName = editDraft.name.trim();
    const trimmedUsername = editDraft.username.trim();
    const trimmedPassword = editDraft.password.trim();
    if (!trimmedName || !trimmedUsername || !trimmedPassword) {
      setStatusMessage('الاسم واسم المستخدم وكلمة المرور مطلوبة.');
      return;
    }
    if (users.some((candidate) => candidate.id !== user.id && candidate.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      setStatusMessage('اسم المستخدم موجود بالفعل، يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    await updateUser(user.id, {
      name: trimmedName,
      username: trimmedUsername,
      password: trimmedPassword,
      role: editDraft.role,
    });
    setEditingUserId(null);
    setEditDraft(null);
    showStatus('تم تحديث بيانات المستخدم بنجاح!');
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditDraft(null);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (users.length <= 1) {
      alert('لا يمكن حذف المستخدم الوحيد في النظام.');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟ لن يتمكن من تسجيل الدخول بعد ذلك.`)) {
      await deleteUser(userId);
      showStatus('تم حذف المستخدم بنجاح.');
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl" dir="rtl">
        <div className="flex shrink-0 items-center justify-between border-b-2 border-yellow-400 bg-blue-950 p-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-blue-950">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">إدارة مستخدمي الداشبورد</h3>
              <p className="text-[11px] text-sky-100">إجمالي {users.length} مستخدمين معتمدين</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-blue-950 transition-colors hover:bg-yellow-300"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{showAddForm ? 'إلغاء الإضافة' : 'إضافة مستخدم'}</span>
            </button>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-sky-100 transition-colors hover:bg-blue-800 hover:text-white" title="إغلاق">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-2 border-b border-blue-100 bg-sky-50 px-4 py-2 text-xs font-semibold text-blue-900">
            <Check className="h-4 w-4 text-blue-700" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {showAddForm && (
            <form onSubmit={handleCreateUser} className="space-y-3 rounded-xl border border-blue-200 bg-sky-50 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                <UserPlus className="h-4 w-4 text-blue-700" />
                <span>بيانات المستخدم الجديد</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">
                  الاسم الكامل *
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="مثال: أحمد حسن" />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  المسمى الوظيفي
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                    {userRoles.map((userRole) => <option key={userRole} value={userRole}>{userRole}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  اسم المستخدم *
                  <input required value={username} onChange={(e) => setUsername(e.target.value)} className={`${inputClass} font-mono`} placeholder="مثال: ahmed" />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  كلمة المرور *
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} font-mono`} placeholder="حدد كلمة المرور" />
                </label>
              </div>
              <button type="submit" className="rounded-lg bg-blue-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-900">
                حفظ المستخدم
              </button>
            </form>
          )}

          <section className="space-y-2.5">
            <div className="text-xs font-bold text-blue-950">قائمة المستخدمين الحاليين</div>
            {users.map((user) => {
              const isCurrentUser = currentUser?.id === user.id;
              const isEditing = editingUserId === user.id && editDraft !== null;

              return (
                <div key={user.id} className={`rounded-xl border p-3.5 transition-colors ${isCurrentUser ? 'border-blue-300 bg-sky-50 ring-1 ring-blue-100' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${user.color || 'bg-blue-800'} text-xs font-bold text-white shadow-sm`}>
                        {user.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{user.name}</span>
                          {isCurrentUser && <span className="rounded-full bg-blue-800 px-2 py-0.5 text-[10px] font-semibold text-white">حسابك الحالي</span>}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                          <span>{user.role}</span>
                          <span className="font-mono text-slate-700">يوزر: <strong>{user.username}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => isEditing ? cancelEditing() : startEditing(user)}
                        className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-sky-100"
                      >
                        {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                        {isEditing ? 'إلغاء' : 'تعديل البيانات'}
                      </button>
                      {users.length > 1 && (
                        <button type="button" onClick={() => handleDeleteUser(user.id, user.name)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" title="حذف المستخدم">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && editDraft && (
                    <form onSubmit={(e) => handleSaveUser(e, user)} className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-white p-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="text-xs font-semibold text-slate-700">
                          الاسم الكامل
                          <input required value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} className={inputClass} />
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          المسمى الوظيفي
                          <select value={editDraft.role} onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })} className={inputClass}>
                            {!userRoles.includes(editDraft.role) && <option value={editDraft.role}>{editDraft.role}</option>}
                            {userRoles.map((userRole) => <option key={userRole} value={userRole}>{userRole}</option>)}
                          </select>
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          اسم المستخدم
                          <input required value={editDraft.username} onChange={(e) => setEditDraft({ ...editDraft, username: e.target.value })} className={`${inputClass} font-mono`} />
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          كلمة المرور
                          <input required type="password" value={editDraft.password} onChange={(e) => setEditDraft({ ...editDraft, password: e.target.value })} className={`${inputClass} font-mono`} />
                        </label>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Shield className="h-3.5 w-3.5 text-blue-700" />
                          <span>التغييرات تُحفظ وتُزامن لجميع المستخدمين</span>
                        </div>
                        <button type="submit" className="flex items-center gap-1 rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900">
                          <Check className="h-3.5 w-3.5" />
                          حفظ
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </section>
        </div>

        <div className="shrink-0 border-t border-blue-100 bg-sky-50 p-3 text-center text-[11px] text-blue-900">
          يتم حفظ التعديلات ومزامنتها تلقائياً مع السيرفر ولجميع المستخدمين.
        </div>
      </div>
    </div>
  );
};
