import { Star } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const testimonials = [
    {
        name: "Dr. Sarah Mitchell",
        role: "Family Physician",
        content:
            "MediMind has transformed how my patients manage their medications. The OCR accuracy is remarkable!",
        rating: 5,
        avatar: "SM",
    },
    {
        name: "Raj Patel",
        role: "Caregiver",
        content:
            "Managing my father's 8 daily medications was overwhelming. Now reminders take care of the rest.",
        rating: 5,
        avatar: "RP",
    },
    {
        name: "Emily Chen",
        role: "Patient",
        content:
            "I haven't missed a single dose since I started using MediMind three months ago.",
        rating: 5,
        avatar: "EC",
    },
    {
        name: "Dr. James Walker",
        role: "Cardiologist",
        content:
            "The structured data extraction saves me 30 minutes per patient. Incredible tool.",
        rating: 5,
        avatar: "JW",
    },
    {
        name: "Anita Sharma",
        role: "Diabetes Patient",
        content:
            "Auto reminders for my insulin shots have been a lifesaver. So easy to use.",
        rating: 5,
        avatar: "AS",
    },
    {
        name: "Michael Torres",
        role: "Pharmacist",
        content:
            "Finally a tool that reads prescriptions as well as I can. Patients love it.",
        rating: 5,
        avatar: "MT",
    },
];

const Testimonials = () => {
    // Double the array for seamless infinite scroll
    const marqueeItems = [...testimonials, ...testimonials];

    return (
        <section className="py-20 md:py-24 bg-muted/40 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6">
                <ScrollReveal animation="fade-up" className="mx-auto">
                    <div className="text-center mb-10 md:mb-14">
                        <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-primary/8 border border-primary/15 rounded-full">
                            <span className="text-primary font-semibold text-xs uppercase tracking-wider">
                                Testimonials
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                            Loved by Patients &{" "}
                            <span className="text-primary">Providers</span>
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                            Hear from real people who trust MediMind with their health.
                        </p>
                    </div>
                </ScrollReveal>
            </div>

            {/* ── Mobile: Infinite Marquee ── */}
            <div className="md:hidden">
                {/* Row 1 — scrolls left */}
                <div className="marquee-container mb-3">
                    <div className="marquee-track">
                        {marqueeItems.map((t, i) => (
                            <div
                                key={`r1-${i}`}
                                className="flex-shrink-0 w-[240px] rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
                            >
                                {/* Stars */}
                                <div className="flex gap-0.5 mb-2">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="w-3 h-3 text-amber-400" fill="currentColor" />
                                    ))}
                                </div>
                                {/* Quote */}
                                <p className="text-[12px] text-foreground leading-relaxed mb-3 line-clamp-3">
                                    "{t.content}"
                                </p>
                                {/* Author */}
                                <div className="flex items-center gap-2 pt-2.5 border-t border-border/40">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-bold text-primary">{t.avatar}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-foreground truncate">{t.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2 — scrolls right (reversed) */}
                <div className="marquee-container">
                    <div className="marquee-track marquee-reverse">
                        {marqueeItems.map((t, i) => (
                            <div
                                key={`r2-${i}`}
                                className="flex-shrink-0 w-[240px] rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
                            >
                                {/* Stars */}
                                <div className="flex gap-0.5 mb-2">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="w-3 h-3 text-amber-400" fill="currentColor" />
                                    ))}
                                </div>
                                {/* Quote */}
                                <p className="text-[12px] text-foreground leading-relaxed mb-3 line-clamp-3">
                                    "{t.content}"
                                </p>
                                {/* Author */}
                                <div className="flex items-center gap-2 pt-2.5 border-t border-border/40">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-bold text-primary">{t.avatar}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-foreground truncate">{t.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Desktop: Grid ── */}
            <div className="hidden md:block container mx-auto px-4 sm:px-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {testimonials.slice(0, 6).map((testimonial, index) => (
                        <ScrollReveal
                            key={testimonial.name}
                            animation="fade-up"
                            delay={index * 0.1}
                            className="h-full"
                        >
                            <div className="flex flex-col h-full p-6 rounded-2xl bg-card border border-border/60 shadow-soft">
                                {/* Rating */}
                                <div className="flex gap-0.5 mb-3">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-[15px] text-foreground leading-relaxed mb-5 flex-1">
                                    "{testimonial.content}"
                                </p>

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
