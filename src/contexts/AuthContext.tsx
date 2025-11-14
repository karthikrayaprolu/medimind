import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
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

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      token,
      login: (nextToken: string) => setToken(nextToken),
      logout: () => setToken(null),
    }),
    [token],
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
