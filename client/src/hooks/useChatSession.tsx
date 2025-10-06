// Fetches all the sessions from the database
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQuery } from "@tanstack/react-query";
import { useUserSettings } from "@/context/UserSettingsContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useChatSession() {
  const { settings, updateSettings } = useUserSettings();
  const sessionId = settings.chatSession;

  // Ensure sessionId is set on mount
  useEffect(() => {
    if (!sessionId) {
      // If no session, create a new one and store in settings
      updateSettings({ chatSession: uuidv4() });
    }
    // eslint-disable-next-line
  }, []); // run only on mount

  // Change session 
  const selectSession = (id: string) => {
    updateSettings({ chatSession: id });
  };

  // Fetch sessions for the current user
  const {
    data: sessions,
    error,
    isLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["chatSessions", settings.userName],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/chat-session`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      return data.sessions;
    },
    enabled: !!settings.userName, // Only run if userName exists
  });

  return {
    sessionId: settings.chatSession,
    setSessionId: selectSession,
    sessions: sessions || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : String(error),
    refetchSessions,
  };
}

