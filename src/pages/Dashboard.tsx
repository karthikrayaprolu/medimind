import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  BellRing,
  LogOut,
  Pill,
  Clock,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  FileUp,
  User,
  Activity,
  Camera,
  Calendar,
  ChevronRight,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  TrendingUp,
  Droplets,
  Target,
  Zap,
  CheckCircle2,
  Pencil,
  X,
  Check,
  Bell,
  Settings,
  ChevronDown,
  History,
  Shield,
} from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { prescriptionApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import ProfileAvatar, { avatarIds } from "@/components/ProfileAvatar";

interface Schedule {
  _id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  timings: string[];
  custom_times?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
  };
  enabled: boolean;
  created_at: string;
}

interface Prescription {
  _id: string;
  raw_text: string;
  structured_data: string;
  created_at: string;
}

const Dashboard = () => {
  const { logout, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editForm, setEditForm] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "",
    timings: [] as string[],
    custom_times: {} as {
      morning?: string;
      afternoon?: string;
      evening?: string;
      night?: string;
    },
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // ── Profile State ──
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem("medimind-user-name") || ""; } catch { return ""; }
  });
  const [userAvatar, setUserAvatar] = useState(() => {
    try { return localStorage.getItem("medimind-user-avatar") || "m1"; } catch { return "m1"; }
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try { return localStorage.getItem("medimind-notifications") !== "false"; } catch { return true; }
  });
  const [reminderSound, setReminderSound] = useState(() => {
    try { return localStorage.getItem("medimind-reminder-sound") !== "false"; } catch { return true; }
  });

  // Scroll to top when changing tabs to prevent bottom nav from being scrolled out of view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Persist profile settings
  useEffect(() => {
    try {
      localStorage.setItem("medimind-user-name", userName);
      localStorage.setItem("medimind-user-avatar", userAvatar);
      localStorage.setItem("medimind-notifications", String(notificationsEnabled));
      localStorage.setItem("medimind-reminder-sound", String(reminderSound));
    } catch { }
  }, [userName, userAvatar, notificationsEnabled, reminderSound]);

  // Avatar options - memoized to prevent recalculation
  const avatarOptionsMen = useMemo(() => avatarIds.filter(id => id.startsWith("m")), []);
  const avatarOptionsWomen = useMemo(() => avatarIds.filter(id => id.startsWith("w")), []);

  // Load data on mount
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [schedulesData, prescriptionsData] = await Promise.all([
        prescriptionApi.getUserSchedules(token!),
        prescriptionApi.getUserPrescriptions(token!),
      ]);
      // Sort by created_at descending (latest first)
      setSchedules(schedulesData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setPrescriptions(prescriptionsData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    try {
      await prescriptionApi.uploadPrescription(file, token);
      toast({
        title: "Prescription uploaded!",
        description: "Your prescription has been processed successfully.",
        duration: 5000,
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again",
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
    setShowUploadOptions(true);
  };

  const handleCameraCapture = () => {
    setShowUploadOptions(false);
    cameraInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    setShowUploadOptions(false);
    fileInputRef.current?.click();
  };

  const handleToggleSchedule = async (
    scheduleId: string,
    currentState: boolean
  ) => {
    try {
      await prescriptionApi.toggleSchedule(scheduleId, !currentState);
      setSchedules(
        schedules.map((s) =>
          s._id === scheduleId ? { ...s, enabled: !currentState } : s
        )
      );
      toast({
        title: currentState ? "Reminder paused" : "Reminder activated",
        description: `${currentState ? "Paused" : "Active"} for this medication`,
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await prescriptionApi.deleteSchedule(scheduleId);
      setSchedules(schedules.filter((s) => s._id !== scheduleId));
      toast({
        title: "Reminder deleted",
        description: "Medication schedule removed",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditForm({
      medicine_name: schedule.medicine_name,
      dosage: schedule.dosage,
      frequency: schedule.frequency,
      timings: [...schedule.timings],
      custom_times: schedule.custom_times || {},
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSchedule) return;
    if (editForm.timings.length === 0) {
      toast({
        title: "Invalid timings",
        description: "Select at least one timing for the medication",
        variant: "destructive",
      });
      return;
    }
    setIsSavingEdit(true);
    try {
      const result = await prescriptionApi.updateSchedule(
        editingSchedule._id,
        editForm
      );
      setSchedules(
        schedules.map((s) =>
          s._id === editingSchedule._id
            ? { ...s, ...editForm }
            : s
        )
      );
      setEditingSchedule(null);
      toast({
        title: "Schedule updated",
        description: `${editForm.medicine_name} has been updated`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Failed to update schedule",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const toggleEditTiming = (timing: string) => {
    setEditForm((prev) => {
      const isRemoving = prev.timings.includes(timing);
      const newTimings = isRemoving
        ? prev.timings.filter((t) => t !== timing)
        : [...prev.timings, timing];
      
      // Initialize default time when adding a timing
      const defaultTimes: Record<string, string> = {
        morning: "08:00",
        afternoon: "13:00",
        evening: "18:00",
        night: "21:00",
      };
      
      const newCustomTimes = { ...prev.custom_times };
      if (!isRemoving && !newCustomTimes[timing as keyof typeof newCustomTimes]) {
        newCustomTimes[timing as keyof typeof newCustomTimes] = defaultTimes[timing] || "09:00";
      }
      
      return {
        ...prev,
        timings: newTimings,
        custom_times: newCustomTimes,
      };
    });
  };

  const updateCustomTime = (timing: string, time: string) => {
    setEditForm((prev) => ({
      ...prev,
      custom_times: {
        ...prev.custom_times,
        [timing]: time,
      },
    }));
  };

  const handleClearHistory = async () => {
    if (!token) return;
    
    setIsClearingHistory(true);
    try {
      await prescriptionApi.clearHistory(token);
      
      // Refresh data
      await loadData();
      
      setShowClearHistoryConfirm(false);
      toast({
        title: "History cleared",
        description: "All prescriptions and schedules have been removed.",
      });
    } catch (error) {
      toast({
        title: "Clear failed",
        description:
          error instanceof Error ? error.message : "Failed to clear history",
        variant: "destructive",
      });
    } finally {
      setIsClearingHistory(false);
    }
  };

  // Memoized filtered lists to prevent recalculation
  const activeSchedules = useMemo(() => 
    schedules.filter((s) => s.enabled), 
    [schedules]
  );

  const recentPrescriptions = useMemo(() => 
    prescriptions.slice(0, 3), 
    [prescriptions]
  );

  const getTimingDetails = useCallback((timing: string) => {
    const map: Record<
      string,
      { icon: typeof Sun; color: string; bg: string }
    > = {
      morning: {
        icon: Sunrise,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/10",
      },
      afternoon: {
        icon: Sun,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-500/10",
      },
      evening: {
        icon: Sunset,
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-500/10",
      },
      night: {
        icon: Moon,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
      },
    };
    return (
      map[timing.toLowerCase()] || {
        icon: Clock,
        color: "text-muted-foreground",
        bg: "bg-muted",
      }
    );
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []); // Empty deps - will be constant for the session

  /* ────────────────────────────── HOME TAB ────────────────────────────── */
  const renderHomeTab = () => (
    <div className="space-y-5 pb-28">
      {/* Greeting */}
      <div className="mb-2">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          {greeting}{userName ? `, ${userName.includes(" ") ? userName.split(" ")[0] : userName}` : ""} 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's your health overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-card border border-border/60 shadow-soft">
          <div className="text-center">
            <div className="mx-auto mb-2 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
            </div>
            <p className="text-xl font-extrabold text-foreground">
              {prescriptions.length}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Prescriptions
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/60 shadow-soft">
          <div className="text-center">
            <div className="mx-auto mb-2 w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Pill className="h-4.5 w-4.5 text-secondary" strokeWidth={2} />
            </div>
            <p className="text-xl font-extrabold text-foreground">
              {schedules.length}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Medications
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border/60 shadow-soft">
          <div className="text-center">
            <div className="mx-auto mb-2 w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <BellRing className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
            </div>
            <p className="text-xl font-extrabold text-foreground">
              {activeSchedules.length}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              Active
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Upload */}
      <Card className="p-5 bg-primary/5 border border-primary/10 shadow-none">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Camera className="h-7 w-7 text-primary" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-[15px] mb-0.5">
              Upload Prescription
            </h3>
            <p className="text-xs text-muted-foreground">
              Snap or upload to extract medication details
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-none font-semibold px-4"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <FileUp className="h-4 w-4 mr-1.5" />
                Upload
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Active Medications */}
      {activeSchedules.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground text-[15px]">
              Active Medications
            </h3>
            <button
              onClick={() => setActiveTab("schedules")}
              className="text-xs font-semibold text-primary flex items-center gap-0.5"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {schedules
              .filter((s) => s.enabled)
              .slice(0, 3)
              .map((schedule) => (
                <Card
                  key={schedule._id}
                  className="p-4 bg-card border border-border/60 shadow-soft"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Pill
                        className="h-5 w-5 text-primary"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {schedule.medicine_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.dosage} · {schedule.frequency}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 flex-wrap max-w-[90px] justify-end">
                      {schedule.timings.map((timing) => {
                        const details = getTimingDetails(timing);
                        const TimingIcon = details.icon;
                        const customTime = schedule.custom_times?.[timing as keyof typeof schedule.custom_times];
                        return (
                          <div
                            key={timing}
                            className="flex flex-col items-center gap-0.5"
                            title={customTime || timing}
                          >
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center",
                                details.bg
                              )}
                            >
                              <TimingIcon
                                className={cn("h-3.5 w-3.5", details.color)}
                                strokeWidth={2}
                              />
                            </div>
                            {customTime && (
                              <span className="text-[9px] font-semibold text-muted-foreground">
                                {customTime}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-[15px]">
            Recent Activity
          </h3>
          {prescriptions.length > 3 && (
            <button
              onClick={() => setActiveTab("history")}
              className="text-xs font-semibold text-primary flex items-center gap-0.5"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {prescriptions.length === 0 ? (
          <Card className="p-6 text-center bg-card border border-border/60 shadow-soft">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No activity yet. Upload your first prescription!
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {prescriptions.slice(0, 3).map((prescription) => {
              // Parse medicines from prescription
              let medicines: any[] = [];
              try {
                medicines = JSON.parse(prescription.structured_data);
              } catch (e) {
                medicines = [];
              }

              return (
                <Card
                  key={prescription._id}
                  className="p-4 bg-card border border-border/60 shadow-soft"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground">
                          Prescription uploaded
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(prescription.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      
                      {/* Show medicines */}
                      {medicines.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {medicines.slice(0, 3).map((med: any, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-lg"
                            >
                              <Pill className="h-3 w-3" strokeWidth={2} />
                              {med.medicine_name || "Unknown"}
                            </span>
                          ))}
                          {medicines.length > 3 && (
                            <span className="text-xs text-muted-foreground px-1 py-0.5">
                              +{medicines.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          No medicines detected
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* ──────────────────────────── SCHEDULES TAB ──────────────────────────── */
  const renderSchedulesTab = () => (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Medication Reminders
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {activeSchedules.length} active ·{" "}
          {schedules.length} total
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : schedules.length === 0 ? (
        <Card className="p-8 text-center bg-card border border-border/60 shadow-soft">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mb-1.5 font-bold text-foreground">No reminders yet</h3>
          <p className="mb-5 text-sm text-muted-foreground">
            Upload a prescription to create medication reminders
          </p>
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="rounded-xl border-border shadow-none"
          >
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
                "overflow-hidden bg-card border shadow-soft transition-all",
                schedule.enabled
                  ? "border-primary/20"
                  : "border-border/60 opacity-50"
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                        schedule.enabled ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      <Pill
                        className={cn(
                          "h-5 w-5",
                          schedule.enabled
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-[15px] truncate">
                        {schedule.medicine_name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {schedule.dosage} · {schedule.frequency}
                      </p>

                      {/* Timing pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {schedule.timings.map((timing) => {
                          const details = getTimingDetails(timing);
                          const TimingIcon = details.icon;
                          const customTime = schedule.custom_times?.[timing as keyof typeof schedule.custom_times];
                          return (
                            <span
                              key={timing}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium",
                                details.bg,
                                details.color
                              )}
                            >
                              <TimingIcon className="h-3 w-3" strokeWidth={2} />
                              {customTime ? (
                                <span className="font-semibold">{customTime}</span>
                              ) : (
                                <span className="capitalize">{timing}</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleToggleSchedule(schedule._id, schedule.enabled)
                      }
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                        schedule.enabled
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {schedule.enabled ? (
                        <Power className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <PowerOff className="h-4 w-4" strokeWidth={2} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditSchedule(schedule)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule._id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  /* ──────────────────────────── INSIGHTS TAB ──────────────────────────── */
  const getAdherenceScore = useCallback(() => {
    if (schedules.length === 0) return 0;
    const enabled = activeSchedules.length;
    return Math.round((enabled / schedules.length) * 100);
  }, [schedules.length, activeSchedules.length]);

  const getNextTiming = (timings: string[]) => {
    const hour = new Date().getHours();
    const order = ["morning", "afternoon", "evening", "night"];
    const periodMap: Record<string, number> = { morning: 8, afternoon: 13, evening: 18, night: 21 };

    // Find the next timing that hasn't passed yet today
    for (const t of order) {
      if (timings.includes(t) && hour < periodMap[t]) {
        return t;
      }
    }
    // All timings passed today, show first timing (tomorrow)
    for (const t of order) {
      if (timings.includes(t)) return t;
    }
    return timings[0] || "—";
  };

  const healthTips = [
    { icon: Droplets, title: "Stay Hydrated", text: "Drink water with your medications for better absorption.", color: "bg-blue-50 dark:bg-blue-500/10", iconColor: "text-blue-500" },
    { icon: Target, title: "Consistency Matters", text: "Take medications at the same time daily for best results.", color: "bg-primary/8", iconColor: "text-primary" },
    { icon: Zap, title: "Don't Skip Doses", text: "Missing doses can reduce effectiveness by up to 50%.", color: "bg-secondary/8", iconColor: "text-secondary" },
  ];

  const renderInsightsTab = () => {
    const adherence = getAdherenceScore();

    return (
      <div className="space-y-5 pb-24">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Health Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your medication overview & tips
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : schedules.length === 0 ? (
          <Card className="p-8 text-center bg-card border border-border/60 shadow-soft">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <TrendingUp className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-1.5 font-bold text-foreground">No insights yet</h3>
            <p className="mb-5 text-sm text-muted-foreground">
              Upload a prescription to see your health insights
            </p>
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="rounded-xl border-border shadow-none"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Upload Prescription
            </Button>
          </Card>
        ) : (
          <>
            {/* Adherence Score Card */}
            <Card className="p-5 bg-card border border-border/60 shadow-soft">
              <div className="flex items-center gap-5">
                {/* Score Ring */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" className="text-muted/50" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="currentColor"
                      className="text-primary"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(adherence / 100) * 213.6} 213.6`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-extrabold text-foreground">{adherence}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-0.5">Adherence Score</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {adherence >= 80
                      ? "Great job! You're staying on track with your medications."
                      : adherence >= 50
                        ? "Good progress. Try to enable all your medication reminders."
                        : "Let's improve! Enable your medication schedules to stay healthy."}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-primary">
                      {activeSchedules.length} of {schedules.length} active
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Active Medications Detail */}
            <div>
              <h3 className="font-bold text-foreground mb-3 text-[15px]">Your Medications</h3>
              <div className="space-y-2.5">
                {schedules.map((schedule) => (
                  <Card
                    key={schedule._id}
                    className="p-4 bg-card border border-border/60 shadow-soft"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        schedule.enabled ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Pill className={cn(
                          "h-5 w-5",
                          schedule.enabled ? "text-primary" : "text-muted-foreground"
                        )} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {schedule.medicine_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {schedule.dosage} · {schedule.frequency}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-primary capitalize">
                          {getNextTiming(schedule.timings)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {schedule.enabled ? "Active" : "Paused"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Health Tips */}
            <div>
              <h3 className="font-bold text-foreground mb-3 text-[15px]">Health Tips</h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {healthTips.map((tip, i) => {
                  const TipIcon = tip.icon;
                  return (
                    <Card
                      key={i}
                      className="flex-shrink-0 w-[200px] p-4 bg-card border border-border/60 shadow-soft"
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                        tip.color
                      )}>
                        <TipIcon className={cn("h-4.5 w-4.5", tip.iconColor)} strokeWidth={2} />
                      </div>
                      <h4 className="font-bold text-foreground text-sm mb-1">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /* ──────────────────────────── PROFILE TAB ──────────────────────────── */
  const renderProfileTab = () => (
    <div className="space-y-5 pb-28">
      {/* ── Profile Header with Avatar & Name ── */}
      <div className="text-center pt-2 pb-1">
        {/* Avatar */}
        <button
          onClick={() => setShowAvatarPicker(true)}
          className="relative inline-block mb-3 group"
          aria-label="Change avatar"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/20 overflow-hidden transition-transform group-active:scale-95">
            <ProfileAvatar avatarId={userAvatar} size="lg" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md border-2 border-card">
            <Pencil className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </button>

        {/* Editable Name */}
        {isEditingName ? (
          <div className="flex items-center justify-center gap-2 mt-1">
            <input
              type="text"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              className="w-44 text-center text-lg font-extrabold text-foreground bg-transparent border-b-2 border-primary focus:outline-none py-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setUserName(editNameValue.trim());
                  setIsEditingName(false);
                  toast({ title: "Name updated", description: "Your display name has been saved." });
                } else if (e.key === "Escape") {
                  setIsEditingName(false);
                }
              }}
            />
            <button
              onClick={() => {
                setUserName(editNameValue.trim());
                setIsEditingName(false);
                toast({ title: "Name updated", description: "Your display name has been saved." });
              }}
              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setEditNameValue(userName);
              setIsEditingName(true);
            }}
            className="group flex items-center justify-center gap-1.5 mx-auto"
          >
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {userName || "Tap to add name"}
            </h2>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
          </button>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account & preferences
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="p-3.5 bg-card border border-border/60 shadow-soft text-center">
          <p className="text-xl font-extrabold text-primary">{prescriptions.length}</p>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Prescriptions</p>
        </Card>
        <Card className="p-3.5 bg-card border border-border/60 shadow-soft text-center">
          <p className="text-xl font-extrabold text-primary">{schedules.length}</p>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Medications</p>
        </Card>
        <Card className="p-3.5 bg-card border border-border/60 shadow-soft text-center">
          <p className="text-xl font-extrabold text-primary">{schedules.filter(s => s.enabled).length}</p>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Active</p>
        </Card>
      </div>

      {/* ── Notifications ── */}
      <Card className="bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="px-5 pt-4 pb-1.5">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" strokeWidth={2} />
            Notifications
          </h3>
        </div>
        <div className="divide-y divide-border/40">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <span className="text-sm font-medium text-foreground block">Push Notifications</span>
              <span className="text-[11px] text-muted-foreground">Get reminded for your medications</span>
            </div>
            <button
              onClick={() => {
                setNotificationsEnabled(!notificationsEnabled);
                toast({
                  title: notificationsEnabled ? "Notifications disabled" : "Notifications enabled",
                  description: notificationsEnabled
                    ? "You won't receive medication reminders"
                    : "You'll receive timely medication reminders",
                });
              }}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-300",
                notificationsEnabled ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300",
                  notificationsEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <span className="text-sm font-medium text-foreground block">Reminder Sound</span>
              <span className="text-[11px] text-muted-foreground">Play a sound for medication alerts</span>
            </div>
            <button
              onClick={() => {
                setReminderSound(!reminderSound);
                toast({
                  title: reminderSound ? "Sound disabled" : "Sound enabled",
                  description: reminderSound ? "Reminders will be silent" : "Reminders will play a sound",
                });
              }}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-300",
                reminderSound ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300",
                  reminderSound ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* ── Appearance ── */}
      <Card className="bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Sun className="h-4 w-4 text-muted-foreground dark:hidden" strokeWidth={2} />
              <Moon className="h-4 w-4 text-muted-foreground hidden dark:block" strokeWidth={2} />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground block">Appearance</span>
              <span className="text-[11px] text-muted-foreground">Switch between light & dark</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      {/* ── Privacy & Data ── */}
      <Card className="bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="px-5 pt-4 pb-1.5">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" strokeWidth={2} />
            Privacy & Security
          </h3>
        </div>
        <div className="px-5 py-3.5">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Your data is protected</p>
              <p className="text-xs text-muted-foreground mt-1">
                All data is encrypted in transit and at rest. Your {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} and {schedules.length} medication schedule{schedules.length !== 1 ? 's' : ''} are stored securely.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Sign Out ── */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-none font-semibold h-12"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>

      {/* ── Avatar Picker Modal ── */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowAvatarPicker(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-card border border-border/80 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            {/* Handle bar for visual cue */}
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                Choose Avatar
              </h3>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Men */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Men</p>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {avatarOptionsMen.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setUserAvatar(id);
                    setShowAvatarPicker(false);
                    toast({ title: "Avatar updated" });
                  }}
                  className={cn(
                    "w-full aspect-square rounded-2xl flex items-center justify-center border-2 transition-all active:scale-95 overflow-hidden p-1",
                    userAvatar === id
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border/60 bg-card hover:border-primary/30"
                  )}
                >
                  <ProfileAvatar avatarId={id} size="md" />
                </button>
              ))}
            </div>

            {/* Women */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Women</p>
            <div className="grid grid-cols-4 gap-3 pb-2">
              {avatarOptionsWomen.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setUserAvatar(id);
                    setShowAvatarPicker(false);
                    toast({ title: "Avatar updated" });
                  }}
                  className={cn(
                    "w-full aspect-square rounded-2xl flex items-center justify-center border-2 transition-all active:scale-95 overflow-hidden p-1",
                    userAvatar === id
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border/60 bg-card hover:border-primary/30"
                  )}
                >
                  <ProfileAvatar avatarId={id} size="md" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ──────────────────────────── HISTORY TAB ──────────────────────────── */
  const renderHistoryTab = () => (
    <div className="space-y-5 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Prescription History
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        {prescriptions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearHistoryConfirm(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl shadow-none"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : prescriptions.length === 0 ? (
        <Card className="p-8 text-center bg-card border border-border/60 shadow-soft">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <History className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mb-1.5 font-bold text-foreground">No history yet</h3>
          <p className="mb-5 text-sm text-muted-foreground">
            Upload your first prescription to get started
          </p>
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="rounded-xl border-border shadow-none"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Upload Prescription
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Monthly groupings */}
          {(() => {
            const grouped: Record<string, Prescription[]> = {};
            prescriptions.forEach((p) => {
              const monthYear = new Date(p.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });
              if (!grouped[monthYear]) grouped[monthYear] = [];
              grouped[monthYear].push(p);
            });

            // Sort month groups by the first item's date (descending)
            const sortedGroups = Object.entries(grouped).sort(([, itemsA], [, itemsB]) => 
              new Date(itemsB[0].created_at).getTime() - new Date(itemsA[0].created_at).getTime()
            );

            return sortedGroups.map(([month, items]) => (
              <div key={month}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {month}
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((prescription) => {
                    // Parse medicines from prescription
                    let medicines: any[] = [];
                    try {
                      medicines = JSON.parse(prescription.structured_data);
                    } catch (e) {
                      medicines = [];
                    }

                    return (
                      <Card
                        key={prescription._id}
                        className="p-4 bg-card border border-border/60 shadow-soft hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-foreground">
                                {new Date(prescription.created_at).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-lg">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Processed
                              </div>
                            </div>
                            
                            {/* Medicine preview */}
                            {medicines.length > 0 ? (
                              <div className="mt-2 space-y-1.5">
                                {medicines.slice(0, 2).map((med: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <Pill className="h-3 w-3 text-primary flex-shrink-0" strokeWidth={2} />
                                    <span className="font-medium text-foreground truncate">
                                      {med.medicine_name || "Unknown"}
                                    </span>
                                    <span className="text-muted-foreground truncate">
                                      {med.dosage || "N/A"}
                                    </span>
                                  </div>
                                ))}
                                {medicines.length > 2 && (
                                  <p className="text-[10px] text-muted-foreground pl-5">
                                    +{medicines.length - 2} more medication{medicines.length - 2 !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">
                                No medicines extracted
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Gallery file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      {/* Camera capture input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Upload Options Modal */}
      {showUploadOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowUploadOptions(false)}
          />
          <div className="relative w-full max-w-xs bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-base font-extrabold text-foreground tracking-tight text-center mb-1">
              Scan Prescription
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-5">
              Choose how to add your prescription
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Camera Option */}
              <button
                onClick={handleCameraCapture}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <Camera className="h-6 w-6 text-primary" strokeWidth={1.8} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Camera</p>
                  <p className="text-[10px] text-muted-foreground">Take a photo</p>
                </div>
              </button>

              {/* Gallery Option */}
              <button
                onClick={handleGalleryUpload}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <FileUp className="h-6 w-6 text-primary" strokeWidth={1.8} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Gallery</p>
                  <p className="text-[10px] text-muted-foreground">Upload image</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowUploadOptions(false)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/85 backdrop-blur-2xl md:hidden safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Logo & App Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab("home")}
          >
            <LogoIcon size={34} className="text-primary" />
            <div>
              <h1 className="text-[15px] font-extrabold tracking-tight text-foreground leading-tight">
                MediMind
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                Health companion
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:scale-95",
                  showNotifications
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label="Notifications"
              >
                <Bell className="h-[20px] w-[20px]" strokeWidth={1.8} />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-2xl shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-3.5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">Reminders</p>
                        <p className="text-[10px] text-muted-foreground">
                          {schedules.filter(s => s.enabled).length} active of {schedules.length} total
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                        {(() => {
                          const h = new Date().getHours();
                          if (h < 12) return "🌅 Morning";
                          if (h < 17) return "☀️ Afternoon";
                          if (h < 21) return "🌇 Evening";
                          return "🌙 Night";
                        })()}
                      </div>
                    </div>

                    <div className="h-px bg-border/60 mx-2" />

                    {/* Reminder List */}
                    <div className="max-h-64 overflow-y-auto">
                      {schedules.length === 0 ? (
                        <div className="px-3.5 py-6 text-center">
                          <BellRing className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs font-medium text-muted-foreground">No reminders yet</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">Upload a prescription to get started</p>
                        </div>
                      ) : (
                        schedules.map((schedule) => {
                          const currentPeriod = (() => {
                            const h = new Date().getHours();
                            if (h < 12) return "morning";
                            if (h < 17) return "afternoon";
                            if (h < 21) return "evening";
                            return "night";
                          })();
                          const isDueNow = schedule.enabled && schedule.timings.map(t => t.toLowerCase()).includes(currentPeriod);

                          return (
                            <div
                              key={schedule._id}
                              className={cn(
                                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl mx-1 my-0.5 transition-colors",
                                isDueNow ? "bg-primary/8" : "hover:bg-muted/50"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                schedule.enabled ? "bg-primary/10" : "bg-muted"
                              )}>
                                <Pill className={cn(
                                  "h-3.5 w-3.5",
                                  schedule.enabled ? "text-primary" : "text-muted-foreground"
                                )} strokeWidth={2} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-xs font-semibold truncate",
                                  schedule.enabled ? "text-foreground" : "text-muted-foreground line-through"
                                )}>
                                  {schedule.medicine_name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {schedule.dosage} · {schedule.timings.map(t =>
                                    t.charAt(0).toUpperCase() + t.slice(1)
                                  ).join(", ")}
                                </p>
                              </div>
                              {isDueNow && (
                                <span className="flex-shrink-0 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                  NOW
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {schedules.length > 0 && (
                      <>
                        <div className="h-px bg-border/60 mx-2" />
                        <button
                          onClick={() => {
                            setActiveTab("schedules");
                            setShowNotifications(false);
                          }}
                          className="flex items-center justify-center w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-primary hover:bg-muted transition-colors"
                        >
                          View All Medications
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95",
                  activeTab === "profile" || showProfileMenu
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label="Profile menu"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden">
                  <ProfileAvatar avatarId={userAvatar} size="sm" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-2xl shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                      My Profile
                    </button>
                    <div className="h-px bg-border/60 mx-3 my-1" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={2} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/90 backdrop-blur-xl hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <LogoIcon size={40} className="text-primary" />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  MediMind
                </h1>
                <p className="text-xs text-muted-foreground">
                  AI-powered prescription management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <Button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-none font-semibold"
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
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-xl border-border shadow-none"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-5 max-w-2xl">
        <div className="md:hidden">
          {activeTab === "home" && renderHomeTab()}
          {activeTab === "schedules" && renderSchedulesTab()}
          {activeTab === "insights" && renderInsightsTab()}
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "history" && renderHistoryTab()}
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

      {/* ─── Edit Schedule Modal ─── */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setEditingSchedule(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white dark:bg-card border border-border/80 rounded-t-3xl sm:rounded-2xl p-6 sm:mx-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                Edit Medication
              </h3>
              <button
                onClick={() => setEditingSchedule(null)}
                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Medicine Name
                </label>
                <input
                  type="text"
                  value={editForm.medicine_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, medicine_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Medicine name"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Dosage
                </label>
                <input
                  type="text"
                  value={editForm.dosage}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dosage: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="e.g. 500mg, 5ml, 2 tablets"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Frequency
                </label>
                <select
                  value={editForm.frequency}
                  onChange={(e) =>
                    setEditForm({ ...editForm, frequency: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none"
                >
                  <option value="once a day">Once a day</option>
                  <option value="twice a day">Twice a day</option>
                  <option value="thrice a day">Thrice a day</option>
                  <option value="four times a day">Four times a day</option>
                </select>
              </div>

              {/* Timings */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Timings
                </label>
                <div className="space-y-3">
                  {(["morning", "afternoon", "evening", "night"] as const).map(
                    (timing) => {
                      const details = getTimingDetails(timing);
                      const TimingIcon = details.icon;
                      const isSelected = editForm.timings.includes(timing);
                      return (
                        <div key={timing} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleEditTiming(timing)}
                            className={cn(
                              "w-full flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium capitalize border transition-all",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <TimingIcon className="h-4 w-4" strokeWidth={2} />
                            {timing}
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 ml-auto" strokeWidth={2.5} />
                            )}
                          </button>
                          
                          {/* Time picker when selected */}
                          {isSelected && (
                            <div className="pl-4 flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                              <input
                                type="time"
                                value={editForm.custom_times[timing] || "09:00"}
                                onChange={(e) => updateCustomTime(timing, e.target.value)}
                                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                              />
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingSchedule(null)}
                className="flex-1 rounded-xl border-border shadow-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editForm.medicine_name.trim()}
                className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-none"
              >
                {isSavingEdit ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Clear History Confirmation Modal ─── */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowClearHistoryConfirm(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-white dark:bg-card border border-border/80 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" strokeWidth={2} />
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-extrabold text-foreground tracking-tight text-center mb-2">
              Clear All History?
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              This will permanently delete all {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} and {schedules.length} medication schedule{schedules.length !== 1 ? 's' : ''}. This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClearHistoryConfirm(false)}
                disabled={isClearingHistory}
                className="flex-1 rounded-xl border-border shadow-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClearHistory}
                disabled={isClearingHistory}
                className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none"
              >
                {isClearingHistory ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
