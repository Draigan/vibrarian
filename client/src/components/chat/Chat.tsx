import { useChatActions } from "@/hooks/useChatActions";
import { ChatHeader } from "./ChatHeader";
import { ChatFooter } from "./ChatFooter";
import { useVirtuoso } from "@/hooks/useVirtuoso";
import ChatBody from "./ChatBody";
import { useState } from "react";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatSession } from "@/hooks/useChatSession";
import { replace } from "react-router-dom";

interface Message {
  key: string;
  content: string;
  role: "user" | "assistant";
  status: "pending" | "sent" | "error";
}

export function Chat() {
  const { virtuosoRef, replaceMessages, appendMessages, replaceTypingDots, replaceMessageAt, updateMessageAtIndex, mapMessages } = useVirtuoso<Message>();
  const { mutate: sendMessage, status, stop } = useChatActions(appendMessages, replaceMessageAt, replaceTypingDots, mapMessages);

  const { sessions, sessionId, setSessionId, loading } = useChatSession();

  // Get all messages for a session
  const { data: messages = [], status: isMessagesLoading } = useChatMessages(sessionId);

  function handleSwitchSession(sessionId: string) {
    setSessionId(sessionId)
    if (sessionId === "new") return;
    replaceMessages(messages);
  }

  return (
    <div className="flex w-full h-full justify-center">
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <ChatHeader
          handleSwitchSession={handleSwitchSession}
          sessions={sessions}
          sessionId={sessionId}
        />
        <ChatBody virtuoso={virtuosoRef} />
        <div className="h-34 bg-card" />
        <div className="absolute bottom-0 ">
          <ChatFooter
            sendMessage={sendMessage}
            assistantIsTyping={status === "pending"}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;

