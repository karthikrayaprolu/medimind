import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { LogIn, UserPlus, Mail, Lock, ArrowLeft, User, Eye, EyeOff } from "lucide-react";
import LogoIcon from "@/components/LogoIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { registerPushNotifications } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = useMemo(() => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname as string;
    }
    return "/dashboard";
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "signup") {
      const confirm = String(formData.get("confirmPassword") ?? "").trim();
      if (password !== confirm) {
        toast({
          title: "Passwords do not match",
          description: "Please ensure both password fields match.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const { authApi } = await import("@/lib/api");

      if (mode === "login") {
        const response = await authApi.login({ email, password });
        login(response.user_id);
        registerPushNotifications().catch(console.error);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${response.email}`,
        });
      } else {
        const fullName = String(formData.get("fullName") ?? "").trim();
        const response = await authApi.signup({ email, password, fullName });
        login(response.user_id);
        registerPushNotifications().catch(console.error);
        toast({
          title: "Account created!",
          description: "Welcome to MediMind",
        });
      }

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      toast({
        title: mode === "login" ? "Login failed" : "Signup failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-background flex flex-col overflow-y-auto px-4 py-8">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Back Button — hidden on native since hardware back is available */}
      {!Capacitor.isNativePlatform() && (
        <div className="absolute top-4 left-4 safe-area-inset-top z-20">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      )}

      {/* Auth Card — centered with flex grow so it scrolls when keyboard opens */}
      <div className="relative z-10 w-full max-w-md m-auto">
        <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 inline-block">
                <LogoIcon size={48} className="text-primary" />
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Sign in to continue to MediMind"
                  : "Start your health journey with MediMind"}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="mb-6 flex rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                  mode === "login"
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                  mode === "signup"
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      autoComplete="name"
                      className="pl-10 h-11 rounded-xl border-border/80 bg-background"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="pl-10 h-11 rounded-xl border-border/80 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    className="pl-10 pr-10 h-11 rounded-xl border-border/80 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pl-10 h-11 rounded-xl border-border/80 bg-background"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6 h-11 rounded-xl font-semibold shadow-none"
                disabled={isLoading}
              >
                {isLoading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms</a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </form>
          </div>

          {/* Footer Info */}
          <div className="border-t border-border/60 bg-muted/30 px-6 py-4">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Secure encrypted authentication</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>HIPAA compliant data storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
