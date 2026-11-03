import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { QualityMemberProfile, QualityMemberReview, ActionItem, DepartmentActionItem, DepartmentActionItem, AppUser, DashboardSyncData, MeetingSession, SeniorityTier } from '../types/dashboard';
import { INITIAL_MEMBERS } from '../data/initialData';
import { apiRequest, clearAccessToken, saveAccessToken } from '../lib/api';

interface DashboardContextType {
  // Authentication & Users
  currentUser: AppUser | null;
  users: AppUser[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addUser: (name: string, username: string, password: string, role?: string, photoUrl?: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Members & Meetings
  members: QualityMemberReview[];
  activeMemberId: string;
  activeMember: QualityMemberReview;
  activeMeeting: MeetingSession;
  setActiveMemberId: (id: string) => void;
  setActiveMeetingId: (meetingId: string) => void;
  updateMeetingDate: (meetingDate: string) => void;
  addMember: (name: string, role?: string, seniority?: SeniorityTier, profile?: QualityMemberProfile) => void;
  updateMember: (id: string, updates: Partial<QualityMemberReview>) => void;
  updateMemberSeniority: (id: string, seniority: SeniorityTier) => void;
  deleteMember: (id: string) => void;
  addMeeting: (title?: string) => void;
  deleteMeeting: (meetingId: string) => void;

  // Sync state
  syncStatus: 'synced' | 'saving' | 'syncing' | 'offline';
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  refreshFromServer: () => Promise<void>;

  // Column 2: Duration
  updateMemberDuration: (startDate: string, endDate: string, notes?: string) => void;

  // Column 3: Total Tasks Screen
  updateTotalTasksScreen: (screenshotUrl: string | null, fileName?: string) => void;

  // Column 4: Overplanned Negotiation
  updateOverplannedDiscussion: (notes: string) => void;
  addOverplannedAction: (text: string, dueDate?: string) => void;
  toggleOverplannedAction: (actionId: string) => void;
  deleteOverplannedAction: (actionId: string) => void;
  addOverplannedDepartmentAction: (department: string, dueDate: string) => void;
  deleteOverplannedDepartmentAction: (actionId: string) => void;
  setOverplannedNoAction: (value: boolean) => void;

  // Column 5: Tickets Screen
  updateTicketsDiscussion: (notes: string) => void;
  addTicketsAction: (text: string, dueDate?: string) => void;
  toggleTicketsAction: (actionId: string) => void;
  deleteTicketsAction: (actionId: string) => void;
  addTicketsDepartmentAction: (department: string, dueDate: string) => void;
  deleteTicketsDepartmentAction: (actionId: string) => void;
  setTicketsNoAction: (value: boolean) => void;

  // Column 6: Meeting Report
  updateMeetingReportFile: (fileUrl: string | null, fileName?: string, fileSize?: string) => void;
  updateMeetingReportNotes: (notes: string) => void;
  updateMeetingReportRecipient: (recipient: string) => void;
  updateDepartmentReport: (department: string, fileUrl: string | null, fileName?: string, fileSize?: string) => void;
  updateQualityReport: (fileUrl: string | null, fileName?: string, fileSize?: string) => void;
  updateQualityReport: (fileUrl: string | null, fileName?: string, fileSize?: string) => void;

  resetToDefaults: () => Promise<void>;
}

const STORAGE_KEY = 'quality_team_meeting_dashboard_v6';
const USERS_STORAGE_KEY = 'quality_team_users_v3';
const AUTH_SESSION_KEY = 'quality_team_auth_session_v2';

const normalizeDepartmentActions = (value: unknown): DepartmentActionItem[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (typeof item === 'string') return [{ id: `legacy-dept-${index}-${item}`, department: item, text: `Action for ${item}`, done: false, dueDate: '' }];
    if (item && typeof item === 'object' && typeof item.department === 'string') return [{ ...item, id: item.id || `dept-${index}-${Date.now()}`, text: item.text || `Action for ${item.department}`, done: Boolean(item.done), dueDate: item.dueDate || '' } as DepartmentActionItem];
    return [];
  });
};

const normalizeStringList = (value: unknown): string[] => {
  const values = Array.isArray(value) ? value : typeof value === 'string' && value.trim() ? [value.trim()] : [];
  return Array.from(new Set(values.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)));
};

const cleanMeetingTitle = (title: string) => title.replace(/\s*\(فحص الشاشات والتسجيل\)/g, '').trim();

const normalizeMemberProfile = (member: QualityMemberReview): QualityMemberReview => ({
  ...member,
  subject: normalizeStringList(member.subject),
  summaryGrades: normalizeStringList(member.summaryGrades),
  quizGrades: normalizeStringList(member.quizGrades),
  coursesReviewed: normalizeStringList(member.coursesReviewed),
  coursesProduced: normalizeStringList(member.coursesProduced),
  stages: member.stages || '',
  photoUrl: member.photoUrl || '',
  meetings: Array.isArray(member.meetings)
    ? member.meetings.map((meeting) => ({ ...meeting, title: cleanMeetingTitle(meeting.title), overplannedNegotiation: { ...meeting.overplannedNegotiation, departmentsActions: normalizeDepartmentActions(meeting.overplannedNegotiation?.departmentsActions) }, ticketsScreen: { ...meeting.ticketsScreen, departmentsActions: normalizeDepartmentActions(meeting.ticketsScreen?.departmentsActions) } }))
    : [],
});

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users state with defensive defaults
  const [users, setUsers] = useState<AppUser[]>([]);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Members state with migration safety
  const [members, setMembers] = useState<QualityMemberReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('quality_team_meeting_dashboard_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) return [];
          return parsed.map((m: any, idx: number) => {
            const roleStr = (m.role || '').toLowerCase();
            const inferredSeniority: SeniorityTier =
              m.seniority ||
              (roleStr.includes('lead') || roleStr.includes('senior')
                ? 'Senior'
                : roleStr.includes('junior')
                ? 'Junior'
                : 'Middle');

            const hasMeetings = Array.isArray(m.meetings) && m.meetings.length > 0;
            if (!hasMeetings) {
              const defaultMtg: MeetingSession = {
                id: `mtg-${Date.now()}-${idx}`,
                title: 'Meeting 1',
                createdAt: '2026-10-26',
                duration: m.duration || { startDate: '2026-09-25', endDate: '2026-10-26', notes: '' },
                totalTasksScreen: m.totalTasksScreen || { screenshotUrl: null },
                overplannedNegotiation: m.overplannedNegotiation || { discussionNotes: '', actions: [] },
                ticketsScreen: m.ticketsScreen || { discussionNotes: '', actions: [] },
                meetingReport: m.meetingReport ? { ...m.meetingReport } : { fileUrl: null },
              };
              return {
                id: m.id || `m-${idx}`,
                name: m.name || `Member ${idx + 1}`,
                role: m.role === 'Frontend QA Specialist' ? '' : m.role || 'Quality Engineer',
                seniority: inferredSeniority,
                subject: normalizeStringList(m.subject),
                stages: m.stages || '',
                summaryGrades: normalizeStringList(m.summaryGrades),
                quizGrades: normalizeStringList(m.quizGrades),
                coursesReviewed: normalizeStringList(m.coursesReviewed),
                coursesProduced: normalizeStringList(m.coursesProduced),
                photoUrl: m.photoUrl || '',
                meetings: [defaultMtg],
                activeMeetingId: defaultMtg.id,
                lastUpdatedBy: m.lastUpdatedBy || 'النظام',
                lastUpdatedAt: m.lastUpdatedAt || 'الآن',
              };
            }
            return {
              id: m.id || `m-${idx}`,
              name: m.name || `Member ${idx + 1}`,
              role: m.role === 'Frontend QA Specialist' ? '' : m.role || 'Quality Engineer',
              seniority: inferredSeniority,
              subject: normalizeStringList(m.subject),
              stages: m.stages || '',
              summaryGrades: normalizeStringList(m.summaryGrades),
              quizGrades: normalizeStringList(m.quizGrades),
              coursesReviewed: normalizeStringList(m.coursesReviewed),
              coursesProduced: normalizeStringList(m.coursesProduced),
              photoUrl: m.photoUrl || '',
              meetings: m.meetings.map((mtg: any, mIdx: number) => ({
                id: mtg.id || `mtg-${mIdx}`,
                title: cleanMeetingTitle(mtg.title || `Meeting ${mIdx + 1}`),
                createdAt: mtg.createdAt || '2026-10-26',
                duration: mtg.duration || { startDate: '2026-09-25', endDate: '2026-10-26', notes: '' },
                totalTasksScreen: mtg.totalTasksScreen || { screenshotUrl: null },
                overplannedNegotiation: {
                  discussionNotes: mtg.overplannedNegotiation?.discussionNotes || '',
                  actions: Array.isArray(mtg.overplannedNegotiation?.actions) ? mtg.overplannedNegotiation.actions : [],
                },
                ticketsScreen: {
                  discussionNotes: mtg.ticketsScreen?.discussionNotes || '',
                  actions: Array.isArray(mtg.ticketsScreen?.actions) ? mtg.ticketsScreen.actions : [],
                },
                meetingReport: {
                  fileUrl: mtg.meetingReport?.fileUrl || null,
                  fileName: mtg.meetingReport?.fileName,
                  fileSize: mtg.meetingReport?.fileSize,
                  uploadedAt: mtg.meetingReport?.uploadedAt,
                  notes: mtg.meetingReport?.notes || '',
                  reportRecipient: mtg.meetingReport?.reportRecipient || 'أحمد',
                },
              })),
              activeMeetingId: m.activeMeetingId || m.meetings[0]?.id || `mtg-${Date.now()}`,
              lastUpdatedBy: m.lastUpdatedBy || 'النظام',
              lastUpdatedAt: m.lastUpdatedAt || 'الآن',
            };
          });
        }
      }
      return INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return members[0]?.id || 'm1';
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'syncing' | 'offline'>('synced');
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>('النظام');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('الآن');
  const versionRef = useRef<number>(1);
  const isSavingRef = useRef<boolean>(false);

  // Active member and active meeting (bulletproof against undefined)
  const activeMember: QualityMemberReview =
    members.find((m) => m.id === activeMemberId) || members[0] || INITIAL_MEMBERS[0];

  const safeMeetings: MeetingSession[] =
    Array.isArray(activeMember.meetings) && activeMember.meetings.length > 0
      ? activeMember.meetings
      : INITIAL_MEMBERS[0].meetings;

  const selectedMeeting: MeetingSession =
    safeMeetings.find((mtg) => mtg.id === activeMember.activeMeetingId) ||
    safeMeetings[0] ||
    INITIAL_MEMBERS[0].meetings[0];
  const activeMeeting: MeetingSession = {
    ...selectedMeeting,
    title: cleanMeetingTitle(selectedMeeting.title),
  };

  // Keep dashboard data cached locally; credentials and sessions are server-only.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(members)); } catch { /* quota fallback */ }
  }, [members]);

  // Authentication is verified by the Supabase Edge Function; the bearer token stays in this browser tab.
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiRequest('login', { username: username.trim(), password }, false);
      const data = await res.json();
      if (!res.ok || !data.success || !data.user) return { success: false, error: data.error || 'تعذر تسجيل الدخول' };
      saveAccessToken(data.token);
      setCurrentUser(data.user);
      await refreshFromServer();
      return { success: true };
    } catch {
      return { success: false, error: 'تعذر الاتصال بالسيرفر. تحقق من الاتصال وحاول مرة أخرى.' };
    }
  };

  const logout = () => {
    void apiRequest('logout').catch(() => undefined);
    clearAccessToken();
    setCurrentUser(null);
    setUsers([]);
  };

  // Fetch state from server
  const refreshFromServer = async () => {
    try {
      const res = await apiRequest('dashboard-read');
      if (res.status === 401) {
        clearAccessToken();
        setCurrentUser(null);
        setUsers([]);
        setSyncStatus('offline');
        return;
      }
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const remoteData: DashboardSyncData = json.data;

          if (remoteData.version >= versionRef.current && !isSavingRef.current) {
            versionRef.current = remoteData.version;
            if (Array.isArray(remoteData.members)) {
              setMembers(remoteData.members.map(normalizeMemberProfile));
            }
            if (Array.isArray(remoteData.users)) {
              setUsers(remoteData.users);
            }
            setActiveMemberId(remoteData.activeMemberId || remoteData.members[0]?.id || '');
            setLastUpdatedBy(remoteData.lastUpdatedBy);
            setLastUpdatedAt(remoteData.lastUpdatedAt);
          }
          setSyncStatus('synced');
        }
      }
    } catch {
      setSyncStatus('offline');
    }
  };

  // Push updates to server
  const pushToServer = async (newMembers: QualityMemberReview[], newActiveId?: string) => {
    isSavingRef.current = true;
    setSyncStatus('saving');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembers));
      const res = await apiRequest('dashboard-write', { members: newMembers, activeMemberId: newActiveId ?? activeMemberId });

      if (res.ok) {
        const json = await res.json();
        if (json.version) {
          versionRef.current = json.version;
          setLastUpdatedBy(json.lastUpdatedBy);
          setLastUpdatedAt(json.lastUpdatedAt);
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch {
      setSyncStatus('offline');
    } finally {
      isSavingRef.current = false;
    }
  };

  // Restore the authenticated session from this tab's session token.
  useEffect(() => {
    let active = true;
    apiRequest('session')
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.user : null;
      })
      .then(async (user) => {
        if (!active) return;
        setCurrentUser(user);
        if (user) await refreshFromServer();
      })
      .catch(() => { if (active) setSyncStatus('offline'); });
    return () => { active = false; };
  }, []);

  // Poll shared state so edits from other team members appear automatically.
  useEffect(() => {
    if (!currentUser) return;
    const timer = window.setInterval(() => { void refreshFromServer(); }, 5000);
    return () => window.clearInterval(timer);
  }, [currentUser]);

  // Remove legacy browser-stored credentials from earlier versions.
  useEffect(() => {
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem('quality_team_users_v2');
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem('quality_team_auth_session_v1');
  }, []);

  // Update current member's ACTIVE MEETING
  const updateCurrentMeeting = (updater: (prevMeeting: MeetingSession) => MeetingSession) => {
    if (members.length === 0) return;
    const nowFormatted = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser ? currentUser.name : 'مستخدم الداشبورد';

    const updatedMembers = members.map((m) => {
      if (m.id !== activeMember.id) return m;

      const currentMeetings = Array.isArray(m.meetings) && m.meetings.length > 0 ? m.meetings : [activeMeeting];
      const updatedMeetings = currentMeetings.map((mtg) => {
        if (mtg.id !== activeMeeting.id) return mtg;
        return updater(mtg);
      });

      return {
        ...m,
        meetings: updatedMeetings,
        lastUpdatedBy: authorName,
        lastUpdatedAt: nowFormatted,
      };
    });

    setMembers(updatedMembers);
    pushToServer(updatedMembers);
  };

  // Member Management
  const addMember = (name: string, role = 'Quality Engineer', seniority: SeniorityTier = 'Middle', profile: QualityMemberProfile = {}) => {
    if (!name.trim()) return;
    const authorName = currentUser ? currentUser.name : 'مستخدم الداشبورد';
    const initialMtgId = `mtg-${Date.now()}`;

    const defaultMeeting: MeetingSession = {
      id: initialMtgId,
      title: 'Meeting 1',
      meetingDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: authorName,
      duration: {
        startDate: '2026-09-25',
        endDate: '2026-10-26',
        notes: '',
      },
      totalTasksScreen: { screenshotUrl: null },
      overplannedNegotiation: { discussionNotes: '', actions: [] },
      ticketsScreen: { discussionNotes: '', actions: [] },
      meetingReport: { fileUrl: null, reportRecipient: 'أحمد', notes: 'تم الاتفاق على كافة الـ Actions وتم رفع التقرير لمتابعة التنفيذ.' },
    };

    const newMember: QualityMemberReview = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Quality Engineer',
      seniority,
      ...profile,
      meetings: [defaultMeeting],
      activeMeetingId: initialMtgId,
      lastUpdatedBy: authorName,
      lastUpdatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setActiveMemberId(newMember.id);
    pushToServer(updated, newMember.id);
  };

  const updateMember = (id: string, updates: Partial<QualityMemberReview>) => {
    const updated = members.map((member) => (member.id === id ? { ...member, ...updates } : member));
    setMembers(updated);
    pushToServer(updated);
  };

  const updateMemberSeniority = (id: string, seniority: SeniorityTier) => {
    const updated = members.map((m) => (m.id === id ? { ...m, seniority } : m));
    setMembers(updated);
    pushToServer(updated);
  };

  const deleteMember = (id: string) => {
    const filtered = members.filter((m) => m.id !== id);
    setMembers(filtered);
    const nextActiveId = activeMemberId === id ? (filtered[0]?.id || '') : activeMemberId;
    setActiveMemberId(nextActiveId);
    pushToServer(filtered, nextActiveId);
  };

  // Meeting Management per Member
  const setActiveMeetingId = (meetingId: string) => {
    const updated = members.map((m) => (m.id === activeMember.id ? { ...m, activeMeetingId: meetingId } : m));
    setMembers(updated);
    pushToServer(updated);
  };

  const updateMeetingDate = (meetingDate: string) => updateCurrentMeeting((prev) => ({ ...prev, meetingDate }));

  const addMeeting = (title?: string) => {
    const authorName = currentUser ? currentUser.name : 'مستخدم الداشبورد';
    const newMtgId = `mtg-${Date.now()}`;
    const nextNumber = safeMeetings.length + 1;

    const newMeeting: MeetingSession = {
      id: newMtgId,
      title: title || `Meeting ${nextNumber}`,
      meetingDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: authorName,
      duration: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
      },
      totalTasksScreen: { screenshotUrl: null },
      overplannedNegotiation: { discussionNotes: '', actions: [] },
      ticketsScreen: { discussionNotes: '', actions: [] },
      meetingReport: { fileUrl: null },
    };

    const updated = members.map((m) => {
      if (m.id !== activeMember.id) return m;
      const currentMtgs = Array.isArray(m.meetings) ? m.meetings : [];
      return {
        ...m,
        meetings: [...currentMtgs, newMeeting],
        activeMeetingId: newMtgId,
        lastUpdatedBy: authorName,
        lastUpdatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
    });

    setMembers(updated);
    pushToServer(updated);
  };

  const deleteMeeting = (meetingId: string) => {
    if (safeMeetings.length <= 1) {
      alert('يجب أن يتبقى ميتينج واحد على الأقل لهذا العضو.');
      return;
    }
    const updated = members.map((m) => {
      if (m.id !== activeMember.id) return m;
      const filteredMtgs = m.meetings.filter((mtg) => mtg.id !== meetingId);
      return {
        ...m,
        meetings: filteredMtgs,
        activeMeetingId: m.activeMeetingId === meetingId ? filteredMtgs[0].id : m.activeMeetingId,
      };
    });

    setMembers(updated);
    pushToServer(updated);
  };

  // User Management
  const addUser = async (name: string, username: string, password: string, role = 'Quality Engineer', photoUrl = '') => {
    if (!name.trim() || !username.trim() || !password.trim()) return;
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-cyan-600'];
    const user: AppUser = {
      id: `user-${Date.now()}`, username: username.trim(), password,
      name: name.trim(), role: role.trim(), color: colors[users.length % colors.length], photoUrl,
    };
    const res = await apiRequest('users-save', { user });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر إضافة المستخدم');
    setUsers(data.users || []);
  };

  const updateUser = async (id: string, updates: Partial<AppUser>) => {
    const existing = users.find((u) => u.id === id);
    if (!existing) return;
    const user = { ...existing, ...updates };
    const res = await apiRequest('users-save', { user });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر تحديث المستخدم');
    setUsers(data.users || []);
    if (currentUser?.id === id) setCurrentUser((data.users || []).find((u: AppUser) => u.id === id) || null);
  };

  const deleteUser = async (id: string) => {
    if (users.length <= 1) { alert('لا يمكن حذف المستخدم الوحيد.'); return; }
    const res = await apiRequest('users-delete', { id });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر حذف المستخدم');
    setUsers((current) => current.filter((u) => u.id !== id));
    if (currentUser?.id === id) logout();
  };

  // Column 2: Duration
  const updateMemberDuration = (startDate: string, endDate: string, notes?: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      duration: {
        startDate,
        endDate,
        notes: notes !== undefined ? notes : prev.duration?.notes || '',
      },
    }));
  };

  // Column 3: Total Tasks Screen
  const updateTotalTasksScreen = (screenshotUrl: string | null, fileName?: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      totalTasksScreen: {
        screenshotUrl,
        fileName: fileName || (screenshotUrl ? 'tasks_screenshot.png' : undefined),
        uploadedAt: screenshotUrl ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : undefined,
      },
    }));
  };

  // Column 4: Overplanned Negotiation
  const updateOverplannedDiscussion = (notes: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      overplannedNegotiation: {
        discussionNotes: notes,
        actions: prev.overplannedNegotiation?.actions || [],
      departmentsActions: prev.overplannedNegotiation?.departmentsActions || [],
      noAction: prev.overplannedNegotiation?.noAction || false,
      },
    }));
  };

  const addOverplannedDepartmentAction = (department: string, dueDate: string) => updateCurrentMeeting((prev) => ({ ...prev, overplannedNegotiation: { ...prev.overplannedNegotiation, discussionNotes: prev.overplannedNegotiation?.discussionNotes || '', actions: prev.overplannedNegotiation?.actions || [], departmentsActions: [...normalizeDepartmentActions(prev.overplannedNegotiation?.departmentsActions), { id: `dept-op-${Date.now()}`, department, text: `Action for ${department}`, done: false, dueDate, createdBy: currentUser?.name || 'Dashboard User' }] } }));
  const deleteOverplannedDepartmentAction = (actionId: string) => updateCurrentMeeting((prev) => ({ ...prev, overplannedNegotiation: { ...prev.overplannedNegotiation, departmentsActions: normalizeDepartmentActions(prev.overplannedNegotiation?.departmentsActions).filter((item) => item.id !== actionId) } }));
  const setOverplannedNoAction = (value: boolean) => updateCurrentMeeting((prev) => ({ ...prev, overplannedNegotiation: { ...prev.overplannedNegotiation, discussionNotes: prev.overplannedNegotiation?.discussionNotes || '', actions: value ? [] : (prev.overplannedNegotiation?.actions || []), departmentsActions: prev.overplannedNegotiation?.departmentsActions || [], noAction: value } }));

  const addOverplannedAction = (text: string, dueDate?: string) => {
    if (!text.trim()) return;
    const authorName = currentUser ? currentUser.name : 'مستخدم الداشبورد';
    const newAction: ActionItem = {
      id: `act-op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: text.trim(),
      done: false,
      dueDate: dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: authorName,
    };

    updateCurrentMeeting((prev) => ({
      ...prev,
      overplannedNegotiation: {
        discussionNotes: prev.overplannedNegotiation?.discussionNotes || '',
        actions: [...(prev.overplannedNegotiation?.actions || []), newAction],
        departmentsActions: prev.overplannedNegotiation?.departmentsActions || [],
        noAction: prev.overplannedNegotiation?.noAction || false,
      },
    }));
  };

  const toggleOverplannedAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      overplannedNegotiation: {
        discussionNotes: prev.overplannedNegotiation?.discussionNotes || '',
        actions: (prev.overplannedNegotiation?.actions || []).map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)),
        departmentsActions: prev.overplannedNegotiation?.departmentsActions || [],
        noAction: prev.overplannedNegotiation?.noAction || false,
      },
    }));
  };

  const deleteOverplannedAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      overplannedNegotiation: {
        discussionNotes: prev.overplannedNegotiation?.discussionNotes || '',
        actions: (prev.overplannedNegotiation?.actions || []).filter((a) => a.id !== actionId),
        departmentsActions: prev.overplannedNegotiation?.departmentsActions || [],
        noAction: prev.overplannedNegotiation?.noAction || false,
      },
    }));
  };

  // Column 5: Tickets Screen
  const updateTicketsDiscussion = (notes: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      ticketsScreen: {
        discussionNotes: notes,
        actions: prev.ticketsScreen?.actions || [],
      departmentsActions: prev.ticketsScreen?.departmentsActions || [],
      noAction: prev.ticketsScreen?.noAction || false,
      },
    }));
  };

  const addTicketsDepartmentAction = (department: string, dueDate: string) => updateCurrentMeeting((prev) => ({ ...prev, ticketsScreen: { ...prev.ticketsScreen, discussionNotes: prev.ticketsScreen?.discussionNotes || '', actions: prev.ticketsScreen?.actions || [], departmentsActions: [...normalizeDepartmentActions(prev.ticketsScreen?.departmentsActions), { id: `dept-tk-${Date.now()}`, department, text: `Action for ${department}`, done: false, dueDate, createdBy: currentUser?.name || 'Dashboard User' }] } }));
  const deleteTicketsDepartmentAction = (actionId: string) => updateCurrentMeeting((prev) => ({ ...prev, ticketsScreen: { ...prev.ticketsScreen, departmentsActions: normalizeDepartmentActions(prev.ticketsScreen?.departmentsActions).filter((item) => item.id !== actionId) } }));
  const setTicketsNoAction = (value: boolean) => updateCurrentMeeting((prev) => ({ ...prev, ticketsScreen: { ...prev.ticketsScreen, discussionNotes: prev.ticketsScreen?.discussionNotes || '', actions: value ? [] : (prev.ticketsScreen?.actions || []), departmentsActions: prev.ticketsScreen?.departmentsActions || [], noAction: value } }));

  const addTicketsAction = (text: string, dueDate?: string) => {
    if (!text.trim()) return;
    const authorName = currentUser ? currentUser.name : 'مستخدم الداشبورد';
    const newAction: ActionItem = {
      id: `act-tk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: text.trim(),
      done: false,
      dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: authorName,
    };

    updateCurrentMeeting((prev) => ({
      ...prev,
      ticketsScreen: {
        discussionNotes: prev.ticketsScreen?.discussionNotes || '',
        actions: [...(prev.ticketsScreen?.actions || []), newAction],
        departmentsActions: prev.ticketsScreen?.departmentsActions || [],
        noAction: prev.ticketsScreen?.noAction || false,
      },
    }));
  };

  const toggleTicketsAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      ticketsScreen: {
        discussionNotes: prev.ticketsScreen?.discussionNotes || '',
        actions: (prev.ticketsScreen?.actions || []).map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)),
        departmentsActions: prev.ticketsScreen?.departmentsActions || [],
        noAction: prev.ticketsScreen?.noAction || false,
      },
    }));
  };

  const deleteTicketsAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      ticketsScreen: {
        discussionNotes: prev.ticketsScreen?.discussionNotes || '',
        actions: (prev.ticketsScreen?.actions || []).filter((a) => a.id !== actionId),
        departmentsActions: prev.ticketsScreen?.departmentsActions || [],
        noAction: prev.ticketsScreen?.noAction || false,
      },
    }));
  };

  // Column 6: Meeting Report
  const updateMeetingReportFile = (fileUrl: string | null, fileName?: string, fileSize?: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      meetingReport: {
        ...prev.meetingReport,
        fileUrl,
        fileName: fileName || (fileUrl ? 'meeting_summary_report.pdf' : undefined),
        fileSize,
        uploadedAt: fileUrl ? new Date().toLocaleDateString('ar-EG') : undefined,
      },
    }));
  };

  const updateDepartmentReport = (department: string, fileUrl: string | null, fileName?: string, fileSize?: string) => {
    updateCurrentMeeting((prev) => ({ ...prev, meetingReport: { ...prev.meetingReport, fileUrl: prev.meetingReport?.fileUrl || null, departmentReports: { ...(prev.meetingReport?.departmentReports || {}), [department]: fileUrl ? { fileUrl, fileName, fileSize, uploadedAt: new Date().toLocaleDateString('ar-EG') } : null } } }));
  };

  const updateQualityReport = (fileUrl: string | null, fileName?: string, fileSize?: string) => updateCurrentMeeting((prev) => ({ ...prev, meetingReport: { ...prev.meetingReport, fileUrl: prev.meetingReport?.fileUrl || null, qualityReport: fileUrl ? { fileUrl, fileName, fileSize, uploadedAt: new Date().toLocaleDateString('en-US') } : null } }));

  const updateMeetingReportNotes = (notes: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      meetingReport: {
        ...prev.meetingReport,
        notes,
      },
    }));
  };

  const updateMeetingReportRecipient = (recipient: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      meetingReport: {
        ...prev.meetingReport,
        reportRecipient: recipient,
      },
    }));
  };

  const resetToDefaults = async () => {
    try {
      const res = await apiRequest('reset');
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data.members);
        setActiveMemberId(json.data.activeMemberId);
        setUsers(json.data.users);
      }
    } catch {
      setMembers(INITIAL_MEMBERS);
      setActiveMemberId(INITIAL_MEMBERS[0].id);
      setUsers([]);
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USERS_STORAGE_KEY);
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        members,
        activeMemberId,
        activeMember,
        activeMeeting,
        setActiveMemberId,
        setActiveMeetingId,
        updateMeetingDate,
        addMember,
        updateMember,
        updateMemberSeniority,
        deleteMember,
        addMeeting,
        deleteMeeting,
        syncStatus,
        lastUpdatedBy,
        lastUpdatedAt,
        refreshFromServer,
        updateMemberDuration,
        updateTotalTasksScreen,
        updateOverplannedDiscussion,
        addOverplannedAction,
        toggleOverplannedAction,
        deleteOverplannedAction,
        addOverplannedDepartmentAction,
        deleteOverplannedDepartmentAction,
        setOverplannedNoAction,
        updateTicketsDiscussion,
        addTicketsAction,
        toggleTicketsAction,
        deleteTicketsAction,
        addTicketsDepartmentAction,
        deleteTicketsDepartmentAction,
        setTicketsNoAction,
        updateMeetingReportFile,
        updateMeetingReportNotes,
        updateMeetingReportRecipient,
        updateDepartmentReport,
        updateQualityReport,
        updateQualityReport,
        resetToDefaults,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
