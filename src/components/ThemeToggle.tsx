import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Use RAF for smoother transition on mobile
    requestAnimationFrame(() => {
      setTheme(theme === "light" ? "dark" : "light");
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" style={{ willChange: 'transform' }} />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" style={{ willChange: 'transform' }} />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
