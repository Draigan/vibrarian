import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
} from "@virtuoso.dev/message-list";

interface ChatMessage {
  id: string;
  key: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  status?: "pending";
}

export default function Range() {
  const virtuosoRef = useRef(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingAssistant, setPendingAssistant] = useState<null | { id: string, content: string }>(null);

  // --- NEW: Keep refs to always have latest values ---
  const pendingAssistantRef = useRef(pendingAssistant);
  const messagesRef = useRef(messages);
  useEffect(() => { pendingAssistantRef.current = pendingAssistant; }, [pendingAssistant]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Send user message
  const sendMessage = (text: string) => {
    const id = crypto.randomUUID();
    const userMsg: ChatMessage = {
      id,
      key: id,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setPendingAssistant({
      id: crypto.randomUUID(),
      content: text,
    });
  };

  // Callback always sees latest values
  const handleRangeChanged = useCallback(() => {
    if (!pendingAssistantRef.current) return;

    // Find last user index in latest messages
    const currMessages = messagesRef.current;
    const idx = [...currMessages].reverse().findIndex(m => m.role === "user");
    const userIndex = idx === -1 ? -1 : currMessages.length - 1 - idx;

    if (userIndex !== -1) {
      virtuosoRef.current?.scrollToIndex({
        index: userIndex,
        align: "start",
        behavior: "smooth",
      });
    }

    // Append assistant typing after scroll
    setMessages(prev => [
      ...prev,
      {
        id: pendingAssistantRef.current!.id,
        key: pendingAssistantRef.current!.id,
        role: "assistant",
        content: pendingAssistantRef.current!.content,
        created_at: new Date().toISOString(),
        status: "pending"
      }
    ]);
    setPendingAssistant(null);
  }, []);

  return (
    <VirtuosoMessageListLicense licenseKey={import.meta.env.VITE_VIRTUOSO_LICENSE_KEY || ""}>
      <div>
        <VirtuosoMessageList
          ref={virtuosoRef}
          data={messages}
          rangeChanged={handleRangeChanged}
          itemContent={(_, msg) => (
            <div>
              <b>{msg.role}:</b> {msg.content} {msg.status === "pending" && <em>typing...</em>}
            </div>
          )}
          style={{ height: 400 }}
        />
        <input
          type="text"
          onKeyDown={e => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              sendMessage(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
          placeholder="Type a message and hit Enter"
          style={{ width: "100%", marginTop: 8 }}
        />
      </div>
    </VirtuosoMessageListLicense>
  );
}

