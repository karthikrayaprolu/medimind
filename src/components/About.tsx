import { Shield, Lock, Award, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const trustIndicators = [
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: Lock, label: "End-to-End Encrypted" },
  { icon: Award, label: "FDA Registered" },
  { icon: CheckCircle2, label: "ISO 27001 Certified" },
];

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="fade-up" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About MediMind
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              MediMind automates the medication journey—from secure login and prescription upload to OCR extraction, structured understanding, and personalized reminder schedules—so every patient stays informed and adherent.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Behind the scenes, orchestrated FastAPI services, validated data models, and resilient storage pipelines safeguard protected health information while delivering actionable insights in seconds.
            </p>
          </ScrollReveal>

          {/* Trust Indicators Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <ScrollReveal
                  key={index}
                  animation="scale-up"
                  delay={0.2 + index * 0.1}
                  className="h-full"
                >
                  <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 h-full">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground text-center">{indicator.label}</span>
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
