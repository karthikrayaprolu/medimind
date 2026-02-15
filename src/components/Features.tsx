import { UploadCloud, Scan, ListChecks, BellRing, Brain, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  {
    icon: UploadCloud,
    title: "Seamless Upload",
    description:
      "Snap or upload any prescription — handwritten or printed. Secure, authenticated uploads with real-time validation.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Scan,
    title: "AI-Powered OCR",
    description:
      "Advanced OCR extracts medicine names, dosages, and instructions with clinician-grade accuracy from any format.",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description:
      "LLM services transform raw text into structured, validated medicine schedules you can trust and act on.",
    color: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  {
    icon: BellRing,
    title: "Auto Reminders",
    description:
      "Never miss a dose. Automated push notifications and email alerts keep you on track, every time.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: ListChecks,
    title: "Full History",
    description:
      "Every prescription, medication, and schedule — searchable and accessible in your personal health timeline.",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA Secure",
    description:
      "End-to-end encryption, secure authentication, and compliant data storage protect your health information.",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up" className="mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
              <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                Features
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              Everything You Need for{" "}
              <span className="text-primary">Medication Clarity</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From upload to reminder — MediMind handles the entire prescription
              lifecycle so you never miss what matters.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={feature.title}
                animation="fade-up"
                delay={index * 0.08}
                className="h-full"
              >
                <Card className="p-6 h-full bg-card border border-border/60 shadow-soft hover:shadow-card transition-all duration-300 group">
                  <div
                    className={`mb-4 w-11 h-11 rounded-xl flex items-center justify-center ${feature.color} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
