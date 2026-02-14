import { Home, Upload, Clock, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUploadClick: () => void;
}

const BottomNav = ({ activeTab, onTabChange, onUploadClick }: BottomNavProps) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "schedules", icon: Clock, label: "Reminders" },
    { id: "upload", icon: Upload, label: "Upload", isUpload: true },
    { id: "history", icon: FileText, label: "History" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism background */}
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-around px-1 py-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isUpload = item.isUpload;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isUpload) {
                    onUploadClick();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center transition-all duration-300",
                  isActive && !isUpload && "text-primary",
                  !isActive && !isUpload && "text-gray-600 dark:text-gray-400 hover:text-primary",
                  isUpload ? "px-2 -mt-6" : "flex-1 gap-1 px-3 py-2 rounded-xl",
                  isActive && !isUpload && "bg-primary/10"
                )}
              >
                {/* Special styling for upload button - Centered and elevated */}
                {isUpload ? (
                  <div className="relative flex flex-col items-center">
                    <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-40"></div>
                    <div className="relative bg-gradient-to-br from-primary to-primary/90 text-white p-4 rounded-full shadow-2xl ring-4 ring-white dark:ring-slate-900">
                      <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <span className="mt-2 text-xs font-medium text-primary">Upload</span>
                  </div>
                ) : (
                  <>
                    <Icon 
                      className={cn(
                        "h-6 w-6 transition-all",
                        isActive && "scale-110"
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span 
                      className={cn(
                        "text-xs font-medium transition-all",
                        isActive && "font-semibold"
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
