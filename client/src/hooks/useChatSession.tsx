import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from '@/context/AuthContext';

const SESSION_KEY = "currentSessionId";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const {user} = useAuth();
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSessionId(stored);
    } else {
      selectSession(null);
    }
  }, []);

  const selectSession = (id: string | null) => {
    if (id == null){
      id = uuidv4();
    }
    localStorage.setItem(SESSION_KEY, id);
    setSessionId(id);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
  };

  const {
    data: sessions,
    error,
    isLoading,
    refetch: loadSessions, 
  } = useQuery({
    queryKey: ["chatSessions", user?.email],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/chat-session`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      return data.sessions;
    },
    enabled: true,
  });

  return {
    sessionId,
    setSessionId: selectSession,
    clearSession,
    sessions: sessions || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    loadSessions, 
  };
}
