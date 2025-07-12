import { useRef, useCallback, useEffect } from "react";
import type { VirtuosoMessageListMethods } from "@virtuoso.dev/message-list";

// T is your message type (e.g., Message)
export interface HasRole {
  role: string;
  status?: string;
}

export function useVirtuoso<T extends HasRole>() {
  const virtuosoRef = useRef<VirtuosoMessageListMethods<T>>(null);

  // Replace all messages
  const replaceMessages = useCallback(
    (
      messages: T[],
      opts?: {
        scrollToTop?: boolean;
        scrollToBottom?: boolean;
        initialLocation?: any; // for custom scroll control
        [key: string]: any;
      }
    ) => {
      let virtuosoOpts: any = { purgeItemSizes: true };

      // Priority: explicit initialLocation > scrollToTop > scrollToBottom > nothing
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


  // Assuming you have your ref:

  const getResolvedIndex = useCallback((index: number) => {
    // Pull current messages from Virtuoso's internal data
    const messages = virtuosoRef.current?.data.get?.() || [];
    let resolvedIndex = index;

    if (index < 0) {
      resolvedIndex = messages.length + index;
    }
    // Clamp to valid range (0 to messages.length - 1)
    if (resolvedIndex < 0) resolvedIndex = 0;
    if (resolvedIndex >= messages.length) resolvedIndex = messages.length - 1;

    return resolvedIndex;
  }, []);
  const scrollToIndex = useCallback(
    (
      index: number,
      opts?: { align?: "start" | "center" | "end"; behavior?: "auto" | "smooth" }
    ) => {
      // Get the current list length from your state or Virtuoso's API
      const messages = virtuosoRef.current?.data.get?.() || [];
      let targetIndex: number | "LAST" = index;

      if (index < 0) {
        // Python-style negative index
        const resolved = messages.length + index;
        targetIndex = resolved < 0 ? 0 : resolved;
      }

      virtuosoRef.current?.scrollToItem({
        index: targetIndex,
        align: opts?.align || "start",
        behavior: opts?.behavior || "smooth",
      });
    },
    []
  );
  //const appendMessages = useCallback((msgs: T[],index: number) => {
  //  if (!virtuosoRef.current) return;
  //if (index){
  //  virtuosoRef.current?.data.append(msgs, () => ({
  //    index: index,
  //    align: "start",
  //    behavior: "smooth",
  //  }));
  //  } else {
  //    virtuosoRef.current?.data.append(msgs);
  //  }
  //});

  const appendMessages = useCallback((msgs: T[],index: number) => {
    if (!virtuosoRef.current) return;

  if (index !== undefined){
    index = getResolvedIndex(index);
    virtuosoRef.current?.data.append(msgs, () => ({
      index: index,
      align: "start",
      behavior: "smooth",
    }));
    } else {
    virtuosoRef.current?.data.append(msgs);
    }
  }, [virtuosoRef]);
  // Scrolls the last user message to the top of the list
  // Scroll to a message by key/id

  //// Scroll to a message by key/id
  //const scrollToMessageKey = useCallback((key: string, opts?: any) => {
  //  virtuosoRef.current?.scrollToMessageKey(key, opts);
  //}, []);
  //const scrollToMessageKey = useCallback((index: number, opts?: any) => {
  //  virtuosoRef.current?.scrollToIndex({
  //    index,
  //    align: opts?.align || "start",
  //    behavior: opts?.behavior || "smooth",
  //  });
  //}, []);
  const scrollToMessageKey = useCallback(
    (key: string, opts?: { align?: "start" | "center" | "end"; behavior?: "auto" | "smooth" }) => {
      const messages = messagesRef.current; // make sure messagesRef is up-to-date via useRef
      const index = messages.findIndex(msg => msg.key === key);
      if (index >= 0) {
        virtuosoRef.current?.scrollToItem({
          index,
          align: opts?.align || "start",
          behavior: opts?.behavior || "smooth",
        });
      } else {
        console.warn(`Key "${key}" not found in messages.`);
      }
    },
    []
  );
  // Delete a message at the given index (supports negative indexing)
  const deleteMessageAt = useCallback((index: number) => {
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    console.log("[deleteMessageAt] Current messages:", messages.map(m => m?.content || m?.id));
    if (!len) {
      console.warn("[deleteMessageAt] No messages to delete.");
      return;
    }

    // Normalize negative index
    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) {
      console.warn(`[deleteMessageAt] Index out of bounds: ${realIndex}`);
      return;
    }

    const deleted = messages[realIndex];
    const newMessages = [...messages.slice(0, realIndex), ...messages.slice(realIndex + 1)];

    console.log(`[deleteMessageAt] Deleting message at index ${realIndex}:`, deleted);
    console.log("[deleteMessageAt] New messages after delete:", newMessages.map(m => m?.content || m?.id));

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

