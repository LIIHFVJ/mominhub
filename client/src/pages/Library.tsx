import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book as BookIcon, ExternalLink, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthReminder } from "@/components/AuthReminder";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Library() {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBookType, setActiveBookType] = useState("reading");

    useEffect(() => {
        async function fetchBooks() {
            try {
                const { data, error } = await supabase
                    .from('books')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setBooks(data || []);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBooks();
    }, []);

    // Filter books by category and type
    const filteredBooks = books.filter(b => (b.book_type || "reading") === activeBookType);
    const shiaBooks = filteredBooks.filter(b => b.category === "shia");
    const sunniBooks = filteredBooks.filter(b => b.category === "sunni");

    return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <AuthReminder className="mb-4" />
      <header className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    المكتبة الإسلامية
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    مجموعة من الكتب والمصادر الإسلامية (ملفات PDF) جاهزة للقراءة والتحميل.
                </p>
            </header>

            <div className="flex justify-center mb-6">
                <div className="inline-flex p-1 bg-muted rounded-xl border">
                    <button
                        onClick={() => setActiveBookType("reading")}
                        className={`px-6 py-2 rounded-lg transition-all ${activeBookType === 'reading' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                    >
                        كتب للقراءة
                    </button>
                    <button
                        onClick={() => setActiveBookType("download")}
                        className={`px-6 py-2 rounded-lg transition-all ${activeBookType === 'download' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                    >
                        كتب للتحميل
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">جاري تحميل الكتب...</p>
                </div>
            ) : (
                <Tabs defaultValue="shia" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="shia">كتب الشيعة</TabsTrigger>
                            <TabsTrigger value="sunni">كتب أهل السنة</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="shia" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shiaBooks.length > 0 ? shiaBooks.map((book) => (
                                <Card key={book.id} className="hover:shadow-lg transition-shadow border-teal-100 dark:border-teal-900 group">
                                    <CardHeader>
                                        <CardTitle className="flex items-start justify-between gap-2">
                                            <span className="line-clamp-2 text-lg">{book.title}</span>
                                            <FileText className="h-5 w-5 text-teal-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        </CardTitle>
                                        {book.author && <CardDescription>{book.author}</CardDescription>}
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild variant="outline" className="w-full border-teal-200 hover:bg-teal-50 text-teal-700">
                                            <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                فتح الكتاب (PDF)
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="text-center col-span-full py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    لا توجد كتب مضافة حالياً في هذا القسم.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="sunni" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sunniBooks.length > 0 ? sunniBooks.map((book) => (
                                <Card key={book.id} className="hover:shadow-lg transition-shadow border-emerald-100 dark:border-emerald-900 group">
                                    <CardHeader>
                                        <CardTitle className="flex items-start justify-between gap-2">
                                            <span className="line-clamp-2 text-lg">{book.title}</span>
                                            <BookIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        </CardTitle>
                                        {book.author && <CardDescription>{book.author}</CardDescription>}
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild variant="outline" className="w-full border-emerald-200 hover:bg-emerald-50 text-emerald-700">
                                            <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                فتح الكتاب (PDF)
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="text-center col-span-full py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    لا توجد كتب مضافة حالياً في هذا القسم.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
