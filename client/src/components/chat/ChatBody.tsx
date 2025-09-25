import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
} from "@virtuoso.dev/message-list";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "./ChatBubble";
import { TriangleAlert } from "lucide-react";
import type { ChatMessage } from "@/types/chat";


type Props = {
  virtuoso: React.RefObject<any>;
  handleRetry: (msg: ChatMessage) => void;
  messages: ChatMessage[] | [];
}

const ItemContent = ({
  msg,
  isUser,
  handleRetry,
}: {
  msg: ChatMessage;
  isUser: boolean;
  isLastMessage: boolean;
  handleRetry: (msg: ChatMessage) => void;
}) => (
  <div className="flex justify-center ">
    <div className="chat-size-default">
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
        <ChatBubble key={msg.id} variant={isUser ? "sent" : "received"}>
          {!isUser && (
            <ChatBubbleAvatar
              src="vibrarian.jpg"
              className="self-start"
            />
          )}
          <ChatBubbleMessage
            variant={isUser ? "sent" : "received"}
            isLoading={msg.status === "pending"}
          >
            {msg.content}

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

export default function ChatBody(
  {
    virtuoso,
    handleRetry,
  }: Props
) {
  const messages: ChatMessage[] = virtuoso.current?.data.get() || [];
  return (
    <div
      className="w-full px-3 chat:px-0 chat:w-[760px]"
      style={{
        display: "flex",
        height: "calc(100vh - 205px)",
        flexDirection: "column",
      }}
    >
      <VirtuosoMessageListLicense licenseKey="">
        <VirtuosoMessageList<ChatMessage, null>
          ref={virtuoso}
          style={{ flex: 1 }}
          computeItemKey={({ data }) => data.key ?? data.id}
          ItemContent={({ data }) => {
            const isUser = data.role === "user";
            const lastId = messages[messages.length - 1]?.id;
            const isLastMessage = data.id === lastId;
            return (
              <ItemContent
                msg={data}
                isUser={isUser}
                isLastMessage={isLastMessage}
                handleRetry={handleRetry}
              />
            );
          }}
        />
      </VirtuosoMessageListLicense>
    </div>
  );
}

