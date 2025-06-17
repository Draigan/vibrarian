import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      // Redirect after 3 seconds
      setTimeout(() => navigate("/login"), 5000);
    };
    doLogout();
  }, [logout, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
      <h1 className="text-2xl font-semibold">You have been logged out</h1>
      <p className="text-muted-foreground">Thank you for visiting Vibrarian. Redirecting to login...</p>
    </div>
  );
}
