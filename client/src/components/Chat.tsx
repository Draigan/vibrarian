import { useState } from "react";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatBubble, ChatBubbleMessage, ChatBubbleTimestamp, ChatBubbleAvatar } from "./ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "./ui/button";
import ChatHistory from "./ChatHistory";
import { useChatSession } from "@/hooks/useChatSession";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { sessionId } = useChatSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          message: { role: lastMessage.role, content: lastMessage.content },
        }),
      });

      const data = await res.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "(No response)",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between px-4 py-2 border-b">

        <ChatHistory />
        <div>
          Session: {sessionId}
        </div>
        <Button
          variant="outline"
          className="hover:!bg-primary hover:text-primary-foreground border-primary" >
          + New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatMessageList>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              variant={msg.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar src={msg.role === "user"
                ? "/images/user-avatar.png"
                : "vibrarian.jpg"} 
                fallback={msg.role === "user" ? "U" : "A"} />

              <ChatBubbleMessage variant={msg.role === "user" ? "sent" : "received"}>
                {msg.content}
                <ChatBubbleTimestamp timestamp={new Date().toLocaleTimeString()} />
              </ChatBubbleMessage>

            </ChatBubble>
          ))}
        </ChatMessageList>
      </div>

      <div className="border-t">
        <ChatInput
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={() => { }}
        />
      </div>
    </div>
  );
}
