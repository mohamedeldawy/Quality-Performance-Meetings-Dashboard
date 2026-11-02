import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { QualityLevel, QualityMemberProfile, QualityMemberReview, ActionItem, AppUser, DashboardSyncData, MeetingSession } from '../types/dashboard';
import { INITIAL_MEMBERS, INITIAL_USERS } from '../data/initialData';

interface DashboardContextType {
  // Authentication & Users
  currentUser: AppUser | null;
  users: AppUser[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addUser: (name: string, username: string, password: string, role?: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Members & Meetings
  members: QualityMemberReview[];
  activeMemberId: string;
  activeMember: QualityMemberReview;
  activeMeeting: MeetingSession;
  setActiveMemberId: (id: string) => void;
  setActiveMeetingId: (meetingId: string) => void;
  addMember: (profile: QualityMemberProfile) => void;
  updateMember: (id: string, updates: Partial<QualityMemberProfile>) => void;
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

  // Column 5: Tickets Screen
  updateTicketsDiscussion: (notes: string) => void;
  addTicketsAction: (text: string, dueDate?: string) => void;
  toggleTicketsAction: (actionId: string) => void;
  deleteTicketsAction: (actionId: string) => void;

  // Column 6: Meeting Report
  updateMeetingReportFile: (fileUrl: string | null, fileName?: string, fileSize?: string) => void;
  updateMeetingReportNotes: (notes: string) => void;

  resetToDefaults: () => Promise<void>;
}

const STORAGE_KEY = 'quality_team_meeting_dashboard_v6';
const USERS_STORAGE_KEY = 'quality_team_users_v3';
const AUTH_SESSION_KEY = 'quality_team_auth_session_v2';

const getMigratedMemberProfile = (member: any): QualityMemberProfile => {
  const defaultMember = INITIAL_MEMBERS.find((candidate) => candidate.id === member.id);
  const level: QualityLevel =
    member.level === 'Junior' || member.level === 'Middle' || member.level === 'Senior'
      ? member.level
      : defaultMember?.level || 'Middle';

  return {
    name: member.name || 'عضو جديد',
    role: member.role === 'Frontend QA Specialist' ? 'Quality Engineer' : member.role || 'Quality Engineer',
    level,
    subject: member.subject || '',
    schoolStages: member.schoolStages || '',
    summaryGrades: member.summaryGrades || '',
    quizGrades: member.quizGrades || '',
    coursesReviewed: Number.isFinite(member.coursesReviewed) ? member.coursesReviewed : 0,
    coursesProduced: Number.isFinite(member.coursesProduced) ? member.coursesProduced : 0,
    photoUrl: member.photoUrl || null,
  };
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users state with defensive defaults
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY) || localStorage.getItem('quality_team_users_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: any, idx: number) => ({
            id: u.id || `user-${idx}`,
            username: u.username || (idx === 0 ? 'dawy' : idx === 1 ? 'radwa' : `user${idx + 1}`),
            password: u.password || (idx === 0 ? 'password123' : idx === 1 ? 'radwa123' : 'password123'),
            name: u.name || `User ${idx + 1}`,
            role: u.role || 'Quality Engineer',
            color: u.color || 'bg-indigo-600',
          }));
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_SESSION_KEY) || localStorage.getItem('quality_team_auth_session_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.username)) {
          const match = users.find((u) => u.id === parsed.id || (u.username && u.username.toLowerCase() === (parsed.username || '').toLowerCase()));
          if (match) return match;
        }
      }
    } catch {
      // ignore
    }
    return null; // Require login screen by default
  });

  // Members state with migration safety
  const [members, setMembers] = useState<QualityMemberReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('quality_team_meeting_dashboard_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any, idx: number) => {
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
                meetingReport: m.meetingReport || { fileUrl: null },
              };
              return {
                id: m.id || `m-${idx}`,
                ...getMigratedMemberProfile(m),
                meetings: [defaultMtg],
                activeMeetingId: defaultMtg.id,
                lastUpdatedBy: m.lastUpdatedBy || 'النظام',
                lastUpdatedAt: m.lastUpdatedAt || 'الآن',
              };
            }
            return {
              id: m.id || `m-${idx}`,
              ...getMigratedMemberProfile(m),
              meetings: m.meetings.map((mtg: any, mIdx: number) => ({
                id: mtg.id || `mtg-${mIdx}`,
                title: mtg.title || `Meeting ${mIdx + 1}`,
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
                meetingReport: mtg.meetingReport || { fileUrl: null },
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

  const activeMeeting: MeetingSession =
    safeMeetings.find((mtg) => mtg.id === activeMember.activeMeetingId) ||
    safeMeetings[0] ||
    INITIAL_MEMBERS[0].meetings[0];

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      if (currentUser) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch {
      // quota fallback
    }
  }, [members, users, currentUser]);

  // Login handler
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    // 1. First check local users (ensures GitHub Pages / static hosting works instantly)
    const matched = users.find(
      (u) => (u.username || '').toLowerCase() === trimmedUser && (u.password || '') === trimmedPass
    );

    if (matched) {
      setCurrentUser(matched);
      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(matched));
      } catch {
        // ignore
      }
      return { success: true };
    }

    // 2. Try server API login (if running full-stack)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(data.user));
          return { success: true };
        }
      }
    } catch {
      // static fallback
    }

    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // ignore
    }
  };

  // Fetch state from server
  const refreshFromServer = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const remoteData: DashboardSyncData = json.data;

          if (remoteData.version > versionRef.current && !isSavingRef.current) {
            versionRef.current = remoteData.version;
            if (Array.isArray(remoteData.members) && remoteData.members.length > 0) {
              setMembers(remoteData.members.map((member) => ({
                ...member,
                ...getMigratedMemberProfile(member),
              })));
            }
            if (Array.isArray(remoteData.users) && remoteData.users.length > 0) {
              setUsers(remoteData.users);
            }
            if (remoteData.activeMemberId) {
              setActiveMemberId(remoteData.activeMemberId);
            }
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
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          members: newMembers,
          activeMemberId: newActiveId || activeMemberId,
          updatedBy: currentUser ? currentUser.name : 'مستخدم الداشبورد',
        }),
      });

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

  // Initial load
  useEffect(() => {
    refreshFromServer();
  }, []);

  // Update current member's ACTIVE MEETING
  const updateCurrentMeeting = (updater: (prevMeeting: MeetingSession) => MeetingSession) => {
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
  const addMember = (profile: QualityMemberProfile) => {
    if (!profile.name.trim()) return;
    const authorName = currentUser ? currentUser.name : 'مستخدم الداشبورد';
    const initialMtgId = `mtg-${Date.now()}`;

    const defaultMeeting: MeetingSession = {
      id: initialMtgId,
      title: 'Meeting 1',
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
      meetingReport: { fileUrl: null },
    };

    const newMember: QualityMemberReview = {
      id: `m-${Date.now()}`,
      ...profile,
      name: profile.name.trim(),
      role: profile.role.trim() || 'Quality Engineer',
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

  const updateMember = (id: string, updates: Partial<QualityMemberProfile>) => {
    const updated = members.map((member) =>
      member.id === id ? { ...member, ...updates } : member
    );
    setMembers(updated);
    pushToServer(updated);
  };

  const deleteMember = (id: string) => {
    if (members.length <= 1) {
      alert('يجب أن يتبقى عضو واحد على الأقل في القائمة.');
      return;
    }
    const filtered = members.filter((m) => m.id !== id);
    setMembers(filtered);
    const nextActiveId = activeMemberId === id ? filtered[0].id : activeMemberId;
    setActiveMemberId(nextActiveId);
    pushToServer(filtered, nextActiveId);
  };

  // Meeting Management per Member
  const setActiveMeetingId = (meetingId: string) => {
    const updated = members.map((m) => (m.id === activeMember.id ? { ...m, activeMeetingId: meetingId } : m));
    setMembers(updated);
    pushToServer(updated);
  };

  const addMeeting = (title?: string) => {
    const authorName = currentUser ? currentUser.name : 'مستخدم الداشبورد';
    const newMtgId = `mtg-${Date.now()}`;
    const nextNumber = safeMeetings.length + 1;

    const newMeeting: MeetingSession = {
      id: newMtgId,
      title: title || `Meeting ${nextNumber}`,
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
  const addUser = async (name: string, username: string, password: string, role = 'Quality Engineer') => {
    if (!name.trim() || !username.trim() || !password.trim()) return;
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-cyan-600'];
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      password: password.trim(),
      name: name.trim(),
      role: role.trim(),
      color: colors[users.length % colors.length],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: newUser, updatedBy: currentUser ? currentUser.name : 'المدير' }),
      });
    } catch {
      // offline fallback
    }
  };

  const updateUser = async (id: string, updates: Partial<AppUser>) => {
    const updatedUsers = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    const updatedUser = updatedUsers.find((u) => u.id === id);
    if (updatedUser) {
      if (currentUser?.id === id) {
        setCurrentUser(updatedUser);
      }
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: updatedUser }),
        });
      } catch {
        // offline
      }
    }
  };

  const deleteUser = async (id: string) => {
    if (users.length <= 1) {
      alert('لا يمكن حذف المستخدم الوحيد.');
      return;
    }
    const updatedUsers = users.filter((u) => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    if (currentUser?.id === id) {
      setCurrentUser(updatedUsers[0]);
    }

    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch {
      // offline
    }
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
      },
    }));
  };

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
      },
    }));
  };

  const toggleOverplannedAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      overplannedNegotiation: {
        discussionNotes: prev.overplannedNegotiation?.discussionNotes || '',
        actions: (prev.overplannedNegotiation?.actions || []).map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)),
      },
    }));
  };

  const deleteOverplannedAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      overplannedNegotiation: {
        discussionNotes: prev.overplannedNegotiation?.discussionNotes || '',
        actions: (prev.overplannedNegotiation?.actions || []).filter((a) => a.id !== actionId),
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
      },
    }));
  };

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
      },
    }));
  };

  const toggleTicketsAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      ticketsScreen: {
        discussionNotes: prev.ticketsScreen?.discussionNotes || '',
        actions: (prev.ticketsScreen?.actions || []).map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)),
      },
    }));
  };

  const deleteTicketsAction = (actionId: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      ticketsScreen: {
        discussionNotes: prev.ticketsScreen?.discussionNotes || '',
        actions: (prev.ticketsScreen?.actions || []).filter((a) => a.id !== actionId),
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

  const updateMeetingReportNotes = (notes: string) => {
    updateCurrentMeeting((prev) => ({
      ...prev,
      meetingReport: {
        ...prev.meetingReport,
        notes,
      },
    }));
  };

  const resetToDefaults = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data.members);
        setActiveMemberId(json.data.activeMemberId);
        setUsers(json.data.users);
      }
    } catch {
      setMembers(INITIAL_MEMBERS);
      setActiveMemberId(INITIAL_MEMBERS[0].id);
      setUsers(INITIAL_USERS);
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
        addMember,
        updateMember,
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
        updateTicketsDiscussion,
        addTicketsAction,
        toggleTicketsAction,
        deleteTicketsAction,
        updateMeetingReportFile,
        updateMeetingReportNotes,
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
