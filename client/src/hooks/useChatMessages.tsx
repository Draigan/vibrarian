import { useUserSettings } from "@/context/UserSettingsContext";
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ----------------------
// Hook: useChatMessages
// ----------------------
//
// Fetches all messages for a given chat session from the backend.
// Integrates with React Query for caching, re-fetching, and state management.
//
export function useChatMessages(sessionId: string | null) {
  // get user-specific settings (e.g., userName, active session)
  const { settings } = useUserSettings();
  const user = settings.userName;
  // ----------------------
  // React Query: useQuery
  // ----------------------
  return useQuery({
    // unique cache key → isolates chat messages by session & user
    queryKey: ["chatMessages", sessionId, settings.userName],

    // actual fetch function
    queryFn: async () => {
      console.log("📡 Fetching messages for session:", sessionId, "user:", user);

      // if no session, return empty array immediately
      if (!sessionId) return [];

      // construct API URL
      const url = `${BASE_URL}/api/chat-session/${sessionId}/messages`;
      console.log("🔗 Requesting:", url);

      // request messages from server (with cookies for auth)
      const res = await fetch(url, {
        credentials: "include",
      });

      // handle failed response
      if (!res.ok) {
        console.error("❌ Failed to fetch messages:", res.status);
        throw new Error("Failed to fetch messages");
      }

      // parse JSON and return message array
      const data = await res.json();
      console.log("✅ Messages received:", data.messages);
      return data.messages;
    },

    // only run query when both sessionId and user are set
    enabled: !!sessionId && !!user,
  });
}


