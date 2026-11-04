import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Users, UserPlus, Trash2, Pencil, Shield, Check, X, AlertCircle, ImagePlus } from 'lucide-react';

interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const resizeUserPhoto = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 320 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('تعذر تجهيز الصورة'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.62));
      };
      image.onerror = () => reject(new Error('تعذر قراءة الصورة'));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    reader.readAsDataURL(file);
  });

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useDashboard();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Quality Engineer');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: '', username: '', password: '', role: '', photoUrl: '' });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const cancelAddUser = () => {
    setShowAddForm(false);
    setName('');
    setUsername('');
    setPassword('');
    setRole('Quality Engineer');
    setNewPhotoUrl('');
    setStatusMessage(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) return;

    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setStatusMessage('اسم المستخدم موجود بالفعل، يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    try {
      await addUser(name.trim(), username.trim(), password.trim(), role.trim(), newPhotoUrl);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'تعذر حفظ المستخدم.');
      return;
    }
    setName('');
    setUsername('');
    setPassword('');
    setRole('Quality Engineer');
    setNewPhotoUrl('');
    setShowAddForm(false);
    setStatusMessage('تمت إضافة المستخدم بنجاح!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveUser = async (userId: string) => {
    const nameValue = editValues.name.trim();
    const usernameValue = editValues.username.trim();
    const passwordValue = editValues.password.trim();
    const roleValue = editValues.role.trim();
    if (!nameValue || !usernameValue || !roleValue) return;

    if (users.some((user) => user.id !== userId && user.username.toLowerCase() === usernameValue.toLowerCase())) {
      setStatusMessage('اسم المستخدم موجود بالفعل، يرجى اختيار اسم مستخدم آخر.');
      return;
    }

    try {
      await updateUser(userId, {
      name: nameValue,
      username: usernameValue,
      ...(passwordValue ? { password: passwordValue } : {}),
      role: roleValue,
      photoUrl: editValues.photoUrl,
      });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'تعذر تحديث المستخدم.');
      return;
    }
    setEditingUserId(null);
    setStatusMessage('تم تحديث بيانات المستخدم بنجاح!');
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
        <div className="p-4 bg-blue-950 text-white border-b-2 border-amber-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center">
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
              onClick={() => showAddForm ? cancelAddUser() : setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors"
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
        {statusMessage && (() => { const isSuccess = statusMessage.startsWith('تم'); return <div className={`${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} border-b px-4 py-2 text-xs font-semibold flex items-center gap-2`}>
            {isSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="text-rose-600">!</span>}
            <span>{statusMessage}</span>
          </div>; })()}

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Add New User Form */}
          {showAddForm && (
            <form onSubmit={handleCreateUser} className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
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

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-white p-2 text-xs font-semibold text-blue-800 hover:bg-blue-50">
                <ImagePlus className="h-4 w-4" />
                {newPhotoUrl ? 'تغيير صورة المستخدم' : 'إضافة صورة المستخدم'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      setNewPhotoUrl(await resizeUserPhoto(file));
                      setStatusMessage(null);
                    } catch {
                      setStatusMessage('تعذر تحميل الصورة، جرّب ملفًا آخر.');
                    }
                    event.target.value = '';
                  }}
                />
              </label>
              {newPhotoUrl && (
                <div className="flex items-center gap-2">
                  <img src={newPhotoUrl} alt="معاينة صورة المستخدم" className="h-10 w-10 rounded-full border border-blue-200 object-cover" />
                  <button type="button" onClick={() => setNewPhotoUrl('')} className="text-[10px] font-semibold text-rose-600 hover:text-rose-700">
                    إزالة الصورة
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={cancelAddUser}
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
          <datalist id="quality-role-options">
            <option value="Quality Manager" />
            <option value="Quality Lead" />
            <option value="Senior Quality" />
            <option value="Quality Engineer" />
            <option value="Quality Auditor" />
            <option value="QA Specialist" />
          </datalist>
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
                      {u.photoUrl ? (
                        <img src={u.photoUrl} alt={u.name} className="h-9 w-9 shrink-0 rounded-full border border-blue-200 object-cover shadow-2xs" />
                      ) : (
                        <div className={`w-9 h-9 rounded-full ${u.color || 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                          {u.name.slice(0, 2)}
                        </div>
                      )}
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
                            setEditValues({ name: u.name, username: u.username, password: '', role: u.role, photoUrl: u.photoUrl || '' });
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-medium transition-colors"
                        title="تعديل بيانات المستخدم"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'إلغاء' : 'تعديل البيانات'}</span>
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

                  {/* Full User Edit Form */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white p-3 rounded-lg border border-indigo-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          الاسم الكامل
                          <input
                            required
                            value={editValues.name}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className="mt-1 w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </label>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          المسمى الوظيفي
                          <input
                            required
                            
                            value={editValues.role}
                            onChange={(e) => setEditValues({ ...editValues, role: e.target.value })}
                            className="mt-1 w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </label>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          اسم المستخدم
                          <input
                            required
                            value={editValues.username}
                            onChange={(e) => setEditValues({ ...editValues, username: e.target.value })}
                            className="mt-1 w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </label>
                        <label className="block text-[11px] font-semibold text-slate-700">
                          كلمة مرور جديدة (اختياري)
                          <input
                            type="password"
                            placeholder="اتركها فارغة للاحتفاظ بالحالية"
                            value={editValues.password}
                            onChange={(e) => setEditValues({ ...editValues, password: e.target.value })}
                            className="mt-1 w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </label>
                      </div>
                      <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
                        <label className="flex cursor-pointer items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2 py-1.5 text-[10px] font-semibold text-blue-800 hover:bg-blue-100">
                          <ImagePlus className="h-3.5 w-3.5" />
                          تغيير الصورة
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              try {
                                const photoUrl = await resizeUserPhoto(file);
                                setEditValues((current) => ({ ...current, photoUrl }));
                                setStatusMessage(null);
                              } catch {
                                setStatusMessage('تعذر تحميل الصورة، جرّب ملفًا آخر.');
                              }
                              event.target.value = '';
                            }}
                          />
                        </label>
                        {editValues.photoUrl && (
                          <button type="button" onClick={() => setEditValues({ ...editValues, photoUrl: '' })} className="text-[10px] font-semibold text-rose-600 hover:text-rose-700">
                            إزالة الصورة
                          </button>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSaveUser(u.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          حفظ التعديلات
                        </button>
                      </div>
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
