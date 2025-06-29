import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatBubbles } from "./ChatBubbles";

export function ChatMain({ messages, assistantIsTyping, handleRetry }: any) {
  return (
    <div className="flex-1 overflow-y-auto">
      <ChatMessageList>
        <ChatBubbles
          messages={messages}
          assistantIsTyping={assistantIsTyping}
          handleRetry={handleRetry}
        />
      </ChatMessageList>
    </div>
  );
}
