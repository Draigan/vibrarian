/** hooks/useVirtuoso.ts
 *
 * Provides helper methods for managing ChatMessage items inside a VirtuosoMessageList.
 * - Tied directly to the ChatMessage type.
 * - Keeps a ref to the Virtuoso instance for programmatic control.
 * - Supports replacing, appending, deleting, and updating messages.
 * - Includes utilities for negative indexing and mapping transformations.
 * - Useful for implementing chat-style UIs with dynamic message updates.
 */

import { useRef, useCallback } from "react";
import type { VirtuosoMessageListMethods } from "@virtuoso.dev/message-list";
import type { ChatMessage } from "@/types/chat";

export function useVirtuoso() {
  // Reference to VirtuosoMessageList instance
  const virtuosoRef = useRef<VirtuosoMessageListMethods<ChatMessage>>(null);

  // Replace all messages
  const replaceMessages = useCallback(
    (
      messages: ChatMessage[],
      opts?: {
        scrollToTop?: boolean;
        scrollToBottom?: boolean;
        initialLocation?: any;
        [key: string]: any;
      }
    ) => {
      let virtuosoOpts: any = { purgeItemSizes: true };

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

  // Utility: resolve negative index
  const getResolvedIndex = useCallback((index: number) => {
    const messages = virtuosoRef.current?.data.get?.() || [];
    let resolvedIndex = index;

    if (index < 0) {
      resolvedIndex = messages.length + index;
    }
    if (resolvedIndex < 0) resolvedIndex = 0;
    if (resolvedIndex >= messages.length) resolvedIndex = messages.length - 1;

    return resolvedIndex;
  }, []);

  // Append messages
  const appendMessages = useCallback(
    (msgs: ChatMessage[], index?: number) => {
      if (!virtuosoRef.current) return;

      if (index !== undefined) {
        const resolved = getResolvedIndex(index);
        virtuosoRef.current.data.append(msgs, () => ({
          index: resolved,
          align: "start",
          behavior: "smooth",
        }));
      } else {
        virtuosoRef.current.data.append(msgs);
      }
    },
    [getResolvedIndex]
  );

  // Delete message at index
  const deleteMessageAt = useCallback((index: number) => {
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    if (!len) return;

    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) return;

    const newMessages = [
      ...messages.slice(0, realIndex),
      ...messages.slice(realIndex + 1),
    ];

    virtuosoRef.current?.data.replace(newMessages);
  }, []);

  // Replace message at index
  const replaceMessageAt = useCallback((index: number, newMessage: ChatMessage) => {
    const messages = virtuosoRef.current?.data.get() || [];
    const len = messages.length;
    if (!len) return;

    const realIndex = index < 0 ? len + index : index;
    if (realIndex < 0 || realIndex >= len) return;

    const newMessages = [...messages];
    newMessages[realIndex] = newMessage;
    virtuosoRef.current?.data.replace(newMessages);
  }, []);

  // Replace "typing dots" placeholder
  const replaceTypingDots = useCallback((index: number, newMessage: ChatMessage) => {
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

  // Update partial fields at index
  const updateMessageAtIndex = (index: number, partial: Partial<ChatMessage>) => {
    if (!virtuosoRef.current) return;
    const arr = virtuosoRef.current.data.get();
    if (index < 0 || index >= arr.length) return;
    const newArr = arr.map((msg, i) =>
      i === index ? { ...msg, ...partial } : msg
    );
    virtuosoRef.current.data.replace(newArr);
  };

  // Map over messages
  const mapMessages = useCallback((mapper: (msg: ChatMessage) => ChatMessage) => {
    if (!virtuosoRef.current) return;
    virtuosoRef.current.data.map(mapper);
  }, []);

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

