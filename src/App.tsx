import { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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

/** Configures native status bar appearance */
const useStatusBar = () => {
  useEffect(() => {
    if (!isNative) return;

    import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: "#FFFFFF" });
      StatusBar.setOverlaysWebView({ overlay: false });
    }).catch(() => {});
  }, []);
};

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

  if (showSplash) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="medimind-ui-theme">
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="medimind-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
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
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
