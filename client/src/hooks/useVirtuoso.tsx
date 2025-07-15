import { useRef, useCallback, useEffect } from "react";
import type { VirtuosoMessageListMethods } from "@virtuoso.dev/message-list";

// T is your message type (e.g., Message)
export interface HasRole {
  role?: string;
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

const replaceMessageContentAt = useCallback(
  (index: number, newContent: string) => {
    if (!virtuosoRef.current) return;

    const resolvedIndex = getResolvedIndex(index);

    virtuosoRef.current.data.update((oldMessages: T[]) => {
      return oldMessages.map((msg, i) =>
        i === resolvedIndex ? { ...msg, content: newContent } : msg
      );
    });
  },
  [virtuosoRef, getResolvedIndex]
);

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
  //
  const replaceTypingDots = useCallback((index: number, newMessage: T) => {
    if (newMessage.role !== 'assistant') return;
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

const updateMessageAtIndex = (index: number, partial: Partial<T>) => {
  if (!virtuosoRef.current) return;
  const arr = virtuosoRef.current.data.get();
  if (index < 0 || index >= arr.length) return;
  const newArr = arr.map((msg, i) => 
    i === index ? { ...msg, ...partial } : msg
  );
  virtuosoRef.current.data.replace(newArr);
};
const mapMessages = useCallback(
  (mapper: (msg: T) => T) => {
    if (!virtuosoRef.current) return;
    virtuosoRef.current.data.map(mapper);
  },
  [virtuosoRef]
);


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

