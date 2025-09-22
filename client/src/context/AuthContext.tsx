import LayoutSkeleton from "@/components/layout/LayoutSkeleton";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserSettings } from "./UserSettingsContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthContextType {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => ({ success: false, message: "" }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { updateSettings, clearSettings } = useUserSettings();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // 🔑 Helper: hydrate auth + user settings from /session
  const fetchSession = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/session`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        if (data.logout) {
          await logout(); // expired/invalid token
        } else {
          console.log("DATA:",data.role);
          setUser(data.user);
          updateSettings({
            userName: data.user.email,
            role: data.role,
            theme: data.settings?.theme || "light",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  };

  // On mount → check session stability + hydrate
  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔑 Signup
  const signup = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Signup failed" };
      }

      // hydrate from /session after signup
      await fetchSession();
      navigate("/");
      return { success: true, message: "Signup successful!" };
    } catch (err) {
      return { success: false, message: "Unexpected error occurred." };
    }
  };

  // 🔑 Login
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid email or password");
      }

      // hydrate from /session after login
      await fetchSession();
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setUser(null);
      throw err;
    }
  };

  // 🔑 Logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      clearSettings();
    }
  };

  const value = { user, login, logout, signup };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LayoutSkeleton /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

