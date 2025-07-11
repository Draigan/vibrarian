import ChatInput from "./ChatInput";

interface ChatFooterProps {
  input: string;
  setInput: (val: string) => void;
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
    <div className="w-full flex  justify-center items-center flex-col">
      <div
        className="
          w-[762px] h-[108px] rounded-4xl bg-accent
          shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.18)] 
        "
      >
        <ChatInput
          sendMessage={sendMessage}
          isLoading={assistantIsTyping}
          stop={stop}
        />
      </div>
      <div className="text-sm opacity-50 py-3"> Vibrarian can make mistakes </div>
    </div>
  );
}
export default ChatFooter;

