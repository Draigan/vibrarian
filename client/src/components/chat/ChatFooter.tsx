import ChatInput from "./ChatInput";

interface ChatFooterProps {
  sendMessage: any;
  assistantIsTyping: boolean;
  stop: () => void;
}

export function ChatFooter({
  sendMessage,
  assistantIsTyping,
  stop,
}: ChatFooterProps) {
  return (
    <div className="w-full px-3 chat:px-0">
      <div className="w-full chat:w-[760px] mx-auto min-h-[108px] rounded-4xl bg-accent shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.18)]">
        <ChatInput
          sendMessage={sendMessage}
          isLoading={assistantIsTyping}
          stop={stop}
        />
      </div>
      <div className="w-full chat:w-[760px] mx-auto text-sm opacity-50 py-3 text-center">
        Vibrarian can make mistakes
      </div>
    </div>
  );
}

