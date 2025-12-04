import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { authApi } from "@/lib/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  registerPushNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "medimind-auth-token";

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Unable to read auth token", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const { registerNotifications, fcmToken } = usePushNotifications();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Unable to persist auth token", error);
    }
  }, [token]);

  // Send FCM token to backend when it changes
  useEffect(() => {
    if (fcmToken && token) {
      authApi.updateFcmToken(fcmToken).catch((err) => {
        console.error("Failed to update FCM token on backend:", err);
      });
    }
  }, [fcmToken, token]);

  const registerPushNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log("[Push] Not a native platform, skipping push registration");
      return;
    }

    try {
      const registeredToken = await registerNotifications();
      if (registeredToken) {
        await authApi.updateFcmToken(registeredToken);
        console.log("[Push] FCM token registered with backend");
      }
    } catch (error) {
      console.error("[Push] Failed to register push notifications:", error);
    }
  }, [registerNotifications]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      token,
      login: (nextToken: string) => setToken(nextToken),
      logout: () => setToken(null),
      registerPushNotifications,
    }),
    [token, registerPushNotifications],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
