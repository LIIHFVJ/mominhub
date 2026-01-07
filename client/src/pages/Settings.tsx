import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Moon, Sun, Monitor, User, Bell, Languages, BookText, Loader2, MapPin, Search, Calculator, Sparkles } from "lucide-react";
import { ARAB_LOCATIONS, CALCULATION_METHODS } from "@/lib/prayer-times";

interface UserPreferences {
    theme: string;
    reciter_id: string;
    notifications_enabled: boolean;
    language: string;
    country: string;
    city: string;
    athan_enabled: boolean;
    pre_notification_enabled: boolean;
    calculation_method: number;
    pre_notification_time: number;
    athan_voice: string;
    fajr_enabled: boolean;
    dhuhr_enabled: boolean;
    asr_enabled: boolean;
    maghrib_enabled: boolean;
    isha_enabled: boolean;
    sunnah_tahajjud: boolean;
    sunnah_duha: boolean;
    sunnah_witr: boolean;
    dnd_mode_enabled: boolean;
    dnd_start: string;
    dnd_end: string;
}

export default function Settings() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dateInfo, setDateInfo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: "light",
        reciter_id: "ar.alafasy",
        notifications_enabled: true,
        language: "ar",
        country: "Iraq",
        city: "Baghdad",
        athan_enabled: false,
        pre_notification_enabled: true,
        calculation_method: 4,
        pre_notification_time: 5,
        athan_voice: "makkah",
        fajr_enabled: true,
        dhuhr_enabled: true,
        asr_enabled: true,
        maghrib_enabled: true,
        isha_enabled: true,
        sunnah_tahajjud: false,
        sunnah_duha: false,
        sunnah_witr: false,
        dnd_mode_enabled: false,
        dnd_start: "22:00",
        dnd_end: "04:00"
    });
    const [cityMode, setCityMode] = useState<"select" | "manual">("select");

    const selectedCountryData = ARAB_LOCATIONS.find(l => l.country === preferences.country);

    useEffect(() => {
        async function loadPreferences() {
            if (!user) {
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setPreferences({
                    theme: data.theme || "light",
                    reciter_id: data.reciter_id || "ar.alafasy",
                    notifications_enabled: data.notifications_enabled ?? true,
                    language: data.language || "ar",
                    country: data.country || "Iraq",
                    city: data.city || "Baghdad",
                    athan_enabled: data.athan_enabled ?? false,
                    pre_notification_enabled: data.pre_notification_enabled ?? true,
                    calculation_method: data.calculation_method || 4,
                    pre_notification_time: data.pre_notification_time || 5,
                    athan_voice: data.athan_voice || "makkah",
                    fajr_enabled: data.fajr_enabled ?? true,
                    dhuhr_enabled: data.dhuhr_enabled ?? true,
                    asr_enabled: data.asr_enabled ?? true,
                    maghrib_enabled: data.maghrib_enabled ?? true,
                    isha_enabled: data.isha_enabled ?? true,
                    sunnah_tahajjud: data.sunnah_tahajjud ?? false,
                    sunnah_duha: data.sunnah_duha ?? false,
                    sunnah_witr: data.sunnah_witr ?? false,
                    dnd_mode_enabled: data.dnd_mode_enabled ?? false,
                    dnd_start: data.dnd_start || "22:00",
                    dnd_end: data.dnd_end || "04:00"
                });
            }
            setLoading(false);
        }
        loadPreferences();
    }, [user]);

    const handleSave = async () => {
        if (!user) {
            toast.error("يرجى تسجيل الدخول لحفظ الإعدادات");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    theme: preferences.theme,
                    reciter_id: preferences.reciter_id,
                    notifications_enabled: preferences.notifications_enabled,
                    language: preferences.language,
                    country: preferences.country,
                    city: preferences.city,
                    athan_enabled: preferences.athan_enabled,
                    pre_notification_enabled: preferences.pre_notification_enabled,
                    calculation_method: preferences.calculation_method,
                    pre_notification_time: preferences.pre_notification_time,
                    athan_voice: preferences.athan_voice,
                    fajr_enabled: preferences.fajr_enabled,
                    dhuhr_enabled: preferences.dhuhr_enabled,
                    asr_enabled: preferences.asr_enabled,
                    maghrib_enabled: preferences.maghrib_enabled,
                    isha_enabled: preferences.isha_enabled,
                    sunnah_tahajjud: preferences.sunnah_tahajjud,
                    sunnah_duha: preferences.sunnah_duha,
                    sunnah_witr: preferences.sunnah_witr,
                    dnd_mode_enabled: preferences.dnd_mode_enabled,
                    dnd_start: preferences.dnd_start,
                    dnd_end: preferences.dnd_end,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('not found')) {
                    throw new Error("لم يتم العثور على الجدول. يرجى التأكد من تشغيل ملف SQL migration.");
                }
                throw error;
            }
            toast.success("تم حفظ الإعدادات بنجاح");
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error("خطأ في الحفظ: " + (error.message || "تأكد من إعداد قاعدة البيانات"));
        } finally {
            setSaving(false);
        }
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("متصفحك لا يدعم الإشعارات");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            toast.success("تم تفعيل أذونات الإشعارات");
        } else {
            toast.error("تم رفض أذونات الإشعارات");
        }
    };

    const testNotification = () => {
        if (Notification.permission === "default") {
            requestNotificationPermission();
        }

        if (Notification.permission === "granted") {
            new Notification("تجربة التنبيه", {
                body: "هكذا سيصلك تنبيه الصلاة القادم إن شاء الله",
                icon: "/favicon.ico"
            });
            toast.success("تم إرسال إشعار تجريبي");
        } else {
            toast.error("يرجى تفعيل صلاحية الإشعارات من المتصفح أولاً");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 px-4 py-12 md:py-20">
            <div className="max-w-2xl mx-auto space-y-8 text-right" dir="rtl">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8" />
                        الإعدادات المتقدمة
                    </h1>
                    <p className="text-muted-foreground italic">خصص تجربتك الروحية مع رفيق المؤمن</p>
                </div>

                <div className="space-y-6">
                    {/* Theme Settings */}
                    <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-sm border-r-4 border-r-blue-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-blue-500" />
                                المظهر والعرض
                            </CardTitle>
                            <CardDescription>اختر السمة التي تفضلها للواجهة</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="theme-mode">تغيير المظهر (داكن/فاتح)</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        toggleTheme?.();
                                        setPreferences(prev => ({ ...prev, theme: theme === 'light' ? 'dark' : 'light' }));
                                    }}
                                    className="gap-2"
                                >
                                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    {theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quran Settings */}
                    <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-sm border-r-4 border-r-purple-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <BookText className="w-5 h-5 text-purple-500" />
                                تفضيلات القرآن الكريم
                            </CardTitle>
                            <CardDescription>اختر قارئك المفضل وجودة الصوت</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>القارئ المفضل</Label>
                                <Select
                                    value={preferences.reciter_id}
                                    onValueChange={(val: string) => setPreferences(prev => ({ ...prev, reciter_id: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر القارئ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ar.alafasy">مشاري العفاسي</SelectItem>
                                        <SelectItem value="ar.shaatree">أبو بكر الشاطري</SelectItem>
                                        <SelectItem value="ar.ahmedajamy">أحمد العجمي</SelectItem>
                                        <SelectItem value="ar.mahermuaiqly">ماهر المعيقلي</SelectItem>
                                        <SelectItem value="ar.husary">محمود خليل الحصري</SelectItem>
                                        <SelectItem value="ar.saoodshuraym">سعود الشريم</SelectItem>
                                        <SelectItem value="ar.abdurrahmansudais">عبد الرحمن السديس</SelectItem>
                                        <SelectItem value="ar.minshawi">محمد صديق المنشاوي</SelectItem>
                                        <SelectItem value="ar.abdulsamad">عبد الباسط عبد الصمد</SelectItem>
                                        <SelectItem value="ar.yasseradrussary">ياسر الدوسري</SelectItem>
                                        <SelectItem value="ar.faresabbad">فارس عباد</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">سيتم استخدامه تلقائياً عند فتح آيات جديدة</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications & Prayer */}
                    <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-sm border-r-4 border-r-orange-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Bell className="w-5 h-5 text-orange-500" />
                                التنبيهات والأذان
                            </CardTitle>
                            <CardDescription>إعدادات إشعارات الصلاة والوضوء</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">التنبيهات العامة</Label>
                                    <p className="text-xs text-muted-foreground">تفعيل إشعارات الأذكار والمناسبات</p>
                                </div>
                                <Switch
                                    checked={preferences.notifications_enabled}
                                    onCheckedChange={(val: boolean) => setPreferences(prev => ({ ...prev, notifications_enabled: val }))}
                                />
                            </div>

                            {/* Individual Prayer Toggles */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20">
                                <PrayerToggle label="الفجر" checked={preferences.fajr_enabled} onChange={(v: boolean) => setPreferences(p => ({ ...p, fajr_enabled: v }))} />
                                <PrayerToggle label="الظهر" checked={preferences.dhuhr_enabled} onChange={(v: boolean) => setPreferences(p => ({ ...p, dhuhr_enabled: v }))} />
                                <PrayerToggle label="العصر" checked={preferences.asr_enabled} onChange={(v: boolean) => setPreferences(p => ({ ...p, asr_enabled: v }))} />
                                <PrayerToggle label="المغرب" checked={preferences.maghrib_enabled} onChange={(v: boolean) => setPreferences(p => ({ ...p, maghrib_enabled: v }))} />
                                <PrayerToggle label="العشاء" checked={preferences.isha_enabled} onChange={(v: boolean) => setPreferences(p => ({ ...p, isha_enabled: v }))} />
                            </div>

                            {/* Sunnah Reminders */}
                            <div className="space-y-4 border-t pt-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    تنبيهات السنن والقيام
                                </Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">قيام الليل (الثلث الأخير)</span>
                                        <Switch checked={preferences.sunnah_tahajjud} onCheckedChange={(v) => setPreferences(p => ({ ...p, sunnah_tahajjud: v }))} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">صلاة الضحى</span>
                                        <Switch checked={preferences.sunnah_duha} onCheckedChange={(v) => setPreferences(p => ({ ...p, sunnah_duha: v }))} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">صلاة الوتر</span>
                                        <Switch checked={preferences.sunnah_witr} onCheckedChange={(v) => setPreferences(p => ({ ...p, sunnah_witr: v }))} />
                                    </div>
                                </div>
                            </div>

                            {/* DND Mode */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <Moon className="w-4 h-4 text-indigo-500" />
                                        وضع السكون (عدم الإزعاج)
                                    </Label>
                                    <Switch checked={preferences.dnd_mode_enabled} onCheckedChange={(v) => setPreferences(p => ({ ...p, dnd_mode_enabled: v }))} />
                                </div>
                                {preferences.dnd_mode_enabled && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-muted-foreground">من الساعة</span>
                                            <Input type="time" value={preferences.dnd_start} onChange={(e) => setPreferences(p => ({ ...p, dnd_start: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-muted-foreground">إلى الساعة</span>
                                            <Input type="time" value={preferences.dnd_end} onChange={(e) => setPreferences(p => ({ ...p, dnd_end: e.target.value }))} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">تنبيهات ما قبل الأذان</Label>
                                    <p className="text-xs text-muted-foreground">تحضير للوضوء قبل الوقت</p>
                                </div>
                                <Switch
                                    checked={preferences.pre_notification_enabled}
                                    onCheckedChange={(val: boolean) => {
                                        if (val) requestNotificationPermission();
                                        setPreferences(prev => ({ ...prev, pre_notification_enabled: val }));
                                    }}
                                />
                            </div>

                            {preferences.pre_notification_enabled && (
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 mr-6">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold">وقت التنبيه المسبق</Label>
                                        <p className="text-[10px] text-muted-foreground">كم دقيقة قبل دخول الوقت؟</p>
                                    </div>
                                    <Select
                                        value={preferences.pre_notification_time.toString()}
                                        onValueChange={(val: string) => setPreferences(prev => ({ ...prev, pre_notification_time: parseInt(val) }))}
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 دقائق</SelectItem>
                                            <SelectItem value="10">10 دقائق</SelectItem>
                                            <SelectItem value="15">15 دقيقة</SelectItem>
                                            <SelectItem value="20">20 دقيقة</SelectItem>
                                            <SelectItem value="30">30 دقيقة</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 gap-2 text-xs border-dashed"
                                onClick={testNotification}
                            >
                                <Bell className="w-3 h-3" />
                                إرسال إشعار تجريبي للتأكد
                            </Button>

                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">تشغيل الأذان تلقائياً</Label>
                                    <p className="text-xs text-muted-foreground">تشغيل صوت الأذان عند دخول وقت الصلاة</p>
                                </div>
                                <Switch
                                    checked={preferences.athan_enabled}
                                    onCheckedChange={(val: boolean) => setPreferences(prev => ({ ...prev, athan_enabled: val }))}
                                />
                            </div>

                            {preferences.athan_enabled && (
                                <div className="space-y-4 pr-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">صوت الأذان</Label>
                                        <Select
                                            value={preferences.athan_voice}
                                            onValueChange={(val: string) => setPreferences(prev => ({ ...prev, athan_voice: val }))}
                                        >
                                            <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm">
                                                <SelectValue placeholder="اختر صوت المؤذن" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="makkah">أذان مكة المكرمة</SelectItem>
                                                <SelectItem value="madinah">أذان المدينة المنورة</SelectItem>
                                                <SelectItem value="aqsa">أذان المسجد الأقصى</SelectItem>
                                                <SelectItem value="egypt">أذان مصر (مقامات)</SelectItem>
                                                <SelectItem value="turkey">أذان تركيا (سلطاني)</SelectItem>
                                                <SelectItem value="shia">الأذان الجعفري (صوت حزين)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-muted-foreground mr-1">سيتم تشغيل هذا الصوت تلقائياً عند دخول الوقت</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 border-t pt-4 px-2">
                                <Label className="flex items-center gap-2">
                                    <Languages className="w-4 h-4 text-primary" />
                                    لغة الواجهة
                                </Label>
                                <Select
                                    value={preferences.language}
                                    onValueChange={(val: string) => setPreferences(prev => ({ ...prev, language: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ar">العربية</SelectItem>
                                        <SelectItem value="en">English (قريباً)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Settings */}
                    <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-sm border-r-4 border-r-green-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-500" />
                                الموقع الجغرافي
                            </CardTitle>
                            <CardDescription>يتم تحديد المواقيت بدقة بناءً على بلدك ومدينتك</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Country Selection */}
                                <div className="space-y-2">
                                    <Label className="font-bold flex items-center gap-2">الدولة</Label>
                                    <Select
                                        value={preferences.country}
                                        onValueChange={(val: string) => {
                                            const countryData = ARAB_LOCATIONS.find(c => c.country === val);
                                            setCityMode("select");
                                            setPreferences(prev => ({
                                                ...prev,
                                                country: val,
                                                city: countryData ? countryData.cities[0].en : prev.city,
                                                calculation_method: countryData?.defaultMethod || prev.calculation_method
                                            }));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الدولة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ARAB_LOCATIONS.map(loc => (
                                                <SelectItem key={loc.country} value={loc.country}>{loc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* City Selection */}
                                <div className="space-y-2">
                                    <Label className="font-bold flex items-center gap-2">المدينة / المحافظة</Label>
                                    {cityMode === "select" && selectedCountryData ? (
                                        <div className="flex gap-2">
                                            <Select
                                                value={preferences.city}
                                                onValueChange={(val: string) => {
                                                    if (val === "manual") {
                                                        setCityMode("manual");
                                                    } else {
                                                        setPreferences(prev => ({ ...prev, city: val }));
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="اختر المدينة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {selectedCountryData.cities.map(city => (
                                                        <SelectItem key={city.en} value={city.en}>{city.ar}</SelectItem>
                                                    ))}
                                                    <SelectItem value="manual" className="text-primary font-bold border-t">
                                                        إدخال مدينة أخرى...
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={preferences.city}
                                                onChange={(e) => setPreferences(prev => ({ ...prev, city: e.target.value }))}
                                                placeholder="أدخل اسم المدينة"
                                                className="text-right flex-1"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setCityMode("select")}
                                                title="العودة للقائمة"
                                            >
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-xl border border-primary/20 text-center font-medium">
                                ملاحظة: النظام يختار طريقة الحساب الأنسب لبلدك تلقائياً لضمان الدقة.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Account Info */}
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">{user?.user_metadata?.full_name || "مستخدم ضيف"}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email || "سجل الدخول لحفظ بياناتك"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        className="w-full h-12 text-lg shadow-lg shadow-primary/20"
                        onClick={handleSave}
                        disabled={saving || !user}
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : null}
                        حفظ التغييرات
                    </Button>

                    {!user && (
                        <p className="text-center text-sm text-destructive font-bold">
                            يجب تسجيل الدخول لحفظ هذه الإعدادات بشكل دائم
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function PrayerToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
            <span className="text-xs font-medium">{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} className="scale-75 origin-right" />
        </div>
    );
}
