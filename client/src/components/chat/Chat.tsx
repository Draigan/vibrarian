import { ChatHeader } from "./ChatHeader";
import { ChatFooter } from "./ChatFooter";
import ChatBody from "./ChatBody";
import { useChat } from "@/context/ChatContext";

export function Chat() {
  const {
    virtuosoRef,
    replaceMessages,
    sendMessage,
    stop,
    sessions,
    sessionId,
    switchSession,
    messages,
  } = useChat();


  return (

    <div className="flex w-full h-screen overflow-hidden justify-center">
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <ChatHeader
          loading={false}
          handleSwitchSession={switchSession}
          sessions={sessions}
          sessionId={sessionId}
        />

        <ChatBody virtuoso={virtuosoRef} messages={messages} />
        <ChatFooter
          sendMessage={sendMessage}
          assistantIsTyping={false}
          stop={stop}
        />
      </div>
    </div>
  );
}

export default Chat;
