import { Star, Quote } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const testimonials = [
    {
        name: "Dr. Sarah Mitchell",
        role: "Family Physician",
        content:
            "MediMind has transformed how my patients manage their medications. The OCR accuracy is remarkable — even with my handwriting!",
        rating: 5,
        avatar: "SM",
    },
    {
        name: "Raj Patel",
        role: "Caregiver",
        content:
            "Managing my father's 8 daily medications was overwhelming. Now I just upload the prescription and reminders take care of the rest.",
        rating: 5,
        avatar: "RP",
    },
    {
        name: "Emily Chen",
        role: "Patient",
        content:
            "The automatic reminders have been a lifesaver. I haven't missed a single dose since I started using MediMind three months ago.",
        rating: 5,
        avatar: "EC",
    },
];

const Testimonials = () => {
    return (
        <section className="py-20 md:py-24 bg-muted/40">
            <div className="container mx-auto px-4 sm:px-6">
                <ScrollReveal animation="fade-up" className="mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
                            <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                                Testimonials
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                            Loved by Patients &{" "}
                            <span className="text-primary">Providers</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Hear from real people who trust MediMind with their health
                            management.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <ScrollReveal
                            key={testimonial.name}
                            animation="fade-up"
                            delay={index * 0.1}
                            className="h-full"
                        >
                            <div className="flex flex-col h-full p-6 rounded-2xl bg-card border border-border/60 shadow-soft">
                                {/* Quote Icon */}
                                <Quote className="w-8 h-8 text-primary/20 mb-4" fill="currentColor" />

                                {/* Content */}
                                <p className="text-[15px] text-foreground leading-relaxed mb-5 flex-1">
                                    "{testimonial.content}"
                                </p>

                                {/* Rating */}
                                <div className="flex gap-0.5 mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-4 h-4 text-amber-400"
                                            fill="currentColor"
                                        />
                                    ))}
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary">
                                            {testimonial.avatar}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
