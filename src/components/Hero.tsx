import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMockup from "@/assets/hero-mockup.png";

interface HeroProps {
  onWaitlistClick: () => void;
}

const Hero = ({ onWaitlistClick }: HeroProps) => {
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background pt-20">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full"
            >
              <span className="text-primary font-semibold text-sm">Powered by AI Healthcare Technology</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              MediMind
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl md:text-3xl font-semibold text-foreground mb-6"
            >
              Your Intelligent Medical Companion
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Get instant medical assistance, symptom insights, and connect with trusted professionals — powered by smart healthcare technology.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={scrollToFeatures}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Try Prototype
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onWaitlistClick}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Join Waitlist
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>End-to-End Encrypted</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              
              {/* Phone Mockup */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <img
                  src={heroMockup}
                  alt="MediMind Dashboard"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
