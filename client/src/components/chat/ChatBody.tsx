/** components/chat/ChatBody.tsx
 *
 * Renders the scrollable list of chat messages using VirtuosoMessageList.
 * - Delegates rendering of message state (pending, failed, aborted, sent) to ChatBubbleMessage.
 * - Handles user vs assistant alignment.
 * - Supports retry for failed messages.
 */

import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
} from "@virtuoso.dev/message-list";
import { ChatBubble, ChatBubbleMessage } from "./ChatBubble";
import type { ChatMessage } from "@/types/chat";

type Props = {
  virtuoso: React.RefObject<any>;
  handleRetry: (msg: ChatMessage) => void;
  messages: ChatMessage[];
};

const MessageContent = ({
  msg,
  isUser,
  handleRetry,
}: {
  msg: ChatMessage;
  isUser: boolean;
  isLastMessage: boolean;
  handleRetry: (msg: ChatMessage) => void;
}) => (
  <div className="flex justify-center">
    <div className="chat-size-default">
      <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
        <ChatBubble key={msg.id} variant={isUser ? "sent" : "received"}>
          <ChatBubbleMessage
            variant={isUser ? "sent" : "received"}
            isLoading={msg.status === "pending"}
            status={msg.status}
            avatarSrc="vibrarian.jpg"
            showAvatar={!isUser && msg.status !== "failed"}
            onRetry={msg.status === "failed" ? () => handleRetry(msg) : undefined}
          >
            {msg.content}
          </ChatBubbleMessage>
        </ChatBubble>
      </div>
    </div>
  </div>
);

export default function ChatBody({ virtuoso, handleRetry }: Props) {
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
              <MessageContent
                msg={data}
                isUser={isUser}
                isLastMessage={isLastMessage}
                handleRetry={()=> handleRetry(data)}
              />
            );
          }}
        />
      </VirtuosoMessageListLicense>
    </div>
  );
}

