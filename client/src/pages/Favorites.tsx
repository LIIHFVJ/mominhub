import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, BookOpen, Sparkles, Wind, User } from "lucide-react";
import { toast } from "sonner";
import { AuthReminder } from "@/components/AuthReminder";

interface FavoriteItem {
    id: string;
    type: "dua" | "verse" | "book" | "adhkar";
    content_id: string;
    content: string;
    title?: string;
}

export default function Favorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadFavorites() {
            if (!user) return;
            setIsLoading(true);
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user.id);

            if (data) {
                setFavorites(data);
            }
            setIsLoading(false);
        }
        loadFavorites();
    }, [user]);

    const removeFavorite = async (favId: string) => {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favId);

        if (!error) {
            setFavorites(prev => prev.filter(f => f.id !== favId));
            toast.success("تم الحذف من المفضلة");
        } else {
            toast.error("فشل الحذف");
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "verse": return "آية قرآنية";
            case "dua":
            case "adhkar": return "دعاء/ذكر/زيارة";
            case "book": return "كتاب";
            default: return "أخرى";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "verse": return <BookOpen className="w-5 h-5 text-blue-500" />;
            case "dua":
            case "adhkar": return <Sparkles className="w-5 h-5 text-purple-500" />;
            case "book": return <BookOpen className="w-5 h-5 text-green-500" />;
            default: return <Wind className="w-5 h-5 text-gray-500" />;
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-2xl mx-auto space-y-8">
                <div className="relative">
                    <Heart className="w-24 h-24 text-primary mb-4 opacity-10" />
                    <Heart className="w-12 h-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">المفضلة</h2>
                    <p className="text-muted-foreground">قم بتسجيل الدخول للبدء في حفظ آياتك وأذكارك المفضلة ومزامنتها عبر جميع أجهزتك</p>
                </div>
                <AuthReminder message="تسجيل الدخول يتيح لك حفظ ومزامنة مفضلاتك" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-6">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">المفضلة</h1>
                <p className="text-muted-foreground">كل ما قمت بحفظه في مكان واحد</p>
            </header>

            {isLoading ? (
                <div className="text-center py-12">جاري التحميل...</div>
            ) : favorites.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">لا توجد عناصر في المفضلة بعد</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {favorites.map((fav) => (
                        <Card key={fav.id} className="overflow-hidden">
                            <div className="flex p-4 gap-4">
                                <div className="flex-shrink-0 pt-1">
                                    {getTypeIcon(fav.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {getTypeLabel(fav.type)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeFavorite(fav.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {fav.title && <h3 className="font-bold mb-1">{fav.title}</h3>}
                                    <p className="text-lg leading-relaxed text-right quran-text">
                                        {fav.content}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
