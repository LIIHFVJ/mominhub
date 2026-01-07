import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    BookOpen,
    Upload,
    BarChart,
    Plus,
    Trash2,
    Lock,
    Loader2,
    FileText,
    Image as ImageIcon,
    Heart,
    Wind,
    Sparkles,
    MessageSquare,
    BookText
} from "lucide-react";
import { toast } from "sonner";
import { ADHKAR_CATEGORIES } from "@shared/islamic-data";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Admin() {
    const { user, loading: authLoading } = useAuth();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState({
        users: 0,
        books: 0,
        favorites: 0,
        totalTasbeeh: 0,
        totalQuran: 0,
        activeUsers: 0
    });
    const [booksList, setBooksList] = useState<any[]>([]);
    const [adhkarList, setAdhkarList] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [activeZiyaratTab, setActiveZiyaratTab] = useState("ziyarat"); // For the new tab

    // New Book Form State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddAdhkarOpen, setIsAddAdhkarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newAdhkar, setNewAdhkar] = useState({
        category: "morning",
        customCategory: "",
        showCustomCategory: false,
        text: "",
        source: "",
        type: "adhkar" as "adhkar" | "duaa" | "ziyarat"
    });

    const [newBook, setNewBook] = useState({
        title: "",
        author: "",
        category: "shia",
        file_url: "",
        cover_url: "",
        description: ""
    });

    // Files state
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    useEffect(() => {
        async function checkRole() {
            if (authLoading) return;
            if (!user) {
                setLocation("/");
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error || data?.role !== 'admin') {
                    toast.error("عذراً، لا تملك صلاحية الوصول لهذه الصفحة");
                    setLocation("/");
                } else {
                    setIsAdmin(true);
                    fetchStats();
                    fetchBooks();
                    fetchAdhkar();
                }
            } catch (e) {
                setLocation("/");
            } finally {
                setVerifying(false);
            }
        }
        checkRole();
    }, [user, authLoading]);

    const fetchStats = async () => {
        try {
            const { count: usersCount, error: usersError } = await supabase.from('users').select('*', { count: 'exact', head: true });
            const { count: booksCount, error: booksError } = await supabase.from('books').select('*', { count: 'exact', head: true });
            const { count: favoritesCount, error: favoritesError } = await supabase.from('favorites').select('*', { count: 'exact', head: true });

            if (usersError) console.error("Admin: Users fetch error:", usersError);
            if (booksError) console.error("Admin: Books fetch error:", booksError);
            if (favoritesError) console.error("Admin: Favorites fetch error:", favoritesError);

            // جلب إحصائيات اليوم
            const today = new Date().toISOString().split('T')[0];
            const { data: dailyStats, error: statsError } = await supabase
                .from('user_stats')
                .select('tasbeeh_count, quran_reading_minutes')
                .eq('date', today);

            if (statsError) {
                console.error("Admin: Daily stats fetch error:", statsError);
                toast.error("فشل جلب إحصائيات اليوم");
            }

            const totalTasbeeh = dailyStats?.reduce((acc, curr) => acc + (curr.tasbeeh_count || 0), 0) || 0;
            const totalQuran = dailyStats?.reduce((acc, curr) => acc + (curr.quran_reading_minutes || 0), 0) || 0;
            const activeUsersCount = dailyStats?.length || 0;

            setStats({
                users: usersCount || 0,
                books: booksCount || 0,
                favorites: favoritesCount || 0,
                totalTasbeeh,
                totalQuran,
                activeUsers: activeUsersCount
            });
        } catch (e) {
            console.error("Admin: fetchStats exception:", e);
        }
    };

    const fetchBooks = async () => {
        const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
        if (data) setBooksList(data);
    };

    const fetchAdhkar = async () => {
        const { data } = await supabase.from('adhkar').select('*').order('created_at', { ascending: false });
        if (data) setAdhkarList(data);
    };

    const handleAddAdhkar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newAdhkar.text.trim()) {
            toast.error("يرجى إدخال نص الذكر");
            return;
        }

        setIsSubmitting(true);
        try {
            const category = newAdhkar.showCustomCategory ? newAdhkar.customCategory : newAdhkar.category;
            if (!category) throw new Error("يرجى اختيار أو كتابة فئة");

            // Check if this item already exists in the same category
            const { data: existing, error: checkError } = await supabase
                .from('adhkar')
                .select('id')
                .eq('category', category)
                .eq('content', newAdhkar.text.trim())
                .limit(1);

            if (existing && existing.length > 0) {
                toast.error("هذا الذكر موجود بالفعل في هذه الفئة");
                setIsSubmitting(false);
                return;
            }

            // Infer type from static categories first, fallback to activeTab
            let typeValue = (ADHKAR_CATEGORIES[category as keyof typeof ADHKAR_CATEGORIES] as any)?.type;
            if (!typeValue) {
                if (activeTab === 'duaa') typeValue = 'duaa';
                else if (activeTab === 'ziyarat') typeValue = 'ziyarat';
                else typeValue = 'adhkar';
            }

            // 1. Get the max order_index for the category
            const { data: maxOrderData, error: maxOrderError } = await supabase
                .from('adhkar')
                .select('order_index')
                .eq('category', category)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            if (maxOrderError && maxOrderError.code !== 'PGRST116') { // Ignore 'single row not found'
                throw maxOrderError;
            }

            const newOrderIndex = (maxOrderData?.order_index || 0) + 1;

            const { error } = await supabase.from('adhkar').insert([{
                category,
                content: newAdhkar.text,
                source: newAdhkar.source,
                type: typeValue,
                order_index: newOrderIndex
            }]);

            if (error) throw error;
            toast.success("تم الإضافة بنجاح");
            setIsAddAdhkarOpen(false);
            setNewAdhkar({
                category: "morning",
                customCategory: "",
                showCustomCategory: false,
                text: "",
                source: "",
                type: "adhkar"
            });
            fetchAdhkar();
        } catch (error: any) {
            console.error("Error adding Adhkar:", error);
            toast.error(`حدث خطأ أثناء الإضافة: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAdhkar = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الذكر؟")) return;
        const { error } = await supabase.from('adhkar').delete().eq('id', id);
        if (error) toast.error("فشل الحذف");
        else {
            toast.success("تم الحذف بنجاح");
            fetchAdhkar();
        }
    };

    const getCategoryName = (cat: string) => {
        const staticCat = ADHKAR_CATEGORIES[cat as keyof typeof ADHKAR_CATEGORIES];
        if (staticCat) return staticCat.name;

        const legacyCats: any = {
            morning: "أذكار الصباح",
            evening: "أذكار المساء",
            sleep: "أذكار النوم",
            travel: "أذكار السفر",
            istikhara: "الاستخارة",
            rain: "المطر",
            protection: "أذكار التحصين"
        };
        return legacyCats[cat] || cat;
    };

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // تقليل العرض للحفاظ على الجودة والمساحة
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error("Image compression failed"));
                        },
                        'image/jpeg',
                        0.7 // جودة 70% توازن ممتاز بين الحجم والوضوح
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const uploadFile = async (file: File | Blob, folder: string, originalName?: string) => {
        const fileExt = originalName ? originalName.split('.').pop() : (file instanceof File ? file.name.split('.').pop() : 'jpg');
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
            .from('books')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('books')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newBook.title.trim()) {
            toast.error("يرجى إدخال عنوان الكتاب");
            return;
        }

        if (!pdfFile && !newBook.file_url) {
            toast.error("يرجى اختيار ملف PDF أو وضع رابط مباشر");
            return;
        }

        // Check if book already exists
        const { data: existing, error: checkError } = await supabase
            .from('books')
            .select('id')
            .eq('title', newBook.title.trim())
            .limit(1);

        if (existing && existing.length > 0) {
            toast.error("هذا الكتاب موجود بالفعل");
            return;
        }

        setIsSubmitting(true);
        try {
            let finalFileUrl = newBook.file_url;
            let finalCoverUrl = newBook.cover_url;

            if (pdfFile) {
                toast.info("جاري رفع ملف الكتاب...");
                finalFileUrl = await uploadFile(pdfFile, 'pdfs');
            }

            if (coverFile) {
                toast.info("جاري ضغط ورفع الغلاف...");
                const compressedCover = await compressImage(coverFile);
                finalCoverUrl = await uploadFile(compressedCover, 'covers', coverFile.name);
            }

            const { error } = await supabase.from('books').insert([{
                ...newBook,
                file_url: finalFileUrl,
                cover_url: finalCoverUrl
            }]);

            if (error) throw error;

            toast.success("تم إضافة الكتاب وحفظ الملفات بنجاح");
            setIsAddModalOpen(false);
            resetForm();
            fetchBooks();
            fetchStats();
        } catch (error: any) {
            toast.error("خطأ أثناء الرفع أو الحفظ: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewBook({ title: "", author: "", category: "shia", file_url: "", cover_url: "", description: "" });
        setPdfFile(null);
        setCoverFile(null);
    };

    const handleDeleteBook = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الكتاب؟")) return;

        try {
            const { error } = await supabase.from('books').delete().eq('id', id);
            if (error) throw error;

            toast.success("تم حذف الكتاب");
            fetchBooks();
            fetchStats();
        } catch (error: any) {
            toast.error("خطأ في الحذف: " + error.message);
        }
    };

    if (authLoading || verifying) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="container mx-auto px-4 py-8" dir="rtl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Lock className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                    <p className="text-muted-foreground">إدارة محتوى المنصة والمستخدمين</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-[900px]">
                    <TabsTrigger value="overview">
                        <BarChart className="w-4 h-4 ml-2" />
                        إحصائيات المنصة
                    </TabsTrigger>
                    <TabsTrigger value="books">
                        <BookOpen className="w-4 h-4 ml-2" />
                        الكتب
                    </TabsTrigger>
                    <TabsTrigger value="adhkar">
                        <Sparkles className="w-4 h-4 ml-2" />
                        الأذكار
                    </TabsTrigger>
                    <TabsTrigger value="duaa">
                        <MessageSquare className="w-4 h-4 ml-2" />
                        الأدعية
                    </TabsTrigger>
                    <TabsTrigger value="users">
                        <Users className="w-4 h-4 ml-2" />
                        المستخدمين
                    </TabsTrigger>
                    <TabsTrigger value="ziyarat">
                        <BookText className="w-4 h-4 ml-2" />
                        الزيارات
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-none">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">إجمالي المستخدمين</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.users}</h3>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-none">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">مجموع الكتب</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.books}</h3>
                                    </div>
                                    <BookOpen className="w-8 h-8 text-emerald-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-none">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">التفضيلات المسجلة</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.favorites}</h3>
                                    </div>
                                    <Heart className="w-8 h-8 text-amber-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-none">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">إجمالي التسبيح اليوم</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.totalTasbeeh}</h3>
                                    </div>
                                    <Wind className="w-8 h-8 text-emerald-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-none">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">دقائق القراءة اليوم</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.totalQuran}</h3>
                                    </div>
                                    <BookOpen className="w-8 h-8 text-blue-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-none">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">المستخدمون النشطون اليوم</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.activeUsers}</h3>
                                    </div>
                                    <Users className="w-8 h-8 text-purple-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="books" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>إدارة المكتبة</CardTitle>

                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        إضافة كتاب جديد
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-right text-2xl font-bold">إضافة كتاب جديد</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddBook} className="space-y-4 py-4" dir="rtl">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="text-right block">عنوان الكتاب *</Label>
                                                <Input
                                                    id="title"
                                                    required
                                                    value={newBook.title}
                                                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                                    placeholder="مثلاً: نهج البلاغة"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="author" className="text-right block">المؤلف</Label>
                                                <Input
                                                    id="author"
                                                    value={newBook.author}
                                                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                                    placeholder="مثلاً: الشريف الرضي"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-right block">التصنيف</Label>
                                            <Select
                                                value={newBook.category}
                                                onValueChange={(val: string) => setNewBook({ ...newBook, category: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر التصنيف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="shia">كتب الشيعة</SelectItem>
                                                    <SelectItem value="sunni">كتب أهل السنة</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-4 rounded-xl border-2 border-dashed p-4 bg-muted/30">
                                            <div className="space-y-2">
                                                <Label className="text-right block font-bold text-primary flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    ملف الكتاب (PDF)
                                                </Label>
                                                <Input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                                    className="bg-background cursor-pointer"
                                                />
                                                <p className="text-[10px] text-muted-foreground mr-1">أو ضع رابطاً مباشراً بالأسفل إذا كان الملف مرفوعاً مسبقاً</p>
                                                <Input
                                                    value={newBook.file_url}
                                                    onChange={(e) => setNewBook({ ...newBook, file_url: e.target.value })}
                                                    placeholder="رابط مباشر للملف (اختياري عند اختيار ملف)"
                                                    className="h-8 text-xs"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-right block font-bold text-primary flex items-center gap-2">
                                                    <ImageIcon className="w-4 h-4" />
                                                    غلاف الكتاب (Image)
                                                </Label>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                                    className="bg-background cursor-pointer"
                                                />
                                                <Input
                                                    value={newBook.cover_url}
                                                    onChange={(e) => setNewBook({ ...newBook, cover_url: e.target.value })}
                                                    placeholder="رابط مباشر للغلاف (اختياري)"
                                                    className="h-8 text-xs mt-2"
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter className="pt-4 gap-2">
                                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                                        جاري المعالجة...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-5 h-5 ml-2" />
                                                        تأكيد الإضافة
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {booksList.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                        <p>لا توجد كتب مضافة حالياً</p>
                                    </div>
                                ) : (
                                    booksList.map((book) => (
                                        <div key={book.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 bg-muted rounded flex items-center justify-center overflow-hidden border">
                                                    {book.cover_url ? (
                                                        <img src={book.cover_url} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 opacity-20" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{book.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {book.author} • {book.category === 'shia' ? 'شيعة' : 'سنة'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteBook(book.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="adhkar">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>إدارة الأذكار</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">إضافة وتعديل وحذف الأذكار المعروضة في التطبيق</p>
                            </div>
                            <Dialog open={isAddAdhkarOpen} onOpenChange={setIsAddAdhkarOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        إضافة ذكر جديد
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>إضافة ذكر جديد</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddAdhkar} className="space-y-4 pt-4 text-right">
                                        <div className="space-y-2">
                                            <Label>الفئة</Label>
                                            <Select
                                                value={newAdhkar.showCustomCategory ? "custom" : newAdhkar.category}
                                                onValueChange={(v: string) => {
                                                    if (v === "custom") {
                                                        setNewAdhkar({ ...newAdhkar, showCustomCategory: true, category: "" });
                                                    } else {
                                                        setNewAdhkar({ ...newAdhkar, showCustomCategory: false, category: v });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر الفئة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(ADHKAR_CATEGORIES)
                                                        .filter(([_, cat]) => (cat as any).type === activeTab)
                                                        .map(([key, cat]) => (
                                                            <SelectItem key={key} value={key}>{cat.name}</SelectItem>
                                                        ))}
                                                    {/* Existing custom categories */}
                                                    {Array.from(new Set(adhkarList.filter(a => a.type === 'adhkar').map(a => a.category)))
                                                        .filter(cat => !ADHKAR_CATEGORIES[cat as keyof typeof ADHKAR_CATEGORIES])
                                                        .map(cat => (
                                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                        ))
                                                    }
                                                    <SelectItem value="custom" className="font-bold text-primary">+ فئة جديدة...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {newAdhkar.showCustomCategory && (
                                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                <Label>اسم الفئة الجديدة</Label>
                                                <Input
                                                    placeholder="مثلاً: أذكار المنزل"
                                                    value={newAdhkar.customCategory}
                                                    onChange={(e) => setNewAdhkar({ ...newAdhkar, customCategory: e.target.value })}
                                                    className="text-right"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>نص الذكر</Label>
                                            <textarea
                                                className="w-full min-h-[100px] p-3 rounded-md border bg-background text-right"
                                                value={newAdhkar.text}
                                                onChange={(e) => setNewAdhkar({ ...newAdhkar, text: e.target.value })}
                                                placeholder="..."
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>المصدر</Label>
                                            <Input
                                                value={newAdhkar.source}
                                                onChange={(e) => setNewAdhkar({ ...newAdhkar, source: e.target.value })}
                                                placeholder="مثلاً: البخاري، مسلم، سورة الفلق"
                                                required
                                            />
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة الذكر"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {adhkarList.filter(i => i.type === 'adhkar').length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                        <p>لا توجد أذكار مضافة حالياً</p>
                                    </div>
                                ) : (
                                    adhkarList.filter(i => i.type === 'adhkar').map((item) => (
                                        <div key={item.id} className="flex flex-col p-4 bg-muted/50 rounded-lg group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 text-right">
                                                    <div className="flex items-center gap-2 mb-2 justify-end">
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                            {getCategoryName(item.category)}
                                                        </span>
                                                        <p className="text-sm font-bold text-muted-foreground"> المصدر: {item.source}</p>
                                                    </div>
                                                    <p className="text-base leading-relaxed">{item.text}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteAdhkar(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="duaa">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>إدارة الأدعية</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">إضافة وتعديل وحذف الأدعية المعروضة في التطبيق</p>
                            </div>
                            <Dialog open={isAddAdhkarOpen} onOpenChange={setIsAddAdhkarOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        إضافة دعاء جديد
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>إضافة دعاء جديد</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddAdhkar} className="space-y-4 pt-4 text-right">
                                        <div className="space-y-2">
                                            <Label>الفئة</Label>
                                            <Select
                                                value={newAdhkar.showCustomCategory ? "custom" : newAdhkar.category}
                                                onValueChange={(v: string) => {
                                                    if (v === "custom") {
                                                        setNewAdhkar({ ...newAdhkar, showCustomCategory: true, category: "" });
                                                    } else {
                                                        setNewAdhkar({ ...newAdhkar, showCustomCategory: false, category: v });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر الفئة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(ADHKAR_CATEGORIES)
                                                        .filter(([_, cat]) => (cat as any).type === activeTab)
                                                        .map(([key, cat]) => (
                                                            <SelectItem key={key} value={key}>{cat.name}</SelectItem>
                                                        ))}
                                                    {/* Existing custom categories for duaa */}
                                                    {Array.from(new Set(adhkarList.filter(a => a.type === 'duaa').map(a => a.category)))
                                                        .filter(cat => !ADHKAR_CATEGORIES[cat as keyof typeof ADHKAR_CATEGORIES])
                                                        .map(cat => (
                                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                        ))
                                                    }
                                                    <SelectItem value="custom" className="font-bold text-primary">+ فئة جديدة...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {newAdhkar.showCustomCategory && (
                                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                <Label>اسم الفئة الجديدة</Label>
                                                <Input
                                                    placeholder="مثلاً: أدعية الشفاء"
                                                    value={newAdhkar.customCategory}
                                                    onChange={(e) => setNewAdhkar({ ...newAdhkar, customCategory: e.target.value })}
                                                    className="text-right"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label>نص الدعاء</Label>
                                            <textarea
                                                className="w-full min-h-[100px] p-3 rounded-md border bg-background text-right"
                                                value={newAdhkar.text}
                                                onChange={(e) => setNewAdhkar({ ...newAdhkar, text: e.target.value })}
                                                placeholder="..."
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>المصدر</Label>
                                            <Input
                                                value={newAdhkar.source}
                                                onChange={(e) => setNewAdhkar({ ...newAdhkar, source: e.target.value })}
                                                placeholder="مثلاً: البخاري، مسلم"
                                                required
                                            />
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة الدعاء"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {adhkarList.filter(i => i.type === 'duaa').length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                        <p>لا توجد أدعية مضافة حالياً</p>
                                    </div>
                                ) : (
                                    adhkarList.filter(i => i.type === 'duaa').map((item) => (
                                        <div key={item.id} className="flex flex-col p-4 bg-muted/50 rounded-lg group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 text-right">
                                                    <div className="flex items-center gap-2 mb-2 justify-end">
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                            {getCategoryName(item.category)}
                                                        </span>
                                                        <p className="text-sm font-bold text-muted-foreground"> المصدر: {item.source}</p>
                                                    </div>
                                                    <p className="text-base leading-relaxed">{item.text}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteAdhkar(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>إدارة الصلاحيات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <p>قريباً: إدارة الأدوار والصلاحيات المتقدمة</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ziyarat">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>إدارة الزيارات</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">إضافة وتعديل وحذف الزيارات المعروضة في التطبيق</p>
                            </div>
                            <Dialog open={isAddAdhkarOpen} onOpenChange={setIsAddAdhkarOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        إضافة زيارة جديدة
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>إضافة زيارة جديدة</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddAdhkar} className="space-y-4 pt-4 text-right">
                                        <div className="space-y-2">
                                            <Label>الفئة</Label>
                                            <Select
                                                value={newAdhkar.showCustomCategory ? "custom" : newAdhkar.category}
                                                onValueChange={(v: string) => {
                                                    if (v === "custom") {
                                                        setNewAdhkar({ ...newAdhkar, showCustomCategory: true, category: "" });
                                                    } else {
                                                        setNewAdhkar({ ...newAdhkar, showCustomCategory: false, category: v });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر الفئة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(ADHKAR_CATEGORIES)
                                                        .filter(([_, cat]) => (cat as any).type === activeTab)
                                                        .map(([key, cat]) => (
                                                            <SelectItem key={key} value={key}>{cat.name}</SelectItem>
                                                        ))}
                                                    <SelectItem value="custom" className="font-bold text-primary">+ فئة جديدة...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {newAdhkar.showCustomCategory && (
                                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                                <Label>اسم الفئة الجديدة</Label>
                                                <Input
                                                    placeholder="مثلاً: زيارات خاصة"
                                                    value={newAdhkar.customCategory}
                                                    onChange={(e) => setNewAdhkar({ ...newAdhkar, customCategory: e.target.value })}
                                                    className="text-right"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>نص الزيارة</Label>
                                            <textarea
                                                className="w-full min-h-[150px] p-3 rounded-md border bg-background text-right font-arabic text-lg"
                                                value={newAdhkar.text}
                                                onChange={(e) => setNewAdhkar({ ...newAdhkar, text: e.target.value })}
                                                placeholder="..."
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>المصدر / الوصف</Label>
                                            <Input
                                                value={newAdhkar.source}
                                                onChange={(e) => setNewAdhkar({ ...newAdhkar, source: e.target.value })}
                                                placeholder="مثلاً: مفاتيح الجنان"
                                                required
                                            />
                                        </div>
                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة الزيارة"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {adhkarList.filter(i => (i.type === 'ziyarat' || (i as any).type === 'ziyarat')).length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                        <p>لا توجد زيارات مضافة حالياً</p>
                                    </div>
                                ) : (
                                    adhkarList.filter(i => (i.type === 'ziyarat' || (i as any).type === 'ziyarat')).map((item) => (
                                        <div key={item.id} className="flex flex-col p-4 bg-muted/50 rounded-lg group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 text-right">
                                                    <div className="flex items-center gap-2 mb-2 justify-end">
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                            {getCategoryName(item.category)}
                                                        </span>
                                                        <p className="text-sm font-bold text-muted-foreground"> المصدر: {item.source}</p>
                                                    </div>
                                                    <p className="text-base leading-relaxed font-arabic text-xl">{(item.text || '').substring(0, 150)}...</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteAdhkar(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
