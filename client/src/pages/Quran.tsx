import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, Heart, SkipBack, SkipForward, Repeat, Info, AlertCircle, Search, Headset, BookOpen, Music } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { AuthReminder } from "@/components/AuthReminder";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Reciter {
  id: string;
  name: string;
  bio: string;
  quality: string;
}

const RECITERS: Reciter[] = [
  {
    id: "ar.alafasy",
    name: "مشاري العفاسي",
    bio: "مشاري بن راشد العفاسي، إمام وخطيب وقارئ كويتي، صاحب صوت ندي وأداء مميز.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.ahmedajamy",
    name: "أحمد العجمي",
    bio: "أحمد بن علي العجمي، قارئ للقرآن الكريم من مدينة الخبر بالسعودية.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.mahermuaiqly",
    name: "ماهر المعيقلي",
    bio: "ماهر بن حمد المعيقلي، إمام وخطيب المسجد الحرام بمكة المكرمة.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.shaatree",
    name: "أبو بكر الشاطري",
    bio: "أبو بكر بن محمد الشاطري، قارئ سعودي، ولد في جدة عام 1970م.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.husary",
    name: "محمود خليل الحصري",
    bio: "أحد أشهر قراء القرآن الكريم في العالم الإسلامي، تميز بجودة القراءة وإتقان الأحكام.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.saoodshuraym",
    name: "سعود الشريم",
    bio: "سعود بن إبراهيم الشريم، إمام وخطيب المسجد الحرام بمكة المكرمة سابقاً.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.abdurrahmansudais",
    name: "عبد الرحمن السديس",
    bio: "الرئيس العام لشؤون المسجد الحرام والمسجد النبوي، وإمام الحرم المكي الشريف.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.minshawi",
    name: "محمد صديق المنشاوي",
    bio: "أحد أعلام القراء في مصر والعالم الإسلامي، لُقب بصاحب الصوت الباكي.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.abdulsamad",
    name: "عبد الباسط عبد الصمد",
    bio: "صاحب الحنجرة الذهبية، أحد أشهر القراء في تاريخ العالم الإسلامي.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.yasseradrussary",
    name: "ياسر الدوسري",
    bio: "ياسر بن راشد الدوسري، إمام وخطيب المسجد الحرام بمكة المكرمة.",
    quality: "128kbps MP3"
  },
  {
    id: "ar.faresabbad",
    name: "فارس عباد",
    bio: "فارس عبد ربه محمد عباد، قارئ يمني، يتميز بصوت شجي وأداء هادئ.",
    quality: "128kbps MP3"
  }
];

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
  };
  numberInSurah: number;
  audio: string;
  tafsir?: string;
  hifzStatus?: 'none' | 'trying' | 'memorized';
}

export default function Quran() {
  const { user } = useAuth();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reciterSearch, setReciterSearch] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [lastProgress, setLastProgress] = useState<{ surahNumber: number, ayahNumber: number } | null>(null);
  const [showTafsir, setShowTafsir] = useState<Record<number, boolean>>({});
  const [tafsirs, setTafsirs] = useState<Record<number, string>>({});
  const [selectedTafsirSource, setSelectedTafsirSource] = useState("ar.muyassar");
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
          toast.error("فشل تشغيل الصوت لهذا القارئ. قد يكون الرابط غير متوفر حالياً.");
        });
      }
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentAyahIndex, selectedReciter]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleAyahEnd = () => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (currentAyahIndex < ayahs.length - 1) {
      const nextIndex = currentAyahIndex + 1;
      setCurrentAyahIndex(nextIndex);
      if (selectedSurah) {
        updateReadingProgress(selectedSurah.number, ayahs[nextIndex].numberInSurah);
      }
    } else {
      setIsPlaying(false);
      setCurrentAyahIndex(0);
    }
  };

  // تحميل المفضلة
  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      const { data } = await supabase
        .from('favorites')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('type', 'verse');

      if (data) {
        setFavorites(new Set(data.map(f => f.content_id)));
      }
    }
    loadFavorites();
  }, [user]);

  // تحميل التقدم والقارئ المفضل
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (progressData?.[0]) {
        setLastProgress({
          surahNumber: progressData[0].surah_number,
          ayahNumber: progressData[0].ayah_number
        });
      }

      const { data: prefData } = await supabase
        .from('user_preferences')
        .select('reciter_id')
        .eq('user_id', user.id)
        .single();

      if (prefData?.reciter_id) {
        setSelectedReciter(prefData.reciter_id);
      }
    }
    loadUserData();
  }, [user]);

  const updateReadingProgress = async (surahNum: number, ayahNum: number) => {
    if (!user) return;
    try {
      await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          surah_number: surahNum,
          ayah_number: ayahNum,
          updated_at: new Date()
        }, { onConflict: 'user_id' });
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  // جلب السور
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();
        setSurahs(data.data);
      } catch (error) {
        toast.error("فشل تحميل السور");
      }
    };
    fetchSurahs();
  }, []);

  // جلب الآيات عند تغيير السورة أو القارئ
  useEffect(() => {
    if (selectedSurah) {
      const fetchAyahs = async () => {
        setLoadingAyahs(true);
        try {
          const response = await fetch(
            `https://api.alquran.cloud/v1/surah/${selectedSurah.number}/${selectedReciter}`
          );
          const data = await response.json();
          if (data.data) {
            setAyahs(data.data.ayahs);
            // Reset index if we switched surahs, but keep it if we just switched reciters
            if (lastProgress && lastProgress.surahNumber === selectedSurah.number) {
                const index = data.data.ayahs.findIndex((a: any) => a.numberInSurah === lastProgress.ayahNumber);
                if (index !== -1) setCurrentAyahIndex(index);
            }
          }
        } catch (error) {
          toast.error("فشل تحميل الآيات لهذا القارئ");
        } finally {
          setLoadingAyahs(false);
        }
      };
      fetchAyahs();
    }
  }, [selectedSurah, selectedReciter]);

  const fetchTafsir = async (ayahNumber: number) => {
    if (tafsirs[ayahNumber]) return;
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${selectedTafsirSource}`);
      const data = await res.json();
      if (data.data) {
        setTafsirs(prev => ({ ...prev, [ayahNumber]: data.data.text }));
      }
    } catch (e) {
      console.error("Tafsir error", e);
    }
  };

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReciters = RECITERS.filter(r => 
    r.name.includes(reciterSearch)
  );

  const handleToggleFavorite = async (ayahId: string, ayahText: string) => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      if (favorites.has(ayahId)) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('content_id', ayahId);
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(ayahId);
          return newSet;
        });
        toast.success("تم حذف من المفضلة");
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          type: "verse",
          content_id: ayahId,
          content: ayahText,
        });
        setFavorites((prev) => new Set(prev).add(ayahId));
        toast.success("تم إضافة إلى المفضلة");
      }
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <AuthReminder className="mb-6" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary/5 p-8 rounded-3xl border border-primary/10">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">القرآن الكريم</h1>
            <p className="text-muted-foreground font-medium">تلاوات مباركة بأصوات كبار القراء مع التفسير الميسر</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-background p-3 rounded-2xl shadow-sm border flex items-center gap-4">
                <div className="text-left">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">وقت القراءة اليوم</p>
                    <p className="text-sm font-bold text-primary">45 دقيقة</p>
                </div>
                <BookOpen className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Right Column: Navigation & Settings */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Surah Selection */}
            <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث عن سورة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none bg-transparent focus-visible:ring-0 text-right h-8"
                    />
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredSurahs.map((surah) => (
                        <button
                            key={surah.number}
                            onClick={() => setSelectedSurah(surah)}
                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                                selectedSurah?.number === surah.number
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "hover:bg-muted"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedSurah?.number === surah.number ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                                    {surah.number}
                                </span>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{surah.name}</p>
                                    <p className={`text-[10px] ${selectedSurah?.number === surah.number ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                        {surah.numberOfAyahs} آية • {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Reciter Selection - Improved List */}
            <Card className="rounded-3xl border-border/40 shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold">
                        اختر القارئ
                    </h3>
                    <div className="relative w-32">
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="بحث..."
                            value={reciterSearch}
                            onChange={e => setReciterSearch(e.target.value)}
                            className="w-full bg-muted rounded-lg pr-7 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                    {filteredReciters.map(reciter => (
                        <button
                            key={reciter.id}
                            onClick={() => setSelectedReciter(reciter.id)}
                            className={`p-3 rounded-xl border transition-all text-right font-bold text-sm flex items-center justify-between group ${
                                selectedReciter === reciter.id
                                ? "border-primary bg-primary text-primary-foreground shadow-md"
                                : "border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-primary/30"
                            }`}
                        >
                            <span>{reciter.name}</span>
                            {selectedReciter === reciter.id && (
                                <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </Card>
          </div>

          {/* Left Column: Display & Player */}
          <div className="lg:col-span-8 space-y-6">
            {selectedSurah ? (
              <div className="space-y-6">
                
                {/* Audio Player Card */}
                <Card className="rounded-3xl border-primary/20 shadow-xl bg-card/95 backdrop-blur-sm sticky top-4 z-20 p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Reciter Info */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">القارئ الحالي</p>
                                <h3 className="text-lg font-bold">{RECITERS.find(r => r.id === selectedReciter)?.name}</h3>
                                <p className="text-xs text-muted-foreground">{selectedSurah.name} • الآية {ayahs[currentAyahIndex]?.numberInSurah || 1}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex-1 flex flex-col gap-4 w-full">
                            <div className="flex items-center justify-center gap-4">
                                <Button variant="ghost" size="icon" onClick={() => setIsLooping(!isLooping)} className={`rounded-full ${isLooping ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                                    <Repeat className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCurrentAyahIndex(prev => Math.max(0, prev - 1))} disabled={currentAyahIndex === 0}>
                                    <SkipForward className="w-5 h-5" />
                                </Button>
                                <Button size="icon" className="w-14 h-14 rounded-full shadow-lg shadow-primary/30" onClick={togglePlay}>
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCurrentAyahIndex(prev => Math.min(ayahs.length - 1, prev + 1))} disabled={currentAyahIndex === ayahs.length - 1}>
                                    <SkipBack className="w-5 h-5" />
                                </Button>
                                <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg">
                                    <span className="text-[10px] font-bold text-muted-foreground">1x</span>
                                    <Music className="w-3 h-3 text-muted-foreground" />
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-muted-foreground">{currentAyahIndex + 1}</span>
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentAyahIndex + 1) / ayahs.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground">{ayahs.length}</span>
                            </div>
                        </div>

                        {/* Volume */}
                        <div className="hidden md:flex flex-col items-center gap-2 w-32">
                            <div className="flex items-center gap-2 w-full">
                                <Volume2 className="w-4 h-4 text-muted-foreground" />
                                <Slider 
                                    value={[volume * 100]} 
                                    max={100} 
                                    onValueChange={(v) => setVolume(v[0] / 100)}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <audio ref={audioRef} src={ayahs[currentAyahIndex]?.audio} onEnded={handleAyahEnd} preload="auto" />
                </Card>

                {/* Ayahs List */}
                <div className="space-y-4">
                    {loadingAyahs ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-32 bg-muted animate-pulse rounded-3xl" />
                        ))
                    ) : (
                        ayahs.map((ayah, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={ayah.number}
                            >
                                <Card 
                                    className={`p-6 rounded-3xl border-2 transition-all duration-500 ${
                                        index === currentAyahIndex 
                                        ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-xl scale-[1.02]" 
                                        : "border-transparent hover:border-primary/10"
                                    }`}
                                >
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className={`rounded-full ${favorites.has(`verse-${ayah.number}`) ? "text-red-500 bg-red-50" : "text-muted-foreground"}`}
                                                    onClick={() => handleToggleFavorite(`verse-${ayah.number}`, ayah.text)}
                                                >
                                                    <Heart className={`w-5 h-5 ${favorites.has(`verse-${ayah.number}`) ? "fill-current" : ""}`} />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="rounded-full text-muted-foreground"
                                                    onClick={() => {
                                                        setShowTafsir(prev => ({ ...prev, [ayah.number]: !prev[ayah.number] }));
                                                        fetchTafsir(ayah.number);
                                                    }}
                                                >
                                                    <Info className="w-5 h-5" />
                                                </Button>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                {ayah.numberInSurah}
                                            </div>
                                        </div>

                                        <p 
                                            className="text-3xl md:text-4xl leading-[2] text-right font-arabic select-none cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => {
                                                setCurrentAyahIndex(index);
                                                setIsPlaying(true);
                                            }}
                                        >
                                            {ayah.text}
                                        </p>

                                        <AnimatePresence>
                                            {showTafsir[ayah.number] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-primary/5 p-4 rounded-2xl border-r-4 border-primary text-sm text-right leading-relaxed font-medium">
                                                        {tafsirs[ayah.number] || "جاري تحميل التفسير..."}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-6 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <BookOpen className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold">مرحباً بك في المصحف الشريف</h3>
                    <p className="text-muted-foreground max-w-xs">يرجى اختيار سورة من القائمة الجانبية لبدء القراءة والاستماع</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
