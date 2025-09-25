import { useRef, useCallback } from "react";
import type { VirtuosoMessageListMethods } from "@virtuoso.dev/message-list";

// ----------------------
// Type: HasRole
// ----------------------
// Minimal shape for messages used in Virtuoso list.
// This allows extending with role/status (user, assistant, pending, etc.)
export interface HasRole {
  role?: string;
  status?: string;
}

// ----------------------
// Hook: useVirtuoso
// ----------------------
//
// Provides a collection of helper methods to manipulate messages
// inside a VirtuosoMessageList (append, replace, delete, etc.).
// Keeps a ref to Virtuoso so you can update the underlying list.
//
export function useVirtuoso<T extends HasRole>() {
  // Reference to VirtuosoMessageList instance
  const virtuosoRef = useRef<VirtuosoMessageListMethods<T>>(null);

  // ----------------------
  // Replace all messages
  // ----------------------
  const replaceMessages = useCallback(
    (
      messages: T[],
      opts?: {
        scrollToTop?: boolean;
        scrollToBottom?: boolean;
        initialLocation?: any; // custom scroll control
        [key: string]: any;
      }
    ) => {
      let virtuosoOpts: any = { purgeItemSizes: true };

      // Scroll options priority:
      // explicit location > scroll to top > scroll to bottom
      if (opts?.initialLocation) {
        virtuosoOpts.initialLocation = opts.initialLocation;
      } else if (opts?.scrollToTop) {
        virtuosoOpts.initialLocation = {
          index: 0,
          align: "start",
          behavior: "smooth",
        };
      } else if (opts?.scrollToBottom) {
        virtuosoOpts.initialLocation = {
          index: "LAST",
          align: "end",
          behavior: "smooth",
        };
      }

      virtuosoRef.current?.data.replace(messages, virtuosoOpts);
    },
    []
  );

  // ----------------------
  // Utility: resolve negative index
  // ----------------------
  // Allows using negative indexing (e.g. -1 = last item)
  const getResolvedIndex = useCallback((index: number) => {
    const messages = virtuosoRef.current?.data.get?.() || [];
    let resolvedIndex = index;

    if (index < 0) {
      resolvedIndex = messages.length + index;
    }
    // clamp to valid range
    if (resolvedIndex < 0) resolvedIndex = 0;
    if (resolvedIndex >= messages.length) resolvedIndex = messages.length - 1;

    return resolvedIndex;
  }, []);


  // ----------------------
  // Append messages
  // ----------------------
  // Adds messages to the list. Supports appending with scroll alignment.
const appendMessages = useCallback(
  (msgs: T[], index?: number) => {
    if (!virtuosoRef.current) return;

    if (index !== undefined) {
      const resolved = getResolvedIndex(index); // always returns a number
      virtuosoRef.current.data.append(msgs, () => ({
        index: resolved,
        align: "start",
        behavior: "smooth",
      }));
    } else {
      virtuosoRef.current.data.append(msgs);
    }
  },
  [virtuosoRef, getResolvedIndex]
);
  // ----------------------
  // Delete message at index
  // ----------------------
  const deleteMessageAt = useCallback((index: number) => {
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    console.log(
      "[deleteMessageAt] Current messages:",
      messages.map((m) => m?.content || m?.id)
    );
    if (!len) {
      console.warn("[deleteMessageAt] No messages to delete.");
      return;
    }

    // normalize negative index
    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) {
      console.warn(`[deleteMessageAt] Index out of bounds: ${realIndex}`);
      return;
    }

    const deleted = messages[realIndex];
    const newMessages = [
      ...messages.slice(0, realIndex),
      ...messages.slice(realIndex + 1),
    ];

    console.log(`[deleteMessageAt] Deleting message at index ${realIndex}:`, deleted);
    console.log(
      "[deleteMessageAt] New messages after delete:",
      newMessages.map((m) => m?.content || m?.id)
    );

    virtuosoRef.current?.data.replace(newMessages);
  }, []);

  // ----------------------
  // Replace message at index
  // ----------------------
  const replaceMessageAt = useCallback((index: number, newMessage: T) => {
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    if (!len) return;

    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) return;

    const newMessages = [...messages];
    newMessages[realIndex] = newMessage;
    virtuosoRef.current?.data.replace(newMessages);
  }, []);

  // ----------------------
  // Replace "typing dots" placeholder at index
  // ----------------------
  // Only replaces if message role is assistant.
  const replaceTypingDots = useCallback((index: number, newMessage: T) => {
    if (newMessage.role !== "assistant") return;
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    if (!len) return;

    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) return;

    const newMessages = [...messages];
    newMessages[realIndex] = newMessage;
    virtuosoRef.current?.data.replace(newMessages);
  }, []);

  // ----------------------
  // Update partial fields at index
  // ----------------------
  const updateMessageAtIndex = (index: number, partial: Partial<T>) => {
    if (!virtuosoRef.current) return;
    const arr = virtuosoRef.current.data.get();
    if (index < 0 || index >= arr.length) return;
    const newArr = arr.map((msg, i) =>
      i === index ? { ...msg, ...partial } : msg
    );
    virtuosoRef.current.data.replace(newArr);
  };

  // ----------------------
  // Map over messages
  // ----------------------
  // Applies a transformation to every message in the list
  const mapMessages = useCallback(
    (mapper: (msg: T) => T) => {
      if (!virtuosoRef.current) return;
      virtuosoRef.current.data.map(mapper);
    },
    [virtuosoRef]
  );

  // ----------------------
  // Expose API
  // ----------------------
  return {
    virtuosoRef,
    replaceMessages,
    appendMessages,
    deleteMessageAt,
    replaceMessageAt,
    replaceTypingDots,
    updateMessageAtIndex,
    mapMessages,
  };
}

