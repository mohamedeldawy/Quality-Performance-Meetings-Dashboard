export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  createdBy?: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface QualityMemberReview {
  id: string;
  name: string;
  role: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;

  // 2. Duration: الفترة الزمنية لحساب البرفورمانس
  duration: {
    startDate: string; // e.g. "2026-09-25"
    endDate: string;   // e.g. "2026-10-26"
    notes?: string;
  };

  // 3. Total Tasks Screen: سكرين شوت من السيستم للتاسكات والأوفر بلاند
  totalTasksScreen: {
    screenshotUrl: string | null;
    fileName?: string;
    uploadedAt?: string;
  };

  // 4. Overplanned Negotiation: خانة النقاش + خانة الأكشنز
  overplannedNegotiation: {
    discussionNotes: string; // النقاش اللي دار ما بيني وبين الشخص
    actions: ActionItem[];   // الأكشنز عشان نحل الأوفر بلاند
  };

  // 5. Tickets Screen: خانة للنيجوشيشن + خانة للأكشنز
  ticketsScreen: {
    discussionNotes: string; // خانة النيجوشيشن
    actions: ActionItem[];   // خانة الأكشنز
    screenshotUrl?: string | null;
  };

  // 6. Meeting Report: رفع ريبورت ملخص الميتينج لإرساله للشخص
  meetingReport: {
    fileUrl: string | null;
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
    notes?: string;
  };
}

export interface DashboardSyncData {
  members: QualityMemberReview[];
  users: AppUser[];
  activeMemberId: string;
  version: number;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}
