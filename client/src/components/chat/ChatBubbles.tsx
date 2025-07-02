import { ChatBubble, ChatBubbleMessage, ChatBubbleTimestamp, ChatBubbleAvatar } from "../ui/chat/chat-bubble";
import { TriangleAlert } from "lucide-react";

export function ChatBubbles({ messages, assistantIsTyping, handleRetry }: any) {
  return (
    <>
      {messages.map((msg: any) => (
        <ChatBubble
          key={msg.id}
          variant={msg.role === "user" ? "sent" : "received"}
        >
          {/* Avatar only for assistant/AI messages */}
          {msg.role !== "user" && (
            <ChatBubbleAvatar
              src="vibrarian.jpg"
              fallback="A"
              className="self-start"
            />
          )}

          <ChatBubbleMessage variant={msg.role === "user" ? "sent" : "received"}>
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
          <ChatBubbleAvatar src="vibrarian.jpg" fallback="A" className="mr-2" />
          <ChatBubbleMessage variant="received">
            <span className="flex items-center gap-2">
              <span className="animate-bounce">...</span>
            </span>
          </ChatBubbleMessage>
        </ChatBubble>
      )}
    </>
  );
}

