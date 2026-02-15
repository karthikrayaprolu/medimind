import { Shield, Lock, Award, CheckCircle2 } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import ScrollReveal from "@/components/ScrollReveal";

const trustIndicators = [
  { icon: Shield, label: "HIPAA Compliant", description: "Full regulatory compliance" },
  { icon: Lock, label: "End-to-End Encrypted", description: "256-bit encryption" },
  { icon: Award, label: "FDA Registered", description: "Medical device standards" },
  { icon: CheckCircle2, label: "ISO 27001", description: "Information security certified" },
];

const stats = [
  { value: "50K+", label: "Prescriptions Processed" },
  { value: "99.2%", label: "OCR Accuracy" },
  { value: "10K+", label: "Active Users" },
  { value: "4.9★", label: "App Store Rating" },
];

const About = () => {
  return (
    <section id="about" className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="fade-up" className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
              <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                About
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              Trusted by Patients,{" "}
              <span className="text-primary">Built by Experts</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              MediMind automates the entire medication journey — from secure
              upload and OCR extraction to structured scheduling and personalized
              reminders.
            </p>
          </ScrollReveal>

          {/* Stats Grid */}
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-5 rounded-2xl bg-card border border-border/60 shadow-soft"
                >
                  <p className="text-2xl md:text-3xl font-extrabold text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Mission Statement */}
          <ScrollReveal animation="fade-up" delay={0.2}>
            <div className="p-6 md:p-8 rounded-2xl bg-primary/5 border border-primary/10 mb-12">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <LogoIcon size={40} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    Behind the scenes, orchestrated FastAPI services, validated
                    data models, and resilient storage pipelines safeguard
                    protected health information while delivering actionable
                    insights in seconds. We believe everyone deserves medication
                    clarity — effortless, accurate, and always accessible.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Trust Indicators Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <ScrollReveal
                  key={indicator.label}
                  animation="fade-up"
                  delay={0.2 + index * 0.08}
                  className="h-full"
                >
                  <div className="flex flex-col items-center text-center p-5 bg-card rounded-2xl border border-border/60 shadow-soft hover:shadow-card transition-shadow duration-300 h-full">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-bold text-foreground mb-0.5">
                      {indicator.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {indicator.description}
                    </span>
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

export default About;
