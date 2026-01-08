import { Button } from "@/components/ui/button";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Sparkles,
  Wind,
  Heart,
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  Users,
  Wind as TasbeehIcon,
  BookOpen as ReadingIcon,
  BookText
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePrayerTimes } from "@/contexts/PrayerTimesContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookMarked, ArrowLeft } from "lucide-react";
import { AuthReminder } from "@/components/AuthReminder";
import { Logo } from "@/components/Logo";

export default function Home() {
  const { user, signInWithGoogle } = useAuth();
  const { nextPrayer, times, date: prayerDate, loading: prayerLoading } = usePrayerTimes();
  const [lastRead, setLastRead] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalTasbeeh: 0,
    totalQuranMinutes: 0,
    activeUsers: 0
  });
  const [personalStats, setPersonalStats] = useState({
    tasbeeh: 0,
    quranMinutes: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  const ISLAMIC_EVENTS = [
    { month: 1, day: 1, title: "رأس السنة الهجرية" },
    { month: 1, day: 10, title: "يوم عاشوراء" },
    { month: 3, day: 12, title: "المولد النبوي الشريف" },
    { month: 7, day: 27, title: "الإسراء والمعراج" },
    { month: 8, day: 15, title: "ليلة النصف من شعبان" },
    { month: 9, day: 1, title: "بداية شهر رمضان" },
    { month: 9, day: 27, title: "ليلة القدر" },
    { month: 10, day: 1, title: "عيد الفطر المبارك" },
    { month: 12, day: 10, title: "عيد الأضحى المبارك" },
    { month: 12, day: 18, title: "عيد الغدير" },
  ];

  const HIJRI_MONTHS = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
    "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ];

  useEffect(() => {
    if (prayerDate) {
      const hMonth = prayerDate.hijri.month.number;
      const hDay = parseInt(prayerDate.hijri.day);
      
      const events = ISLAMIC_EVENTS.filter(e => 
        (e.month === hMonth && e.day >= hDay) || (e.month > hMonth)
      ).slice(0, 3);
      
      setUpcomingEvents(events);
    }
  }, [prayerDate]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase.rpc('get_platform_stats');

        if (data && data.length > 0) {
          const stats = data[0];
          setGlobalStats({
            totalTasbeeh: Number(stats.total_tasbeeh) || 0,
            totalQuranMinutes: Number(stats.total_quran_minutes) || 0,
            activeUsers: Number(stats.active_users_count) || 0
          });
        }
      } catch (e) {
        console.warn("Error fetching global stats", e);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return;
      setLoadingProgress(true);
      try {
        // Fetch Reading Progress
        const { data: progressData } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressData) {
          const res = await fetch(`https://api.alquran.cloud/v1/surah/${progressData.surah_number}`);
          const surahData = await res.json();
          setLastRead({
            ...progressData,
            surahName: surahData.data.name
          });
        }

        // Fetch Personal Daily Stats
        const dateKey = new Date().toISOString().split('T')[0];
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('tasbeeh_count, quran_reading_minutes')
          .eq('user_id', user.id)
          .eq('date', dateKey)
          .maybeSingle();

        if (statsData) {
          setPersonalStats({
            tasbeeh: statsData.tasbeeh_count || 0,
            quranMinutes: statsData.quran_reading_minutes || 0
          });
        }
      } catch (e) {
        console.error("Error fetching user data", e);
      } finally {
        setLoadingProgress(false);
      }
    }
    fetchProgress();
  }, [user]);

  const features = [
    {
      icon: BookOpen,
      title: "القرآن الكريم",
      description: "اقرأ واستمع للقرآن مع عدة قراء وترجمات",
      href: "/quran",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "الأذكار والأدعية",
      description: "مجموعة شاملة من الأذكار والأدعية المشروعة",
      href: "/adhkar",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BookText,
      title: "الزيارات الشريفة",
      description: "مجموعة من الزيارات المأثورة للنبي وأهل بيته",
      href: "/ziyarat",
      color: "from-amber-600 to-orange-600",
    },
    {
      icon: Wind,
      title: "التسبيح الرقمي",
      description: "عداد تفاعلي لحساب التسبيحات والأذكار",
      href: "/tasbeeh",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Heart,
      title: "المفضلة",
      description: "احفظ أدعيتك وآياتك المفضلة",
      href: "/favorites",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: MapPin,
      title: "بوصلة القبلة",
      description: "حدد اتجاه القبلة من موقعك الحالي",
      href: "/qibla",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Calendar,
      title: "التقويم الهجري",
      description: "تتبع المناسبات الإسلامية المهمة",
      href: "/calendar",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: MessageSquare,
      title: "الاستشارة الفقهية",
      description: "اسأل عن أحكام فقهية من مصادر موثوقة",
      href: "/fatwa",
      color: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-primary/40 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/40 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 flex justify-center">
            <Logo className="w-24 h-24" textClassName="hidden" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent leading-tight">
            رفيق المؤمن
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 font-light leading-relaxed max-w-3xl mx-auto">
            منصة إسلامية شاملة تجمع القرآن الكريم والأذكار والأدعية والمكتبة
            الإسلامية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="group shadow-lg hover:shadow-primary/20 transition-all">
              <a href="/quran" className="flex items-center gap-2">
                ابدأ الآن
                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </Button>
            
            {!user ? (
              <GoogleLoginButton 
                size="lg" 
                variant="outline" 
                text="تسجيل الدخول (اختياري)" 
                className="backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-all"
              />
            ) : null}

            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const element = document.getElementById("features");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="backdrop-blur-sm"
            >
              تعرف أكثر
            </Button>
          </div>
        </div>
      </section>

      {/* Prayer Times Widget */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-0 overflow-hidden border-none bg-gradient-to-br from-primary/95 to-primary shadow-2xl relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/10 rounded-full -ml-16 -mb-16 blur-3xl" />

            <div className="grid grid-cols-1 md:grid-cols-3 relative z-10">
              {/* Next Prayer Highlight */}
              <div className="p-8 text-primary-foreground flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-l border-white/10 backdrop-blur-sm">
                <div className="bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-md">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-sm uppercase tracking-wider opacity-80 mb-1">الصلاة القادمة</h3>
                {nextPrayer ? (
                  <>
                    <div className="text-5xl font-extrabold my-2 tracking-tight">{nextPrayer.name}</div>
                    <div className="text-2xl font-light opacity-90">{nextPrayer.time}</div>
                    <div className="mt-6 text-sm bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      بقي {nextPrayer.remaining}
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 w-32 bg-white/20 rounded-lg mx-auto" />
                    <div className="h-6 w-20 bg-white/10 rounded-lg mx-auto" />
                  </div>
                )}
              </div>

              {/* All Prayer Times List + Hijri Date */}
              <div className="col-span-2 p-8 flex flex-col justify-between bg-white/[0.03] backdrop-blur-md">
                <div className="flex justify-between items-start mb-8">
                  <div className="text-primary-foreground">
                    <p className="text-xs opacity-70 mb-1">التاريخ الهجري</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-70" />
                      <span className="font-bold text-lg">
                        {prayerDate ? `${prayerDate.hijri.day} ${prayerDate.hijri.month.ar} ${prayerDate.hijri.year}` : "---"}
                      </span>
                    </div>
                  </div>
                  <div className="text-primary-foreground text-left">
                    <div className="text-xl font-bold">{new Date().toLocaleDateString('ar-EG', { weekday: 'long' })}</div>
                    <div className="text-xs opacity-70">{new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {times ? (
                    Object.entries(times).filter(([name]) => ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name)).map(([name, time]) => {
                      const isNext = nextPrayer?.name === translate(name);
                      return (
                        <div key={name} className={`flex flex-col items-center p-3 rounded-2xl transition-all border ${isNext ? 'bg-white/20 border-white/30 scale-105 shadow-xl' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                          <span className={`text-[10px] uppercase font-bold mb-1 ${isNext ? 'text-amber-300' : 'text-primary-foreground/60'}`}>{translate(name)}</span>
                          <span className="text-lg font-bold text-primary-foreground">{time}</span>
                        </div>
                      );
                    })
                  ) : (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
                    ))
                  )}
                </div>
                {!times && !prayerLoading && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-primary-foreground/60 bg-white/5 p-3 rounded-xl border border-white/10">
                    <MapPin className="w-3 h-3 text-red-400" />
                    يرجى ضبط الموقع في <a href="/settings" className="text-amber-300 underline font-bold">الإعدادات</a> لعرض المواقيت
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white/40 dark:bg-white/5 backdrop-blur-md border-primary/10 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                <TasbeehIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">إجمالي التسبيح اليوم</p>
                <div className="text-xl font-bold text-foreground">
                  {globalStats.totalTasbeeh.toLocaleString('ar-EG')}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/40 dark:bg-white/5 backdrop-blur-md border-primary/10 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                <ReadingIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">دقائق القراءة اليوم</p>
                <div className="text-xl font-bold text-foreground">
                  {globalStats.totalQuranMinutes.toLocaleString('ar-EG')}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/40 dark:bg-white/5 backdrop-blur-md border-primary/10 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">المستخدمون النشطون</p>
                <div className="text-xl font-bold text-foreground">
                  {globalStats.activeUsers.toLocaleString('ar-EG')}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Islamic Events */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              المناسبات القادمة
            </h2>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
              <a href="/calendar" className="flex items-center gap-1">
                عرض التقويم بالكامل
                <ArrowLeft className="w-4 h-4" />
              </a>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, i) => (
                <Card key={i} className="p-4 bg-white/50 dark:bg-card/50 border-primary/10 hover:border-primary/30 transition-all hover:shadow-md cursor-pointer group" onClick={() => window.location.href = '/calendar'}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-1">{event.title}</h3>
                      <p className="text-[10px] text-muted-foreground">
                        {event.day} {HIJRI_MONTHS[event.month - 1]}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-6 bg-muted/20 rounded-2xl text-muted-foreground text-sm italic">
                لا توجد مناسبات قريبة مسجلة
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Personal Daily Achievements */}
      {user ? (
        <section className="px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              إنجازاتي اليوم
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 bg-primary/5 border-primary/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                  <TasbeehIcon className="w-12 h-12" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">تسبيحاتي اليوم</p>
                <div className="text-3xl font-bold text-primary">
                  {personalStats.tasbeeh.toLocaleString('ar-EG')}
                </div>
                <div className="mt-4 h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${Math.min((personalStats.tasbeeh / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] mt-2 text-muted-foreground">الهدف اليومي المبدئي: 100 تسبيحة</p>
              </Card>

              <Card className="p-6 bg-secondary/5 border-secondary/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                  <ReadingIcon className="w-12 h-12" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">دقائق القراءة اليوم</p>
                <div className="text-3xl font-bold text-secondary">
                  {personalStats.quranMinutes.toLocaleString('ar-EG')} دقيقـة
                </div>
                <div className="mt-4 h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-1000"
                    style={{ width: `${Math.min((personalStats.quranMinutes / 15) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] mt-2 text-muted-foreground">الهدف اليومي: 15 دقيقة</p>
              </Card>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <AuthReminder 
              message="سجل دخولك لتتبع إنجازاتك اليومية، وحفظ مكان توقفك في القراءة، ومزامنة مفضلاتك"
              className="mb-4"
            />
          </div>
        </section>
      )}

      {/* Resume Reading Section */}
      {user && lastRead && (
        <section className="px-4 mb-8 -mt-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 border-primary/20 bg-primary/5 shadow-xl hover:shadow-2xl transition-all border-r-4 border-r-primary">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-lg">
                    <BookMarked className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-primary">واصل القراءة</h3>
                    <p className="text-muted-foreground mt-1">
                      لقد توقفت عند <span className="font-bold text-foreground">{lastRead.surahName}</span>، الآية <span className="font-bold text-foreground">{lastRead.ayah_number}</span>
                    </p>
                  </div>
                </div>
                <Button asChild size="lg" className="gap-2 group px-8">
                  <a href="/quran">
                    استكمال القراءة
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section id="features" className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            الميزات الرئيسية
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            مجموعة متكاملة من الأدوات الإسلامية في منصة واحدة سهلة الاستخدام
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <a
                  key={index}
                  href={feature.href}
                  className="group"
                >
                  <Card className="p-6 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 relative overflow-hidden">
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-20 blur-2xl rounded-full`} />
                    </div>

                    <div className="relative z-10">
                      <div
                        className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            ابدأ رحلتك الروحية اليوم
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            انضم إلى آلاف المستخدمين الذين يستخدمون رفيق المؤمن لتحسين عبادتهم
            وتقويتهم الروحية
          </p>
          {!user && (
            <GoogleLoginButton size="lg" text="سجل الآن مجاناً بواسطة جوجل" />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>
            رفيق المؤمن - منصة إسلامية موثوقة تعتمد على مصادر إسلامية أصيلة
          </p>
          <p className="mt-2 text-sm">
            جميع المحتوى الإسلامي مستمد من مصادر موثوقة وموثقة
          </p>
        </div>
      </footer>
    </div>
  );
}
function translate(name: string): string {
  const ar: any = {
    Fajr: "الفجر",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
    Sunrise: "الشروق",
    Sunset: "الغروب"
  };
  return ar[name] || name;
}
