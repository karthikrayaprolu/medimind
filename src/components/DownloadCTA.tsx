import { ArrowRight } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";

const DownloadCTA = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
                <ScrollReveal animation="fade-up">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Icon */}
                        <div className="inline-block mb-6">
                            <LogoIcon size={56} className="text-primary" />
                        </div>

                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                            Start Managing Your{" "}
                            <span className="text-primary">Medications Today</span>
                        </h2>

                        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                            Join thousands of patients who trust MediMind to keep their
                            medication schedules organized, accurate, and effortless.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                            <Button
                                size="lg"
                                onClick={() => navigate("/auth")}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-none font-semibold rounded-xl px-8 h-12"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>

                        {/* Bottom trust line */}
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <LogoIcon size={16} className="text-primary" />
                            <span>No credit card required · Free forever for basics</span>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};

export default DownloadCTA;
