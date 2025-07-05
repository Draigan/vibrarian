import { useState, useRef } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { ChatHeader } from "./ChatHeader";
import { ChatMain } from "./ChatMain";
import { ChatFooter } from "./ChatFooter";
import type { VirtuosoHandle } from "react-virtuoso";

type Message = {
  id: string;
  role: "user" | "assistant";
  sender: "user" | "assistant";
  content: string;
  created_at: string;
  status?: "pending" | "failed" | "sent";
};

export function Chat() {
  const [input, setInput] = useState("");
  const { sessions, sessionId, setSessionId, loadSessions, loading } = useChatSession();
  const { mutate: sendMessage, status, stop } = useSendMessage(sessionId);
  const assistantIsTyping = status === "pending";
  const { data: messages = [] } = useChatMessages(sessionId);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);

    // Scroll so last user message aligns with top
    setTimeout(() => {
      if (virtuosoRef.current) {
        // Find the index of the last user message in messages
        const lastUserIdx = messages.map(m => m.role).lastIndexOf("user");
          virtuosoRef.current.scrollToIndex({
            index: lastUserIdx,
            align: "start",
            behavior: "auto",
          });
      }
    }, 1000);

    setInput("");
  };

  const handleRetry = (msg: Message) => {
    sendMessage(msg.content);
  };

  return (
    <div className="flex w-full h-full justify-center">
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <ChatHeader
          sessions={sessions}
          sessionId={sessionId}
          setSessionId={setSessionId}
          loadSessions={loadSessions}
          loading={loading}
        />
        <ChatMain
          virtuosoRef={virtuosoRef}
          messages={messages}
          assistantIsTyping={assistantIsTyping}
          handleRetry={handleRetry}
        />
        <div className="h-37 bg-card" />
        <div className="absolute bottom-0 ">
          <ChatFooter
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            assistantIsTyping={assistantIsTyping}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;

