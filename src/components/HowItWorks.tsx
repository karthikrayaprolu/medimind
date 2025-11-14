import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { LogIn, UploadCloud, Server, Scan, FileText, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    title: "Authenticate Securely",
    description: "Users land on MediMind, sign in, and receive JWT-backed access so every action is tied to a verified identity.",
    number: "01",
  },
  {
    icon: UploadCloud,
    title: "Upload Prescription",
    description: "Images are optionally compressed on-device, then sent through the /upload-prescription endpoint with processing status updates.",
    number: "02",
  },
  {
    icon: Server,
    title: "Gateway Intake",
    description: "FastAPI receives the file, user metadata, and timestamps, staging each asset in temporary storage ready for downstream services.",
    number: "03",
  },
  {
    icon: Scan,
    title: "OCR Extraction",
    description: "An EasyOCR worker cleans and transcribes handwritten notes into dosage lines, normalizing text and fixing common recognition errors.",
    number: "04",
  },
  {
    icon: FileText,
    title: "Structured Understanding",
    description: "Language reasoning services convert raw text into validated JSON for medicines, dosing cadence, timings, and durations via Pydantic models.",
    number: "05",
  },
  {
    icon: CalendarCheck,
    title: "Reminders & History",
    description: "Schedules populate MongoDB alongside the source image, enabling automated notifications, PDF exports, edits, and longitudinal insights.",
    number: "06",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow the journey from upload to actionable medication support in six orchestrated stages.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines (Desktop) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-20" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              const stepRef = useRef(null);
              const stepInView = useInView(stepRef, { once: true, margin: "-50px" });

              return (
                <motion.div
                  key={index}
                  ref={stepRef}
                  initial={{ opacity: 0, y: 50 }}
                  animate={stepInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                    {step.number}
                  </div>

                  {/* Card */}
                  <div className="bg-card rounded-2xl p-8 pt-16 text-center border border-border hover:shadow-lg transition-all duration-300 h-full">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Arrow (Mobile) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-4">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-secondary" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
