const sampleMeeting1 = {
  id: 'mtg-1',
  title: 'Meeting 1 (سبتمبر - أكتوبر)',
  createdAt: '2026-10-26',
  createdBy: 'مدير الكواليتي (أحمد ضوي)',
  duration: {
    startDate: '2026-09-25',
    endDate: '2026-10-26',
    notes: 'دورة تقييم أداء شهر أكتوبر (سبرنت 44)',
  },
  totalTasksScreen: {
    screenshotUrl: null,
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
    reportRecipient: 'أحمد',
    notes: 'تم الاتفاق على كافة الـ Actions وتم رفع التقرير لمتابعة التنفيذ.',
  },
};

const sampleMeeting2 = {
  id: 'mtg-2',
  title: 'Meeting 2 (أكتوبر - نوفمبر)',
  createdAt: '2026-11-02',
  createdBy: 'أ/ رضوى',
  duration: {
    startDate: '2026-10-27',
    endDate: '2026-11-26',
    notes: 'متابعة الدورة الثانية بعد تطبيق خطة التحسين',
  },
  totalTasksScreen: {
    screenshotUrl: null,
  },
  overplannedNegotiation: {
    discussionNotes: 'مراجعة نسب الالتزام الزمني بعد تطبيق اختبارات الـ Webhooks.',
    actions: [],
  },
  ticketsScreen: {
    discussionNotes: 'فحص التذاكر الجديدة الخاصة بتطبيق الموبايل.',
    actions: [],
    screenshotUrl: null,
  },
  meetingReport: {
    fileUrl: null,
    reportRecipient: 'أحمد',
    notes: 'تم الاتفاق على كافة الـ Actions وتم رفع التقرير لمتابعة التنفيذ.',
  },
};

export const INITIAL_MEMBERS = [
  {
    id: 'm1',
    name: 'أحمد حسن',
    role: 'Quality Assurance Lead',
    seniority: 'Senior',
    lastUpdatedBy: 'مدير الكواليتي (أحمد ضوي)',
    lastUpdatedAt: 'اليوم، 02:15 م',
    meetings: [sampleMeeting1, sampleMeeting2],
    activeMeetingId: 'mtg-1',
  },
  {
    id: 'm-sr-2',
    name: 'محمود عادل',
    role: 'Senior Automation QA',
    seniority: 'Senior',
    lastUpdatedBy: 'أ/ رضوى',
    lastUpdatedAt: 'أمس',
    meetings: [
      {
        ...sampleMeeting1,
        id: 'mtg-mahmoud-1',
        title: 'Meeting 1 (سبرنت البنية التحتية)',
        overplannedNegotiation: {
          discussionNotes: 'مناقشة تغطية الـ E2E Tests وسيرفرات الـ CI/CD.',
          actions: [],
        },
      },
    ],
    activeMeetingId: 'mtg-mahmoud-1',
  },
  {
    id: 'm2',
    name: 'سارة محمود',
    role: '',
    seniority: 'Middle',
    lastUpdatedBy: 'أ/ رضوى',
    lastUpdatedAt: 'اليوم، 01:40 م',
    meetings: [
      {
        ...sampleMeeting1,
        id: 'mtg-sara-1',
        title: 'Meeting 1 (مراجعة الواجهات)',
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
      },
    ],
    activeMeetingId: 'mtg-sara-1',
  },
  {
    id: 'm-mid-2',
    name: 'ياسمين سمير',
    role: 'Middle Functional QA',
    seniority: 'Middle',
    lastUpdatedBy: 'مدير الكواليتي (أحمد ضوي)',
    lastUpdatedAt: 'منذ يومين',
    meetings: [
      {
        ...sampleMeeting1,
        id: 'mtg-yasmin-1',
        title: 'Meeting 1 (اختبارات الامتحانات)',
        overplannedNegotiation: {
          discussionNotes: 'مراجعة بنك الأسئلة واختبارات التصحيح الآلي.',
          actions: [],
        },
      },
    ],
    activeMeetingId: 'mtg-yasmin-1',
  },
  {
    id: 'm3',
    name: 'عمر خالد',
    role: 'Junior Quality Engineer',
    seniority: 'Junior',
    lastUpdatedBy: 'مدير الكواليتي (أحمد ضوي)',
    lastUpdatedAt: 'أمس',
    meetings: [
      {
        ...sampleMeeting1,
        id: 'mtg-omar-1',
        title: 'Meeting 1 (اختبارات الأداء)',
        overplannedNegotiation: {
          discussionNotes: 'نقاش حول مهام اختبارات الأداء وسيرفرات البث في أوقات الذروة.',
          actions: [],
        },
      },
    ],
    activeMeetingId: 'mtg-omar-1',
  },
  {
    id: 'm-jr-2',
    name: 'كريم علي',
    role: 'Junior QA Tester',
    seniority: 'Junior',
    lastUpdatedBy: 'أ/ رضوى',
    lastUpdatedAt: 'اليوم، 11:30 ص',
    meetings: [
      {
        ...sampleMeeting1,
        id: 'mtg-karim-1',
        title: 'Meeting 1',
        overplannedNegotiation: {
          discussionNotes: 'مراجعة تدفق تسجيل الطلاب الجدد واستعادة كلمة المرور.',
          actions: [],
        },
      },
    ],
    activeMeetingId: 'mtg-karim-1',
  },
];
