import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Plus, Trash2, CheckCircle2, Calendar, FolderArchive } from 'lucide-react';

export const Column1Quality: React.FC = () => {
  const {
    members,
    activeMemberId,
    setActiveMemberId,
    activeMember,
    activeMeeting,
    setActiveMeetingId,
    addMember,
    deleteMember,
    addMeeting,
    deleteMeeting,
  } = useDashboard();

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;
    addMember(memberName, memberRole);
    setMemberName('');
    setMemberRole('');
    setShowAddMemberForm(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Column Header (English only, no duplicate Arabic sub-label) */}
      <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px] font-mono font-bold">
            1
          </span>
          <h2 className="text-xs font-bold tracking-wide">Quality</h2>
        </div>

        <button
          onClick={() => setShowAddMemberForm(!showAddMemberForm)}
          className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
          title="إضافة عضو كواليتي جديد"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddMemberForm ? 'إلغاء' : 'إضافة عضو'}</span>
        </button>
      </div>

      {/* Description */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 shrink-0" dir="rtl">
        أعضاء الفريق وميتنجات التقييم الشهرية:
      </div>

      {/* Content */}
      <div className="flex-1 p-2.5 space-y-3 overflow-y-auto" dir="rtl">
        {/* Add Member Form */}
        {showAddMemberForm && (
          <form onSubmit={handleAddMember} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">اسم العضو *</label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد حسن"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">المسمى الوظيفي</label>
              <input
                type="text"
                placeholder="مثال: Quality Assurance Specialist"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

        {/* Quality Members List */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            الأعضاء (Members):
          </div>

          {members.map((member) => {
            const isActive = member.id === activeMemberId;

            return (
              <div
                key={member.id}
                onClick={() => setActiveMemberId(member.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-indigo-50/90 border-indigo-500 ring-1 ring-indigo-400 shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
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
                    <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                    {member.meetings.length} ميتينج
                  </span>
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

        {/* Selected Member's Meetings Archive Section */}
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <FolderArchive className="w-3.5 h-3.5 text-indigo-600" />
              <span>ميتنجات ({activeMember.name}):</span>
            </div>
            <button
              type="button"
              onClick={() => addMeeting()}
              className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold transition-colors"
              title="إضافة ميتينج جديد لهذا العضو لشهر آخر"
            >
              <Plus className="w-3 h-3" />
              <span>+ ميتينج جديد</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {activeMember.meetings.map((meeting) => {
              const isCurrentMeeting = meeting.id === activeMeeting.id;

              return (
                <div
                  key={meeting.id}
                  onClick={() => setActiveMeetingId(meeting.id)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isCurrentMeeting
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isCurrentMeeting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold truncate flex items-center gap-1">
                        <span>{meeting.title}</span>
                        {isCurrentMeeting && (
                          <span className="text-[10px] text-emerald-400 font-mono font-normal">
                            (المعروض الآن)
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] font-mono truncate flex items-center gap-1 ${
                          isCurrentMeeting ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        <Calendar className="w-2.5 h-2.5" />
                        <span>
                          {meeting.duration.startDate || '25/9'} إلى {meeting.duration.endDate || '26/10'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeMember.meetings.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`هل أنت متأكد من حذف ${meeting.title}؟`)) {
                          deleteMeeting(meeting.id);
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        isCurrentMeeting
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-slate-200'
                      }`}
                      title="حذف هذا الميتينج"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 text-center font-mono shrink-0">
        العضو المختار: {activeMember.name} · {activeMeeting.title}
      </div>
    </div>
  );
};
