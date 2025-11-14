import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Lock, Award, CheckCircle2 } from "lucide-react";

const trustIndicators = [
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: Lock, label: "End-to-End Encrypted" },
  { icon: Award, label: "FDA Registered" },
  { icon: CheckCircle2, label: "ISO 27001 Certified" },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About MediMind
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              MediMind automates the medication journey—from secure login and prescription upload to OCR extraction, structured understanding, and personalized reminder schedules—so every patient stays informed and adherent.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Behind the scenes, orchestrated FastAPI services, validated data models, and resilient storage pipelines safeguard protected health information while delivering actionable insights in seconds.
            </p>
          </motion.div>

          {/* Trust Indicators Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex flex-col items-center p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground text-center">{indicator.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
