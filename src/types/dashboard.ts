export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  createdBy?: string;
}

export interface AppUser {
  id: string;
  username: string;
  password: string; // Password set by admin
  name: string;
  role: string;
  color: string;
}

export interface MeetingSession {
  id: string;
  title: string; // e.g. "Meeting 1", "Meeting 2"
  createdAt: string;
  createdBy?: string;

  // 2. Duration
  duration: {
    startDate: string; // e.g. "2026-09-25"
    endDate: string;   // e.g. "2026-10-26"
    notes?: string;
  };

  // 3. Total Tasks Screen
  totalTasksScreen: {
    screenshotUrl: string | null;
    fileName?: string;
    uploadedAt?: string;
  };

  // 4. Overplanned Negotiation
  overplannedNegotiation: {
    discussionNotes: string;
    actions: ActionItem[];
  };

  // 5. Tickets Screen
  ticketsScreen: {
    discussionNotes: string;
    actions: ActionItem[];
    screenshotUrl?: string | null;
  };

  // 6. Meeting Report
  meetingReport: {
    fileUrl: string | null;
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
    notes?: string;
  };
}

export interface QualityMemberReview {
  id: string;
  name: string;
  role: string;
  meetings: MeetingSession[];
  activeMeetingId: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface DashboardSyncData {
  members: QualityMemberReview[];
  users: AppUser[];
  activeMemberId: string;
  version: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}
