import { useMutation, useQueryClient, type UseMutateFunction } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useRef } from "react";
import { useUserSettings } from "@/context/UserSettingsContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Shared message type
export type ChatMessage = {
  id: string;
  key: string;
  role: "user" | "assistant";
  content: string;
  session_id: string;
  created_at: string;
  status?: "pending" | "sent" | "failed";
};

// API response type
type SendMessageResponse = {
  content: string;
  logout?: boolean;
  error?: string;
};

type AppendMessages = (msgs: ChatMessage[], index?: number) => void;
type ReplaceMessageAt = (index: number, msg: ChatMessage) => void;
type ReplaceTypingDots = (index: number, msg: ChatMessage) => void;
type MapMessages = (fn: (msg: ChatMessage) => ChatMessage) => void;

export function useChatActions(
  appendMessages: AppendMessages,
  replaceMessageAt: ReplaceMessageAt,
  replaceTypingDots: ReplaceTypingDots,
  mapMessages: MapMessages
) {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { settings } = useUserSettings();

  const sessionId = settings.chatSession;

  // Cancel send message
  const stop = () => {
    abortControllerRef.current?.abort();
  };

  const mutation = useMutation<SendMessageResponse, Error, string>({
    mutationFn: async (message: string) => {
      abortControllerRef.current = new AbortController();
      const res = await fetch(`${BASE_URL}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: { role: "user", content: message },
        }),
        credentials: "include",
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data: SendMessageResponse = await res.json();
      if (data.logout) {
        console.log("Logging out (from useChatActions)", data.error);
        logout();
      }
      return data;
    },

    onMutate: async (message) => {
      if (!sessionId || !settings.userName) return;

      await queryClient.cancelQueries(["chatMessages", sessionId, settings.userName]);
      const previous = queryClient.getQueryData<ChatMessage[]>(["chatMessages", sessionId, settings.userName]);

      let id = crypto.randomUUID();
      const optimisticUserMessage: ChatMessage = {
        id,
        key: id,
        role: "user",
        content: message,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };

      id = crypto.randomUUID();
      const assistantTypingMessage: ChatMessage = {
        id,
        key: id,
        role: "assistant",
        content: "",
        session_id: sessionId,
        created_at: new Date().toISOString(),
        status: "pending",
      };

      appendMessages([optimisticUserMessage]);
      appendMessages([assistantTypingMessage], -1);

      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", sessionId, settings.userName],
        (old = []) => [...old, optimisticUserMessage]
      );

      return { previous };
    },

    onSuccess: (data) => {
      if (!sessionId || !settings.userName) return;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        key: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "(No response)",
        session_id: sessionId,
        created_at: new Date().toISOString(),
        status: "sent",
      };

      mapMessages((msg) => (msg.status === "pending" ? { ...msg, ...assistantMessage } : msg));

      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", sessionId, settings.userName],
        (old = []) => [...old, assistantMessage]
      );
    },

    onError: (err) => {
      if (!sessionId || !settings.userName) return;
      if (err?.name === "AbortError") return;

      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", sessionId, settings.userName],
        (old = []) =>
          old.map((msg, i, arr) =>
            i === arr.length - 1 && msg.role === "user" && !msg.status
              ? { ...msg, status: "failed" }
              : msg
          )
      );
    },

    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  return {
    ...mutation,
    stop,
  };
}

