import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useRef } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useSendMessage(sessionId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = () => {
    abortControllerRef.current?.abort();
  };

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      abortControllerRef.current = new AbortController(); // <-- fix is here!
      const res = await fetch(`${BASE_URL}/api/chat`, {
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
      return await res.json(); // assistant response
    },

    onMutate: async (message) => {
      if (!sessionId || !user?.email) return;

      await queryClient.cancelQueries(["chatMessages", sessionId, user.email]);
      const previous = queryClient.getQueryData(["chatMessages", sessionId, user.email]);

      const optimisticUserMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["chatMessages", sessionId, user.email], (old: any[] = []) => [
        ...old,
        optimisticUserMessage,
      ]);

      return { previous };
    },

    onSuccess: (data, _input, _context) => {
      if (!sessionId || !user?.email) return;

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "(No response)",
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["chatMessages", sessionId, user.email], (old: any[] = []) => [
        ...old,
        assistantMessage,
      ]);
    },

    onError: (err, _input, context) => {
      if (!sessionId || !user?.email) return;
      if (err?.name === "AbortError") {
        // Optionally handle as "cancelled" (show nothing, or a special UI)
        return;
      }
      queryClient.setQueryData(
        ["chatMessages", sessionId, user.email],
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
