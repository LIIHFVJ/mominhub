import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChevronRight, ChevronLeft,
    Share2, Calendar as CalendarIcon,
    Bell, MapPin, Search, RefreshCw,
    Clock, Info
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, parse, addDays, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePrayerTimes } from "@/contexts/PrayerTimesContext";
import { AuthReminder } from "@/components/AuthReminder";

interface HijriEvent {
    month: number;
    day: number;
    title: string;
    description: string;
    type: 'holy' | 'birth' | 'death' | 'battle';
}

const ISLAMIC_EVENTS: HijriEvent[] = [
    { month: 1, day: 1, title: "رأس السنة الهجرية", description: "بداية العام الهجري الجديد", type: 'holy' },
    { month: 1, day: 10, title: "يوم عاشوراء", description: "ذكرى استشهاد الإمام الحسين عليه السلام", type: 'death' },
    { month: 2, day: 20, title: "أربعينية الإمام الحسين", description: "مرور 40 يوماً على واقعة الطف", type: 'death' },
    { month: 3, day: 12, title: "المولد النبوي الشريف", description: "على رواية المشهور عند السنة", type: 'birth' },
    { month: 3, day: 17, title: "المولد النبوي ومولد الإمام الصادق", description: "على رواية الشيعة الإمامية", type: 'birth' },
    { month: 7, day: 13, title: "مولد الإمام علي (ع)", description: "ذكرى مولد أمير المؤمنين في الكعبة", type: 'birth' },
    { month: 7, day: 15, title: "وفاة السيدة زينب (ع)", description: "ذكرى وفاة عقيلة بني هاشم", type: 'death' },
    { month: 7, day: 18, title: "وفاة إبراهيم بن الرسول الأكرم", description: "وفاة إبراهيم ابن النبي محمد (صلى الله عليه وآله وسلم)", type: 'death' },
    { month: 7, day: 25, title: "استشهاد الإمام الكاظم (ع)", description: "ذكرى استشهاد الإمام موسى بن جعفر عليه السلام", type: 'death' },
    { month: 7, day: 27, title: "الإسراء والمعراج", description: "ذكرى عروج النبي صلى الله عليه وآله", type: 'holy' },
    { month: 8, day: 3, title: "مولد الإمام الحسين (ع)", description: "ذكرى مولد سيد الشهداء", type: 'birth' },
    { month: 8, day: 15, title: "مولد الإمام المهدي (عج)", description: "النصف من شعبان", type: 'birth' },
    { month: 9, day: 1, title: "بداية شهر رمضان", description: "شهر الصيام والقرآن", type: 'holy' },
    { month: 9, day: 15, title: "مولد الإمام الحسن (ع)", description: "ذكرى مولد كريم أهل البيت", type: 'birth' },
    { month: 9, day: 19, title: "ضربة الإمام علي عليه السلام", description: "في محراب الكوفة", type: 'death' },
    { month: 9, day: 21, title: "استشهاد الإمام علي عليه السلام", description: "ذكرى استشهاد أمير المؤمنين", type: 'death' },
    { month: 10, day: 1, title: "عيد الفطر المبارك", description: "أول أيام عيد الفطر", type: 'holy' },
    { month: 11, day: 11, title: "مولد الإمام الرضا (ع)", description: "ذكرى مولد غريب طوس", type: 'birth' },
    { month: 12, day: 1, title: "زواج النورين", description: "زواج الإمام علي والسيدة فاطمة", type: 'holy' },
    { month: 12, day: 10, title: "عيد الأضحى المبارك", description: "ذكرى تضحية نبي الله إبراهيم", type: 'holy' },
    { month: 12, day: 18, title: "عيد الغدير الأغر", description: "تنصيب الإمام علي عليه السلام خليفة", type: 'holy' },
];

// Aladhan API Endpoints
const API_BASE_URL = "https://api.aladhan.com/v1";
const API_BACKUP_URLS = [
    "https://alislam.api.islamic.network/v1",
    "https://aladhan.api.alislam.ru/v1"
];

interface HijriDateInfo {
    day: string;
    month: {
        number: number;
        en: string;
        ar: string;
    };
    year: string;
    weekday: {
        ar: string;
    };
}

export default function Calendar() {
    const { times: prayerTimes, loading: prayerLoading, preferences } = usePrayerTimes();
    const [hijriDate, setHijriDate] = useState<HijriDateInfo | null>(null);
    const [monthDays, setMonthDays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<any>(null);
    const [showMonthlyTimes, setShowMonthlyTimes] = useState(false);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    
    // Conversion States
    const [convertGtoH, setConvertGtoH] = useState(format(new Date(), "yyyy-MM-dd"));
    const [convertHtoG, setConvertHtoG] = useState({ day: "", month: "", year: "" });
    const [convertedResult, setConvertedResult] = useState<any>(null);
    const [conversionType, setConversionType] = useState<'GtoH' | 'HtoG'>('GtoH');

    const fetchMonthData = async (date: Date) => {
        setLoading(true);
        try {
            const dateStr = format(date, "dd-MM-yyyy");
            
            // Get Hijri info for the requested date
            const todayRes = await fetch(`${API_BASE_URL}/gToH/${dateStr}`);
            const todayData = await todayRes.json();
            
            if (todayData.code === 200) {
                const currentHijri = todayData.data.hijri;
                setHijriDate(currentHijri);
                
                const hMonth = currentHijri.month.number;
                const hYear = currentHijri.year;
                
                // Use preferences or fallback to Makkah
                const city = preferences?.city || "Makkah";
                const country = preferences?.country || "Saudi Arabia";
                const method = preferences?.calculation_method || 4;

                // Fetch the full Hijri month calendar
                const calendarRes = await fetch(
                    `${API_BASE_URL}/hijriCalendar/${hYear}/${hMonth}?city=${city}&country=${country}&method=${method}`
                );
                const calendarData = await calendarRes.json();
                
                if (calendarData.code === 200) {
                    setMonthDays(calendarData.data);
                    setMonthlyData(calendarData.data);
                    
                    const today = calendarData.data.find((d: any) => 
                        parseInt(d.date.hijri.day) === parseInt(currentHijri.day)
                    );
                    if (today) setSelectedDay(today);
                }
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("خطأ في تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = async (direction: 'next' | 'prev') => {
        if (!hijriDate) return;
        
        setLoading(true);
        try {
            let nextHMonth = hijriDate.month.number;
            let nextHYear = parseInt(hijriDate.year);
            
            if (direction === 'next') {
                if (nextHMonth === 12) {
                    nextHMonth = 1;
                    nextHYear++;
                } else {
                    nextHMonth++;
                }
            } else {
                if (nextHMonth === 1) {
                    nextHMonth = 12;
                    nextHYear--;
                } else {
                    nextHMonth--;
                }
            }
            
            const city = preferences?.city || "Makkah";
            const country = preferences?.country || "Saudi Arabia";
            const method = preferences?.calculation_method || 4;

            const calendarRes = await fetch(
                `${API_BASE_URL}/hijriCalendar/${nextHYear}/${nextHMonth}?city=${city}&country=${country}&method=${method}`
            );
            const calendarData = await calendarRes.json();
            
            if (calendarData.code === 200 && calendarData.data.length > 0) {
                setMonthDays(calendarData.data);
                setMonthlyData(calendarData.data);
                const firstDayOfNewMonth = calendarData.data[0];
                setHijriDate(firstDayOfNewMonth.date.hijri);
                setSelectedDay(firstDayOfNewMonth);
                
                const [gDay, gMonth, gYear] = firstDayOfNewMonth.date.gregorian.date.split('-');
                setCurrentDate(new Date(parseInt(gYear), parseInt(gMonth) - 1, parseInt(gDay)));
            }
        } catch (error) {
            console.error("Month Change Error:", error);
            toast.error("خطأ في التنقل بين الشهور");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthData(currentDate);
    }, [currentDate]); // Only depend on currentDate, preferences handled inside fetch

    const handleGtoHConvert = async () => {
        try {
            const date = parse(convertGtoH, "yyyy-MM-dd", new Date());
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            const res = await fetch(`${API_BASE_URL}/gToH/${day}-${month}-${year}`);
            const data = await res.json();
            if (data.code === 200) {
                setConvertedResult({ type: 'hijri', data: data.data.hijri });
            }
        } catch (error) {
            toast.error("تاريخ غير صالح");
        }
    };

    const handleHtoGConvert = async () => {
        const { day, month, year } = convertHtoG;
        if (!day || !month || !year) {
            toast.error("يرجى إكمال جميع الحقول");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/hToG/${day}-${month}-${year}`);
            const data = await res.json();
            if (data.code === 200) {
                setConvertedResult({ type: 'gregorian', data: data.data.gregorian });
            }
        } catch (error) {
            toast.error("تاريخ غير صالح");
        }
    };

    const nextMonth = () => {
        const next = new Date(currentDate);
        next.setMonth(next.getMonth() + 1);
        setCurrentDate(next);
    };

    const prevMonth = () => {
        const prev = new Date(currentDate);
        prev.setMonth(prev.getMonth() - 1);
        setCurrentDate(prev);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const nextEvent = useMemo(() => {
        if (!hijriDate) return null;
        const currentMonth = hijriDate.month.number;
        const currentDay = parseInt(hijriDate.day);

        let events = ISLAMIC_EVENTS.filter(e => 
            (e.month === currentMonth && e.day >= currentDay) || 
            (e.month > currentMonth)
        ).sort((a, b) => (a.month * 100 + a.day) - (b.month * 100 + b.day));

        if (events.length === 0) {
            events = ISLAMIC_EVENTS.sort((a, b) => (a.month * 100 + a.day) - (b.month * 100 + b.day));
        }

        return events[0];
    }, [hijriDate]);

    const weekdays = [
        { en: "Sunday", ar: "الأحد" },
        { en: "Monday", ar: "الاثنين" },
        { en: "Tuesday", ar: "الثلاثاء" },
        { en: "Wednesday", ar: "الأربعاء" },
        { en: "Thursday", ar: "الخميس" },
        { en: "Friday", ar: "الجمعة" },
        { en: "Saturday", ar: "السبت" }
    ];

    const hijriMonths = [
        "المحرّم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
        "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground font-arabic" dir="rtl">
            {/* Header Section - Pixel Perfect Match */}
            <div className="relative h-72 md:h-80 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                        backgroundImage: `url('https://images.unsplash.com/photo-1591604021695-4c6977efec5d?auto=format&fit=crop&q=80&w=2000')`,
                        filter: 'brightness(0.3)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
                
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hijriDate?.day}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                                {hijriDate ? (
                                    `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year} هـ`
                                ) : "..."}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/60 font-medium">
                                {format(currentDate, "EEEE d MMMM yyyy", { locale: ar })}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-20 space-y-12 pb-24">
                <AuthReminder message="سجل دخولك لمزامنة تقويمك وتلقي تنبيهات بالمناسبات الإسلامية" />
                
                {/* Month Navigation - Clean & Dark */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <Button variant="ghost" onClick={goToToday} className="text-primary hover:bg-primary/10 font-bold text-lg rounded-xl">
                        اليوم
                    </Button>
                    <div className="flex items-center gap-8">
                        <Button variant="ghost" size="icon" onClick={() => handleMonthChange('prev')} className="text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                            <ChevronRight className="w-8 h-8" />
                        </Button>
                        <h2 className="text-3xl font-bold text-white min-w-[120px] text-center">
                            {hijriDate?.month.ar}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={() => handleMonthChange('next')} className="text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                            <ChevronLeft className="w-8 h-8" />
                        </Button>
                    </div>
                    <div className="w-[60px]" /> {/* Spacer for centering */}
                </div>

                {/* Calendar Grid - Matching the Image */}
                <div className="bg-[#111] rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/5">
                    <div className="grid grid-cols-7 mb-10">
                        {weekdays.map(day => (
                            <div key={day.en} className="text-center text-base font-medium text-white/40">
                                {day.ar}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-6 md:gap-y-8">
                        {loading ? (
                            Array.from({ length: 35 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="aspect-square flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/5 animate-pulse rounded-full" />
                                </div>
                            ))
                        ) : (
                            <>
                                {monthDays.length > 0 && Array.from({ length: weekdays.findIndex(d => d.en === monthDays[0].date.hijri.weekday.en) }).map((_, i) => (
                                    <div key={`pad-${i}`} className="aspect-square" />
                                ))}
                                
                                {monthDays.map((day, idx) => {
                                    const hDay = parseInt(day.date.hijri.day);
                                    const isToday = hijriDate && 
                                                   day.date.hijri.day === hijriDate.day && 
                                                   day.date.hijri.month.number === hijriDate.month.number;
                                    
                                    const isSelected = selectedDay && 
                                                      day.date.hijri.day === selectedDay.date.hijri.day && 
                                                      day.date.hijri.month.number === selectedDay.date.hijri.month.number;

                                    // Match the blue color from image (seems to be specific days or events)
                                    const isBlue = [1, 7, 13, 14, 21, 27, 28].includes(hDay);
                                    const event = ISLAMIC_EVENTS.find(e => 
                                        e.month === day.date.hijri.month.number && e.day === hDay
                                    );

                                    return (
                                        <div key={idx} className="aspect-square flex items-center justify-center relative">
                                            <button 
                                                onClick={() => setSelectedDay(day)}
                                                className={`
                                                    w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full transition-all text-2xl font-bold
                                                    ${isToday ? "bg-[#ea2e2e] text-white shadow-[0_0_20px_rgba(234,46,46,0.4)] scale-110 z-10" : ""}
                                                    ${!isToday && isSelected ? "border-2 border-white/20 text-white" : ""}
                                                    ${!isToday && !isSelected && isBlue ? "text-[#3b82f6]" : ""}
                                                    ${!isToday && !isSelected && !isBlue ? "text-white/80 hover:bg-white/5" : ""}
                                                `}
                                            >
                                                {hDay}
                                            </button>
                                            {event && !isToday && (
                                                <div className="absolute bottom-0 w-1.5 h-1.5 bg-primary rounded-full" />
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* Selected Day Details / Prayer Times */}
                <AnimatePresence mode="wait">
                    {selectedDay && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#111] rounded-[2.5rem] border border-white/5 p-8"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                         <Clock className="w-6 h-6 text-primary" />
                                         توقيت صلاة {selectedDay.date.hijri.day} {selectedDay.date.hijri.month.ar}
                                     </h3>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setShowMonthlyTimes(!showMonthlyTimes)}
                                        className="text-primary hover:bg-primary/10"
                                    >
                                        {showMonthlyTimes ? "إخفاء جدول الشهر" : "عرض جدول الشهر"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    {Object.entries(selectedDay.timings).filter(([name]) => ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name)).map(([name, time]) => (
                                        <div key={name} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                            <span className="text-xs text-white/40 mb-1 font-medium">
                                                {name === "Fajr" ? "الفجر" : name === "Dhuhr" ? "الظهر" : name === "Asr" ? "العصر" : name === "Maghrib" ? "المغرب" : "العشاء"}
                                            </span>
                                            <span className="text-xl font-bold text-primary">{time.split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>

                                {showMonthlyTimes && (
                                    <div className="mt-8 overflow-x-auto rounded-2xl border border-white/5">
                                        <table className="w-full text-sm text-right">
                                            <thead className="bg-white/5">
                                                <tr className="text-white/40">
                                                    <th className="p-4 font-bold">اليوم</th>
                                                    <th className="p-4 font-bold">هجري</th>
                                                    <th className="p-4 font-bold">ميلادي</th>
                                                    <th className="p-4 font-bold">الفجر</th>
                                                    <th className="p-4 font-bold">المغرب</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlyData.map((day: any, i: number) => (
                                                     <tr key={i} className="border-t border-white/5 hover:bg-white/5 text-white/80">
                                                         <td className="p-4">{day.date.hijri.weekday.ar}</td>
                                                         <td className="p-4 font-bold">{day.date.hijri.day}</td>
                                                         <td className="p-4 text-white/40">{day.date.gregorian.day}/{day.date.gregorian.month.number}</td>
                                                         <td className="p-4 font-bold text-primary">{day.timings.Fajr.split(' ')[0]}</td>
                                                         <td className="p-4 font-bold text-primary">{day.timings.Maghrib.split(' ')[0]}</td>
                                                     </tr>
                                                 ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Conversion Section - Clean Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Card className="bg-[#111] border-none rounded-[2rem] hover:bg-[#1a1a1a] transition-all cursor-pointer group p-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-bold text-white">تحويل التاريخ الهجري</h4>
                                        <p className="text-white/40">التاريخ الهجري إلى الميلادي</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                        <CalendarIcon className="w-8 h-8" />
                                    </div>
                                </div>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="bg-[#111] border-white/10 text-white rounded-[2rem] font-arabic">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-center">تحويل التاريخ</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="flex bg-white/5 p-1 rounded-2xl">
                                     <button 
                                         onClick={() => setConversionType('GtoH')} 
                                         className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${conversionType === 'GtoH' ? 'bg-primary text-white' : 'text-white/40 hover:text-white/60'}`}
                                     >
                                         ميلادي ← هجري
                                     </button>
                                     <button 
                                         onClick={() => setConversionType('HtoG')} 
                                         className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${conversionType === 'HtoG' ? 'bg-primary text-white' : 'text-white/40 hover:text-white/60'}`}
                                     >
                                         هجري ← ميلادي
                                     </button>
                                 </div>
                                {conversionType === 'GtoH' ? (
                                    <div className="space-y-4">
                                        <Input type="date" value={convertGtoH} onChange={(e) => setConvertGtoH(e.target.value)} className="bg-white/5 border-none h-14 rounded-2xl text-right text-lg text-white" />
                                        <Button onClick={handleGtoHConvert} className="w-full h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90">تحويل الآن</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <Input placeholder="اليوم" value={convertHtoG.day} onChange={e => setConvertHtoG(prev => ({ ...prev, day: e.target.value }))} className="bg-white/5 border-none h-14 rounded-2xl text-center text-lg text-white" />
                                            <Input placeholder="الشهر" value={convertHtoG.month} onChange={e => setConvertHtoG(prev => ({ ...prev, month: e.target.value }))} className="bg-white/5 border-none h-14 rounded-2xl text-center text-lg text-white" />
                                            <Input placeholder="السنة" value={convertHtoG.year} onChange={e => setConvertHtoG(prev => ({ ...prev, year: e.target.value }))} className="bg-white/5 border-none h-14 rounded-2xl text-center text-lg text-white" />
                                        </div>
                                        <Button onClick={handleHtoGConvert} className="w-full h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90">تحويل الآن</Button>
                                    </div>
                                )}
                                {convertedResult && (
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                        <p className="text-sm text-white/40 mb-1">التاريخ المحول</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {convertedResult.type === 'hijri' ? `${convertedResult.data.day} ${convertedResult.data.month.ar} ${convertedResult.data.year} هـ` : `${convertedResult.data.day} ${convertedResult.data.month.en} ${convertedResult.data.year} م`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Card className="bg-[#111] border-none rounded-[2rem] hover:bg-[#1a1a1a] transition-all cursor-pointer group p-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h4 className="text-2xl font-bold text-white">تحويل التاريخ الميلادي</h4>
                                <p className="text-white/40">التاريخ الميلادي إلى الهجري</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                <CalendarIcon className="w-8 h-8" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Upcoming Event - Exact Match to Image */}
                <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-white px-2">الحدث القادم</h3>
                    {nextEvent && (
                        <div className="bg-[#111] rounded-[2.5rem] p-8 md:p-10 border border-white/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                        {nextEvent.title}
                                    </h4>
                                    <p className="text-xl text-white/40 font-medium">
                                        {nextEvent.day} {hijriMonths[nextEvent.month - 1]}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button className="h-16 px-10 rounded-2xl bg-[#ea2e2e] hover:bg-[#ff3e3e] text-white font-bold text-xl shadow-lg shadow-[#ea2e2e]/20 transition-all active:scale-95">
                                        <Bell className="w-6 h-6 ml-3" />
                                        اضافة تذكير
                                    </Button>
                                    <Button variant="outline" className="h-16 w-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95">
                                        <Share2 className="w-8 h-8" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
