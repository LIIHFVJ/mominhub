import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Heart, Copy, Share2, Sparkles, Loader2, Search, RotateCcw, BookText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ADHKAR_CATEGORIES } from "@shared/islamic-data";
import { useAuth } from "@/_core/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function Ziyarat() {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState("ashura");
    const [ziyaratList, setZiyaratList] = useState<any[]>([]);
    const [dbCategories, setDbCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCategories = useMemo(() => {
        const base = Object.entries(ADHKAR_CATEGORIES)
            .filter(([_, cat]) => (cat as any).type === "ziyarat")
            .map(([id, cat]) => ({ id, name: cat.name, description: cat.description }));

        const dynamic = dbCategories
            .filter(cat => !ADHKAR_CATEGORIES[cat as keyof typeof ADHKAR_CATEGORIES])
            .map(cat => ({ id: cat, name: cat, description: "" }));

        return [...base, ...dynamic];
    }, [dbCategories]);

    useEffect(() => {
        fetchDbCategories();
    }, []);

    const fetchDbCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('adhkar')
                .select('category')
                .eq('type', 'ziyarat')
                .eq('is_active', true);

            if (error) throw error;
            if (data) {
                const unique = Array.from(new Set(data.map(d => d.category)));
                setDbCategories(unique);
            }
        } catch (error) {
            console.error("Fetch Ziyarat categories error:", error);
        }
    };

    useEffect(() => {
        const isAvailable = filteredCategories.some((c: any) => c.id === selectedCategory);
        if (!isAvailable && filteredCategories.length > 0) {
            setSelectedCategory(filteredCategories[0].id);
        }
    }, [filteredCategories]);

    useEffect(() => {
        fetchZiyarat();
        if (user) fetchFavorites();
    }, [selectedCategory, user]);

    const fetchZiyarat = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('adhkar')
                .select('*')
                .eq('category', selectedCategory)
                .eq('type', 'ziyarat')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (error) throw error;
            
            // Remove potential duplicates based on content
            const uniqueData = data ? Array.from(new Map(data.map(item => [item.content, item])).values()) : [];
            setZiyaratList(uniqueData);
        } catch (error: any) {
            console.error("Fetch Ziyarat error:", error);
            toast.error("فشل تحميل الزيارات");
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
            setFavorites(new Set(data.map(f => f.content_id)));
        } catch (error) {
            console.error("Fetch favorites error:", error);
        }
    };

    const toggleFavorite = async (id: string, content: string) => {
        if (!user) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }

        const isFav = favorites.has(id);
        try {
            if (isFav) {
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('content_id', id);
                favorites.delete(id);
            } else {
                await supabase
                    .from('favorites')
                    .insert({ 
                        user_id: user.id, 
                        content_id: id, 
                        type: 'adhkar',
                        content: content
                    });
                favorites.add(id);
            }
            setFavorites(new Set(favorites));
            toast.success(isFav ? "تم الإزالة من المفضلة" : "تم الإضافة للمفضلة");
        } catch (error) {
            toast.error("فشل تحديث المفضلة");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("تم النسخ إلى الحافظة");
    };

    const shareZiyarat = (item: any) => {
        if (navigator.share) {
            navigator.share({
                title: item.category,
                text: item.content,
                url: window.location.href,
            }).catch(console.error);
        } else {
            copyToClipboard(`${item.category}\n\n${item.content}`);
        }
    };

    const filteredZiyarat = ziyaratList.filter(item =>
        item.content?.includes(searchQuery) ||
        (item.source && item.source.includes(searchQuery)) ||
        (item.description && item.description.includes(searchQuery))
    );

    return (
        <div className="min-h-screen bg-[#FDFCF7] dark:bg-background pb-20">
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/20 pt-12 pb-8">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mb-4"
                    >
                        <div className="p-3 bg-primary/20 rounded-2xl">
                            <BookText className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-primary">الزيارات</h1>
                    </motion.div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        مجموعة من الزيارات المشهورة للنبي صلى الله عليه وسلم وأهل بيته عليهم السلام
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search & Categories */}
                <div className="sticky top-16 z-40 bg-[#FDFCF7]/80 dark:bg-background/80 backdrop-blur-md py-4 space-y-4 mb-8">
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            dir="rtl"
                            placeholder="ابحث في نص الزيارة..."
                            className="pr-10 bg-white dark:bg-card border-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <div className="flex gap-2 min-w-max px-4">
                            {filteredCategories.map((cat: any) => (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`rounded-full px-6 transition-all ${selectedCategory === cat.id
                                            ? "shadow-lg scale-105"
                                            : "hover:bg-primary/5"
                                        }`}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>

                {/* List */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-muted-foreground font-medium">جاري التحميل...</p>
                        </div>
                    ) : filteredZiyarat.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {filteredZiyarat.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group relative overflow-hidden border-none shadow-xl bg-white dark:bg-card rounded-3xl p-8 hover:ring-2 ring-primary/20 transition-all duration-500">
                                        {/* Background Pattern */}
                                        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-br-full -translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700" />

                                        <div className="relative space-y-6">
                                            {/* Arabic Text */}
                                            <p className="text-3xl leading-relaxed font-arabic text-center px-4" dir="rtl">
                                                {item.content}
                                            </p>

                                            {/* Description */}
                                            {item.description && (
                                                <div className="p-4 bg-muted/30 rounded-2xl border-r-4 border-primary/40">
                                                    <p className="text-sm text-foreground/80 leading-loose" dir="rtl">
                                                        <Sparkles className="w-4 h-4 inline-block ml-2 text-primary/60" />
                                                        {item.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Source & Actions */}
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
                                                {item.source && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
                                                        <span className="font-medium text-primary/70">المصدر:</span>
                                                        {item.source}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        onClick={() => toggleFavorite(item.id, item.content)}
                                                    >
                                                        <Heart className={`w-5 h-5 ${favorites.has(item.id) ? "fill-red-500 text-red-500" : ""}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => copyToClipboard(item.content)}
                                                    >
                                                        <Copy className="w-5 h-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => shareZiyarat(item)}
                                                    >
                                                        <Share2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 space-y-4 bg-muted/20 rounded-3xl"
                        >
                            <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground font-medium">لم يتم العثور على نتائج</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
