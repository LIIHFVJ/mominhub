export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
}

export interface AladhanResponse {
    code: number;
    status: string;
    data: {
        timings: PrayerTimes;
        date: {
            readable: string;
            timestamp: string;
            hijri: any;
            gregorian: any;
        };
        meta: {
            latitude: number;
            longitude: number;
            timezone: string;
            method: any;
        };
    };
}

export const ARAB_LOCATIONS = [
    {
        country: "Iraq",
        name: "العراق",
        defaultMethod: 3,
        cities: [
            { en: "Baghdad", ar: "بغداد" },
            { en: "Basra", ar: "البصرة" },
            { en: "Mosul", ar: "الموصل" },
            { en: "Erbil", ar: "أربيل" },
            { en: "Najaf", ar: "النجف" },
            { en: "Karbala", ar: "كربلاء" },
            { en: "Kirkuk", ar: "كركوك" },
            { en: "Sulaymaniyah", ar: "السليمانية" },
            { en: "Hillah", ar: "الحلة" },
            { en: "Nasiriyah", ar: "الناصرية" },
            { en: "Amarah", ar: "العمارة" },
            { en: "Kut", ar: "الكوت" },
            { en: "Ramadi", ar: "الرمادي" },
            { en: "Baqubah", ar: "بعقوبة" },
            { en: "Dohuk", ar: "دهوك" },
            { en: "Samawah", ar: "السماوة" }
        ]
    },
    {
        country: "Saudi Arabia",
        name: "السعودية",
        defaultMethod: 7,
        cities: [
            { en: "Riyadh", ar: "الرياض" },
            { en: "Jeddah", ar: "جدة" },
            { en: "Mecca", ar: "مكة المكرمة" },
            { en: "Medina", ar: "المدينة المنورة" },
            { en: "Dammam", ar: "الدمام" },
            { en: "Taif", ar: "الطائف" },
            { en: "Tabuk", ar: "تبوك" },
            { en: "Buraidah", ar: "بريدة" },
            { en: "Khamis Mushait", ar: "خميس مشيط" },
            { en: "Abha", ar: "أبها" },
            { en: "Al-Khobar", ar: "الخبر" },
            { en: "Jizan", ar: "جيزان" },
            { en: "Hail", ar: "حائل" },
            { en: "Jubail", ar: "الجبيل" },
            { en: "Najran", ar: "نجران" }
        ]
    },
    {
        country: "Egypt",
        name: "مصر",
        defaultMethod: 5,
        cities: [
            { en: "Cairo", ar: "القاهرة" },
            { en: "Alexandria", ar: "الإسكندرية" },
            { en: "Giza", ar: "الجيزة" },
            { en: "Port Said", ar: "بورسعيد" },
            { en: "Suez", ar: "السويس" },
            { en: "Mansoura", ar: "المنصورة" },
            { en: "Tanta", ar: "طنطا" },
            { en: "Asyut", ar: "أسيوط" },
            { en: "Fayyum", ar: "الفيوم" },
            { en: "Zagazig", ar: "الزقازيق" },
            { en: "Ismailia", ar: "الإسماعيلية" },
            { en: "Aswan", ar: "أسوان" },
            { en: "Luxor", ar: "الأقصر" },
            { en: "Hurghada", ar: "الغردقة" }
        ]
    },
    {
        country: "United Arab Emirates",
        name: "الإمارات",
        defaultMethod: 8,
        cities: [
            { en: "Abu Dhabi", ar: "أبو ظبي" },
            { en: "Dubai", ar: "دبي" },
            { en: "Sharjah", ar: "الشارقة" },
            { en: "Ajman", ar: "عجمان" },
            { en: "Umm Al Quwain", ar: "أم القيوين" },
            { en: "Ras Al Khaimah", ar: "رأس الخيمة" },
            { en: "Fujairah", ar: "الفجيرة" },
            { en: "Al Ain", ar: "العين" }
        ]
    },
    {
        country: "Kuwait",
        name: "الكويت",
        defaultMethod: 11,
        cities: [
            { en: "Kuwait City", ar: "مدينة الكويت" },
            { en: "Al Jahra", ar: "الجهراء" },
            { en: "Hawalli", ar: "حولي" },
            { en: "Ahmadi", ar: "الأحمدي" },
            { en: "Farwaniya", ar: "الفروانية" },
            { en: "Mubarak Al-Kabeer", ar: "مبارك الكبير" }
        ]
    },
    {
        country: "Qatar",
        name: "قطر",
        defaultMethod: 10,
        cities: [
            { en: "Doha", ar: "الدوحة" },
            { en: "Al Rayyan", ar: "الريان" },
            { en: "Al Wakrah", ar: "الوكرة" },
            { en: "Al Khor", ar: "الخور" },
            { en: "Madinat ash Shamal", ar: "مدينة الشمال" }
        ]
    },
    {
        country: "Bahrain",
        name: "البحرين",
        defaultMethod: 8,
        cities: [
            { en: "Manama", ar: "المنامة" },
            { en: "Riffa", ar: "الرفاع" },
            { en: "Muharraq", ar: "المحرق" },
            { en: "Hamad Town", ar: "مدينة حمد" },
            { en: "Isa Town", ar: "مدينة عيسى" }
        ]
    },
    {
        country: "Oman",
        name: "عمان",
        defaultMethod: 8,
        cities: [
            { en: "Muscat", ar: "مسقط" },
            { en: "Salalah", ar: "صلالة" },
            { en: "Sohar", ar: "صحار" },
            { en: "Sur", ar: "صور" },
            { en: "Nizwa", ar: "نزوى" },
            { en: "Ibri", ar: "عبري" },
            { en: "Khasab", ar: "خصب" }
        ]
    },
    {
        country: "Jordan",
        name: "الأردن",
        defaultMethod: 3,
        cities: [
            { en: "Amman", ar: "عمان" },
            { en: "Zarqa", ar: "الزرقاء" },
            { en: "Irbid", ar: "إربد" },
            { en: "Aqaba", ar: "العقبة" },
            { en: "Madaba", ar: "مأدبا" },
            { en: "Salt", ar: "السلط" },
            { en: "Mafraq", ar: "المفرق" }
        ]
    },
    {
        country: "Lebanon",
        name: "لبنان",
        defaultMethod: 3,
        cities: [
            { en: "Beirut", ar: "بيروت" },
            { en: "Tripoli", ar: "طرابلس" },
            { en: "Sidon", ar: "صيدا" },
            { en: "Tyre", ar: "صور" },
            { en: "Baalbek", ar: "بعلبك" },
            { en: "Byblos", ar: "جبيل" },
            { en: "Jounieh", ar: "جونية" }
        ]
    },
    {
        country: "Palestine",
        name: "فلسطين",
        defaultMethod: 3,
        cities: [
            { en: "Jerusalem", ar: "القدس" },
            { en: "Gaza", ar: "غزة" },
            { en: "Ramallah", ar: "رام الله" },
            { en: "Nablus", ar: "نابلس" },
            { en: "Hebron", ar: "الخليل" },
            { en: "Jenin", ar: "جنين" },
            { en: "Bethlehem", ar: "بيت لحم" },
            { en: "Tulkarm", ar: "طولكرم" }
        ]
    },
    {
        country: "Syria",
        name: "سوريا",
        defaultMethod: 3,
        cities: [
            { en: "Damascus", ar: "دمشق" },
            { en: "Aleppo", ar: "حلب" },
            { en: "Homs", ar: "حمص" },
            { en: "Latakia", ar: "اللاذقية" },
            { en: "Hama", ar: "حماة" },
            { en: "Deir ez-Zor", ar: "دير الزور" },
            { en: "Tartus", ar: "طرطوس" },
            { en: "Daraa", ar: "درعا" }
        ]
    },
    {
        country: "Morocco",
        name: "المغرب",
        defaultMethod: 3,
        cities: [
            { en: "Rabat", ar: "الرباط" },
            { en: "Casablanca", ar: "الدار البيضاء" },
            { en: "Marrakech", ar: "مراكش" },
            { en: "Fes", ar: "فاس" },
            { en: "Tangier", ar: "طنجة" },
            { en: "Agadir", ar: "أكادير" },
            { en: "Meknes", ar: "مكناس" },
            { en: "Oujda", ar: "وجدة" }
        ]
    },
    {
        country: "Algeria",
        name: "الجزائر",
        defaultMethod: 3,
        cities: [
            { en: "Algiers", ar: "الجزائر العاصمة" },
            { en: "Oran", ar: "وهران" },
            { en: "Constantine", ar: "قسنطينة" },
            { en: "Annaba", ar: "عنابة" },
            { en: "Blida", ar: "البليدة" },
            { en: "Batna", ar: "باتنة" },
            { en: "Setif", ar: "سطيف" }
        ]
    },
    {
        country: "Tunisia",
        name: "تونس",
        defaultMethod: 3,
        cities: [
            { en: "Tunis", ar: "تونس العاصمة" },
            { en: "Sfax", ar: "صفاقس" },
            { en: "Sousse", ar: "سوسة" },
            { en: "Kairouan", ar: "القيروان" },
            { en: "Bizerte", ar: "بنزرت" },
            { en: "Gabes", ar: "قابس" }
        ]
    },
    {
        country: "Libya",
        name: "ليبيا",
        defaultMethod: 3,
        cities: [
            { en: "Tripoli", ar: "طرابلس" },
            { en: "Benghazi", ar: "بنغازي" },
            { en: "Misrata", ar: "مصراتة" },
            { en: "Bayda", ar: "البيضاء" },
            { en: "Zawiya", ar: "الزاوية" },
            { en: "Tobruk", ar: "طبرق" }
        ]
    },
    {
        country: "Yemen",
        name: "اليمن",
        defaultMethod: 3,
        cities: [
            { en: "Sanaa", ar: "صنعاء" },
            { en: "Aden", ar: "عدن" },
            { en: "Taiz", ar: "تعز" },
            { en: "Hodeidah", ar: "الحديدة" },
            { en: "Mukalla", ar: "المكلا" },
            { en: "Ibb", ar: "إب" }
        ]
    },
    {
        country: "Sudan",
        name: "السودان",
        defaultMethod: 3,
        cities: [
            { en: "Khartoum", ar: "الخرطوم" },
            { en: "Omdurman", ar: "أم درمان" },
            { en: "Port Sudan", ar: "بورتسودان" },
            { en: "Kassala", ar: "كسلا" },
            { en: "El Obeid", ar: "الأبيض" }
        ]
    },
    {
        country: "Mauritania",
        name: "موريتانيا",
        defaultMethod: 3,
        cities: [
            { en: "Nouakchott", ar: "نواكشوط" },
            { en: "Nouadhibou", ar: "نواذيبو" },
            { en: "Kiffa", ar: "كيفه" }
        ]
    },
    {
        country: "Somalia",
        name: "الصومال",
        defaultMethod: 3,
        cities: [
            { en: "Mogadishu", ar: "مقديشو" },
            { en: "Hargeisa", ar: "هرجيسا" },
            { en: "Berbera", ar: "بربرة" }
        ]
    },
    {
        country: "Djibouti",
        name: "جيبوتي",
        defaultMethod: 3,
        cities: [
            { en: "Djibouti City", ar: "مدينة جيبوتي" },
            { en: "Ali Sabieh", ar: "علي صبيح" }
        ]
    },
    {
        country: "Comoros",
        name: "جزر القمر",
        defaultMethod: 3,
        cities: [
            { en: "Moroni", ar: "موروني" },
            { en: "Mutsamudu", ar: "موتسامودو" }
        ]
    },
];


export const CALCULATION_METHODS = [
    { id: 4, name: "مجلس الشؤون الإسلامية (كندا/أمريكا)" },
    { id: 1, name: "جامعة العلوم الإسلامية (كـراتشي)" },
    { id: 2, name: "الهيئة الإسلامية لأمريكا الشمالية (ISNA)" },
    { id: 3, name: "رابطة العالم الإسلامي" },
    { id: 5, name: "الهيئة المصرية العامة للمساحة" },
    { id: 7, name: "جامعة أم القرى (مكة المكرمة)" },
    { id: 8, name: "الخليج العربي" },
    { id: 10, name: "قطر" },
    { id: 11, name: "المجلس الأعلى للشؤون الإسلامية (الكويت)" },
    { id: 12, name: "رئاسة الشؤون الدينية (تركيا)" },
];

export async function fetchPrayerTimes(city: string, country: string, methodId: number = 4): Promise<{ timings: PrayerTimes, date: any } | null> {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${methodId}`);
        const data: AladhanResponse = await response.json();
        if (data.code === 200) {
            return { timings: data.data.timings, date: data.data.date };
        }
        return null;
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        return null;
    }
}

export function getNextPrayer(timings: PrayerTimes): { name: string; time: string; remaining: string } | null {
    const now = new Date();
    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const prayers = prayerNames.map(name => {
        const [hours, minutes] = timings[name as keyof PrayerTimes].split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return { name, date };
    });

    // Find the first prayer that is later than now
    let next = prayers.find(p => p.date > now);

    // If all prayers today have passed, the next is Fajr tomorrow
    if (!next) {
        const fajrTomorrow = new Date(prayers[0].date);
        fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
        next = { name: "Fajr", date: fajrTomorrow };
    }

    const diff = next.date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
        name: translatePrayerName(next.name),
        time: next.date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        remaining: `${hours} ساعة و ${minutes} دقيقة`
    };
}

function translatePrayerName(name: string): string {
    const translations: Record<string, string> = {
        Fajr: "الفجر",
        Sunrise: "الشروق",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء"
    };
    return translations[name] || name;
}
