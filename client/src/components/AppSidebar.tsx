import {
  BookOpen,
  Calendar,
  Compass,
  Heart,
  Home,
  Lock,
  MessageSquare,
  Settings,
  Sparkles,
  Wind,
  BookText,
  User,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { setOpenMobile } = useSidebar();

  const isActive = (href: string) => location === href;

  const mainNavItems = [
    { label: "الرئيسية", href: "/", icon: Home },
    { label: "القرآن الكريم", href: "/quran", icon: BookOpen },
    { label: "المكتبة", href: "/library", icon: BookOpen },
    { label: "الأذكار والأدعية", href: "/adhkar", icon: Sparkles },
    { label: "الزيارات", href: "/ziyarat", icon: BookText },
  ];

  const toolsNavItems = [
    { label: "التسبيح", href: "/tasbeeh", icon: Wind },
    { label: "القبلة", href: "/qibla", icon: Compass },
    { label: "التقويم", href: "/calendar", icon: Calendar },
    { label: "الاستشارة الفقهية", href: "/fatwa", icon: MessageSquare },
  ];

  const userNavItems = [
    { label: "المفضلة", href: "/favorites", icon: Heart },
    { label: "الإعدادات", href: "/settings", icon: Settings },
  ];

  const handleNavigate = (href: string) => {
    setLocation(href);
    setOpenMobile(false);
  };

  return (
    <Sidebar side="right" variant="sidebar" collapsible="icon" className="border-l border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-lg text-primary">رفيق المؤمن</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">المنصة الإسلامية الشاملة</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    onClick={() => handleNavigate(item.href)}
                    tooltip={item.label}
                    className={`transition-all duration-200 ${
                      isActive(item.href) 
                        ? "bg-primary/10 text-primary font-bold hover:bg-primary/15" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    {isActive(item.href) && (
                      <ChevronLeft className="h-4 w-4 mr-auto group-data-[collapsible=icon]:hidden" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4">أدوات ومصادر</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    onClick={() => handleNavigate(item.href)}
                    tooltip={item.label}
                    className={`transition-all duration-200 ${
                      isActive(item.href) 
                        ? "bg-primary/10 text-primary font-bold hover:bg-primary/15" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4">شخصي</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    onClick={() => handleNavigate(item.href)}
                    tooltip={item.label}
                    className={`transition-all duration-200 ${
                      isActive(item.href) 
                        ? "bg-primary/10 text-primary font-bold hover:bg-primary/15" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/admin")}
                    onClick={() => handleNavigate("/admin")}
                    tooltip="لوحة التحكم"
                    className={`transition-all duration-200 ${
                      isActive("/admin") 
                        ? "bg-primary/10 text-primary font-bold hover:bg-primary/15" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <Lock className={`h-5 w-5 ${isActive("/admin") ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="group-data-[collapsible=icon]:hidden">لوحة التحكم</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="hover:bg-muted transition-colors px-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary uppercase">
                    {(user.user_metadata?.full_name || user.email || "U").substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 text-right flex-1 group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-bold truncate">
                    {user.user_metadata?.full_name || "مستخدم"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
                <User className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56 bg-card border-border">
              <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer gap-2 justify-end">
                <span>الإعدادات</span>
                <Settings className="h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()} className="cursor-pointer gap-2 justify-end text-destructive focus:text-destructive">
                <span>تسجيل الخروج</span>
                <LogOut className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="default" 
            className="w-full group-data-[collapsible=icon]:p-0"
            onClick={() => setLocation("/")}
          >
            <User className="h-4 w-4 md:ml-2" />
            <span className="group-data-[collapsible=icon]:hidden">تسجيل الدخول</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
