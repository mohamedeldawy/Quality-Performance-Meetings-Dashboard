import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { QualityMemberReview, ActionItem, AppUser, DashboardSyncData } from '../types/dashboard';
import { INITIAL_MEMBERS, INITIAL_USERS } from '../data/initialData';

interface DashboardContextType {
  // Members
  members: QualityMemberReview[];
  activeMemberId: string;
  activeMember: QualityMemberReview;
  setActiveMemberId: (id: string) => void;
  
  // Users & Multi-user collaboration
  users: AppUser[];
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  addUser: (name: string, role?: string) => Promise<void>;
  
  // Live Sync Status
  syncStatus: 'synced' | 'saving' | 'syncing' | 'offline';
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  refreshFromServer: () => Promise<void>;

  // Member management
  addMember: (name: string, role?: string) => void;
  deleteMember: (id: string) => void;
  
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
  updateTicketsScreenshot: (screenshotUrl: string | null) => void;
  
  // Column 6: Meeting Report
  updateMeetingReportFile: (fileUrl: string | null, fileName?: string, fileSize?: string) => void;
  updateMeetingReportNotes: (notes: string) => void;
  
  resetToDefaults: () => Promise<void>;
}

const STORAGE_KEY = 'quality_team_meeting_dashboard_v4';
const USER_KEY = 'quality_team_current_user_v1';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<QualityMemberReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<AppUser>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = INITIAL_USERS.find((u) => u.id === parsed.id);
        if (match) return match;
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS[0]; // Default: مدير الكواليتي
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return members[0]?.id || 'm1';
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'syncing' | 'offline'>('synced');
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>('النظام');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('الآن');
  const versionRef = useRef<number>(1);
  const isSavingRef = useRef<boolean>(false);

  const setCurrentUser = (user: AppUser) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  // Ensure active member always resolves
  const activeMember = members.find((m) => m.id === activeMemberId) || members[0] || INITIAL_MEMBERS[0];

  // Fetch state from server
  const refreshFromServer = async () => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const remoteData: DashboardSyncData = json.data;

          // If remote version is newer and we aren't mid-save
          if (remoteData.version > versionRef.current && !isSavingRef.current) {
            versionRef.current = remoteData.version;
            setMembers(remoteData.members);
            if (remoteData.users && remoteData.users.length > 0) {
              setUsers(remoteData.users);
            }
            if (remoteData.activeMemberId) {
              setActiveMemberId(remoteData.activeMemberId);
            }
            setLastUpdatedBy(remoteData.lastUpdatedBy);
            setLastUpdatedAt(remoteData.lastUpdatedAt);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData.members));
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
          updatedBy: currentUser.name,
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

  // Polling every 2.5 seconds to sync data between manager & Radwa
  useEffect(() => {
    const timer = setInterval(() => {
      // Don't poll overwrite if user is actively focused on an input or textarea
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      if (!isTyping) {
        refreshFromServer();
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [activeMemberId]);

  const updateCurrentMember = (updater: (prev: QualityMemberReview) => QualityMemberReview) => {
    const nowFormatted = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const updatedMembers = members.map((m) =>
      m.id === activeMember.id
        ? {
            ...updater(m),
            lastUpdatedBy: currentUser.name,
            lastUpdatedAt: nowFormatted,
          }
        : m
    );

    setMembers(updatedMembers);
    pushToServer(updatedMembers);
  };

  const addMember = (name: string, role = 'Quality Engineer') => {
    if (!name.trim()) return;
    const newMember: QualityMemberReview = {
      id: `m-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Quality Engineer',
      lastUpdatedBy: currentUser.name,
      lastUpdatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      duration: {
        startDate: '2026-09-25',
        endDate: '2026-10-26',
        notes: '',
      },
      totalTasksScreen: {
        screenshotUrl: null,
      },
      overplannedNegotiation: {
        discussionNotes: '',
        actions: [],
      },
      ticketsScreen: {
        discussionNotes: '',
        actions: [],
        screenshotUrl: null,
      },
      meetingReport: {
        fileUrl: null,
      },
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setActiveMemberId(newMember.id);
    pushToServer(updated, newMember.id);
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

  const addUser = async (name: string, role = 'Quality Reviewer') => {
    if (!name.trim()) return;
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-cyan-600'];
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      color: colors[users.length % colors.length],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: newUser, updatedBy: currentUser.name }),
      });
    } catch {
      // offline fallback
    }
  };

  // Column 2: Duration
  const updateMemberDuration = (startDate: string, endDate: string, notes?: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      duration: {
        startDate,
        endDate,
        notes: notes !== undefined ? notes : prev.duration.notes,
      },
    }));
  };

  // Column 3: Total Tasks Screen
  const updateTotalTasksScreen = (screenshotUrl: string | null, fileName?: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      totalTasksScreen: {
        screenshotUrl,
        fileName: fileName || (screenshotUrl ? 'system_tasks_screenshot.png' : undefined),
        uploadedAt: screenshotUrl ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : undefined,
      },
    }));
  };

  // Column 4: Overplanned Negotiation
  const updateOverplannedDiscussion = (notes: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      overplannedNegotiation: {
        ...prev.overplannedNegotiation,
        discussionNotes: notes,
      },
    }));
  };

  const addOverplannedAction = (text: string, dueDate?: string) => {
    if (!text.trim()) return;
    const newAction: ActionItem = {
      id: `act-op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: text.trim(),
      done: false,
      dueDate: dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: currentUser.name,
    };

    updateCurrentMember((prev) => ({
      ...prev,
      overplannedNegotiation: {
        ...prev.overplannedNegotiation,
        actions: [...prev.overplannedNegotiation.actions, newAction],
      },
    }));
  };

  const toggleOverplannedAction = (actionId: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      overplannedNegotiation: {
        ...prev.overplannedNegotiation,
        actions: prev.overplannedNegotiation.actions.map((a) =>
          a.id === actionId ? { ...a, done: !a.done } : a
        ),
      },
    }));
  };

  const deleteOverplannedAction = (actionId: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      overplannedNegotiation: {
        ...prev.overplannedNegotiation,
        actions: prev.overplannedNegotiation.actions.filter((a) => a.id !== actionId),
      },
    }));
  };

  // Column 5: Tickets Screen
  const updateTicketsDiscussion = (notes: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      ticketsScreen: {
        ...prev.ticketsScreen,
        discussionNotes: notes,
      },
    }));
  };

  const addTicketsAction = (text: string, dueDate?: string) => {
    if (!text.trim()) return;
    const newAction: ActionItem = {
      id: `act-tk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: text.trim(),
      done: false,
      dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: currentUser.name,
    };

    updateCurrentMember((prev) => ({
      ...prev,
      ticketsScreen: {
        ...prev.ticketsScreen,
        actions: [...prev.ticketsScreen.actions, newAction],
      },
    }));
  };

  const toggleTicketsAction = (actionId: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      ticketsScreen: {
        ...prev.ticketsScreen,
        actions: prev.ticketsScreen.actions.map((a) =>
          a.id === actionId ? { ...a, done: !a.done } : a
        ),
      },
    }));
  };

  const deleteTicketsAction = (actionId: string) => {
    updateCurrentMember((prev) => ({
      ...prev,
      ticketsScreen: {
        ...prev.ticketsScreen,
        actions: prev.ticketsScreen.actions.filter((a) => a.id !== actionId),
      },
    }));
  };

  const updateTicketsScreenshot = (screenshotUrl: string | null) => {
    updateCurrentMember((prev) => ({
      ...prev,
      ticketsScreen: {
        ...prev.ticketsScreen,
        screenshotUrl,
      },
    }));
  };

  // Column 6: Meeting Report
  const updateMeetingReportFile = (fileUrl: string | null, fileName?: string, fileSize?: string) => {
    updateCurrentMember((prev) => ({
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
    updateCurrentMember((prev) => ({
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
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DashboardContext.Provider
      value={{
        members,
        activeMemberId,
        activeMember,
        setActiveMemberId,
        users,
        currentUser,
        setCurrentUser,
        addUser,
        syncStatus,
        lastUpdatedBy,
        lastUpdatedAt,
        refreshFromServer,
        addMember,
        deleteMember,
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
        updateTicketsScreenshot,
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
