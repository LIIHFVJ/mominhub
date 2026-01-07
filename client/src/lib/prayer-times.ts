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
    { country: "Iraq", name: "العراق", defaultMethod: 3, cities: ["Baghdad", "Basra", "Mosul", "Erbil", "Najaf", "Karbala", "Kirkuk", "Sulaymaniyah", "Hillah", "Nasiriyah", "Amarah", "Kut", "Ramadi", "Baqubah", "Dohuk", "Samawah"] },
    { country: "Saudi Arabia", name: "السعودية", defaultMethod: 7, cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk", "Buraidah", "Khamis Mushait", "Abha", "Al-Khobar", "Jizan", "Hail", "Jubail", "Najran"] },
    { country: "Egypt", name: "مصر", defaultMethod: 5, cities: ["Cairo", "Alexandria", "Giza", "Port Said", "Suez", "Mansoura", "Tanta", "Asyut", "Fayyum", "Zagazig", "Ismailia", "Aswan", "Luxor", "Hurghada"] },
    { country: "United Arab Emirates", name: "الإمارات", defaultMethod: 8, cities: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Al Ain"] },
    { country: "Kuwait", name: "الكويت", defaultMethod: 11, cities: ["Kuwait City", "Al Jahra", "Hawalli", "Ahmadi", "Farwaniya", "Mubarak Al-Kabeer"] },
    { country: "Qatar", name: "قطر", defaultMethod: 10, cities: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Madinat ash Shamal"] },
    { country: "Bahrain", name: "البحرين", defaultMethod: 8, cities: ["Manama", "Riffa", "Muharraq", "Hamad Town", "Isa Town"] },
    { country: "Oman", name: "عمان", defaultMethod: 8, cities: ["Muscat", "Salalah", "Sohar", "Sur", "Nizwa", "Ibri", "Khasab"] },
    { country: "Jordan", name: "الأردن", defaultMethod: 3, cities: ["Amman", "Zarqa", "Irbid", "Aqaba", "Madaba", "Salt", "Mafraq"] },
    { country: "Lebanon", name: "لبنان", defaultMethod: 3, cities: ["Beirut", "Tripoli", "Sidon", "Tyre", "Baalbek", "Byblos", "Jounieh"] },
    { country: "Palestine", name: "فلسطين", defaultMethod: 3, cities: ["Jerusalem", "Gaza", "Ramallah", "Nablus", "Hebron", "Jenin", "Bethlehem", "Tulkarm"] },
    { country: "Syria", name: "سوريا", defaultMethod: 3, cities: ["Damascus", "Aleppo", "Homs", "Latakia", "Hama", "Deir ez-Zor", "Tartus", "Daraa"] },
    { country: "Morocco", name: "المغرب", defaultMethod: 3, cities: ["Rabat", "Casablanca", "Marrakech", "Fes", "Tangier", "Agadir", "Meknes", "Oujda"] },
    { country: "Algeria", name: "الجزائر", defaultMethod: 3, cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Setif"] },
    { country: "Tunisia", name: "تونس", defaultMethod: 3, cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabes"] },
    { country: "Libya", name: "ليبيا", defaultMethod: 3, cities: ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya", "Tobruk"] },
    { country: "Yemen", name: "اليمن", defaultMethod: 3, cities: ["Sanaa", "Aden", "Taiz", "Hodeidah", "Mukalla", "Ibb"] },
    { country: "Sudan", name: "السودان", defaultMethod: 3, cities: ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "El Obeid"] },
    { country: "Mauritania", name: "موريتانيا", defaultMethod: 3, cities: ["Nouakchott", "Nouadhibou", "Kiffa"] },
    { country: "Somalia", name: "الصومال", defaultMethod: 3, cities: ["Mogadishu", "Hargeisa", "Berbera"] },
    { country: "Djibouti", name: "جيبوتي", defaultMethod: 3, cities: ["Djibouti City", "Ali Sabieh"] },
    { country: "Comoros", name: "جزر القمر", defaultMethod: 3, cities: ["Moroni", "Mutsamudu"] },
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
