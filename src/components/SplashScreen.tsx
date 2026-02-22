import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
  /** Duration in ms before auto-dismiss (default 2800) */
  duration?: number;
}

/**
 * Full-screen animated splash — logo scales up with a soft bounce,
 * tagline fades in from below, and the whole screen fades out.
 */
const SplashScreen = ({ onComplete, duration = 2800 }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#1a1410] dark:via-[#151210] dark:to-[#181510]"
        >
          {/* Decorative background rings */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.06 }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-2 border-orange-500"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.04 }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-orange-400"
            />
          </div>

          {/* Logo + title group */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 16,
              delay: 0.1,
            }}
            className="flex flex-col items-center gap-5"
          >
            {/* Logo icon — enlarged brand mark */}
            <div className="relative">
              <motion.div
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 14,
                  delay: 0.15,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={88}
                  height={88}
                  viewBox="0 0 32 32"
                  fill="none"
                  className="drop-shadow-lg"
                >
                  <rect
                    width="32"
                    height="32"
                    rx="8"
                    className="fill-primary"
                  />
                  <rect
                    x="13"
                    y="7"
                    width="6"
                    height="18"
                    rx="3"
                    fill="white"
                  />
                  <rect
                    x="7"
                    y="13"
                    width="18"
                    height="6"
                    rx="3"
                    fill="white"
                  />
                  <circle cx="16" cy="16" r="2" className="fill-primary" />
                </svg>
              </motion.div>

              {/* Pulse ring behind logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.5], opacity: [0.4, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  ease: "easeOut",
                  delay: 0.6,
                }}
                className="absolute inset-0 rounded-2xl border-2 border-primary"
              />
            </div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="text-3xl font-extrabold tracking-tight text-foreground"
            >
              Medi
              <span className="text-primary">Mind</span>
            </motion.h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-4 text-sm font-medium text-muted-foreground tracking-wide text-center px-8 max-w-xs"
          >
            Your health, managed intelligently.
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex gap-1.5 mt-10"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Bottom credit */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 text-xs font-medium text-muted-foreground tracking-widest uppercase"
          >
            MediMind
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
