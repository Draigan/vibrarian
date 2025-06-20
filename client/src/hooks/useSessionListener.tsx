import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useSessionListener() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { logout } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/session`, {
          credentials: "include", 
        });
        if (!res.ok) throw new Error("No session");
        const data = await res.json();
        console.log("✅ Session still valid:", data.user);
      } catch {
        console.warn("🔐 Session expired or invalid");
        logout();

      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // Initial check on mount
    checkSession();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [navigate, BASE_URL]);
}

