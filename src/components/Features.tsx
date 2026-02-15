import { UploadCloud, Scan, ListChecks, BellRing, Brain, ShieldCheck } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: UploadCloud,
    title: "Seamless Upload",
    description:
      "Snap or upload any prescription — handwritten or printed.",
  },
  {
    icon: Scan,
    title: "AI-Powered OCR",
    description:
      "Extracts medicine names, dosages, and instructions with precision.",
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description:
      "LLM transforms raw text into structured, validated schedules.",
  },
  {
    icon: BellRing,
    title: "Auto Reminders",
    description:
      "Never miss a dose with automated push notifications & alerts.",
  },
  {
    icon: ListChecks,
    title: "Full History",
    description:
      "Every prescription & schedule — searchable in your timeline.",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA Secure",
    description:
      "End-to-end encryption & compliant storage for your data.",
  },
];

const Features = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 260 + 12; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, features.length - 1));
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section id="features" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <ScrollReveal animation="fade-up" className="mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
              <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                Features
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              Everything You Need for{" "}
              <span className="text-primary">Medication Clarity</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              From upload to reminder — MediMind handles the entire prescription
              lifecycle so you never miss what matters.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Mobile: Horizontal Scroll ── */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex-shrink-0 w-[260px] snap-center"
                >
                  <div className="relative h-full rounded-2xl border border-border/60 bg-card p-5 shadow-soft overflow-hidden">
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-80" />

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3.5">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <h3 className="text-[15px] font-bold text-foreground mb-1.5 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active scroll indicator dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {features.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/25"
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop: Grid ── */}
        <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={feature.title}
                animation="fade-up"
                delay={index * 0.08}
                className="h-full"
              >
                <div className="relative p-6 h-full rounded-2xl bg-card border border-border/60 shadow-soft hover:shadow-md transition-all duration-300 group overflow-hidden">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-80 transition-opacity duration-300" />

                  <div className="mb-4 w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
