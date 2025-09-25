import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useRef } from "react";
import { useUserSettings } from "@/context/UserSettingsContext";
import type { ChatMessage } from "@/types/chat";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ----------------------
// Shared types
// ----------------------


// Response format expected from /api/send-message
type SendMessageResponse = {
  content: string;   // assistant's reply text
  logout?: boolean;  // flag if backend requires logout (e.g. token expired)
  error?: string;    // optional error message from server
};

// Helper function types to manipulate message state
type AppendMessages = (msgs: ChatMessage[], index?: number) => void;
type MapMessages = (fn: (msg: ChatMessage) => ChatMessage) => void;

// ----------------------
// Hook: useChatActions
// ----------------------
//
// Provides everything needed to:
// - send a message to the backend
// - manage optimistic UI updates
// - update cache with new/failed/pending messages
// - abort in-flight requests if needed
//
export function useChatActions(
  appendMessages: AppendMessages,
  mapMessages: MapMessages
) {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { settings } = useUserSettings();

  const sessionId = settings.chatSession;

  // ----------------------
  // Cancel current request
  // ----------------------
  const stop = () => {
    abortControllerRef.current?.abort();
  };

  // ----------------------
  // Mutation: send message
  // ----------------------
  const mutation = useMutation<SendMessageResponse, Error, string>({
    // Actual API call
    mutationFn: async (message: string) => {
      // prepare abort controller for cancellation
      abortControllerRef.current = new AbortController();

      const res = await fetch(`${BASE_URL}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: { role: "user", content: message },
        }),
        credentials: "include", // send cookies for auth
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data: SendMessageResponse = await res.json();

      // handle forced logout
      if (data.logout) {
        console.log("Logging out (from useChatActions)", data.error);
        logout();
      }
      return data;
    },

    // ----------------------
    // Optimistic update before request completes
    // ----------------------
    onMutate: async (message) => {
      if (!sessionId || !settings.userName) return;

      // cancel any outgoing fetches for this query
      await queryClient.cancelQueries({
        queryKey: ["chatMessages", sessionId, settings.userName],
      });

      // snapshot previous cache (for rollback if needed)
      const previous = queryClient.getQueryData<ChatMessage[]>([
        "chatMessages",
        sessionId,
        settings.userName,
      ]);

      // optimistic user message
      let id = crypto.randomUUID();
      const optimisticUserMessage: ChatMessage = {
        id,
        key: id,
        role: "user",
        content: message,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };

      // optimistic assistant "typing…" placeholder
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

      // add both to UI immediately
      appendMessages([optimisticUserMessage]);
      appendMessages([assistantTypingMessage], -1);

      // update cache with optimistic user message
      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", sessionId, settings.userName],
        (old = []) => [...old, optimisticUserMessage]
      );

      return { previous };
    },

    // ----------------------
    // Success: replace pending assistant message with real reply
    // ----------------------
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

      // replace the pending message in the UI
      mapMessages((msg) =>
        msg.status === "pending" ? { ...msg, ...assistantMessage } : msg
      );

      // push assistant message to cache
      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", sessionId, settings.userName],
        (old = []) => [...old, assistantMessage]
      );
    },

    // ----------------------
    // Error: mark last user message as failed
    // ----------------------
    onError: (err) => {
      if (!sessionId || !settings.userName) return;
      if (err?.name === "AbortError") return; // user manually aborted

      // update last user message with failed status
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

    // ----------------------
    // Always cleanup after request
    // ----------------------
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  // expose mutation helpers + stop()
  return {
    ...mutation,
    stop,
  };
}

