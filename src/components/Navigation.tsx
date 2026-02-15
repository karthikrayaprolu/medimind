import { useState } from "react";
import { Menu, X } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const menuItems = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "About", id: "about" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-6 py-3 shadow-soft backdrop-blur-xl">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => scrollToSection("home")}
            >
              <LogoIcon size={36} className="text-primary" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                MediMind
              </span>
            </div>

            {/* Menu Items */}
            <div className="flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <Button
                size="sm"
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/auth")
                }
                className="rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="border-b border-border/40 bg-card/85 backdrop-blur-xl safe-area-inset-top">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => scrollToSection("home")}
            >
              <LogoIcon size={36} className="text-primary" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                MediMind
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={cn(
            "overflow-hidden border-b border-border/40 bg-card/95 backdrop-blur-xl transition-all duration-300 ease-out",
            isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-5 pt-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left rounded-xl px-4 py-3 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </button>
            ))}
            <div className="h-px bg-border/60 my-3" />
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-medium text-muted-foreground">
                Theme
              </span>
              <ThemeToggle />
            </div>
            <Button
              className="w-full mt-3 rounded-xl bg-primary font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
              onClick={() => {
                setIsOpen(false);
                navigate(isAuthenticated ? "/dashboard" : "/auth");
              }}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
