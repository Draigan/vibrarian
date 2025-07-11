import * as React from "react";
import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
} from "@virtuoso.dev/message-list";
import { randTextRange, randPhrase } from '@ngneat/falso';
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "../ui/chat/chat-bubble";

import ReactMarkdown from "react-markdown";
import { TriangleAlert } from "lucide-react";
import { ChatStreamingTextChunk } from "./ChatStreamingTextChunk";
interface Message {
  key: string;
  text: string;
  user: "me" | "other";
}

let idCounter = 0;

const ItemContent = ({
  data, index, context
}) => {
  const messages = context;
  const isLast = index === messages.length - 1;
  const isUser = data.role === "user";
  const msg = data;
  return (
    <div className="flex justify-center">
      <div className="chat-size-default">
        <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
          <ChatBubble
            key={msg.id}
            variant={isUser ? "sent" : "received"}
          >
            {!isUser && (
              <ChatBubbleAvatar
                src="vibrarian.jpg"
                fallback="A"
                className="self-start"
              />
            )}
            <ChatBubbleMessage
              variant={isUser ? "sent" : "received"}
              isLoading={msg.status === "pending"} 
            >
              <div className="chat-markdown">
                {msg.content} 
              </div>
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
};

export default function Test({ virtuoso, messages }) {

  return (
    <div
      className="w-[760px]"
      style={{
        display: "flex",
        height: "750px",
        flexDirection: "column",
      }}
    >
      <VirtuosoMessageListLicense licenseKey="">
        <VirtuosoMessageList<Message, null>
          ref={virtuoso}
          context={messages}
          style={{ flex: 1 }}
          computeItemKey={({ data }) => data.key}
          ItemContent={({ data, index }) => (
            <ItemContent data={data} index={index} context={messages} />
          )}
        />
      </VirtuosoMessageListLicense>

    </div>
  );
}
