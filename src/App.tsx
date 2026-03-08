import { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();

const isNative = Capacitor.isNativePlatform();

const LandingRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Index />;
};

/** Handles Android hardware back button with contextual behaviour */
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPress = useRef(0);

  useEffect(() => {
    if (!isNative) return;

    let listener: { remove: () => void } | undefined;

    import("@capacitor/app").then(({ App: CapApp }) => {
      CapApp.addListener("backButton", ({ canGoBack }) => {
        // If on root-level screens, double-tap to exit
        const isRoot = location.pathname === "/" || location.pathname === "/dashboard" || location.pathname === "/auth";
        if (isRoot) {
          const now = Date.now();
          if (now - lastBackPress.current < 2000) {
            CapApp.exitApp();
          } else {
            lastBackPress.current = now;
            // A simple toast-style feedback could be added here
          }
        } else if (canGoBack) {
          navigate(-1);
        }
      }).then((l) => { listener = l; });
    }).catch(() => {});

    return () => { listener?.remove(); };
  }, [navigate, location.pathname]);

  return null;
};

/** Configures native status bar appearance — reacts to theme changes */
const useStatusBar = () => {
  useEffect(() => {
    if (!isNative) return;

    const applyStatusBar = async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const isDark = document.documentElement.classList.contains("dark");

        // Style.Light = dark icons (for light backgrounds)
        // Style.Dark  = light icons (for dark backgrounds)
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: isDark ? "#1a1510" : "#ffffff" });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {}
    };

    applyStatusBar();

    // Watch for theme class changes on <html> so the status bar updates live
    const observer = new MutationObserver(() => applyStatusBar());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);
};

/**
 * Use MemoryRouter on native platforms to avoid Android WebView URL
 * restoration issues that cause blank screens on re-launch.
 * BrowserRouter is fine for the web.
 */
const Router = isNative ? MemoryRouter : BrowserRouter;

const App = () => {
  // Show splash only on native mobile platforms (Android / iOS)
  const [showSplash, setShowSplash] = useState(isNative);

  // Configure native status bar
  useStatusBar();

  // Hide the Android native splash screen once our React app is ready
  useEffect(() => {
    if (isNative) {
      import("@capacitor/splash-screen")
        .then(({ SplashScreen: NativeSplash }) => NativeSplash.hide())
        .catch(() => {});
    }
  }, []);

  // Safety fallback: force-dismiss the React splash after a generous timeout
  // in case AnimatePresence.onExitComplete never fires (known framer-motion
  // issue on Android WebView with cached state).
  useEffect(() => {
    if (!showSplash) return;
    const safety = setTimeout(() => setShowSplash(false), 4500); // splash duration (2800) + exit anim (500) + buffer
    return () => clearTimeout(safety);
  }, [showSplash]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="medimind-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <Router>
              <BackButtonHandler />
              <Routes>
                <Route path="/" element={<LandingRoute />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/dashboard"
                  element={(
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  )}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        </TooltipProvider>

        {/* Splash rendered as overlay so the main app tree mounts underneath */}
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
