import { useState, useRef, useEffect } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { ChatHeader } from "./ChatHeader";
import { ChatFooter } from "./ChatFooter";
import Test from "./Test";
import { useVirtuoso } from "@/hooks/useVirtuoso";

interface Message {
  key: string;
  content: string;
  role: "user" | "assistant";
}

export function Chat() {
  const { virtuosoRef, replaceMessages, appendMessages, deleteMessageAt, replaceMessageAt,replaceLastPendingAssistant, scrollLastUserMessageToTop, scrollToMessageKey } = useVirtuoso<Message>();
  const { mutate: sendMessage, status, stop } = useChatActions(appendMessages, replaceMessages, deleteMessageAt, replaceMessageAt, replaceLastPendingAssistant, scrollLastUserMessageToTop, scrollToMessageKey);
  const assistantIsTyping = status === "pending";

console.log("Virtuoso current messages:", virtuosoRef.current?.data.get());

  return (
    <div className="flex w-full h-full justify-center">
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        <ChatHeader
          replaceMessages={replaceMessages}
        />
        <Test virtuoso={virtuosoRef}  />
        <div className="h-34 bg-card" />
        <div className="absolute bottom-0 ">
          <ChatFooter
            sendMessage={sendMessage}
            assistantIsTyping={assistantIsTyping}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;

