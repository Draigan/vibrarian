// Chat.tsx
import { ChatHeader } from "./ChatHeader";
import { ChatFooter } from "./ChatFooter";
import ChatBody from "./ChatBody";
import { useChat } from "@/context/ChatContext";

export function Chat() {
  const {
    virtuosoRef,
    sendMessage,
    handleAbortMessage,
    sessions,
    sessionId,
    switchSession,
    messages,
    assistantIsTyping,
    handleRetry
  } = useChat();

  return (
    <div className="flex w-full h-screen overflow-hidden justify-center">
      <div className="flex flex-col h-full w-full items-center relative">
        <div className="hidden chat:flex">
        <ChatHeader
          loading={false}
          handleSwitchSession={switchSession}
          sessions={sessions}
          sessionId={sessionId}
        />
        </div>

        {/* Body gets bottom padding so messages aren't hidden behind footer */}
        <ChatBody
          virtuoso={virtuosoRef}
          messages={messages}
          handleRetry={handleRetry}
          className="pb-[140px]" // match footer height
        />

        {/* Footer pinned at bottom */}
        <div className="absolute bottom-0 w-full">
          <ChatFooter
            sendMessage={sendMessage}
            assistantIsTyping={assistantIsTyping}
            stop={handleAbortMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;

