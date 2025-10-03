import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserSettings } from "@/context/UserSettingsContext";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function useChatSessionActions() {
  const queryClient = useQueryClient();
  const { settings, updateSettings } = useUserSettings();
  const { logout } = useAuth();

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      console.log("🗑️ Attempting to delete session:", sessionId);
      console.log("🔗 Delete URL:", `${BASE_URL}/api/chat-session/${sessionId}`);
      
      const res = await fetch(`${BASE_URL}/api/chat-session/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      console.log("🗑️ Delete response status:", res.status);
      
      if (!res.ok) {
        const data = await res.json();
        console.error("🗑️ Delete failed:", data);
        throw new Error(data.error || "Failed to delete session");
      }

      const result = await res.json();
      console.log("🗑️ Delete success:", result);
      return result;
    },
    onSuccess: (_, sessionId) => {
      // Invalidate sessions query to refetch the list
      queryClient.invalidateQueries({
        queryKey: ["chatSessions", settings.userName],
      });

      // If the deleted session was the active one, switch to a new session
      if (sessionId === settings.chatSession) {
        updateSettings({ chatSession: crypto.randomUUID() });
      }

      // Also invalidate messages for the deleted session
      queryClient.removeQueries({
        queryKey: ["chatMessages", sessionId],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to delete session:", error.message);
      // Handle auth errors
      if (error.message.includes("authenticated") || error.message.includes("401")) {
        logout();
      }
    },
  });

  // Rename session mutation
  const renameSessionMutation = useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: string; title: string }) => {
      console.log("✏️ Attempting to rename session:", sessionId, "to:", title);
      console.log("🔗 Rename URL:", `${BASE_URL}/api/chat-session/${sessionId}/rename`);
      
      const res = await fetch(`${BASE_URL}/api/chat-session/${sessionId}/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title }),
      });

      console.log("✏️ Rename response status:", res.status);
      
      if (!res.ok) {
        const data = await res.json();
        console.error("✏️ Rename failed:", data);
        throw new Error(data.error || "Failed to rename session");
      }

      const result = await res.json();
      console.log("✏️ Rename success:", result);
      return result;
    },
    onSuccess: () => {
      // Invalidate sessions query to refetch the updated list
      queryClient.invalidateQueries({
        queryKey: ["chatSessions", settings.userName],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to rename session:", error.message);
      // Handle auth errors
      if (error.message.includes("authenticated") || error.message.includes("401")) {
        logout();
      }
    },
  });

  return {
    deleteSession: deleteSessionMutation.mutate,
    renameSession: renameSessionMutation.mutate,
    isDeleting: deleteSessionMutation.isPending,
    isRenaming: renameSessionMutation.isPending,
    deleteError: deleteSessionMutation.error?.message,
    renameError: renameSessionMutation.error?.message,
  };
}