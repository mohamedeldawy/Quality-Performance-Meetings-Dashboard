import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { QualityMemberProfile, SeniorityTier } from '../../types/dashboard';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  FolderArchive,
  UserCheck,
  Users,
  ChevronDown,
  Sparkles,
  ImagePlus,
  Pencil,
} from 'lucide-react';

type MemberFormValues = QualityMemberProfile & {
  name: string;
  role: string;
  seniority: SeniorityTier;
};

const prepareMemberImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 480 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('تعذر تجهيز الصورة'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.onerror = () => reject(new Error('تعذر قراءة الصورة'));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    reader.readAsDataURL(file);
  });

export const Column1Quality: React.FC = () => {
  const {
    members,
    activeMemberId,
    setActiveMemberId,
    activeMember,
    activeMeeting,
    setActiveMeetingId,
    addMember,
    updateMember,
    deleteMember,
    addMeeting,
    deleteMeeting,
  } = useDashboard();

  // Tier selection: Junior, Middle, Senior
  const [selectedTier, setSelectedTier] = useState<SeniorityTier>(() => {
    return activeMember?.seniority || 'Senior';
  });

  // State to toggle between showing only the active member vs showing the tier's members list
  const [isChangingMember, setIsChangingMember] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberFormValues>({
    name: '',
    role: '',
    seniority: 'Senior',
    subject: '',
    stages: '',
    summaryGrades: '',
    quizGrades: '',
    visualizationGrades: '',
    courseCount: 0,
    photoUrl: '',
  });
  const [imageError, setImageError] = useState('');

  // Filter members based on selected tier
  const tierMembers = useMemo(() => {
    return members.filter((m) => (m.seniority || 'Middle') === selectedTier);
  }, [members, selectedTier]);

  // Counts for the 3 tier tabs
  const tierCounts = useMemo(() => {
    return {
      Junior: members.filter((m) => (m.seniority || 'Middle') === 'Junior').length,
      Middle: members.filter((m) => (m.seniority || 'Middle') === 'Middle').length,
      Senior: members.filter((m) => (m.seniority || 'Middle') === 'Senior').length,
    };
  }, [members]);

  const handleSelectTier = (tier: SeniorityTier) => {
    setSelectedTier(tier);
    // If current active member is in this tier, keep them; otherwise if not in this tier, show list so user can pick
    if (activeMember?.seniority !== tier) {
      setIsChangingMember(true);
    }
  };

  const handleSelectMember = (id: string) => {
    setActiveMemberId(id);
    setIsChangingMember(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim()) return;
    const { name, role, seniority, ...profile } = memberForm;
    if (editingMemberId) {
      updateMember(editingMemberId, { name: name.trim(), role: role.trim() || 'Quality Engineer', seniority, ...profile });
    } else {
      addMember(name.trim(), role.trim() || undefined, seniority, profile);
    }
    setSelectedTier(seniority);
    setShowAddMemberForm(false);
    setEditingMemberId(null);
    setImageError('');
    setIsChangingMember(false);
  };

  const startEditingMember = () => {
    if (!activeMember) return;
    setMemberForm({
      name: activeMember.name,
      role: activeMember.role,
      seniority: activeMember.seniority || selectedTier,
      subject: activeMember.subject || '',
      stages: activeMember.stages || '',
      summaryGrades: activeMember.summaryGrades || '',
      quizGrades: activeMember.quizGrades || '',
      visualizationGrades: activeMember.visualizationGrades || '',
      courseCount: activeMember.courseCount || 0,
      photoUrl: activeMember.photoUrl || '',
    });
    setEditingMemberId(activeMember.id);
    setShowAddMemberForm(true);
    setImageError('');
  };

  // Helper for English meetings header
  const meetingsHeaderTitle = `Meetings ${activeMember?.name || 'Member'}`;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Column Header (Indigo / Purple theme) */}
      <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-950 to-blue-900 text-white flex items-center justify-between border-b border-amber-400/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-mono font-bold shadow-xs">
            1
          </span>
          <h2 className="text-xs font-bold tracking-wide">Quality</h2>
        </div>

        <button
          onClick={() => {
            setEditingMemberId(null);
            setMemberForm({
              name: '',
              role: '',
              seniority: selectedTier,
              subject: '',
              stages: '',
              summaryGrades: '',
              quizGrades: '',
              visualizationGrades: '',
              courseCount: 0,
              photoUrl: '',
            });
            setShowAddMemberForm(!showAddMemberForm);
          }}
          className="flex items-center gap-1 px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-semibold transition-colors shadow-xs"
          title="إضافة عضو كواليتي جديد"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddMemberForm ? 'إلغاء' : '+ عضو جديد'}</span>
        </button>
      </div>

      {/* English Subtitle */}
      <div className="px-3 py-1.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-blue-950 font-sans">
          Team Members & Monthly Performance Meetings
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/90 text-indigo-700 border border-indigo-200 rounded font-bold">
          {members.length} Members
        </span>
      </div>

      {/* 3 Seniority Boxes (Junior / Middle / Senior) */}
      <div className="p-2 bg-slate-50/90 border-b border-slate-200 shrink-0">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-0.5 flex items-center justify-between">
          <span>مستوى الخبرة (Seniority Tier):</span>
          <span className="text-indigo-600 font-mono text-[9px] font-bold">3 Tiers</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['Junior', 'Middle', 'Senior'] as SeniorityTier[]).map((tier) => {
            const isSelected = selectedTier === tier;
            const count = tierCounts[tier];

            return (
              <button
                key={tier}
                type="button"
                onClick={() => handleSelectTier(tier)}
                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{tier}</span>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-indigo-700/90 text-indigo-100' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count} {count === 1 ? 'عضو' : 'أعضاء'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-2.5 space-y-3 overflow-y-auto" dir="rtl">
        {/* Add Member Form */}
        {showAddMemberForm && (
          <form
            onSubmit={handleAddMember}
            className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-blue-950">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{editingMemberId ? 'تعديل ملف عضو الجودة:' : 'إضافة عضو جودة جديد:'}</span>
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">اسم العضو *</label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد حسن"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  placeholder="مثال: أخصائي جودة"
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">المستوى (Tier) *</label>
                <select
                  value={memberForm.seniority}
                  onChange={(e) => setMemberForm({ ...memberForm, seniority: e.target.value as SeniorityTier })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                >
                  <option value="Junior">Junior</option>
                  <option value="Middle">Middle</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[11px] font-semibold text-slate-700">
                المادة
                <input
                  value={memberForm.subject}
                  onChange={(e) => setMemberForm({ ...memberForm, subject: e.target.value })}
                  placeholder="مثال: الرياضيات"
                  className="mt-1 w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </label>
              <label className="block text-[11px] font-semibold text-slate-700">
                المراحل الدراسية
                <input
                  value={memberForm.stages}
                  onChange={(e) => setMemberForm({ ...memberForm, stages: e.target.value })}
                  placeholder="مثال: إعدادي وثانوي"
                  className="mt-1 w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </label>
              <label className="block text-[11px] font-semibold text-slate-700">
                ملخصات أي صفوف؟
                <input
                  value={memberForm.summaryGrades}
                  onChange={(e) => setMemberForm({ ...memberForm, summaryGrades: e.target.value })}
                  placeholder="مثال: الأول والثاني الثانوي"
                  className="mt-1 w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </label>
              <label className="block text-[11px] font-semibold text-slate-700">
                التصورات لأي صفوف؟
                <input
                  value={memberForm.visualizationGrades}
                  onChange={(e) => setMemberForm({ ...memberForm, visualizationGrades: e.target.value })}
                  placeholder="حدد الصفوف الدراسية"
                  className="mt-1 w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </label>
              <label className="block text-[11px] font-semibold text-slate-700">
                كويزات أي صفوف؟
                <input
                  value={memberForm.quizGrades}
                  onChange={(e) => setMemberForm({ ...memberForm, quizGrades: e.target.value })}
                  placeholder="حدد الصفوف الدراسية"
                  className="mt-1 w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <label className="block text-[11px] font-semibold text-slate-700">
                عدد الكورسات المسؤول عنها
                <input
                  type="number"
                  min="0"
                  value={memberForm.courseCount}
                  onChange={(e) => setMemberForm({ ...memberForm, courseCount: Number(e.target.value) })}
                  className="mt-1 w-full text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </label>
              <div>
                <label className="flex items-center justify-center gap-1.5 w-full p-2 bg-white border border-slate-300 rounded text-[11px] font-semibold text-blue-800 cursor-pointer hover:bg-blue-50">
                  <ImagePlus className="w-4 h-4" />
                  {memberForm.photoUrl ? 'تغيير الصورة' : 'إضافة صورة'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const photoUrl = await prepareMemberImage(file);
                        setMemberForm((current) => ({ ...current, photoUrl }));
                        setImageError('');
                      } catch {
                        setImageError('تعذر تحميل الصورة، جرّب ملفًا آخر.');
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
                {memberForm.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setMemberForm({ ...memberForm, photoUrl: '' })}
                    className="mt-1 text-[10px] text-rose-600 hover:text-rose-700"
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>
            {imageError && <p className="text-[10px] text-rose-600">{imageError}</p>}
            <button
              type="submit"
              className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition-colors"
            >
              {editingMemberId ? 'حفظ تعديلات العضو' : 'حفظ وإضافة العضو'}
            </button>
          </form>
        )}

        {/* SECTION 1: Active Member Single View vs Switcher */}
        {!isChangingMember && activeMember ? (
          /* SINGLE SELECTED MEMBER VIEW (No other members shown) */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                العضو المحدد (Selected Member):
              </span>
              <button
                type="button"
                onClick={() => setIsChangingMember(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>تغيير العضو</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-xl shadow-xs relative">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-950 border-2 border-amber-400 shadow-md shrink-0 flex items-center justify-center">
                    {activeMember.photoUrl ? (
                      <img src={activeMember.photoUrl} alt={activeMember.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">{activeMember.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                      <span>{activeMember.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium truncate">
                      {activeMember.role || 'بدون مسمى وظيفي'}
                    </div>
                    <div className="text-[10px] text-blue-800 font-semibold truncate mt-1">
                      {activeMember.subject || 'لم تُحدد المادة'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-800 text-white font-mono shadow-2xs">
                    {activeMember.seniority || selectedTier}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {activeMember.meetings.length} ميتنج
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-blue-200/80 space-y-1.5 text-[11px]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">المراحل الدراسية</span>
                  <span className="text-slate-800 font-semibold text-left">{activeMember.stages || 'غير محددة'}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">ملخصات</span>
                  <span className="text-slate-800 font-semibold text-left">{activeMember.summaryGrades || 'غير محددة'}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">الكويزات</span>
                  <span className="text-slate-800 font-semibold text-left">{activeMember.quizGrades || 'غير محددة'}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">التصورات</span>
                  <span className="text-slate-800 font-semibold text-left">{activeMember.visualizationGrades || 'غير محددة'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-blue-100">
                  <span className="text-blue-900 font-bold">الكورسات المسؤول عنها</span>
                  <span className="min-w-7 text-center px-2 py-0.5 rounded bg-amber-100 text-slate-900 font-bold">
                    {activeMember.courseCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Action bar inside selected member card */}
              <div className="mt-2.5 pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsChangingMember(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-md font-semibold transition-colors shadow-2xs"
                >
                  <Users className="w-3 h-3" />
                  <span>تبديل العضو من قائمة {selectedTier}</span>
                </button>

                <button
                  type="button"
                  onClick={startEditingMember}
                  className="p-1 text-blue-700 hover:text-blue-900 transition-colors"
                  title="تعديل بيانات العضو"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف ${activeMember.name}؟`)) {
                        deleteMember(activeMember.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="حذف هذا العضو"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* MEMBER SELECTION LIST FOR ACTIVE TIER */
          <div className="space-y-1.5 bg-slate-50/80 p-2 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-700">
                اختر عضواً من فئة ({selectedTier}):
              </span>
              {activeMember && (
                <button
                  type="button"
                  onClick={() => setIsChangingMember(false)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  إلغاء التغيير
                </button>
              )}
            </div>

            {tierMembers.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                لا يوجد أعضاء مسجلين في فئة <strong className="text-indigo-600">{selectedTier}</strong> حالياً.
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberForm((current) => ({ ...current, seniority: selectedTier }));
                      setShowAddMemberForm(true);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                  >
                    + إضافة أول عضو لـ {selectedTier}
                  </button>
                </div>
              </div>
            ) : (
              tierMembers.map((member) => {
                const isActive = member.id === activeMemberId;

                return (
                  <div
                    key={member.id}
                    onClick={() => handleSelectMember(member.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isActive ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {member.name.slice(0, 2)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isActive ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          {member.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.meetings.length} ميتينج
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SECTION 2: Active Member's Meetings Archive */}
        {activeMember && (
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-sans">
                <FolderArchive className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {/* User explicitly requested meetings header in English */}
                <span className="tracking-tight text-indigo-950 font-bold">{meetingsHeaderTitle}:</span>
              </div>
              <button
                type="button"
                onClick={() => addMeeting()}
                className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold transition-colors shadow-2xs"
                title="إضافة ميتينج جديد لهذا العضو لشهر آخر"
              >
                <Plus className="w-3 h-3" />
                <span>+ New Meeting</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {activeMember.meetings.map((meeting) => {
                const isCurrentMeeting = meeting.id === activeMeeting?.id;

                return (
                  <div
                    key={meeting.id}
                    onClick={() => setActiveMeetingId(meeting.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isCurrentMeeting
                        ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-slate-900 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCurrentMeeting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{meeting.title}</span>
                          {isCurrentMeeting && (
                            <span className="text-[10px] text-emerald-300 font-mono font-medium">
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
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-indigo-50/50 border-t border-indigo-100 text-[10px] text-indigo-900 text-center font-mono shrink-0">
        Active: {activeMember?.name} ({activeMember?.seniority || selectedTier}) · {activeMeeting?.title}
      </div>
    </div>
  );
};
