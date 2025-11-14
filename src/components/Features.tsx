import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { UploadCloud, Scan, ListChecks, BellRing } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: UploadCloud,
    title: "Seamless Prescription Intake",
    description: "Authenticated uploads with optional compression keep every handwritten or printed prescription secure from the moment it hits the platform.",
  },
  {
    icon: Scan,
    title: "Reliable OCR Extraction",
    description: "An EasyOCR service cleans and interprets images to capture medicine names, strengths, and instructions with clinician-grade fidelity.",
  },
  {
    icon: ListChecks,
    title: "Structured Treatment Intelligence",
    description: "Language understanding services transform unstructured notes into validated JSON ready for scheduling, backed by Pydantic safeguards.",
  },
  {
    icon: BellRing,
    title: "Automated Reminders & History",
    description: "Dosage patterns become reminder timelines with notifications, audit trails, and searchable medication history stored in MongoDB.",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 h-full bg-card hover:shadow-lg transition-all duration-300 border border-border group hover:border-primary/50">
        <div className="mb-4 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
      </Card>
    </motion.div>
  );
};

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Built for End-to-End Medication Clarity
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            MediMind captures every step of the prescription lifecycle so patients and caregivers always know what to take, when to take it, and why.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
