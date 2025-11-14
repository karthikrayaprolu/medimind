import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Footer from "@/components/Footer";
import WaitlistModal from "@/components/WaitlistModal";

const Index = () => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero onWaitlistClick={() => setIsWaitlistOpen(true)} />
      <Features />
      <HowItWorks />
      <About />
      <Footer />
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};

export default Index;
