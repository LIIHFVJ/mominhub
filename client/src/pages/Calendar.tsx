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
        if (!preferences) return;
        setLoading(true);
        try {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            // Get Hijri info for the requested date
            const todayRes = await fetch(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
            const todayData = await todayRes.json();
            
            if (todayData.code === 200) {
                setHijriDate(todayData.data.hijri);
                
                const hMonth = todayData.data.hijri.month.number;
                const hYear = todayData.data.hijri.year;
                
                // Fetch the full Hijri month calendar with prayer times
                const calendarRes = await fetch(
                    `https://api.aladhan.com/v1/hijriCalendar/${hYear}/${hMonth}?city=${preferences.city}&country=${preferences.country}&method=${preferences.calculation_method}`
                );
                const calendarData = await calendarRes.json();
                
                if (calendarData.code === 200) {
                    setMonthDays(calendarData.data);
                    setMonthlyData(calendarData.data);
                    // Set today as selected day by default
                    const today = calendarData.data.find((d: any) => 
                        parseInt(d.hijri.day) === parseInt(todayData.data.hijri.day)
                    );
                    if (today) setSelectedDay(today);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("خطأ في تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    // Special handler for next/prev month to ensure we get the right Hijri month
    const handleMonthChange = async (direction: 'next' | 'prev') => {
        if (!hijriDate || !preferences) return;
        
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
            
            const calendarRes = await fetch(
                `https://api.aladhan.com/v1/hijriCalendar/${nextHYear}/${nextHMonth}?city=${preferences.city}&country=${preferences.country}&method=${preferences.calculation_method}`
            );
            const calendarData = await calendarRes.json();
            
            if (calendarData.code === 200) {
                setMonthDays(calendarData.data);
                // Update hijriDate to the first day of the new month to update the UI
                setHijriDate(calendarData.data[0].hijri);
                setSelectedDay(calendarData.data[0]);
                // Update the Gregorian reference date
                const [gDay, gMonth, gYear] = calendarData.data[0].gregorian.date.split('-');
                setCurrentDate(new Date(parseInt(gYear), parseInt(gMonth) - 1, parseInt(gDay)));
            }
        } catch (error) {
            toast.error("خطأ في التنقل بين الشهور");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (preferences) {
            fetchMonthData(currentDate);
        }
    }, [currentDate, preferences]);

    const handleGtoHConvert = async () => {
        try {
            const date = parse(convertGtoH, "yyyy-MM-dd", new Date());
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            const res = await fetch(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
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
            const res = await fetch(`https://api.aladhan.com/v1/hToG/${day}-${month}-${year}`);
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
        <div className="min-h-screen bg-background text-foreground font-arabic" dir="rtl">
            {/* Header with Background Image Style */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                        backgroundImage: `url('https://images.unsplash.com/photo-1591604021695-4c6977efec5d?auto=format&fit=crop&q=80&w=2000')`,
                        filter: 'brightness(0.4)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
                
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hijriDate?.day}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-2"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                                {hijriDate ? (
                                    `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year} هـ`
                                ) : "جاري التحميل..."}
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 font-medium">
                                {format(currentDate, "EEEE d MMMM yyyy", { locale: ar })}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 space-y-8 pb-24">
                <AuthReminder message="سجل دخولك لمزامنة تقويمك وتلقي تنبيهات بالمناسبات الإسلامية" />

                {/* Calendar Card */}
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-card/80 backdrop-blur-xl">
                    <CardContent className="p-0">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between p-6 border-b border-border/10">
                            <Button variant="ghost" size="icon" onClick={() => handleMonthChange('prev')} className="rounded-full hover:bg-primary/10">
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                            <h2 className="text-2xl font-bold text-primary">
                                {hijriDate?.month.ar}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => handleMonthChange('next')} className="rounded-full hover:bg-primary/10">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-7 mb-6">
                                {weekdays.map(day => (
                                    <div key={day.en} className="text-center text-sm font-bold text-muted-foreground/60">
                                        {day.ar}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2 md:gap-4">
                                {loading ? (
                                    Array.from({ length: 35 }).map((_, i) => (
                                        <div key={`skeleton-${i}`} className="aspect-square bg-muted/20 animate-pulse rounded-full" />
                                    ))
                                ) : (
                                    <>
                                        {monthDays.length > 0 && Array.from({ length: weekdays.findIndex(d => d.ar === monthDays[0].weekday.ar) }).map((_, i) => (
                                            <div key={`pad-${i}`} className="aspect-square" />
                                        ))}
                                        
                                        {monthDays.map((day, idx) => {
                                            const isToday = hijriDate && 
                                                           day.hijri.day === hijriDate.day && 
                                                           day.hijri.month.number === hijriDate.month.number;
                                            
                                            const isSelected = selectedDay && 
                                                              day.hijri.day === selectedDay.hijri.day && 
                                                              day.hijri.month.number === selectedDay.hijri.month.number;

                                            const event = ISLAMIC_EVENTS.find(e => 
                                                e.month === day.hijri.month.number && e.day === parseInt(day.hijri.day)
                                            );

                                            return (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => setSelectedDay(day)}
                                                    className={`
                                                        relative aspect-square flex items-center justify-center rounded-full transition-all text-xl font-bold
                                                        ${isToday ? "bg-red-600 text-white shadow-lg shadow-red-600/30 scale-110 z-10" : ""}
                                                        ${isSelected && !isToday ? "bg-primary/20 text-primary border-2 border-primary" : ""}
                                                        ${!isToday && !isSelected ? "hover:bg-primary/10 text-foreground" : ""}
                                                        ${event && !isToday ? "after:content-[''] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full" : ""}
                                                    `}
                                                >
                                                    {parseInt(day.hijri.day)}
                                                </button>
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
                                    className="bg-primary/5 border-t border-border/10 p-6"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-primary" />
                                                    توقيت صلاة {selectedDay.hijri.day} {selectedDay.hijri.month.ar}
                                                </h3>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setShowMonthlyTimes(!showMonthlyTimes)}
                                                    className="text-xs text-primary"
                                                >
                                                    {showMonthlyTimes ? "إخفاء جدول الشهر" : "عرض جدول الشهر"}
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                {Object.entries(selectedDay.timings).filter(([name]) => ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name)).map(([name, time]) => (
                                                    <div key={name} className="bg-background/50 p-3 rounded-2xl border border-border/10 flex flex-col items-center">
                                                        <span className="text-[10px] text-muted-foreground mb-1">
                                                            {name === "Fajr" ? "الفجر" : name === "Dhuhr" ? "الظهر" : name === "Asr" ? "العصر" : name === "Maghrib" ? "المغرب" : "العشاء"}
                                                        </span>
                                                        <span className="text-lg font-bold text-primary">{time.split(' ')[0]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {showMonthlyTimes && (
                                        <div className="mt-8 overflow-x-auto">
                                            <table className="w-full text-sm text-right">
                                                <thead>
                                                    <tr className="border-b border-border/10 text-muted-foreground">
                                                        <th className="p-2 font-bold text-xs">اليوم</th>
                                                        <th className="p-2 font-bold text-xs">هجري</th>
                                                        <th className="p-2 font-bold text-xs">ميلادي</th>
                                                        <th className="p-2 font-bold text-xs">الفجر</th>
                                                        <th className="p-2 font-bold text-xs">المغرب</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monthlyData.map((day: any, i: number) => (
                                                        <tr key={i} className="border-b border-border/5 hover:bg-primary/5">
                                                            <td className="p-2 text-xs">{day.hijri.weekday.ar}</td>
                                                            <td className="p-2 font-bold text-xs">{day.hijri.day}</td>
                                                            <td className="p-2 text-[10px] text-muted-foreground">{day.gregorian.day}/{day.gregorian.month.number}</td>
                                                            <td className="p-2 font-bold text-primary text-xs">{day.timings.Fajr.split(' ')[0]}</td>
                                                            <td className="p-2 font-bold text-primary text-xs">{day.timings.Maghrib.split(' ')[0]}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Date Conversion Section */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold px-2">تحويل التاريخ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="rounded-[2rem] border-none shadow-lg bg-card/50 backdrop-blur-md overflow-hidden hover:bg-card/80 transition-all cursor-pointer group" onClick={() => setConversionType('HtoG')}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-bold">تحويل التاريخ الهجري</h4>
                                    <p className="text-sm text-muted-foreground">التاريخ الهجري إلى الميلادي</p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <CalendarIcon className="w-8 h-8" />
                                </div>
                            </CardContent>
                        </Card>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Card className="rounded-[2rem] border-none shadow-lg bg-card/50 backdrop-blur-md overflow-hidden hover:bg-card/80 transition-all cursor-pointer group">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-bold">تحويل التاريخ الميلادي</h4>
                                            <p className="text-sm text-muted-foreground">التاريخ الميلادي إلى الهجري</p>
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                                            <CalendarIcon className="w-8 h-8" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-[2rem] font-arabic">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-center">تحويل التاريخ</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="flex bg-muted p-1 rounded-2xl">
                                        <button 
                                            onClick={() => setConversionType('GtoH')}
                                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${conversionType === 'GtoH' ? 'bg-background text-primary shadow-md' : 'text-muted-foreground'}`}
                                        >
                                            ميلادي ← هجري
                                        </button>
                                        <button 
                                            onClick={() => setConversionType('HtoG')}
                                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${conversionType === 'HtoG' ? 'bg-background text-primary shadow-md' : 'text-muted-foreground'}`}
                                        >
                                            هجري ← ميلادي
                                        </button>
                                    </div>

                                    {conversionType === 'GtoH' ? (
                                        <div className="space-y-4">
                                            <Input 
                                                type="date" 
                                                value={convertGtoH}
                                                onChange={(e) => setConvertGtoH(e.target.value)}
                                                className="h-14 rounded-2xl border-border/40 text-right text-lg"
                                            />
                                            <Button onClick={handleGtoHConvert} className="w-full h-14 rounded-2xl text-lg font-bold">تحويل الآن</Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                <Input placeholder="اليوم" value={convertHtoG.day} onChange={e => setConvertHtoG(prev => ({ ...prev, day: e.target.value }))} className="h-14 rounded-2xl text-center text-lg" />
                                                <Input placeholder="الشهر" value={convertHtoG.month} onChange={e => setConvertHtoG(prev => ({ ...prev, month: e.target.value }))} className="h-14 rounded-2xl text-center text-lg" />
                                                <Input placeholder="السنة" value={convertHtoG.year} onChange={e => setConvertHtoG(prev => ({ ...prev, year: e.target.value }))} className="h-14 rounded-2xl text-center text-lg" />
                                            </div>
                                            <Button onClick={handleHtoGConvert} className="w-full h-14 rounded-2xl text-lg font-bold">تحويل الآن</Button>
                                        </div>
                                    )}

                                    {convertedResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-8 rounded-[2rem] bg-primary/10 border-2 border-primary/20 text-center space-y-2"
                                        >
                                            <p className="text-sm text-primary font-bold uppercase tracking-widest">التاريخ المحول</p>
                                            <p className="text-2xl font-bold text-primary">
                                                {convertedResult.type === 'hijri' ? (
                                                    `${convertedResult.data.day} ${convertedResult.data.month.ar} ${convertedResult.data.year} هـ`
                                                ) : (
                                                    `${convertedResult.data.day} ${convertedResult.data.month.en} ${convertedResult.data.year} م`
                                                )}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Upcoming Event Section */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold px-2">الحدث القادم</h3>
                    {nextEvent && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-card to-card/50 overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-4 flex-1">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
                                            <Bell className="w-4 h-4" />
                                            حدث إسلامي قريب
                                        </div>
                                        <h4 className="text-3xl md:text-4xl font-bold leading-tight">
                                            {nextEvent.title}
                                        </h4>
                                        <div className="flex items-center gap-4 text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5" />
                                                <span className="text-lg font-medium">{nextEvent.day} {hijriMonths[nextEvent.month - 1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Button className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg shadow-red-600/20 transition-all active:scale-95">
                                            <Bell className="w-5 h-5 ml-2" />
                                            إضافة تذكير
                                        </Button>
                                        <Button variant="outline" className="h-14 w-14 rounded-2xl border-border/40 hover:bg-primary/5 transition-all active:scale-95">
                                            <Share2 className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
