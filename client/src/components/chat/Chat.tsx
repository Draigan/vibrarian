import { useState, useRef, useEffect } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { ChatHeader } from "./ChatHeader";
import { ChatMain } from "./ChatMain";
import { ChatFooter } from "./ChatFooter";
import type { VirtuosoHandle } from "react-virtuoso";
import Test from "./Test";
import { useVirtuoso } from "@/hooks/useVirtuoso";

interface Message {
  key: string;
  content: string;
  role: "user" | "assistant";
}

export function Chat() {
  const { virtuosoRef, replaceMessages, appendMessages, deleteMessageAt, replaceMessageAt,replaceLastPendingAssistant } = useVirtuoso<Message>();
  const { sessions, sessionId, setSessionId, loadSessions, loading } = useChatSession();
  const { mutate: sendMessage, status, stop } = useChatActions(sessionId, appendMessages, replaceMessages, deleteMessageAt, replaceMessageAt, replaceLastPendingAssistant);
  const assistantIsTyping = status === "pending";
  const { data: messages = []} = useChatMessages(sessionId);



  return (
    <div className="flex w-full h-full justify-center">
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <ChatHeader
          virtuoso={virtuosoRef}
          sessions={sessions}
          sessionId={sessionId}
          setSessionId={setSessionId}
          loadSessions={loadSessions}
          loading={loading}
        />
        <Test virtuoso={virtuosoRef} messages={messages} />
        <div className="h-34 bg-card" />
        <div className="absolute bottom-0 ">
          <ChatFooter
            sendMessage={sendMessage}
            assistantIsTyping={assistantIsTyping}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;

