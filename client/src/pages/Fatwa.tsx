import { useState } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Fatwa() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "system", content: "أنت مساعد فقهي ذكي." },
        { role: "assistant", content: "مرحباً بك في رفيق المؤمن. أنا مساعدك الذكي للإجابة على الأسئلة الفقهية. يمكنك اختيار المذهب (سني/شيعي) للحصول على إجابة أكثر دقة." }
    ]);
    const [context, setContext] = useState<'sunni' | 'shia'>('sunni');

    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (content: string) => {
        // Add user message immediately
        setMessages((prev) => [...prev, { role: "user", content }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/fatwa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: content, context }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.answer },
                ]);
            } else {
                throw new Error(data.error || 'Failed to fetch');
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-6 animate-in fade-in duration-500">
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

            <div className="h-[600px] border rounded-xl overflow-hidden shadow-sm bg-background">
                <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="اكتب سؤالك الفقهي هنا..."
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
