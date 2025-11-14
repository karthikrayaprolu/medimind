import { motion } from "framer-motion";
import { UploadCloud, Scan, FileText, BellRing, History, LogOut, Database, CircuitBoard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

const workflowSteps = [
  {
    icon: UploadCloud,
    title: "Intake & Verification",
    description: "JWT-authenticated uploads land in temporary storage with checksum validation and timestamping.",
  },
  {
    icon: Scan,
    title: "OCR Processing",
    description: "EasyOCR workers parse handwriting, normalize language, and surface extracted medication directives.",
  },
  {
    icon: FileText,
    title: "Structured Insight",
    description: "Language understanding services transform notes into validated medicine objects ready for scheduling.",
  },
  {
    icon: Database,
    title: "Persistent History",
    description: "MongoDB captures raw text, structured payloads, assets, and reminders for longitudinal review.",
  },
  {
    icon: BellRing,
    title: "Reminder Automation",
    description: "Dosage patterns convert into calendar-ready reminders delivered via email, push, or messaging.",
  },
];

const mockReminders = [
  { id: 1, label: "Amoxicillin 250 mg", schedule: "Today, 09:00" },
  { id: 2, label: "Vitamin D3 1000 IU", schedule: "Today, 21:00" },
  { id: 3, label: "Ibuprofen 400 mg", schedule: "Tomorrow, 09:00" },
];

const Dashboard = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
      logout();
      toast({ title: "Signed out", description: "You have exited the MediMind workspace." });
      navigate("/", { replace: true });
    } catch (error) {
      // Even if server logout fails, clear local session
      logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">MediMind Workspace</h1>
            <p className="text-sm text-muted-foreground">
              Monitor prescription uploads, track OCR progress, and orchestrate reminders from a single command center.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="inline-flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 lg:grid-cols-[2fr_1fr]"
        >
          <Card className="border-border/60 bg-card/95 p-6 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <CircuitBoard className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Current Pipeline Overview</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/80 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          <Card className="border-border/60 bg-card/95 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Reminder Queue</h2>
              </div>
              <span className="text-xs font-semibold uppercase text-muted-foreground">Next 24 Hours</span>
            </div>
            <div className="space-y-3">
              {mockReminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg border border-border/50 bg-background/80 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">{reminder.label}</p>
                  <p className="text-xs text-muted-foreground">{reminder.schedule}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card className="border-border/60 bg-card/95 p-6 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <Scan className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Latest OCR Activity</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {["Queued", "Processing", "Validated", "Scheduled"].map((status, index) => (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-xl border border-border/50 bg-background/80 p-4 text-center"
                >
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{status}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{index + 2}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>
      </main>
    </div>
  );
};

export default Dashboard;
