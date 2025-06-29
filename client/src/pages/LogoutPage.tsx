import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      timeoutRef.current = setTimeout(() => navigate("/"), 5000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
      <h1 className="text-2xl font-semibold">You have been logged out</h1>
      <p className="text-muted-foreground">Thank you for visiting Vibrarian. Redirecting to login...</p>
    </div>
  );
}

