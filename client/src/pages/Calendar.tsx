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
    const { times: prayerTimes, loading: prayerLoading } = usePrayerTimes();
    const [hijriDate, setHijriDate] = useState<HijriDateInfo | null>(null);
    const [monthDays, setMonthDays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Conversion States
    const [convertGtoH, setConvertGtoH] = useState(format(new Date(), "yyyy-MM-dd"));
    const [convertHtoG, setConvertHtoG] = useState({ day: "", month: "", year: "" });
    const [convertedResult, setConvertedResult] = useState<any>(null);
    const [conversionType, setConversionType] = useState<'GtoH' | 'HtoG'>('GtoH');

    const fetchMonthData = async (date: Date) => {
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
                
                // Fetch the full Hijri month calendar
                const calendarRes = await fetch(`https://api.aladhan.com/v1/hijriCalendar/${hYear}/${hMonth}`);
                const calendarData = await calendarRes.json();
                
                if (calendarData.code === 200) {
                    setMonthDays(calendarData.data);
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
            
            const calendarRes = await fetch(`https://api.aladhan.com/v1/hijriCalendar/${nextHYear}/${nextHMonth}`);
            const calendarData = await calendarRes.json();
            
            if (calendarData.code === 200) {
                setMonthDays(calendarData.data);
                // Update hijriDate to the first day of the new month to update the UI
                setHijriDate(calendarData.data[0].hijri);
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
        fetchMonthData(currentDate);
    }, [currentDate]);

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
        <div className="min-h-screen bg-background text-foreground p-4 font-arabic" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-6 pb-24">
                
                {/* Header - Modern & Clear */}
                <div className="relative overflow-hidden rounded-3xl bg-primary/10 border border-primary/20 p-8 shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-2">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                اليوم في التقويم الهجري
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary">
                                {hijriDate ? (
                                    <>
                                        <span className="text-muted-foreground text-xl md:text-2xl block mb-1">
                                            {hijriDate.weekday.ar}، {hijriDate.day}
                                        </span>
                                        {hijriDate.month.ar} {hijriDate.year} هـ
                                    </>
                                ) : "جاري التحميل..."}
                            </h1>
                            <p className="text-muted-foreground font-medium">
                                {format(new Date(), "EEEE d MMMM yyyy", { locale: ar })}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" size="sm" onClick={goToToday} className="rounded-xl border-primary/20 hover:bg-primary/5">
                                <RefreshCw className="w-4 h-4 ml-2" />
                                اليوم
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary/5">
                                <Share2 className="w-4 h-4 ml-2" />
                                مشاركة
                            </Button>
                        </div>
                    </div>
                    {/* Background Decorative Pattern */}
                    <div className="absolute -left-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calendar Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                {/* Calendar Month Header */}
                                <div className="flex items-center justify-between p-6 bg-muted/30 border-b">
                                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange('prev')} className="rounded-full">
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                        {hijriDate?.month.ar} {hijriDate?.year} هـ
                                    </h2>
                                    <Button variant="ghost" size="icon" onClick={() => handleMonthChange('next')} className="rounded-full">
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="p-6">
                                    <div className="grid grid-cols-7 mb-4">
                                        {weekdays.map(day => (
                                            <div key={day.en} className="text-center text-[10px] md:text-xs font-bold text-muted-foreground pb-2">
                                                {day.ar}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                                        {loading ? (
                                            Array.from({ length: 35 }).map((_, i) => (
                                                <div key={`skeleton-${i}`} className="aspect-square bg-muted/20 animate-pulse rounded-2xl" />
                                            ))
                                        ) : (
                                            <>
                                                {monthDays.length > 0 && Array.from({ length: weekdays.findIndex(d => d.ar === monthDays[0].weekday.ar) }).map((_, i) => (
                                                    <div key={`pad-${i}`} className="aspect-square bg-muted/5 rounded-2xl" />
                                                ))}
                                                
                                                {monthDays.map((day, idx) => {
                                                    const isToday = hijriDate && 
                                                                   day.hijri.day === hijriDate.day && 
                                                                   day.hijri.month.number === hijriDate.month.number;
                                                    
                                                    const event = ISLAMIC_EVENTS.find(e => 
                                                        e.month === day.hijri.month.number && e.day === parseInt(day.hijri.day)
                                                    );

                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`
                                                                relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all cursor-default group border
                                                                ${isToday ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 z-10 border-primary" : "hover:bg-muted/50 border-transparent"}
                                                                ${event && !isToday ? "ring-1 ring-primary/30 bg-primary/5 border-primary/10" : ""}
                                                            `}
                                                        >
                                                            <span className={`text-base md:text-xl font-bold ${isToday ? "" : "text-foreground"}`}>
                                                                {parseInt(day.hijri.day)}
                                                            </span>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className={`text-[8px] md:text-[9px] font-medium ${isToday ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                                                    {day.gregorian.day}
                                                                </span>
                                                                <span className={`text-[7px] md:text-[8px] opacity-40 ${isToday ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                                                                    {day.gregorian.month.en.substring(0, 3)}
                                                                </span>
                                                            </div>
                                                            
                                                            {event && (
                                                                <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-primary"}`} />
                                                            )}
                                                            
                                                            {/* Tooltip on hover (Simulated with group-hover) */}
                                                            {event && (
                                                                <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 w-32 p-2 bg-popover text-popover-foreground text-[10px] rounded-lg shadow-xl border border-border">
                                                                    {event.title}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Events List for this Month */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 px-2">
                                <Info className="w-5 h-5 text-primary" />
                                مناسبات هذا الشهر الهجري
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hijriDate && ISLAMIC_EVENTS.filter(e => e.month === hijriDate.month.number).map((event, i) => (
                                    <Card key={i} className="rounded-2xl border-border/40 hover:border-primary/30 transition-colors bg-card/50">
                                        <CardContent className="p-4 flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary flex-shrink-0">
                                                <span className="text-lg font-bold leading-none">{event.day}</span>
                                                <span className="text-[10px] font-bold">{hijriDate.month.ar}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm text-primary">{event.title}</h4>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {hijriDate && ISLAMIC_EVENTS.filter(e => e.month === hijriDate.month.number).length === 0 && (
                                    <p className="col-span-full text-center text-muted-foreground py-8 italic">
                                        لا توجد مناسبات مسجلة في هذا الشهر
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="space-y-6">
                        {/* Prayer Times Card */}
                        <Card className="rounded-3xl border-border/40 shadow-sm bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        مواقيت الصلاة اليوم
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground">{hijriDate?.weekday.ar}</span>
                                </div>
                                {prayerLoading ? (
                                    <div className="space-y-3">
                                        {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />)}
                                    </div>
                                ) : prayerTimes ? (
                                    <div className="space-y-3">
                                        {Object.entries(prayerTimes).filter(([name]) => ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name)).map(([name, time]) => (
                                            <div key={name} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 transition-colors">
                                                <span className="text-sm font-medium">
                                                    {name === "Fajr" ? "الفجر" : name === "Dhuhr" ? "الظهر" : name === "Asr" ? "العصر" : name === "Maghrib" ? "المغرب" : "العشاء"}
                                                </span>
                                                <span className="text-sm font-bold text-primary">{time}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-xs text-muted-foreground">
                                        يرجى ضبط الموقع في الإعدادات
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Conversion Tool */}
                        <Card className="rounded-3xl border-border/40 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <RefreshCw className="w-4 h-4 text-primary" />
                                    تحويل التاريخ
                                </h3>
                                
                                <div className="flex bg-muted p-1 rounded-xl mb-4">
                                    <button 
                                        onClick={() => setConversionType('GtoH')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${conversionType === 'GtoH' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}
                                    >
                                        ميلادي ← هجري
                                    </button>
                                    <button 
                                        onClick={() => setConversionType('HtoG')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${conversionType === 'HtoG' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}
                                    >
                                        هجري ← ميلادي
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {conversionType === 'GtoH' ? (
                                        <div className="space-y-3">
                                            <Input 
                                                type="date" 
                                                value={convertGtoH}
                                                onChange={(e) => setConvertGtoH(e.target.value)}
                                                className="rounded-xl border-border/40 text-right"
                                            />
                                            <Button onClick={handleGtoHConvert} className="w-full rounded-xl">تحويل</Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-2">
                                                <Input placeholder="سنة" value={convertHtoG.year} onChange={e => setConvertHtoG(prev => ({ ...prev, year: e.target.value }))} className="text-center text-xs px-1" />
                                                <Input placeholder="شهر" value={convertHtoG.month} onChange={e => setConvertHtoG(prev => ({ ...prev, month: e.target.value }))} className="text-center text-xs px-1" />
                                                <Input placeholder="يوم" value={convertHtoG.day} onChange={e => setConvertHtoG(prev => ({ ...prev, day: e.target.value }))} className="text-center text-xs px-1" />
                                            </div>
                                            <Button onClick={handleHtoGConvert} className="w-full rounded-xl">تحويل</Button>
                                        </div>
                                    )}

                                    {convertedResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center"
                                        >
                                            <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-wider">النتيجة</p>
                                            <p className="text-base font-bold text-primary">
                                                {convertedResult.type === 'hijri' ? (
                                                    `${convertedResult.data.day} ${convertedResult.data.month.ar} ${convertedResult.data.year} هـ`
                                                ) : (
                                                    `${convertedResult.data.day} ${convertedResult.data.month.en} ${convertedResult.data.year} م`
                                                )}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 gap-3">
                            <a href="/qibla" className="block">
                                <Card className="rounded-2xl border-border/40 hover:border-primary/30 transition-colors h-full bg-card/50">
                                    <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold">اتجاه القبلة</span>
                                    </CardContent>
                                </Card>
                            </a>
                            <a href="/adhkar" className="block">
                                <Card className="rounded-2xl border-border/40 hover:border-primary/30 transition-colors h-full bg-card/50">
                                    <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold">أذكار اليوم</span>
                                    </CardContent>
                                </Card>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
