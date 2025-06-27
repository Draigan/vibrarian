import { useState } from "react";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatBubble, ChatBubbleMessage, ChatBubbleTimestamp, ChatBubbleAvatar } from "./ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "./ui/button";
import ChatHistory from "./ChatHistory";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { TriangleAlert } from "lucide-react";

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
    // Optionally, remove the failed status from this message in the cache after resending
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between px-4 py-2 border-b">
        <ChatHistory
          sessions={sessions}
          sessionId={sessionId}
          setSessionId={setSessionId}
          loadSessions={loadSessions}
          loading={loading}
        />
        <div>Session: {sessionId}</div>
        <Button
          variant="outline"
          onClick={() => {
            setSessionId(null);
            loadSessions();
          }}
          className="hover:!bg-primary hover:text-primary-foreground border-primary"
        >
          + New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ChatMessageList>
          {messages.map((msg: Message) => (
            <ChatBubble
              key={msg.id}
              variant={msg.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                src={msg.role === "user" ? "/images/user-avatar.png" : "vibrarian.jpg"}
                fallback={msg.role === "user" ? "U" : "A"}
              />
              <ChatBubbleMessage variant={msg.sender === "user" ? "sent" : "received"}>
                {msg.content}
                <ChatBubbleTimestamp timestamp={new Date(msg.created_at).toLocaleTimeString()} />
                {/* Error UI */}
                {msg.status === "failed" && (
                  <span className="ml-2 flex items-center gap-1 text-red-500 text-xs">
                    <TriangleAlert className="w-4 h-4" />
                    Failed to send
                    <button
                      className="ml-1 underline"
                      onClick={() => handleRetry(msg)}
                      title="Retry"
                    >
                      Retry
                    </button>
                  </span>
                )}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {/* Assistant loading/typing bubble */}
          {assistantIsTyping && (
            <ChatBubble key="assistant-typing" variant="received">
              <ChatBubbleAvatar src="vibrarian.jpg" fallback="A" />
              <ChatBubbleMessage variant="received">
                <span className="flex items-center gap-2">
                  <span className="animate-bounce">...</span>
                </span>
              </ChatBubbleMessage>
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      <div className="border-t">
        <ChatInput
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          handleSubmit={handleSubmit}
          isLoading={assistantIsTyping}
          stop={stop}
        />
      </div>
    </div>
  );
}

