import LayoutSkeleton from '@/components/layout/LayoutSkeleton';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the shape of our auth context state
interface AuthContextType {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
}

// Create the context with default dummy values (will be overridden by provider)
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { },
  logout: async () => { },
  signup: async () => ({ success: false, message: "" }),
});

// AuthProvider component to manage and provide auth state
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();  // for optional redirects after login/logout
  const [loading, setLoading] = useState<boolean>(true);

  // On mount, check if user is already logged in (by calling backend)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/session`, {
          method: 'GET',
          credentials: 'include'  // include cookies in request
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Sign up
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

      // Assume signup also logs them in (as your backend currently does)
      setUser(data.user);
      navigate("/chat"); // or any other redirect
      return { success: true, message: "Signup successful!" };
    } catch (err) {
      return { success: false, message: "Unexpected error occurred." };
    }
  };
  // Login helper – calls backend then updates context state
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // ensure cookie (sb_token) is included in requests
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid email or password');
      }
      // If login was successful, fetch the user info (using the cookie set by backend)
      const data = await res.json();
      console.log("Login response:", data); // 🔍 Check this in the browser console
      console.log("User extracted:", data.user);
      // (Alternatively, call fetchCurrentUser() again if the login endpoint doesn't return user data)
      setUser(data.user);
      // Redirect to a protected page (optional, e.g. to /chat)
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setUser(null);
      throw err;
    }
  };

  // Logout helper – calls backend to clear cookie and updates state
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user from context on logout
      setUser(null);
    }
  };


  const value = { user, login, logout, signup };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children after initial auth check to prevent flicker */}
      {loading ? <LayoutSkeleton /> : children}
    </AuthContext.Provider>
  );
};

// Hook to easily access the auth context in components
export const useAuth = () => useContext(AuthContext);

