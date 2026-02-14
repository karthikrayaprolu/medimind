import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, ArrowLeft, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
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
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 py-8">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Pill className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to MediMind</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                mode === "login"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LogIn className="mr-2 inline h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                mode === "signup"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserPlus className="mr-2 inline h-4 w-4" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    autoComplete="name"
                    className="pl-3 pr-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-3 pr-10"
                />
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pl-3 pr-10"
                />
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pl-3 pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms and Privacy Policy
            </p>
          </form>
        </div>

        {/* Footer Info */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-muted/30 px-6 py-4">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span>Secure encrypted authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span>HIPAA compliant data storage</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
