import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PrayerTimesProvider } from "./contexts/PrayerTimesContext";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Fatwa from "./pages/Fatwa";
import Quran from "./pages/Quran";
import Adhkar from "./pages/Adhkar";
import Ziyarat from "./pages/Ziyarat";
import Tasbeeh from "./pages/Tasbeeh";
import Favorites from "./pages/Favorites";
import Qibla from "./pages/Qibla";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import { useAuth } from "@/_core/hooks/useAuth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { Home as HomeIcon, BookOpen, Sparkles, User, Settings as SettingsIcon, Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function MobileNav() {
  const { user, signInWithGoogle } = useAuth();
  const [location, setLocation] = useLocation();
  const isActive = (href: string) => location === href;

  const items = [
    { label: "الرئيسية", href: "/", icon: HomeIcon },
    { label: "القرآن", href: "/quran", icon: BookOpen },
    { label: "الأذكار", href: "/adhkar", icon: Sparkles },
    { label: "الإعدادات", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-4 py-2">
      <div className="flex justify-around items-center h-12">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => setLocation(item.href)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.href) ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <item.icon className={`h-5 w-5 ${isActive(item.href) ? "scale-110" : ""}`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
        {!user && (
          <button
            onClick={() => signInWithGoogle()}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px]">دخول (اختياري)</span>
          </button>
        )}
      </div>
    </div>
  );
}

function TopHeader() {
  const { user, signInWithGoogle } = useAuth();
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case "/": return "الرئيسية";
      case "/quran": return "القرآن الكريم - تلاوة واستماع";
      case "/library": return "المكتبة الإسلامية - كتب ومصادر";
      case "/adhkar": return "الأذكار والأدعية - حصن المسلم";
      case "/ziyarat": return "الزيارات الشريفة - مأثورات";
      case "/tasbeeh": return "التسبيح الرقمي - مسبحة إلكترونية";
      case "/qibla": return "بوصلة القبلة - تحديد الاتجاه";
      case "/calendar": return "التقويم الهجري والميلادي";
      case "/fatwa": return "الاستشارة الفقهية - أسئلة وأجوبة";
      case "/favorites": return "المفضلة - محتواي المحفوظ";
      case "/settings": return "الإعدادات";
      case "/admin": return "لوحة التحكم";
      default: return "رفيق المؤمن";
    }
  };

  const getPageDescription = () => {
    switch (location) {
      case "/": return "رفيق المؤمن - منصة إسلامية شاملة تجمع القرآن الكريم، الأذكار، الأدعية، المكتبة الإسلامية، وأوقات الصلاة.";
      case "/quran": return "اقرأ واستمع للقرآن الكريم بتلاوات مختلفة لأشهر القراء مع التفسير والترجمة.";
      case "/library": return "مجموعة واسعة من الكتب والمصادر الإسلامية القيمة للبحث والقراءة.";
      case "/adhkar": return "مجموعة شاملة من الأذكار اليومية والأدعية المأثورة من الكتاب والسنة.";
      case "/ziyarat": return "زيارات المعصومين عليهم السلام والأدعية المخصوصة بالمشاهد المشرفة.";
      case "/tasbeeh": return "سبحة إلكترونية متطورة تساعدك على ذكر الله وتسبيحه في كل وقت.";
      case "/qibla": return "حدد اتجاه القبلة بدقة من أي مكان في العالم باستخدام بوصلة القبلة المتطورة.";
      case "/calendar": return "التقويم الهجري والميلادي مع عرض المناسبات الدينية وأوقات الصلاة لكل يوم.";
      case "/fatwa": return "احصل على إجابات لاستشاراتك الفقهية والدينية من خلال قسم الاستشارة الفقهية.";
      default: return "رفيق المؤمن - منصة إسلامية شاملة لكل ما يحتاجه المسلم في يومه.";
    }
  };

  useEffect(() => {
    const title = getPageTitle();
    const fullTitle = title === "رفيق المؤمن" ? title : `${title} - رفيق المؤمن`;
    document.title = fullTitle;

    // Update Meta Tags dynamically
    const description = getPageDescription();
    
    // Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    // OG Description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const url = `https://rafiq-al-momin.com${location === '/' ? '' : location}`;
      canonical.setAttribute('href', url);
    }
  }, [location]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <SidebarTrigger className="md:flex" />
      
      <div className="flex-1 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary md:text-xl">{getPageTitle()}</h1>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث هنا..." 
              className="pr-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 w-64"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
          </Button>
          
          {!user && (
            <Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:bg-primary/5" onClick={() => signInWithGoogle()}>
              تسجيل الدخول (اختياري)
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/quran"} component={Quran} />
      <Route path={"/library"} component={Library} />
      <Route path={"/fatwa"} component={Fatwa} />
      <Route path={"/adhkar"} component={Adhkar} />
      <Route path={"/ziyarat"} component={Ziyarat} />
      <Route path={"/tasbeeh"} component={Tasbeeh} />
      <Route path={"/favorites"} component={Favorites} />
      <Route path={"/qibla"} component={Qibla} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <PrayerTimesProvider>
          <TooltipProvider>
            <Toaster />
            <SidebarProvider defaultOpen={true}>
              <div className="flex min-h-screen w-full bg-background font-arabic" dir="rtl">
                <AppSidebar />
                <SidebarInset className="flex flex-col flex-1">
                  <TopHeader />
                  <main className="flex-1 pb-20 md:pb-6">
                    <Router />
                  </main>
                  <MobileNav />
                </SidebarInset>
              </div>
            </SidebarProvider>
          </TooltipProvider>
        </PrayerTimesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
