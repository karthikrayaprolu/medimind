import { Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const footerLinks = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "About", id: "about" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Mail, href: "mailto:support@medimind.app", label: "Email" },
  ];

  return (
    <footer id="contact" className="border-t border-border/60 bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LogoIcon size={36} className="text-primary" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                MediMind
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Empowering smarter healthcare with AI-driven prescription
              management, medication schedules, and personalized reminders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">
              Connect With Us
            </h3>
            <div className="flex gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-muted border border-border/60 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                  >
                    <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                  </a>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              support@medimind.app
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/60 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 MediMind — Empowering Smarter Healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
