import { Home, Camera, Clock, User, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUploadClick: () => void;
}

const BottomNav = ({ activeTab, onTabChange, onUploadClick }: BottomNavProps) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "schedules", icon: Clock, label: "Meds" },
    { id: "upload", icon: Camera, label: "Scan", isUpload: true },
    { id: "insights", icon: TrendingUp, label: "Insights" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="border-t border-border/40 bg-card/90 backdrop-blur-xl safe-area-inset-bottom">
        <div className="flex items-end justify-around px-2 pt-2 pb-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isUpload = item.isUpload;

            if (isUpload) {
              return (
                <button
                  key={item.id}
                  onClick={onUploadClick}
                  className="flex flex-col items-center -mt-5"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                      <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.2} />
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] font-semibold text-primary">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
                    isActive && "bg-primary/10"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5 transition-all")}
                    strokeWidth={isActive ? 2.3 : 1.8}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] transition-all",
                    isActive ? "font-semibold" : "font-medium"
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
