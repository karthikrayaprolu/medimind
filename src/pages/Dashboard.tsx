import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, BellRing, LogOut, Pill, Clock, Trash2, Power, PowerOff, Loader2, FileUp, User, Activity, Scan, Database, CircuitBoard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { prescriptionApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

interface Schedule {
  _id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  timings: string[];
  enabled: boolean;
  created_at: string;
}

interface Prescription {
  _id: string;
  raw_text: string;
  structured_data: string;
  created_at: string;
}

const workflowSteps = [
  {
    icon: UploadCloud,
    title: "Intake & Verification",
    description: "Authenticated uploads land in temporary storage with validation and timestamping.",
  },
  {
    icon: Scan,
    title: "OCR Processing",
    description: "AI workers parse handwriting and extract medication details.",
  },
  {
    icon: FileText,
    title: "Structured Insight",
    description: "LLM services transform notes into validated medicine objects.",
  },
  {
    icon: Database,
    title: "Persistent History",
    description: "MongoDB stores prescriptions and reminders for review.",
  },
  {
    icon: BellRing,
    title: "Reminder Automation",
    description: "Schedules convert into reminders via email and push notifications.",
  },
];

const Dashboard = () => {
  const { logout, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("home");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [schedulesData, prescriptionsData] = await Promise.all([
        prescriptionApi.getUserSchedules(token!),
        prescriptionApi.getUserPrescriptions(token!),
      ]);
      setSchedules(schedulesData);
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
      logout();
      toast({ title: "Signed out", description: "See you next time!" });
      navigate("/", { replace: true });
    } catch (error) {
      logout();
      navigate("/", { replace: true });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    try {
      await prescriptionApi.uploadPrescription(file, token);
      toast({
        title: "✓ Prescription uploaded!",
        description: "Your prescription has been processed.",
        duration: 5000,
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleToggleSchedule = async (scheduleId: string, currentState: boolean) => {
    try {
      await prescriptionApi.toggleSchedule(scheduleId, !currentState);
      setSchedules(schedules.map(s => s._id === scheduleId ? { ...s, enabled: !currentState } : s));
      toast({
        title: currentState ? "Reminder paused" : "Reminder activated",
        description: `${currentState ? "Paused" : "Active"} for this medication`,
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await prescriptionApi.deleteSchedule(scheduleId);
      setSchedules(schedules.filter(s => s._id !== scheduleId));
      toast({
        title: "Reminder deleted",
        description: "Medication schedule removed",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const getTimingIcon = (timing: string) => {
    const colors: Record<string, string> = {
      morning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      afternoon: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      evening: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      night: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[timing.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  const renderHomeTab = () => (
    <div className="space-y-4 pb-24">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{prescriptions.length}</p>
              <p className="text-xs text-muted-foreground">Prescriptions</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Pill className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{schedules.length}</p>
              <p className="text-xs text-muted-foreground">Medications</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Upload Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Upload Prescription</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Scan or upload your prescription to get started
          </p>
          <Button 
            onClick={handleUploadClick} 
            disabled={isUploading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Choose File
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        {prescriptions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No activity yet. Upload your first prescription!
          </p>
        ) : (
          <div className="space-y-3">
            {prescriptions.slice(0, 3).map((prescription) => (
              <div key={prescription._id} className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Prescription uploaded</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(prescription.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Medication Reminders</h2>
          <p className="text-sm text-muted-foreground">
            {schedules.filter(s => s.enabled).length} active
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : schedules.length === 0 ? (
        <Card className="p-8 text-center bg-white dark:bg-slate-900">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No reminders yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload a prescription to create reminders
          </p>
          <Button onClick={handleUploadClick} variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Upload Prescription
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card
              key={schedule._id}
              className={cn(
                "p-4 transition-all bg-white dark:bg-slate-900",
                schedule.enabled 
                  ? "border-primary/30 dark:border-primary/30" 
                  : "border-gray-200 dark:border-gray-800 opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <div className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                      schedule.enabled ? "bg-primary/10" : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <Pill className={cn("h-4 w-4", schedule.enabled ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{schedule.medicine_name}</h3>
                  </div>
                  <div className="ml-10 space-y-1.5">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Dosage:</span> {schedule.dosage}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Frequency:</span> {schedule.frequency}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {schedule.timings.map((timing) => (
                        <span
                          key={timing}
                          className={cn("rounded-lg px-2 py-1 text-xs font-medium capitalize", getTimingIcon(timing))}
                        >
                          {timing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleSchedule(schedule._id, schedule.enabled)}
                    className="h-9 w-9 p-0"
                  >
                    {schedule.enabled ? (
                      <Power className="h-4 w-4 text-secondary" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSchedule(schedule._id)}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Prescription History</h2>
          <p className="text-sm text-muted-foreground">
            {prescriptions.length} total records
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : prescriptions.length === 0 ? (
        <Card className="p-8 text-center bg-white dark:bg-slate-900">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No history yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload your first prescription to get started
          </p>
          <Button onClick={handleUploadClick} variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Upload Prescription
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <Card key={prescription._id} className="p-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Prescription</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(prescription.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {prescription.structured_data && (
                    <div className="rounded-lg bg-muted/30 p-3 mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Extracted Data:</p>
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                        {JSON.stringify(JSON.parse(prescription.structured_data), null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {prescription.raw_text && (
                    <div className="rounded-lg bg-muted/30 p-3 mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Raw OCR Text:</p>
                      <p className="text-xs text-foreground whitespace-pre-wrap">
                        {prescription.raw_text.substring(0, 200)}
                        {prescription.raw_text.length > 200 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-4 pb-24">
      <div className="text-center py-6">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Your Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>

      <Card className="p-4 bg-white dark:bg-slate-900">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Total Prescriptions</span>
            </div>
            <span className="font-bold text-primary">{prescriptions.length}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Pill className="h-5 w-5 text-secondary" />
              <span className="font-medium">Active Medications</span>
            </div>
            <span className="font-bold text-secondary">{schedules.length}</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Active Reminders</span>
            </div>
            <span className="font-bold text-orange-500">{schedules.filter(s => s.enabled).length}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white dark:bg-slate-900">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2">
            <h3 className="font-semibold">Settings</h3>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </Card>

      <Button 
        onClick={handleLogout} 
        variant="outline" 
        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">MediMind</h1>
              <p className="text-xs text-muted-foreground">Your health companion</p>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Pill className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MediMind Workspace</h1>
                <p className="text-sm text-muted-foreground">Prescription management powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="md:hidden">
          {activeTab === "home" && renderHomeTab()}
          {activeTab === "schedules" && renderSchedulesTab()}
          {activeTab === "history" && renderHistoryTab()}
          {activeTab === "profile" && renderProfileTab()}
        </div>
        
        <div className="hidden md:block space-y-6 pb-6">
          {renderHomeTab()}
          {renderSchedulesTab()}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onUploadClick={handleUploadClick}
      />
    </div>
  );
};

export default Dashboard;
