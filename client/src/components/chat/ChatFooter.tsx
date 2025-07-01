import { ChatInput } from "@/components/ui/chat/chat-input";

export function ChatFooter({ input, setInput, handleSubmit, assistantIsTyping, stop }: any) {
  return (
<div className="border rounded-b-2xl bg-accent">
      <ChatInput
        input={input}
        handleInputChange={(e) => setInput(e.target.value)}
        handleSubmit={handleSubmit}
        isLoading={assistantIsTyping}
        stop={stop}
      />
    </div>
  );
}
