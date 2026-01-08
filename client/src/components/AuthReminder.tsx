import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthReminderProps {
  message?: string;
  className?: string;
}

export function AuthReminder({ 
  message = "سجل دخولك لحفظ تقدمك ومزامنة مفضلاتك عبر جميع أجهزتك",
  className = ""
}: AuthReminderProps) {
  const { user, signInWithGoogle } = useAuth();

  if (user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full ${className}`}
      >
        <Card className="p-4 bg-primary/5 border-primary/20 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground/80 text-center sm:text-right">
                {message}
              </p>
            </div>
            
            <Button 
              onClick={() => signInWithGoogle()}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <User className="w-4 h-4 ml-2" />
              تسجيل الدخول (اختياري)
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
