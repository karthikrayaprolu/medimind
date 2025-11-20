import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ParallaxSectionProps {
    children: ReactNode;
    speed?: number;
    className?: string;
    direction?: "vertical" | "horizontal";
}

const ParallaxSection = ({
    children,
    speed = 0.5,
    className = "",
    direction = "vertical"
}: ParallaxSectionProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

    // Calculate the transform range based on speed
    // Positive speed moves against scroll (parallax depth)
    // Negative speed moves with scroll
    const yRange = [100 * speed, -100 * speed];
    const xRange = [100 * speed, -100 * speed];

    const y = useSpring(useTransform(scrollYProgress, [0, 1], yRange), springConfig);
    const x = useSpring(useTransform(scrollYProgress, [0, 1], xRange), springConfig);

    const style = direction === "vertical" ? { y } : { x };

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.div style={style}>
                {children}
            </motion.div>
        </div>
    );
};

export default ParallaxSection;
