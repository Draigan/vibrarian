import { useRef } from "react";
import { forwardRef, HTMLAttributes } from "react";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAvatar,
} from "../ui/chat/chat-bubble";
import { TriangleAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Virtuoso } from "react-virtuoso";
import type { VirtuosoHandle } from "react-virtuoso";

type Message = {
  id: string;
  role: "user" | "assistant" | "spacer";
  sender: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  status?: "pending" | "failed" | "sent";
};

interface ChatMainProps {
  messages: Message[];
  assistantIsTyping: boolean;
  handleRetry: (msg: Message) => void;
  virtuosoRef: React.RefObject<VirtuosoHandle>;
}

const ListContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => (
    <div
      ref={ref}
      {...props}
      className="flex flex-col gap-10 px-4 py-8"
    />
  )
);

export function ChatMain({
  messages,
  assistantIsTyping,
  handleRetry,
  virtuosoRef,
}: ChatMainProps) {
  // Build items with spacer
  const items = assistantIsTyping
    ? [
        ...messages,
        {
          id: "typing",
          role: "assistant",
          sender: "assistant",
          content: "",
          created_at: new Date().toISOString(),
          status: "pending",
        },
        // Spacer
        {
          id: "spacer",
          role: "spacer",
          sender: "system",
          content: "",
          created_at: "",
          status: "sent",
        },
      ]
    : [
        ...messages,
        // Spacer
        {
          id: "spacer",
          role: "spacer",
          sender: "system",
          content: "",
          created_at: "",
          status: "sent",
        },
      ];

  // For quick demo/testing: add button to scroll 2nd message to top
  const handleScrollToSecond = () => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: messages.length -1,
        align: "start",
        behavior: "auto",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background w-full h-full relative">
      {/* Floating Button (remove in prod if not wanted) */}
      <button
        className="absolute top-2 right-2 z-50 p-2 rounded-xl bg-primary text-primary-foreground shadow-lg border border-primary/30"
        onClick={handleScrollToSecond}
        type="button"
      >
        Scroll to 2nd
      </button>
      <Virtuoso
        ref={virtuosoRef}
        style={{ width: "100%", height: "100%", padding: 0 }}
        totalCount={items.length}
        followOutput={true}
        components={{
          List: ListContainer,
        }}
        itemContent={(i) => {
          const msg = items[i];
          if (msg.role === "spacer") {
            // Adjust the height as needed for your layout!
            return <div style={{ height: 800 }} />;
          }
          const isUser = msg.role === "user";
          return (
            <div className="flex justify-center">
              <div className="chat-size-default">
                <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <ChatBubble
                    key={msg.id}
                    variant={isUser ? "sent" : "received"}
                  >
                    {!isUser && (
                      <ChatBubbleAvatar
                        src="vibrarian.jpg"
                        fallback="A"
                        className="self-start"
                      />
                    )}
                    <ChatBubbleMessage
                      variant={isUser ? "sent" : "received"}
                      isLoading={msg.status === "pending" && msg.id === "typing"}
                    >
                      <div className="chat-markdown">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
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
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

export default ChatMain;

