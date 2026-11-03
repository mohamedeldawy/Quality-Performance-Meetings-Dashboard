export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  createdBy?: string;
}

export interface DepartmentActionItem extends ActionItem { department: string; }

export interface AppUser {
  id: string;
  username: string;
  password?: string; // Password is managed securely by the server
  name: string;
  role: string;
  color: string;
  photoUrl?: string;
}

export interface MeetingSession {
  id: string;
  title: string; // e.g. "Meeting 1", "Meeting 2"
  createdAt: string;
  createdBy?: string;
  meetingDate?: string;

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
    departmentsActions?: DepartmentActionItem[];
    noAction?: boolean;
    departmentsNoAction?: boolean;
  };

  // 5. Tickets Screen
  ticketsScreen: {
    discussionNotes: string;
    actions: ActionItem[];
    screenshotUrl?: string | null;
    departmentsActions?: DepartmentActionItem[];
    noAction?: boolean;
    departmentsNoAction?: boolean;
  };

  // 6. Meeting Report
  meetingReport: {
    fileUrl: string | null;
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
    notes?: string;
    reportRecipient?: string;
    departmentReports?: Record<string, { fileUrl: string; fileName?: string; fileSize?: string; uploadedAt?: string } | null>;
    qualityReport?: { fileUrl: string; fileName?: string; fileSize?: string; uploadedAt?: string } | null;
    summaryReport?: { fileUrl: string; fileName?: string; fileSize?: string; uploadedAt?: string } | null;
  };
}

export type SeniorityTier = 'Junior' | 'Middle' | 'Senior';

export interface QualityMemberProfile {
  subject?: string[];
  stages?: string;
  summaryGrades?: string[];
  quizGrades?: string[];
  coursesReviewed?: string[];
  coursesProduced?: string[];
  photoUrl?: string;
}

export interface QualityMemberReview extends QualityMemberProfile {
  id: string;
  name: string;
  role: string;
  seniority: SeniorityTier; // 'Junior' | 'Middle' | 'Senior'
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
