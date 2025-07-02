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

        // Check HTTP status
        if (res.status === 503) {
          console.warn("🔐 Server/network error (503) during session check, not logging out");
          return; // Don't log out—just notify or retry later
        }

        const data = await res.json();

        if (data.logout) {
          console.log("Logging out (from sessionListener)", data.error);
          logout();
        } else {
          console.log("Session is valid");
        }
      } catch (err) {
        // This catch block is only hit if the fetch itself fails (network down, etc)
        console.error("🔐 Error validating session (fetch failed)", err);
        // Optionally: show a warning or retry logic
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

