import { useAuth } from "@/context/AuthContext";
import { useUserSettings } from "@/context/UserSettingsContext";
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useChatMessages(sessionId: string | null) {
  const {settings} = useUserSettings();
  const user = settings.userName;


  return useQuery({
    queryKey: ["chatMessages", sessionId, settings.userName],
    queryFn: async () => {
      console.log("📡 Fetching messages for session:", sessionId, "user:", user);
      if (!sessionId) return [];

      const url = `${BASE_URL}/api/chat-session/${sessionId}/messages`;
      console.log("🔗 Requesting:", url);

      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch messages:", res.status);
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      console.log("✅ Messages received:", data.messages);
      return data.messages;
    },
    enabled: !!sessionId && !!user
  });
}

