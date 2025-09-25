// src/context/ChatContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useVirtuoso } from "@/hooks/useVirtuoso";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatSession } from "@/hooks/useChatSession";
import type { ChatMessage } from "@/types/chat";

type ChatContextType = {
  virtuosoRef: any;
  replaceMessages: (msgs: ChatMessage[]) => void;
  appendMessages: (msgs: ChatMessage[]) => void;
  mapMessages: (fn: (msg: ChatMessage) => ChatMessage) => void;
  sendMessage: (msg: string) => void;
  stop: () => void;
  sessions: any[];
  sessionId: string;
  setSessionId: (id: string) => void;
  switchSession: (id: string) => void;
  messages: ChatMessage[];
  status: string;
  sessionsDataLoading: boolean;
};

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  // Manage Virtuoso message list
  const { virtuosoRef, replaceMessages, appendMessages, mapMessages } =
    useVirtuoso<ChatMessage>();

  // Actions like send/stop
  const { mutate: sendMessage, stop } = useChatActions(
    appendMessages,
    mapMessages
  );

  // Sessions and active sessionId
  const { sessions, sessionId, setSessionId, loading: sessionsDataLoading } = useChatSession();

  // Messages for the active session
  const { data: messages = [], status, isFetching } = useChatMessages(sessionId);
  const assistantIsTyping = messages.some((m) => m.status === "pending");

  // Switch between sessions
  function switchSession(id: string) {
    if (id === "new") {
     return replaceMessages([]); 
    } 
    replaceMessages(messages);
    setSessionId(id);
  }

  return (
    <ChatContext.Provider
      value={{
        virtuosoRef,
        replaceMessages,
        appendMessages,
        mapMessages,
        sendMessage,
        stop,
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
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

