import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import DownloadCTA from "@/components/DownloadCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-[100dvh] bg-background">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <About />
      <Testimonials />
      <DownloadCTA />
      <Footer />
    </div>
  );
};

export default Index;
