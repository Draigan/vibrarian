import { useRef, useCallback } from "react";
import type { VirtuosoMessageListMethods } from "@virtuoso.dev/message-list";

// T is your message type (e.g., Message)
export interface HasRole {
  role: string;
  status?: string;
}

export function useVirtuoso<T extends HasRole>() {
  const virtuosoRef = useRef<VirtuosoMessageListMethods<T>>(null);

  // Replace all messages
  const replaceMessages = useCallback((messages: T[], opts?: any) => {
    virtuosoRef.current?.data.replace(messages, opts);
  }, []);

  // Append one or more messages with scroll behavior baked in
  const appendMessages = useCallback((msgs: T[]) => {
    const lastMsg = msgs[msgs.length - 1];
    virtuosoRef.current?.data.append(
      msgs,
      lastMsg.role === "assistant"
        ? undefined // Do not scroll
        : ({ scrollInProgress, atBottom }) => ({
            index: "LAST",
            align: "start",
            behavior: atBottom || scrollInProgress ? "smooth" : "auto",
          })
    );
  }, []);

  // Scroll to a message by key/id
  const scrollToMessageKey = useCallback((key: string, opts?: any) => {
    virtuosoRef.current?.scrollToMessageKey(key, opts);
  }, []);

  // Delete a message at the given index (supports negative indexing)
  const deleteMessageAt = useCallback((index: number) => {
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    if (!len) return;

    // Normalize negative index
    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) return;

    const newMessages = [...messages.slice(0, realIndex), ...messages.slice(realIndex + 1)];
    virtuosoRef.current?.data.replace(newMessages);
  }, []);

  // Replace a message at the given index (supports negative indexing)
  const replaceMessageAt = useCallback((index: number, newMessage: T) => {
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    if (!len) return;

    // Normalize negative index
    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) return;

    const newMessages = [...messages];
    newMessages[realIndex] = newMessage;
    virtuosoRef.current?.data.replace(newMessages);
  }, []);

  // Replace last assistant message with status: "pending"
  const replaceLastPendingAssistant = useCallback(
    (patch: Partial<T> | ((m: T) => T)) => {
      const messages = virtuosoRef.current?.data.get() || [];
      // Find last assistant with status: "pending"
      const idx = [...messages]
        .map((m, i) => ({ ...m, _idx: i })) // keep index
        .reverse()
        .find(m => m.role === "assistant" && m.status === "pending")?._idx;

      if (typeof idx !== "number") return;

      const newMessages = [...messages];
      const oldMsg = newMessages[idx];
      newMessages[idx] =
        typeof patch === "function"
          ? patch(oldMsg)
          : { ...oldMsg, ...patch };
      virtuosoRef.current?.data.replace(newMessages);
    },
    []
  );

  return {
    virtuosoRef,
    replaceMessages,
    appendMessages,
    scrollToMessageKey,
    deleteMessageAt,
    replaceMessageAt,
    replaceLastPendingAssistant, // <-- here!
  };
}

