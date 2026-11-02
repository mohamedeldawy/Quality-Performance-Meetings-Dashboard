import { QualityMemberReview, AppUser } from '../types/dashboard';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-manager',
    name: 'مدير الكواليتي (أحمد ضوي)',
    role: 'Quality Manager',
    color: 'bg-indigo-600',
  },
  {
    id: 'user-radwa',
    name: 'أ/ رضوى',
    role: 'Senior Quality',
    color: 'bg-emerald-600',
  },
];

export const INITIAL_MEMBERS: QualityMemberReview[] = [
  {
    id: 'm1',
    name: 'أحمد حسن',
    role: 'Quality Assurance Lead',
    lastUpdatedBy: 'مدير الكواليتي (أحمد ضوي)',
    lastUpdatedAt: 'اليوم، 02:15 م',
    duration: {
      startDate: '2026-09-25',
      endDate: '2026-10-26',
      notes: 'دورة تقييم أداء شهر أكتوبر (سبرنت 44)',
    },
    totalTasksScreen: {
      screenshotUrl: null,
      fileName: undefined,
      uploadedAt: undefined,
    },
    overplannedNegotiation: {
      discussionNotes: 'اتناقشنا في سبب زيادة الساعات على مهام فحص بوابات الدفع الإلكتروني، وكان السبب غموض متطلبات سيناريوهات الفشل في الـ Webhook وتغيير بروتوكول التشفير من جانب البنك دون إشعار مسبق.',
      actions: [
        {
          id: 'act-op-1',
          text: 'اعتماد قائمة سيناريوهات الفحص المسبقة مع فريق التطوير قبل بدء السبرنت',
          done: false,
          dueDate: '2026-11-05',
          createdBy: 'مدير الكواليتي (أحمد ضوي)',
        },
        {
          id: 'act-op-2',
          text: 'تجميد إضافة أي بوابات دفع إضافية حتى استقرار التغطية الحالية',
          done: true,
          dueDate: '2026-11-02',
          createdBy: 'أ/ رضوى',
        },
      ],
    },
    ticketsScreen: {
      discussionNotes: 'راجعنا البلاغات المفتوحة وكان أهمها تذكرة انقطاع إشعار الدفع وبلاغ اختفاء زر إرسال الاختبار في شاشات الموبايل الصغيرة، واتفقنا على أولوية حلها.',
      actions: [
        {
          id: 'act-tk-1',
          text: 'إضافة فحص أوتوماتيكي للشاشات الصغيرة (iPhone SE / Android) في بيئة الـ Staging',
          done: false,
          dueDate: '2026-11-04',
          createdBy: 'أ/ رضوى',
        },
      ],
      screenshotUrl: null,
    },
    meetingReport: {
      fileUrl: null,
      fileName: undefined,
      fileSize: undefined,
      uploadedAt: undefined,
      notes: 'تم الاتفاق على كافة الأكشنات ورفع التقرير لإرساله لأحمد لمتابعة التنفيذ.',
    },
  },
  {
    id: 'm2',
    name: 'سارة محمود',
    role: 'Frontend QA Specialist',
    lastUpdatedBy: 'أ/ رضوى',
    lastUpdatedAt: 'اليوم، 01:40 م',
    duration: {
      startDate: '2026-09-25',
      endDate: '2026-10-26',
      notes: 'مراجعة أداء واجهات المستخدم وتوافقية المتصفحات',
    },
    totalTasksScreen: {
      screenshotUrl: null,
    },
    overplannedNegotiation: {
      discussionNotes: 'تمت مناقشة إعادة تصميم جدول الحصص وفروق التوقيت للطلاب بالخارج، وتم استهلاك 12 ساعة زيادة لتغطية حالات الـ Edge Cases.',
      actions: [
        {
          id: 'act-op-3',
          text: 'إلزام فريق التصميم بتقديم الحالات الشاذة قبل بدء الاختبار',
          done: false,
          dueDate: '2026-11-06',
          createdBy: 'أ/ رضوى',
        },
      ],
    },
    ticketsScreen: {
      discussionNotes: 'تذكرة خطأ العرض في متصفح سفاري تم حلها وإعادة اختبارها بنجاح.',
      actions: [
        {
          id: 'act-tk-2',
          text: 'توثيق خطوات الاختبار في الـ Wiki الداخلي',
          done: true,
          dueDate: '2026-10-30',
          createdBy: 'مدير الكواليتي (أحمد ضوي)',
        },
      ],
      screenshotUrl: null,
    },
    meetingReport: {
      fileUrl: null,
    },
  },
  {
    id: 'm3',
    name: 'عمر خالد',
    role: 'Backend & Systems QA',
    lastUpdatedBy: 'مدير الكواليتي (أحمد ضوي)',
    lastUpdatedAt: 'أمس',
    duration: {
      startDate: '2026-09-25',
      endDate: '2026-10-26',
      notes: 'تقييم اختبارات الـ API والتحميل (Load Testing)',
    },
    totalTasksScreen: {
      screenshotUrl: null,
    },
    overplannedNegotiation: {
      discussionNotes: 'نقاش حول مهام اختبارات الأداء وسيرفرات البث في أوقات الذروة.',
      actions: [],
    },
    ticketsScreen: {
      discussionNotes: 'متابعة تذكرة خطأ 502 ومزامنة البيانات.',
      actions: [],
      screenshotUrl: null,
    },
    meetingReport: {
      fileUrl: null,
    },
  },
];
