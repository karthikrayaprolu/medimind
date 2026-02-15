import {
  LogIn,
  UploadCloud,
  Scan,
  FileText,
  CalendarCheck,
  BellRing,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: LogIn,
    title: "Sign In Securely",
    description:
      "Create an account with encrypted, JWT-backed authentication.",
    number: "01",
  },
  {
    icon: UploadCloud,
    title: "Upload Prescription",
    description:
      "Snap a photo or select an image — securely uploaded instantly.",
    number: "02",
  },
  {
    icon: Scan,
    title: "AI Extraction",
    description:
      "OCR processes handwritten or printed text with high accuracy.",
    number: "03",
  },
  {
    icon: FileText,
    title: "Smart Structuring",
    description:
      "AI transforms raw text into validated medication data.",
    number: "04",
  },
  {
    icon: CalendarCheck,
    title: "Schedule Created",
    description:
      "Schedules auto-generated with dosage, frequency & timing.",
    number: "05",
  },
  {
    icon: BellRing,
    title: "Get Reminders",
    description:
      "Timely notifications so you never miss a dose again.",
    number: "06",
  },
];

const HowItWorks = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <section id="how-it-works" className="py-20 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up" className="mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
              <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                How It Works
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              From Upload to Reminder in{" "}
              <span className="text-primary">6 Steps</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Follow your prescription's journey through our intelligent
              processing pipeline.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Mobile: Compact Timeline ── */}
        <div className="md:hidden max-w-sm mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-primary/40 to-primary/10 rounded-full" />

            <div className="space-y-0">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isExpanded = expandedStep === index;
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.number} className="relative">
                    <button
                      onClick={() =>
                        setExpandedStep(isExpanded ? null : index)
                      }
                      className="w-full flex items-center gap-3.5 py-3 pl-0 pr-2 text-left group"
                    >
                      {/* Timeline node */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                            isExpanded
                              ? "bg-primary shadow-lg shadow-primary/25 scale-110"
                              : "bg-card border border-border/60 shadow-soft group-active:scale-95"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-[18px] h-[18px] transition-colors duration-300",
                              isExpanded ? "text-primary-foreground" : "text-primary"
                            )}
                            strokeWidth={2}
                          />
                        </div>
                      </div>

                      {/* Title row */}
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold text-primary/60 tabular-nums">
                            {step.number}
                          </span>
                          <h3
                            className={cn(
                              "text-sm font-bold transition-colors duration-200",
                              isExpanded ? "text-primary" : "text-foreground"
                            )}
                          >
                            {step.title}
                          </h3>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-300",
                            isExpanded && "rotate-180 text-primary"
                          )}
                          strokeWidth={2}
                        />
                      </div>
                    </button>

                    {/* Expandable description */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-out ml-[52px] pr-2",
                        isExpanded ? "max-h-24 opacity-100 pb-2" : "max-h-0 opacity-0"
                      )}
                    >
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Desktop: Cards Grid ── */}
        <div className="hidden md:block max-w-3xl mx-auto">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <ScrollReveal
                  key={step.number}
                  animation="fade-up"
                  delay={index * 0.08}
                >
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-soft group hover:shadow-md transition-shadow duration-300">
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