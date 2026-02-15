import { ArrowRight, Camera, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LogoIcon from "@/components/LogoIcon";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[100dvh] flex items-center overflow-hidden pt-20 pb-10 md:pt-28 md:pb-16 bg-background"
    >
      {/* Subtle decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Two-column layout on desktop, stacked on mobile */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-16">

            {/* Left: Text content — compact */}
            <div className="flex-1 text-center md:text-left">
              {/* Logo badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2.5 mb-5"
              >
                <LogoIcon size={40} className="text-primary" />
                <span className="text-sm font-bold text-muted-foreground tracking-wide uppercase">
                  MediMind
                </span>
              </motion.div>

              {/* Main Heading — short & punchy */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-[2.5rem] sm:text-5xl md:text-[3.5rem] font-extrabold mb-4 text-foreground tracking-tight leading-[1.08]"
              >
                Scan. Schedule.{" "}
                <span className="text-primary">Stay Healthy.</span>
              </motion.h1>

              {/* One-liner subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="text-base sm:text-lg text-muted-foreground mb-7 max-w-md mx-auto md:mx-0 leading-relaxed"
              >
                Turn any prescription into smart medication reminders in seconds.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-7"
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-none font-semibold rounded-xl px-8 h-12"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("how-it-works")}
                  className="border-2 border-border hover:bg-muted rounded-xl font-semibold px-8 h-12 shadow-none"
                >
                  How It Works
                </Button>
              </motion.div>

              {/* Trust badges — compact inline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-4 justify-center md:justify-start text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <span>50K+ prescriptions processed</span>
              </motion.div>
            </div>

            {/* Right: Visual phone mockup */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex-shrink-0 mt-10 md:mt-0 flex justify-center"
            >
              <div className="relative w-[260px] sm:w-[280px]">
                {/* Phone frame */}
                <div className="rounded-[2rem] border-[3px] border-foreground/10 bg-card shadow-elevated p-3 pb-4">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-3 py-2 mb-3">
                    <span className="text-[10px] font-semibold text-muted-foreground">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3.5 h-2 rounded-sm bg-foreground/20" />
                      <div className="w-3.5 h-2 rounded-sm bg-foreground/20" />
                      <div className="w-5 h-2 rounded-sm bg-primary/60" />
                    </div>
                  </div>

                  {/* Mini app preview */}
                  <div className="space-y-3 px-1">
                    {/* Greeting */}
                    <div className="flex items-center gap-2">
                      <LogoIcon size={24} className="text-primary" />
                      <div>
                        <p className="text-[11px] font-bold text-foreground">Good Morning 👋</p>
                        <p className="text-[9px] text-muted-foreground">3 medications today</p>
                      </div>
                    </div>

                    {/* Medication card preview */}
                    <div className="rounded-xl bg-primary/8 border border-primary/12 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                          <Camera className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-foreground">Prescription Scanned</p>
                          <p className="text-[8px] text-muted-foreground">2 medicines extracted</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="flex-1 rounded-lg bg-card/80 p-2 text-center">
                          <p className="text-xs font-extrabold text-primary">3</p>
                          <p className="text-[7px] text-muted-foreground">Active</p>
                        </div>
                        <div className="flex-1 rounded-lg bg-card/80 p-2 text-center">
                          <p className="text-xs font-extrabold text-secondary">8AM</p>
                          <p className="text-[7px] text-muted-foreground">Next Dose</p>
                        </div>
                        <div className="flex-1 rounded-lg bg-card/80 p-2 text-center">
                          <p className="text-xs font-extrabold text-foreground">92%</p>
                          <p className="text-[7px] text-muted-foreground">Adherence</p>
                        </div>
                      </div>
                    </div>

                    {/* Reminder preview */}
                    <div className="rounded-xl bg-card border border-border/60 p-2.5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-foreground truncate">Amoxicillin 500mg</p>
                        <p className="text-[8px] text-muted-foreground">Take 1 capsule after meal</p>
                      </div>
                      <div className="text-[9px] font-bold text-primary">8:00 AM</div>
                    </div>

                    {/* Another reminder */}
                    <div className="rounded-xl bg-card border border-border/60 p-2.5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-foreground truncate">Metformin 850mg</p>
                        <p className="text-[8px] text-muted-foreground">Take with breakfast</p>
                      </div>
                      <div className="text-[9px] font-bold text-primary">9:00 AM</div>
                    </div>
                  </div>

                  {/* Mini bottom nav */}
                  <div className="flex items-center justify-around mt-4 pt-2.5 border-t border-border/40">
                    <div className="w-5 h-5 rounded-md bg-primary/15" />
                    <div className="w-5 h-5 rounded-md bg-muted" />
                    <div className="w-8 h-8 -mt-3 rounded-xl bg-primary flex items-center justify-center">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="w-5 h-5 rounded-md bg-muted" />
                    <div className="w-5 h-5 rounded-md bg-muted" />
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg">
                  AI Powered ✨
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
