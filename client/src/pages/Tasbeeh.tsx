import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Plus, Minus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function Tasbeeh() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPressed, setIsPressed] = useState(false);

  // تحميل العداد المحفوظ
  useEffect(() => {
    async function loadCounter() {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasbeeh_counter')
        .select('count')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCount(data.count || 0);
      }
      setIsLoading(false);
    }
    loadCounter();
  }, [user]);

  const saveCount = async (newCount: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('tasbeeh_counter')
      .upsert({
        user_id: user.id,
        count: newCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("Error updating count:", error);
      toast.error("فشل حفظ العداد");
    }
  };

  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);
    saveCount(newCount);

    // تحديث الإحصائيات اليومية
    try {
      if (user) {
        await supabase.rpc('increment_tasbeeh_count', { count_to_add: 1 });
      }
    } catch (e) {
      console.warn("Failed to sync daily stats", e);
    }

    // Haptic feedback simulation
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    // Special milestone notifications
    if (newCount % 33 === 0) {
      toast.success(`ماشاء الله! وصلت إلى ${newCount} تسبيحة`);
    } else if (newCount % 100 === 0) {
      toast.success(`بارك الله فيك! ${newCount} تسبيحة`, {
        icon: "🌟"
      });
    }
  };

  const handleDecrement = async () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      saveCount(newCount);
    }
  };

  const handleReset = async () => {
    setCount(0);
    saveCount(0);
    toast.success("تم إعادة تعيين العداد");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background p-4 flex items-center justify-center relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">
            المسبحة الإلكترونية
          </h1>
          <p className="text-muted-foreground text-lg">
            احسب تسبيحاتك وأذكارك بسهولة ويسر
          </p>
        </div>

        {/* Main Counter Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-card to-card/95 border-2 border-primary/20 shadow-xl">
          <div className="text-center">
            {/* Simple Professional Counter */}
            <div className="mb-10">
              <p className="text-sm text-muted-foreground mb-4 tracking-wide">عدد التسبيحات</p>
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 px-16 py-8 rounded-2xl border-2 border-primary/15 shadow-inner">
                <div className="text-8xl font-bold font-mono tracking-wider text-primary">
                  {count.toString().padStart(3, "0")}
                </div>
              </div>
            </div>

            {/* Professional Increment Button */}
            <button
              onClick={handleIncrement}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              className={`
                w-full h-40 rounded-2xl
                bg-gradient-to-br from-primary to-primary/90
                text-primary-foreground font-bold
                mb-8 transition-all duration-150
                shadow-lg hover:shadow-xl
                flex items-center justify-center
                ${isPressed ? 'scale-[0.98]' : 'scale-100 hover:scale-[1.01]'}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl font-bold">اضغط للتسبيح</span>
                <span className="text-sm opacity-90">سبحان الله وبحمده</span>
              </div>
            </button>

            {/* Control Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDecrement}
                className="h-14 border-2 hover:bg-destructive/10 hover:border-destructive transition-all"
              >
                <Minus className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="h-14 border-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleIncrement}
                className="h-14 border-2 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-muted/30 border border-border/50">
          <h3 className="font-semibold text-primary mb-4">نصائح للاستخدام</h3>
          <ul className="space-y-2 text-sm text-muted-foreground text-right">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>اضغط على الزر الكبير لزيادة العداد</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>استخدم الأزرار السفلية للتحكم الدقيق</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>سيتم حفظ العداد تلقائياً في حسابك</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>ستحصل على تنبيه عند الوصول لـ 33 و 100 تسبيحة</span>
            </li>
          </ul>
        </Card>

        {/* Auth Message */}
        {!user && (
          <Card className="p-5 mt-6 bg-primary/5 border-l-4 border-primary">
            <p className="text-sm text-center font-medium">
              سجل الدخول لحفظ العداد الخاص بك عبر جميع أجهزتك
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
