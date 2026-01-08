import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Copy, Share2, Sparkles, Loader2, Search, RotateCcw, Plus, BookText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ADHKAR_CATEGORIES } from "@shared/islamic-data";
import { useAuth } from "@/_core/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { AuthReminder } from "@/components/AuthReminder";

export default function Adhkar() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<"adhkar" | "duaa" | "ziyarat">("adhkar");
  const [selectedCategory, setSelectedCategory] = useState("morning");
  const [adhkarList, setAdhkarList] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Merge static and dynamic categories
  const filteredCategories = useMemo(() => {
    // Start with static categories for current type
    const base = Object.entries(ADHKAR_CATEGORIES)
      .filter(([_, cat]) => (cat as any).type === activeType)
      .map(([id, cat]) => ({ id, name: cat.name, description: cat.description }));

    // Add categories from DB that aren't in static list
    const dynamic = dbCategories
      .filter(cat => !ADHKAR_CATEGORIES[cat as keyof typeof ADHKAR_CATEGORIES])
      .map(cat => ({ id: cat, name: cat, description: "" }));

    return [...base, ...dynamic];
  }, [activeType, dbCategories]);

  useEffect(() => {
    fetchDbCategories();
  }, [activeType]);

  const fetchDbCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('adhkar')
        .select('category')
        .eq('type', activeType)
        .eq('is_active', true);

      if (error) throw error;
      if (data) {
        const unique = Array.from(new Set(data.map(d => d.category)));
        setDbCategories(unique);
      }
    } catch (error) {
      console.error("Fetch DB categories error:", error);
    }
  };

  useEffect(() => {
    const isAvailable = filteredCategories.some((c: any) => c.id === selectedCategory);
    if (!isAvailable && filteredCategories.length > 0) {
      setSelectedCategory(filteredCategories[0].id);
    }
  }, [filteredCategories]);

  useEffect(() => {
    fetchAdhkar();
    if (user) fetchFavorites();
  }, [selectedCategory, user]);

  const fetchAdhkar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('adhkar')
        .select('*')
        .eq('category', selectedCategory)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Remove potential duplicates based on content
      const uniqueData = data ? Array.from(new Map(data.map(item => [item.content, item])).values()) : [];
      setAdhkarList(uniqueData);
    } catch (error: any) {
      console.error("Fetch Adhkar error:", error);
      toast.error("فشل تحميل الأذكار");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('type', 'adhkar');

      if (error) throw error;
      if (data) {
        setFavorites(new Set(data.map(f => f.content_id)));
      }
    } catch (error) {
      console.error("Fetch favorites error:", error);
    }
  };

  const handleToggleFavorite = async (id: string, content: string) => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول لحفظ المفضلات");
      return;
    }

    const isFavorite = favorites.has(id);
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', id)
          .eq('type', 'adhkar');

        if (error) throw error;

        setFavorites(prev => {
          const newFavs = new Set(prev);
          newFavs.delete(id);
          return newFavs;
        });
        toast.success("تم الحذف من المفضلة");
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            content_id: id,
            type: 'adhkar',
            content: content
          });

        if (error) throw error;

        setFavorites(prev => new Set(prev).add(id));
        toast.success("تم الإضافة للمفضلة");
      }
    } catch (error: any) {
      toast.error("حدث خطأ في تحديث المفضلة");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الذكر بنجاح");
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ذكر من تطبيق مؤمن',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy(text);
    }
  };

  const categoryInfo = ADHKAR_CATEGORIES[selectedCategory as keyof typeof ADHKAR_CATEGORIES];

  const filteredAdhkar = adhkarList?.filter((a: any) => a?.content?.includes(searchQuery));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="max-w-4xl mx-auto">
        <AuthReminder className="mb-8" />
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {activeType === 'adhkar' ? 'الأذكار النبوية' : activeType === 'duaa' ? 'الأدعية المأثورة' : 'الزيارات الشريفة'}
            </h1>
            <Sparkles className="w-7 h-7 text-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Section Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted/50 p-1.5 rounded-2xl flex gap-1 backdrop-blur-sm border-2 border-primary/10 shadow-lg">
              <Button
                variant={activeType === 'adhkar' ? 'secondary' : 'ghost'}
                className={`rounded-xl px-8 transition-all duration-300 ${activeType === 'adhkar' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-primary/10'}`}
                onClick={() => setActiveType('adhkar')}
              >
                الأذكار
              </Button>
              <Button
                variant={activeType === 'duaa' ? 'secondary' : 'ghost'}
                className={`rounded-xl px-8 transition-all duration-300 ${activeType === 'duaa' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-primary/10'}`}
                onClick={() => setActiveType('duaa')}
              >
                الأدعية
              </Button>
              <Button
                variant={activeType === 'ziyarat' ? 'secondary' : 'ghost'}
                className={`rounded-xl px-8 transition-all duration-300 ${activeType === 'ziyarat' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-primary/10'}`}
                onClick={() => setActiveType('ziyarat')}
              >
                الزيارات
              </Button>
            </div>
          </div>

          <div className="max-w-md mx-auto relative group">
            <Input
              placeholder={activeType === 'adhkar' ? "ابحث عن ذكر..." : "ابحث عن دعاء..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 rounded-full border-primary/20 bg-white/50 backdrop-blur-sm focus:ring-primary shadow-sm hover:border-primary/40 transition-all text-right"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
        </div>

        {/* Categories Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mb-8"
        >
          <TabsList className="flex flex-wrap h-auto gap-2 p-2 bg-muted/50 backdrop-blur-sm shadow-inner rounded-xl justify-center">
            {filteredCategories.map((category: any) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-lg py-2 px-4 whitespace-nowrap"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Current Category Info */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/20 backdrop-blur-sm shadow-lg transform hover:scale-[1.01] transition-transform duration-300 text-right">
          <h2 className="text-2xl font-bold text-primary mb-2">
            {categoryInfo?.name}
          </h2>
          <p className="text-muted-foreground">
            {categoryInfo?.description}
          </p>
        </Card>

        {/* Adhkar List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-primary font-medium animate-pulse">جاري تحميل الأذكار...</p>
            </div>
          ) : filteredAdhkar.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed bg-muted/20">
              <p className="text-muted-foreground text-lg">لا توجد نتائج مطابقة لبحثك</p>
            </Card>
          ) : (
            <AnimatePresence>
              {filteredAdhkar.map((dua: any, index: number) => (
                <motion.div
                  key={dua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-md border border-border/50 hover:border-primary/40 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150" />

                    <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                      <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 order-2 md:order-1 self-end md:self-start">
                        <button
                          onClick={() => handleToggleFavorite(dua.id, dua.content)}
                          className="p-3 hover:bg-primary/10 rounded-2xl transition-all duration-300"
                        >
                          <Heart className={`w-6 h-6 transition-all duration-300 ${favorites.has(dua.id) ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"}`} />
                        </button>

                        <div className="flex flex-col items-center gap-1 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-12 h-12 border-2 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-md active:scale-95"
                            onClick={() => setCounts(prev => ({ ...prev, [dua.id]: (prev[dua.id] || 0) + 1 }))}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                          <span className="text-sm font-bold text-primary">{(counts[dua.id] || 0)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 opacity-50 hover:opacity-100"
                            onClick={() => setCounts(prev => ({ ...prev, [dua.id]: 0 }))}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>

                        <button onClick={() => handleCopy(dua.content)} className="p-3 hover:bg-primary/10 rounded-2xl transition-all">
                          <Copy className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleShare(dua.content)} className="p-3 hover:bg-primary/10 rounded-2xl transition-all">
                          <Share2 className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="flex-1 order-1 md:order-2 w-full">
                        <p className="text-xl md:text-3xl leading-[1.8] text-right mb-6 text-foreground font-arabic selection:bg-primary/30">
                          {dua.content}
                        </p>
                        <div className="flex flex-wrap items-center justify-end gap-3 mt-auto">
                          {dua.source && (
                            <span className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full text-sm font-medium border border-primary/20 text-primary">
                              <BookText className="w-3.5 h-3.5" />
                              <span>المصدر: {dua.source}</span>
                            </span>
                          )}
                          {dua.order_index !== undefined && (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-xs font-mono text-muted-foreground border border-border/50">
                              {dua.order_index}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
