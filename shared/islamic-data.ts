// Islamic Data Constants

export const QURAN_RECITERS = [
  { id: "ar.alafasy", name: "محمد الأفاسي" },
  { id: "ar.minshawi", name: "محمود خليل الحصري" },
  { id: "ar.husary", name: "محمود خليل الحصري" },
  { id: "ar.abdulbasit", name: "عبد الباسط عبد الصمد" },
  { id: "ar.sudais", name: "عبد الرحمن السديس" },
  { id: "ar.shuraim", name: "سعود الشريم" },
];

export const ADHKAR_CATEGORIES = {
  morning: {
    id: "morning",
    name: "أذكار الصباح",
    description: "الأذكار المشروعة عند الاستيقاظ من النوم",
    type: 'adhkar' as const
  },
  evening: {
    id: "evening",
    name: "أذكار المساء",
    description: "الأذكار المشروعة عند دخول المساء",
    type: 'adhkar' as const
  },
  sleep: {
    id: "sleep",
    name: "أذكار النوم",
    description: "الأذكار المشروعة قبل النوم",
    type: 'adhkar' as const
  },
  prayer: {
    id: "prayer",
    name: "أذكار بعد الصلاة",
    description: "الأذكار المشروعة بعد الصلوات المفروضة",
    type: 'adhkar' as const
  },
  travel: {
    id: "travel",
    name: "دعاء السفر",
    description: "الأدعية المشروعة عند السفر",
    type: 'duaa' as const
  },
  home: {
    id: "home",
    name: "دعاء الخروج والدخول",
    description: "الأدعية المشروعة عند الخروج من المنزل والدخول إليه",
    type: 'duaa' as const
  },
  gathering: {
    id: "gathering",
    name: "دعاء المجلس",
    description: "الأدعية المشروعة في المجلس",
    type: 'duaa' as const
  },
  istikhara: {
    id: "istikhara",
    name: "دعاء الاستخارة",
    description: "دعاء الاستخارة عند الحيرة في الأمور",
    type: 'duaa' as const
  },
  provision: {
    id: "provision",
    name: "دعاء الرزق",
    description: "الأدعية المشروعة لطلب الرزق",
    type: 'duaa' as const
  },
  marriage: {
    id: "marriage",
    name: "دعاء الزواج",
    description: "الأدعية المشروعة للزواج والنكاح",
    type: 'duaa' as const
  },
  rain: {
    id: "rain",
    name: "دعاء نزول المطر",
    description: "الأدعية المشروعة عند نزول المطر",
    type: 'duaa' as const
  },
  protection: {
    id: "protection",
    name: "المعوذات والحماية",
    description: "سورة الفلق والناس وآيات الحماية",
    type: 'adhkar' as const
  },
  ashura: {
    id: "ashura",
    name: "زيارة عاشوراء",
    description: "زيارة الإمام الحسين عليه السلام في يوم عاشوراء",
    type: 'ziyarat' as const
  },
  warith: {
    id: "warith",
    name: "زيارة وارث",
    description: "زيارة مشهورة للإمام الحسين عليه السلام",
    type: 'ziyarat' as const
  },
  yasin: {
    id: "yasin",
    name: "زيارة آل ياسين",
    description: "زيارة للإمام المهدي عجل الله فرجه",
    type: 'ziyarat' as const
  },
  ameen_allah: {
    id: "ameen_allah",
    name: "زيارة أمين الله",
    description: "زيارة لأمير المؤمنين عليه السلام",
    type: 'ziyarat' as const
  },
  jamia_kabira: {
    id: "jamia_kabira",
    name: "الزيارة الجامعة الكبيرة",
    description: "من أصح وأعظم الزيارات لجميع الأئمة",
    type: 'ziyarat' as const
  },
  imam_hussein: {
    id: "imam_hussein",
    name: "زيارة الإمام الحسين",
    description: "زيارة عامة للإمام الحسين عليه السلام",
    type: 'ziyarat' as const
  },
  imam_ali: {
    id: "imam_ali",
    name: "زيارة أمير المؤمنين",
    description: "زيارة عامة لأمير المؤمنين عليه السلام",
    type: 'ziyarat' as const
  },
  imam_mahdi: {
    id: "imam_mahdi",
    name: "زيارة الإمام المهدي",
    description: "زيارة للإمام المهدي عجل الله فرجه الشريف",
    type: 'ziyarat' as const
  },
  imam_hassan: {
    id: "imam_hassan",
    name: "زيارة الإمام الحسن",
    description: "زيارة عامة للإمام الحسن عليه السلام",
    type: 'ziyarat' as const
  },
  imam_sadiq: {
    id: "imam_sadiq",
    name: "زيارة الإمام الصادق",
    description: "زيارة عامة للإمام الصادق عليه السلام",
    type: 'ziyarat' as const
  },
};

export const PRAYER_TIMES = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];

export const ISLAMIC_MONTHS = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الثانية",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

export const ISLAMIC_OCCASIONS = [
  { hijriMonth: 1, hijriDay: 1, name: "رأس السنة الهجرية" },
  { hijriMonth: 3, hijriDay: 12, name: "مولد النبي صلى الله عليه وسلم" },
  { hijriMonth: 7, hijriDay: 27, name: "ليلة الإسراء والمعراج" },
  { hijriMonth: 9, hijriDay: 1, name: "بداية شهر رمضان" },
  { hijriMonth: 9, hijriDay: 27, name: "ليلة القدر" },
  { hijriMonth: 10, hijriDay: 1, name: "عيد الفطر" },
  { hijriMonth: 12, hijriDay: 8, name: "يوم عرفة" },
  { hijriMonth: 12, hijriDay: 10, name: "عيد الأضحى" },
];

export const DUAS = {
  morning: [
    {
      id: "morning-1",
      text: "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور",
      source: "الترمذي",
    },
    {
      id: "morning-2",
      text: "أصبحنا وأصبح الملك لله رب العالمين، اللهم إني أسألك خير هذا اليوم فتحه ونصره ونوره وبركته وهداه، وأعوذ بك من شر ما فيه وشر ما بعده",
      source: "أبو داود",
    },
  ],
  evening: [
    {
      id: "evening-1",
      text: "أمسينا وأمسى الملك لله رب العالمين، اللهم إني أسألك خير هذه الليلة فتحها ونصرها ونورها وبركتها وهداها، وأعوذ بك من شر ما فيها وشر ما بعدها",
      source: "أبو داود",
    },
  ],
  travel: [
    {
      id: "travel-1",
      text: "الله أكبر الله أكبر الله أكبر، سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون",
      source: "الترمذي",
    },
  ],
  istikhara: [
    {
      id: "istikhara-1",
      text: "اللهم إني أستخيرك بعلمك وأستقدرك بقدرتك وأسألك من فضلك العظيم فإنك تقدر ولا أقدر وتعلم ولا أعلم وأنت علام الغيوب",
      source: "البخاري",
    },
  ],
};
