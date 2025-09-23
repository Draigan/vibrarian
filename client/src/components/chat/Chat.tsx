import { useChatActions } from "@/hooks/useChatActions";
import { ChatHeader } from "./ChatHeader";
import { ChatFooter } from "./ChatFooter";
import { useVirtuoso } from "@/hooks/useVirtuoso";
import ChatBody from "./ChatBody";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatSession } from "@/hooks/useChatSession";

interface Message {
  key: string;
  content: string;
  role: "user" | "assistant";
  status: "pending" | "sent" | "error";
}

export function Chat() {
  const { virtuosoRef, replaceMessages, appendMessages, replaceTypingDots, replaceMessageAt, mapMessages } = useVirtuoso<Message>();
  const { mutate: sendMessage, stop } = useChatActions(appendMessages, replaceMessageAt, replaceTypingDots, mapMessages);

  const { sessions, sessionId, setSessionId } = useChatSession();

  // Get all messages for a session
  const { data: messages = [], status: isMessagesLoading } = useChatMessages(sessionId);

  function handleSwitchSession(sessionId: string) {
    setSessionId(sessionId)
    if (sessionId === "new") {
      replaceMessages([]);
      return;
    };
    replaceMessages(messages);
  }

  return (
    <div className="flex w-full h-screen overflow-hidden justify-center">
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <ChatHeader
          handleSwitchSession={handleSwitchSession}
          sessions={sessions}
          sessionId={sessionId}
        />
        <ChatBody virtuoso={virtuosoRef} />
        <ChatFooter
          sendMessage={sendMessage}
          assistantIsTyping={isMessagesLoading === "pending"}
          stop={stop}
        />
      </div>
    </div>
  );
}

export default Chat;

