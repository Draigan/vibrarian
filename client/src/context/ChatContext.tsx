// src/context/ChatContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useVirtuoso } from "@/hooks/useVirtuoso";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatSession } from "@/hooks/useChatSession";
import type { ChatMessage } from "@/types/chat";

type ChatContextType = {
  virtuosoRef: React.MutableRefObject<any>;
  replaceMessages: (msgs: ChatMessage[]) => void;
  appendMessages: (msgs: ChatMessage[]) => void;
  mapMessages: (fn: (msg: ChatMessage) => ChatMessage) => void;
  sendMessage: (msg: string) => void;
  handleAbortMessage: () => void;
  handleRetry: (msg: ChatMessage) => void;
  sessions: Array<{ id: string; title: string; created_at: string; updated_at?: string }>;
  sessionId: string;
  setSessionId: (id: string) => void;
  switchSession: (id: string) => void;
  messages: ChatMessage[];
  status: string;
  sessionsDataLoading: boolean;
  assistantIsTyping: boolean;
};

const ChatContext = createContext<ChatContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function ChatProvider({ children }: Props) {
  // Manage Virtuoso message list
  const { virtuosoRef, replaceMessages, appendMessages, mapMessages } =
    useVirtuoso();

  // Actions like send/stop
  const { mutate: sendMessage, stop: abortMessage } = useChatActions(
    appendMessages,
    mapMessages
  );

  // Sessions and active sessionId
  const { sessions, sessionId, setSessionId, loading: sessionsDataLoading } =
    useChatSession();

  // Messages for the active session
  const { data: messages = [], status } = useChatMessages(sessionId);

  const allMessages = virtuosoRef.current?.data.get?.() || messages;
  const assistantIsTyping = allMessages.some(
    (m) => m.status === "pending"
  );
  const previousSessionId = useRef<string | null>(null);

  // ----------------------
  // Abort: mark pending assistant messages as aborted
  // ----------------------
  function handleAbortMessage() {
    abortMessage();

    const updated = (virtuosoRef.current?.data.get?.() || messages).map(
      (m) =>
        m.role === "assistant" && m.status === "pending"
          ? { ...m, status: "aborted" as const }
          : m
    );

    replaceMessages(updated);
  }

  // ----------------------
  // Retry: find the user message before the failed assistant
  // ----------------------
  function handleRetry(msg: ChatMessage) {
    const all = virtuosoRef.current?.data.get?.() || messages;
    const idx = all.findIndex((m) => m.id === msg.id);

    if (idx > 0) {
      const prev = all[idx - 1];
      if (prev && prev.role === "user" && prev.content) {
        sendMessage(prev.content); // re-send the original user message
      }
    }
  }

  // ----------------------
  // Switch between sessions
  // ----------------------
  function switchSession(id: string) {
    if (id === "new") {
      setSessionId(crypto.randomUUID());
      return replaceMessages([]);
    }
    setSessionId(id);
  }
  useEffect(() => {
    const virtuosoMessages = virtuosoRef.current?.data.get?.() || [];
    const pendingMessages = virtuosoMessages.filter(
      (m) => m.status === "pending"
    );
    const nonPendingVirtuoso = virtuosoMessages.filter(
      (m) => m.status !== "pending"
    );

    const hasSameMessages =
      nonPendingVirtuoso.length === messages.length &&
      nonPendingVirtuoso.every((msg, index) => msg.id === messages[index]?.id);

    if (
      hasSameMessages &&
      previousSessionId.current === sessionId &&
      pendingMessages.length === 0
    ) {
      return;
    }

    // Sync history without wiping out an in-flight assistant placeholder
    replaceMessages([...messages, ...pendingMessages]);
    previousSessionId.current = sessionId;
  }, [sessionId, messages, replaceMessages]);

  return (
    <ChatContext.Provider
      value={{
        virtuosoRef,
        replaceMessages,
        appendMessages,
        mapMessages,
        sendMessage,
        handleAbortMessage,
        handleRetry,
        sessions,
        sessionId,
        setSessionId,
        switchSession,
        messages,
        status,
        sessionsDataLoading,
        assistantIsTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
