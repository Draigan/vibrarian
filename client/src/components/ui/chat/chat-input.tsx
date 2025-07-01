import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
}
export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: ChatInputProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

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

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
  className="flex gap-3 items-center w-full p-3 rounded-b-xl"
    >
      <Textarea
        className={cn(
          "flex-1 min-h-[48px] resize-none px-3 py-2 text-sm rounded-md shadow-sm"
        )}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={2}
      />
      <div className="flex justify-center items-center">
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
            disabled={false}
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

