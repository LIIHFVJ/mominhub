import { useState } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Lock, LogIn } from "lucide-react";
import { AuthReminder } from "@/components/AuthReminder";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Fatwa() {
    const { isAuthenticated, signInWithGoogle } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: "system", content: "أنت مساعد فقهي ذكي." },
        { role: "assistant", content: "مرحباً بك في رفيق المؤمن. أنا مساعدك الذكي للإجابة على الأسئلة الفقهية. يمكنك اختيار المذهب (سني/شيعي) للحصول على إجابة أكثر دقة." }
    ]);
    const [context, setContext] = useState<'sunni' | 'shia'>('sunni');

    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (content: string) => {
        if (!isAuthenticated) {
            toast.error("يرجى تسجيل الدخول أولاً لاستخدام هذه الميزة");
            signInWithGoogle();
            return;
        }
        // Add user message immediately
        setMessages((prev) => [...prev, { role: "user", content }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/fatwa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ question: content, context }),
            });

            let data;
            const contentType = response.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                try {
                    data = await response.json();
                } catch (e) {
                    const text = await response.text();
                    console.error("Failed to parse JSON response:", text);
                    throw new Error(`استجابة غير صالحة من الخادم: ${text.substring(0, 100)}`);
                }
            } else {
                const text = await response.text();
                console.error("Non-JSON response received:", text);
                
                // If the text looks like an error message we recognize
                if (text.includes("A server error occurred")) {
                    throw new Error("حدث خطأ في خادم الموقع. يرجى مراجعة سجلات الخادم.");
                }
                
                throw new Error(`استجابة غير صالحة من الخادم (ليست JSON): ${text.substring(0, 100)}`);
            }

            if (response.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.answer },
                ]);
            } else {
                // If it's a rate limit error or other structured error
                const errorText = data.error || data.message || `Error ${response.status}`;
                throw new Error(errorText);
            }
        } catch (error: any) {
            console.error("Fatwa Page Error:", error);
            let userFriendlyMessage = "عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.";
            
            if (error.message.includes("Failed to fetch")) {
                userFriendlyMessage = "تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم الخلفي (Backend) وتحديث الصفحة.";
            } else if (error.message.includes("تجاوزت الحد المسموح")) {
                userFriendlyMessage = "لقد تجاوزت الحد المسموح به من الطلبات حالياً. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
            } else {
                userFriendlyMessage = `عذراً، حدث خطأ: ${error.message}`;
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: userFriendlyMessage },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6 animate-in fade-in duration-500">
      <AuthReminder className="mb-4" />
      <header className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">الاستشارة الفقهية الذكية</h1>
                <p className="text-muted-foreground">احصل على إجابات موثقة وسريعة لأسئلتك الشرعية</p>
            </header>

            <div className="flex justify-center">
                <Tabs value={context} onValueChange={(v) => setContext(v as 'sunni' | 'shia')} className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sunni">فقه أهل السنة</TabsTrigger>
                        <TabsTrigger value="shia">فقه الشيعة</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">تنويه</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                    هذا النظام يستخدم الذكاء الاصطناعي وقد يحتوي على أخطاء. يرجى دائماً العودة للمصادر الأصلية والعلماء المعتبرين في المسائل الحساسة.
                </AlertDescription>
            </Alert>

            <div className="h-[600px] border rounded-xl overflow-hidden shadow-sm bg-background relative">
                {!isAuthenticated ? (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md p-6 text-center">
                        <Card className="max-w-md p-8 border-primary/20 shadow-xl bg-card/50">
                            <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-full">
                                <Lock className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">هذه الميزة تتطلب تسجيل الدخول</h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                للحصول على استشارة فقهية مخصصة وحفظ سجل محادثاتك، يرجى تسجيل الدخول أولاً.
                            </p>
                            <Button 
                                onClick={() => signInWithGoogle()} 
                                size="lg" 
                                className="w-full gap-2 text-lg h-12"
                            >
                                <LogIn className="w-5 h-5" />
                                تسجيل الدخول للمتابعة
                            </Button>
                        </Card>
                    </div>
                ) : null}

                <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder={isAuthenticated ? "اكتب سؤالك الفقهي هنا..." : "يرجى تسجيل الدخول أولاً..."}
                    suggestedPrompts={[
                        "ما حكم الصلاة في السفر؟",
                        "كيفية حساب زكاة الفطر؟",
                        "ما هي مبطلات الصيام؟",
                        "حكم الجمع بين الصلاتين"
                    ]}
                />
            </div>
        </div>
    );
}
