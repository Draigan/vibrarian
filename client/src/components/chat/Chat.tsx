import { useState } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { ChatHeader } from "./ChatHeader";
import { ChatMain } from "./ChatMain";
import { ChatFooter } from "./ChatFooter";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleRetry = (msg: Message) => {
    sendMessage(msg.content);
  };

  return (
    <div className="flex w-full h-full justify-center">
    <div className="flex flex-col h-full w-full border-1 max-w-[1600px]">
      <ChatHeader
        sessions={sessions}
        sessionId={sessionId}
        setSessionId={setSessionId}
        loadSessions={loadSessions}
        loading={loading}
      />
      <ChatMain
        messages={messages}
        assistantIsTyping={assistantIsTyping}
        handleRetry={handleRetry}
      />
      <ChatFooter
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        assistantIsTyping={assistantIsTyping}
        stop={stop}
      />
    </div>
    </div>
  );
}
