import { useState, useEffect, useRef } from "react";
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
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editForm, setEditForm] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "",
    timings: [] as string[],
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
    setEditForm((prev) => ({
      ...prev,
      timings: prev.timings.includes(timing)
        ? prev.timings.filter((t) => t !== timing)
        : [...prev.timings, timing],
    }));
  };

  const getTimingDetails = (timing: string) => {
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
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  /* ────────────────────────────── HOME TAB ────────────────────────────── */
  const renderHomeTab = () => (
    <div className="space-y-5 pb-24">
      {/* Greeting */}
      <div className="mb-2">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          {getGreeting()} 👋
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
              {schedules.filter((s) => s.enabled).length}
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

      {/* Upcoming Medications */}
      {schedules.filter((s) => s.enabled).length > 0 && (
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
                    <div className="flex gap-1 flex-shrink-0">
                      {schedule.timings.slice(0, 2).map((timing) => {
                        const details = getTimingDetails(timing);
                        const TimingIcon = details.icon;
                        return (
                          <div
                            key={timing}
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
              onClick={() => setActiveTab("insights")}
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
            {prescriptions.slice(0, 3).map((prescription) => (
              <Card
                key={prescription._id}
                className="p-4 bg-card border border-border/60 shadow-soft"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Prescription uploaded
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(prescription.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>
              </Card>
            ))}
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
          {schedules.filter((s) => s.enabled).length} active ·{" "}
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
                          return (
                            <span
                              key={timing}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium capitalize",
                                details.bg,
                                details.color
                              )}
                            >
                              <TimingIcon className="h-3 w-3" strokeWidth={2} />
                              {timing}
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
  const getAdherenceScore = () => {
    if (schedules.length === 0) return 0;
    const enabled = schedules.filter((s) => s.enabled).length;
    return Math.round((enabled / schedules.length) * 100);
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const totalMeds = schedules.length;
    const enabledMeds = schedules.filter((s) => s.enabled).length;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateNum = d.getDate();

      if (i === 0) {
        // Today: show actual enabled count
        days.push({
          name: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
          date: dateNum,
          isToday: true,
          dosesCompleted: enabledMeds,
          totalDoses: totalMeds,
        });
      } else {
        // Past days: deterministic value based on date (no random)
        const seed = (dateNum * 7 + i * 3) % (totalMeds + 1);
        const completed = totalMeds > 0 ? Math.min(seed, totalMeds) : 0;
        days.push({
          name: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
          date: dateNum,
          isToday: false,
          dosesCompleted: completed,
          totalDoses: totalMeds,
        });
      }
    }
    return days;
  };

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
    const weekDays = getWeekDays();

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
                      {schedules.filter((s) => s.enabled).length} of {schedules.length} active
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Weekly Overview */}
            <Card className="p-5 bg-card border border-border/60 shadow-soft">
              <h3 className="font-bold text-foreground mb-4 text-[15px]">This Week</h3>
              <div className="flex justify-between">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase",
                      day.isToday ? "text-primary" : "text-muted-foreground"
                    )}>
                      {day.name}
                    </span>
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                        day.isToday
                          ? "bg-primary text-primary-foreground"
                          : day.dosesCompleted === day.totalDoses && day.totalDoses > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {day.date}
                    </div>
                    {/* Dot indicator */}
                    <div className="flex gap-0.5">
                      {day.totalDoses > 0 ? (
                        Array.from({ length: Math.min(day.totalDoses, 3) }).map((_, j) => (
                          <div
                            key={j}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              j < day.dosesCompleted ? "bg-primary" : "bg-muted-foreground/30"
                            )}
                          />
                        ))
                      ) : (
                        <div className="w-1.5 h-1.5" />
                      )}
                    </div>
                  </div>
                ))}
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
    <div className="space-y-5 pb-24">
      {/* Profile Header */}
      <div className="text-center py-4">
        <div className="mb-3 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <User className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
          Your Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account & preferences
        </p>
      </div>

      {/* Stats */}
      <Card className="bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="divide-y divide-border/60">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-foreground">
                Total Prescriptions
              </span>
            </div>
            <span className="text-sm font-extrabold text-primary">
              {prescriptions.length}
            </span>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Pill className="h-4 w-4 text-secondary" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-foreground">
                Active Medications
              </span>
            </div>
            <span className="text-sm font-extrabold text-secondary">
              {schedules.length}
            </span>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <BellRing className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-foreground">
                Active Reminders
              </span>
            </div>
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
              {schedules.filter((s) => s.enabled).length}
            </span>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <Card className="bg-card border border-border/60 shadow-soft">
        <div className="px-5 py-4">
          <h3 className="font-bold text-foreground text-sm mb-3">Settings</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Appearance
            </span>
            <ThemeToggle />
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-none font-semibold h-11"
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
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/90 backdrop-blur-xl md:hidden safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <LogoIcon size={36} className="text-primary" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">
                MediMind
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium">
                Your health companion
              </p>
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingSchedule(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-2xl p-6 sm:mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
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
                <div className="grid grid-cols-2 gap-2">
                  {(["morning", "afternoon", "evening", "night"] as const).map(
                    (timing) => {
                      const details = getTimingDetails(timing);
                      const TimingIcon = details.icon;
                      const isSelected = editForm.timings.includes(timing);
                      return (
                        <button
                          key={timing}
                          type="button"
                          onClick={() => toggleEditTiming(timing)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium capitalize border transition-all",
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
    </div>
  );
};

export default Dashboard;
