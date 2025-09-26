import * as React from "react";
import ChatTextArea from "./ChatTextArea";
import { cn } from "@/lib/utils";
import { ArrowUp, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext"; // ✅ import context

interface ChatInputProps {
  sendMessage: any;
  isLoading: boolean;
  stop: () => void;
}

export default function ChatInput({
  sendMessage,
  isLoading,
  stop,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const { sessionId } = useChat(); // ✅ watch sessionId

  // focus on mount + whenever sessionId changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [sessionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && isLoading) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading || input.trim().length === 0) return;
    sendMessage(input);
    setInput("");
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleOnSubmit}
      className="flex flex-col w-full p-3 gap-0"
    >
      <ChatTextArea
        ref={inputRef} // ✅ hook up ref
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask Vibrarian"
        rows={1}
      />
      <div className="flex justify-end gap-0 items-center">
        {!isLoading && (
          <button
            type="submit"
            disabled={isLoading || input.trim().length === 0}
            className={cn(
              "bg-primary text-black p-2 rounded-full transition shadow",
              (isLoading || input.trim().length === 0) && "opacity-50"
            )}
            aria-label="Send"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {isLoading && (
          <button
            type="button"
            className="bg-primary text-black p-2 rounded-full transition shadow"
            aria-label="Stop"
            onClick={stop}
          >
            <div className="w-5 h-5 flex justify-center items-center">
              <Square className="w-4 h-4" fill="currentColor" />
            </div>
          </button>
        )}
      </div>
    </form>
  );
}

