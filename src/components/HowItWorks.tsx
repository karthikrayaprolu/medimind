import {
  LogIn,
  UploadCloud,
  Scan,
  FileText,
  CalendarCheck,
  BellRing,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
  {
    icon: LogIn,
    title: "Sign In Securely",
    description:
      "Create an account or log in with encrypted, JWT-backed authentication tied to your verified identity.",
    number: "01",
  },
  {
    icon: UploadCloud,
    title: "Upload Prescription",
    description:
      "Snap a photo or select an image. Your prescription is securely uploaded and validated instantly.",
    number: "02",
  },
  {
    icon: Scan,
    title: "AI Extraction",
    description:
      "Our OCR engine processes handwritten or printed text, extracting medication names, dosages, and instructions.",
    number: "03",
  },
  {
    icon: FileText,
    title: "Smart Structuring",
    description:
      "AI transforms raw extracted text into validated, structured medication data you can review and trust.",
    number: "04",
  },
  {
    icon: CalendarCheck,
    title: "Schedule Created",
    description:
      "Medication schedules are automatically generated with the right dosage, frequency, and timing.",
    number: "05",
  },
  {
    icon: BellRing,
    title: "Get Reminders",
    description:
      "Receive timely push notifications and email alerts so you never miss a dose again.",
    number: "06",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up" className="mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
              <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                How It Works
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              From Upload to Reminder in{" "}
              <span className="text-primary">6 Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Follow your prescription's journey through our intelligent
              processing pipeline.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline Grid */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <ScrollReveal
                  key={step.number}
                  animation="fade-up"
                  delay={index * 0.08}
                >
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-soft group hover:shadow-card transition-shadow duration-300">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <span className="text-[10px] font-bold">{step.number}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                      <h3 className="font-bold text-foreground mb-1 text-[15px]">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;