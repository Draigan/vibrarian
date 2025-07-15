import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useRef, useState } from "react";
import { useUserSettings } from "@/context/UserSettingsContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useChatActions(appendMessages, replaceMessageAt, replaceTypingDots, mapMessages) {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { settings } = useUserSettings();

  const sessionId = settings.chatSession;
  const stop = () => {
    abortControllerRef.current?.abort();
  };

  const mutation = useMutation({
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

      const data = await res.json(); // assistant response
      if (data.logout) {
        console.log("Logging out (from useChatActions)", data.error);
        logout();
      }
      return data; // assistant response
    },

    onMutate: async (message) => {
      if (!sessionId || !settings.userName) return;

      await queryClient.cancelQueries(["chatMessages", sessionId, settings.userName]);
      const previous = queryClient.getQueryData(["chatMessages", sessionId, settings.userName]);

      let id = crypto.randomUUID();
      const optimisticUserMessage = {
        id: id,
        key: id,
        role: "user",
        content: message,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };

      id = crypto.randomUUID();
      const assistantTypingMessage = {
        id: id,
        key: id,
        role: "assistant",
        content: "",
        session_id: sessionId,
        created_at: new Date().toISOString(),
        status: "pending"
      };
      appendMessages([optimisticUserMessage]);
      appendMessages([assistantTypingMessage], -1);


      queryClient.setQueryData(["chatMessages", sessionId, settings.userName], (old: any[] = []) => [
        ...old,
        optimisticUserMessage,
      ]);

      return { previous };
    },

    onSuccess: (data, _input, _context) => {
      if (!sessionId || !settings.userName) return;

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "(No response)",
        session_id: sessionId,
        created_at: new Date().toISOString(),
        status: 'sent'
      };

      //replaceMessageAt(-1, assistantMessage)
      //replaceTypingDots(-1, assistantMessage)
      mapMessages(msg => {
        return (msg.status === "pending"
          ? { ...msg, ...assistantMessage }
          : msg
        )
      }
      );
      //replaceMessageContentAt(-1, assistantMessage)
      queryClient.setQueryData(["chatMessages", sessionId, settings.userName], (old: any[] = []) => [
        ...old,
        assistantMessage,
      ]);
    },

    onError: (err, input) => {
      if (!sessionId || !settings.userName) return;
      if (err?.name === "AbortError") {
        // Optionally handle as "cancelled" (show nothing, or a special UI)
        return;
      }

      const errorMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: "",
        session_id: sessionId,
        created_at: new Date().toISOString(),
        status: "failed"
      };
      queryClient.setQueryData(
        ["chatMessages", sessionId, settings.userName],
        (old: any[] = []) =>
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
