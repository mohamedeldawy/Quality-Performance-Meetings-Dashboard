import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { QualityLevel, QualityMemberProfile } from '../../types/dashboard';
import { Plus, Trash2, CheckCircle2, Calendar, FolderArchive, ImagePlus, Pencil, Save, X } from 'lucide-react';

type ProfileFormMode = 'add' | 'edit' | null;
type MemberDraft = QualityMemberProfile;

const emptyMember: MemberDraft = {
  name: '',
  role: '',
  level: 'Middle',
  subject: '',
  schoolStages: '',
  summaryGrades: '',
  quizGrades: '',
  coursesReviewed: 0,
  coursesProduced: 0,
  photoUrl: null,
};

const qualityLevels: { value: QualityLevel | 'All'; label: string }[] = [
  { value: 'All', label: 'الكل' },
  { value: 'Junior', label: 'جونيور' },
  { value: 'Middle', label: 'ميدل' },
  { value: 'Senior', label: 'سينيور' },
];

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

  const [selectedLevel, setSelectedLevel] = useState<QualityLevel | 'All'>('All');
  const [formMode, setFormMode] = useState<ProfileFormMode>(null);
  const [memberDraft, setMemberDraft] = useState<MemberDraft>(emptyMember);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const visibleMembers =
    selectedLevel === 'All' ? members : members.filter((member) => member.level === selectedLevel);

  const selectLevel = (level: QualityLevel | 'All') => {
    setSelectedLevel(level);
    setFormMode(null);
    const nextMembers = level === 'All' ? members : members.filter((member) => member.level === level);
    if (nextMembers.length > 0 && !nextMembers.some((member) => member.id === activeMemberId)) {
      setActiveMemberId(nextMembers[0].id);
    }
  };

  const startAddMember = () => {
    setMemberDraft(emptyMember);
    setPhotoError(null);
    setFormMode(formMode === 'add' ? null : 'add');
  };

  const startEditMember = () => {
    setMemberDraft({
      ...emptyMember,
      ...activeMember,
      photoUrl: activeMember.photoUrl || null,
    });
    setPhotoError(null);
    setFormMode('edit');
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberDraft.name.trim()) return;

    const profile: MemberDraft = {
      ...memberDraft,
      name: memberDraft.name.trim(),
      role: memberDraft.role.trim(),
      subject: memberDraft.subject.trim(),
      schoolStages: memberDraft.schoolStages.trim(),
      summaryGrades: memberDraft.summaryGrades.trim(),
      quizGrades: memberDraft.quizGrades.trim(),
      coursesReviewed: Math.max(0, Number(memberDraft.coursesReviewed) || 0),
      coursesProduced: Math.max(0, Number(memberDraft.coursesProduced) || 0),
    };

    if (formMode === 'edit') {
      updateMember(activeMember.id, profile);
      setSelectedLevel(profile.level);
    } else {
      addMember(profile);
      setSelectedLevel(profile.level);
    }
    setFormMode(null);
    setPhotoError(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('اختار ملف صورة صالح.');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('حجم الصورة يجب ألا يزيد عن 10 ميجابايت.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPhotoError('تعذر قراءة الصورة. حاول مرة أخرى.');
        return;
      }

      const image = new Image();
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) {
          setPhotoError('الصورة غير صالحة. حاول اختيار ملف آخر.');
          return;
        }
        const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          setPhotoError('تعذر تجهيز الصورة. حاول مرة أخرى.');
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setMemberDraft((draft) => ({ ...draft, photoUrl: canvas.toDataURL('image/jpeg', 0.82) }));
        setPhotoError(null);
      };
      image.onerror = () => setPhotoError('تعذر فتح الصورة. حاول اختيار ملف آخر.');
      image.src = reader.result;
    };
    reader.onerror = () => setPhotoError('تعذر قراءة الصورة. حاول مرة أخرى.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const fieldClass =
    'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b-2 border-yellow-400 bg-blue-950 p-3 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 font-mono text-[11px] font-bold text-blue-950">
            1
          </span>
          <h2 className="text-xs font-bold tracking-wide">Quality</h2>
        </div>
        <button
          type="button"
          onClick={startAddMember}
          className="flex items-center gap-1 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-blue-950 transition-colors hover:bg-yellow-300"
          title="إضافة عضو كواليتي جديد"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{formMode === 'add' ? 'إلغاء' : 'إضافة عضو'}</span>
        </button>
      </div>

      <div className="shrink-0 border-b border-blue-100 bg-sky-50 px-3 py-1.5 text-[11px] text-blue-950" dir="rtl">
        أعضاء الفريق وميتنجات التقييم الشهرية
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-2.5" dir="rtl">
        {formMode && (
          <form onSubmit={handleSaveMember} className="space-y-2 rounded-lg border border-blue-200 bg-sky-50 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-950">
              <span>{formMode === 'add' ? 'بيانات عضو جديد' : 'تعديل بيانات العضو'}</span>
              <button type="button" onClick={() => setFormMode(null)} className="text-slate-500 hover:text-blue-900" title="إغلاق">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <label className="block text-[10px] font-semibold text-slate-700">
              اسم العضو *
              <input required value={memberDraft.name} onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })} className={fieldClass} placeholder="مثال: سارة محمود" />
            </label>
            <label className="block text-[10px] font-semibold text-slate-700">
              المسمى الوظيفي
              <input value={memberDraft.role} onChange={(e) => setMemberDraft({ ...memberDraft, role: e.target.value })} className={fieldClass} placeholder="مثال: أخصائي جودة" />
            </label>
            <label className="block text-[10px] font-semibold text-slate-700">
              المستوى
              <select value={memberDraft.level} onChange={(e) => setMemberDraft({ ...memberDraft, level: e.target.value as QualityLevel })} className={fieldClass}>
                <option value="Junior">جونيور</option>
                <option value="Middle">ميدل</option>
                <option value="Senior">سينيور</option>
              </select>
            </label>
            <label className="block text-[10px] font-semibold text-slate-700">
              المادة
              <input value={memberDraft.subject} onChange={(e) => setMemberDraft({ ...memberDraft, subject: e.target.value })} className={fieldClass} placeholder="مثال: الرياضيات" />
            </label>
            <label className="block text-[10px] font-semibold text-slate-700">
              المراحل الدراسية
              <input value={memberDraft.schoolStages} onChange={(e) => setMemberDraft({ ...memberDraft, schoolStages: e.target.value })} className={fieldClass} placeholder="مثال: الصف الأول والثاني الثانوي" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[10px] font-semibold text-slate-700">
                ملخصات - سنة كام
                <input value={memberDraft.summaryGrades} onChange={(e) => setMemberDraft({ ...memberDraft, summaryGrades: e.target.value })} className={fieldClass} placeholder="مثال: أولى ثانوي" />
              </label>
              <label className="block text-[10px] font-semibold text-slate-700">
                تصوير الكويزات - سنة كام
                <input value={memberDraft.quizGrades} onChange={(e) => setMemberDraft({ ...memberDraft, quizGrades: e.target.value })} className={fieldClass} placeholder="مثال: تالتة إعدادي" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[10px] font-semibold text-slate-700">
                كورسات للمراجعة
                <input type="number" min="0" value={memberDraft.coursesReviewed} onChange={(e) => setMemberDraft({ ...memberDraft, coursesReviewed: Number(e.target.value) })} className={fieldClass} />
              </label>
              <label className="block text-[10px] font-semibold text-slate-700">
                كورسات للإنتاج
                <input type="number" min="0" value={memberDraft.coursesProduced} onChange={(e) => setMemberDraft({ ...memberDraft, coursesProduced: Number(e.target.value) })} className={fieldClass} />
              </label>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-blue-300 bg-white px-2 py-2 text-[10px] font-semibold text-blue-800 hover:bg-sky-50">
              <ImagePlus className="h-3.5 w-3.5" />
              {memberDraft.photoUrl ? 'تغيير صورة العضو' : 'إضافة صورة العضو'}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            {photoError && <p className="text-[10px] font-medium text-rose-600">{photoError}</p>}
            {memberDraft.photoUrl && (
              <div className="flex items-center gap-2">
                <img src={memberDraft.photoUrl} alt="معاينة صورة العضو" className="h-10 w-10 rounded-lg border border-blue-200 object-cover" />
                <button type="button" onClick={() => setMemberDraft({ ...memberDraft, photoUrl: null })} className="text-[10px] font-semibold text-rose-600 hover:text-rose-700">
                  إزالة الصورة
                </button>
              </div>
            )}
            <button type="submit" className="flex w-full items-center justify-center gap-1 rounded-md bg-blue-700 py-1.5 text-xs font-bold text-white hover:bg-blue-800">
              <Save className="h-3.5 w-3.5" />
              حفظ البيانات
            </button>
          </form>
        )}

        <section className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <div className="text-[11px] font-bold text-blue-950">أعضاء الفريق</div>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-blue-900">
              إجمالي {members.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {qualityLevels.map(({ value, label }) => {
              const count = value === 'All' ? members.length : members.filter((member) => member.level === value).length;
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => selectLevel(value)}
                  className={`rounded-md border px-1 py-1 text-[10px] font-semibold transition-colors ${
                    selectedLevel === value
                      ? 'border-blue-800 bg-blue-900 text-white'
                      : 'border-blue-100 bg-white text-slate-600 hover:border-blue-300 hover:bg-sky-50'
                  }`}
                >
                  {label} <span className="font-mono">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            {visibleMembers.map((member) => {
              const isActive = member.id === activeMemberId;
              return (
                <div
                  key={member.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveMemberId(member.id);
                    setFormMode(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveMemberId(member.id);
                      setFormMode(null);
                    }
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 transition-colors ${
                    isActive ? 'border-blue-500 bg-sky-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full border border-blue-200 object-cover" />
                    ) : (
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isActive ? 'bg-blue-800 text-white' : 'bg-sky-100 text-blue-900'}`}>
                        {member.name.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                        <span className="truncate">{member.name}</span>
                        {isActive && <CheckCircle2 className="h-3 w-3 shrink-0 text-blue-700" />}
                      </div>
                      <div className="text-[10px] text-slate-500">{member.level} · {member.meetings.length} ميتينج</div>
                    </div>
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`هل أنت متأكد من حذف ${member.name}؟`)) {
                          if (selectedLevel !== 'All' && visibleMembers.length === 1) setSelectedLevel('All');
                          deleteMember(member.id);
                        }
                      }}
                      className="shrink-0 p-1 text-slate-400 transition-colors hover:text-rose-600"
                      title="حذف العضو"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            {visibleMembers.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[10px] text-slate-500">
                لا يوجد أعضاء في هذا المستوى حتى الآن.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-2 border-t border-blue-100 pt-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-blue-950">
              <FolderArchive className="h-3.5 w-3.5 shrink-0 text-blue-700" />
              <span className="truncate">ملف العضو: {activeMember.name}</span>
            </div>
            <button type="button" onClick={startEditMember} className="flex shrink-0 items-center gap-1 rounded border border-blue-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-blue-800 hover:bg-sky-50">
              <Pencil className="h-3 w-3" />
              تعديل
            </button>
          </div>

          <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-sky-50 to-white p-2.5">
            <div className="flex items-center gap-2">
              {activeMember.photoUrl ? (
                <img src={activeMember.photoUrl} alt={activeMember.name} className="h-14 w-14 shrink-0 rounded-xl border-2 border-yellow-400 object-cover shadow-sm" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-yellow-400 bg-blue-900 text-lg font-bold text-white shadow-sm">
                  {activeMember.name.slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-blue-950">{activeMember.name}</h3>
                <p className="truncate text-[10px] font-semibold text-blue-700">{activeMember.role || 'المسمى الوظيفي غير محدد'}</p>
                <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-bold text-blue-950">{activeMember.level}</span>
              </div>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-blue-100 pt-2 text-[10px]">
              <div><dt className="text-slate-500">المادة</dt><dd className="font-semibold text-slate-800">{activeMember.subject || '—'}</dd></div>
              <div><dt className="text-slate-500">المراحل الدراسية</dt><dd className="font-semibold text-slate-800">{activeMember.schoolStages || '—'}</dd></div>
              <div><dt className="text-slate-500">ملخصات - سنة كام</dt><dd className="font-semibold text-slate-800">{activeMember.summaryGrades || '—'}</dd></div>
              <div><dt className="text-slate-500">تصوير الكويزات - سنة كام</dt><dd className="font-semibold text-slate-800">{activeMember.quizGrades || '—'}</dd></div>
              <div><dt className="text-slate-500">كورسات للمراجعة</dt><dd className="font-semibold text-slate-800">{activeMember.coursesReviewed}</dd></div>
              <div><dt className="text-slate-500">كورسات للإنتاج</dt><dd className="font-semibold text-slate-800">{activeMember.coursesProduced}</dd></div>
            </dl>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold text-blue-950">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-700" />
              <span className="truncate">الميتينجز</span>
            </div>
            <button type="button" onClick={() => addMeeting()} className="flex shrink-0 items-center gap-1 rounded border border-blue-200 bg-sky-50 px-1.5 py-1 text-[10px] font-bold text-blue-800 hover:bg-sky-100" title="إضافة ميتينج جديد لهذا العضو">
              <Plus className="h-3 w-3" />
              ميتينج جديد
            </button>
          </div>
          <div className="space-y-1">
            {activeMember.meetings.map((meeting) => {
              const isCurrentMeeting = meeting.id === activeMeeting.id;
              return (
                <div
                  key={meeting.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveMeetingId(meeting.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveMeetingId(meeting.id);
                    }
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 transition-colors ${
                    isCurrentMeeting ? 'border-blue-900 bg-blue-950 text-white' : 'border-blue-100 bg-white text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-bold">{meeting.title}</div>
                    <div className={`truncate text-[10px] ${isCurrentMeeting ? 'text-sky-100' : 'text-slate-500'}`}>
                      {meeting.duration.startDate || '—'} إلى {meeting.duration.endDate || '—'}
                    </div>
                  </div>
                  {activeMember.meetings.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`هل أنت متأكد من حذف ${meeting.title}؟`)) deleteMeeting(meeting.id);
                      }}
                      className={`shrink-0 rounded p-1 ${isCurrentMeeting ? 'text-slate-300 hover:text-rose-300' : 'text-slate-400 hover:text-rose-600'}`}
                      title="حذف هذا الميتينج"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-blue-100 bg-sky-50 p-2 text-center text-[10px] text-blue-900">
        العضو المختار: {activeMember.name} · {activeMeeting.title}
      </div>
    </div>
  );
};
