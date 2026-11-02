import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { UserCheck, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const Column1Quality: React.FC = () => {
  const { members, activeMemberId, setActiveMemberId, addMember, deleteMember } = useDashboard();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMember(name, role);
    setName('');
    setRole('');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Column Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-mono font-bold">
            1
          </span>
          <div>
            <h2 className="text-xs font-bold capitalize">Quality</h2>
            <div className="text-[11px] text-slate-300 font-medium" dir="rtl">الكواليتي</div>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
          title="إضافة عضو كواليتي جديد"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'إلغاء' : 'إضافة عضو'}</span>
        </button>
      </div>

      {/* Description */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 shrink-0" dir="rtl">
        أعضاء فريق الكواليتي (اضغط لاختيار الشخص الذي تجلس معه في الميتينج):
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto" dir="rtl">
        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">اسم العضو *</label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد حسن"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">المسمى الوظيفي</label>
              <input
                type="text"
                placeholder="مثال: Quality Assurance Specialist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium"
            >
              حفظ العضو
            </button>
          </form>
        )}

        {/* Members List */}
        <div className="space-y-2">
          {members.map((member) => {
            const isActive = member.id === activeMemberId;

            return (
              <div
                key={member.id}
                onClick={() => setActiveMemberId(member.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-400 shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {member.name.slice(0, 2)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{member.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {members.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`هل أنت متأكد من حذف ${member.name}؟`)) {
                          deleteMember(member.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="حذف العضو"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-mono shrink-0">
        {members.length} أعضاء في الكواليتي
      </div>
    </div>
  );
};
