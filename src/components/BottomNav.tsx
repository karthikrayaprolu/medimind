import { Home, Camera, Clock, TrendingUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUploadClick: () => void;
}

const BottomNav = ({ activeTab, onTabChange, onUploadClick }: BottomNavProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "schedules", icon: Clock, label: "Meds" },
    { id: "upload", icon: Camera, label: "Scan", isUpload: true },
    { id: "insights", icon: TrendingUp, label: "Insights" },
    { id: "history", icon: FileText, label: "History" },
  ];

  // Calculate indicator position
  useEffect(() => {
    if (!navRef.current) return;
    
    // Filter out upload items first to match DOM structure
    const nonUploadItems = navItems.filter((item) => !item.isUpload);
    const activeIndex = nonUploadItems.findIndex((item) => item.id === activeTab);
    
    if (activeIndex === -1) return;

    const buttons = navRef.current.querySelectorAll("[data-nav-item]");
    const activeButton = buttons[activeIndex] as HTMLElement;
    if (activeButton) {
      const containerRect = navRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left + buttonRect.width / 2 - 16,
        width: 32,
      });
    }
  }, [activeTab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3 rounded-2xl border border-border/60 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-[0_-2px_12px_-2px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3)] safe-area-inset-bottom">
        <div ref={navRef} className="relative flex items-center justify-around px-1.5 pt-2 pb-2">
          {/* Animated indicator pill */}
          <div
            className="absolute top-1 h-1 rounded-full bg-primary transition-all duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: activeTab === "upload" ? 0 : 1,
            }}
          />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isUpload = item.isUpload;

            if (isUpload) {
              return (
                <button
                  key={item.id}
                  onClick={onUploadClick}
                  className="flex flex-col items-center -mt-6 group"
                  aria-label="Scan prescription"
                >
                  <div className="relative">
                    {/* Glow ring */}
                    <div className="absolute -inset-1.5 rounded-2xl bg-primary/30 blur-lg opacity-40 group-active:opacity-70 transition-opacity" />
                    {/* Button */}
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-lg shadow-primary/20 group-active:scale-95 transition-transform">
                      <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.2} />
                    </div>
                  </div>
                  <span className="mt-1.5 text-[10px] font-bold text-primary tracking-wide">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                data-nav-item
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 min-w-[52px] group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                    isActive && "bg-primary/10 scale-110"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[20px] w-[20px] transition-all duration-300",
                      isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
                    )}
                    strokeWidth={isActive ? 2.4 : 1.7}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] transition-all duration-300 leading-none",
                    isActive ? "font-bold" : "font-medium opacity-70"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
