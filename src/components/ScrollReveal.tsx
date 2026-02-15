import { motion, useInView, Variant } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    className?: string;
    animation?: "fade-up" | "slide-in-right" | "slide-in-left" | "scale-up";
    delay?: number;
    duration?: number;
    threshold?: number;
}

const ScrollReveal = ({
    children,
    width = "100%",
    className = "",
    animation = "fade-up",
    delay = 0,
    duration = 0.45,
    threshold = 0.1,
}: ScrollRevealProps) => {
    const ref = useRef(null);
    const marginValue =
        threshold === 0.1 ? "0px 0px -10px 0px" : "0px 0px -100px 0px";
    const isInView = useInView(ref, { once: true, margin: marginValue });

    const variants: Record<string, { hidden: Variant; visible: Variant }> = {
        "fade-up": {
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0 },
        },
        "slide-in-right": {
            hidden: { opacity: 0, x: 24 },
            visible: { opacity: 1, x: 0 },
        },
        "slide-in-left": {
            hidden: { opacity: 0, x: -24 },
            visible: { opacity: 1, x: 0 },
        },
        "scale-up": {
            hidden: { opacity: 0, scale: 0.92 },
            visible: { opacity: 1, scale: 1 },
        },
    };

    const selectedVariant = variants[animation];

    return (
        <div ref={ref} style={{ width }} className={className}>
            <motion.div
                variants={selectedVariant}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{
                    duration,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
