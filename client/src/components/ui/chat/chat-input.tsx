import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex gap-2 items-end w-full"
    >
      <Textarea
        className={cn(
          "flex-1 min-h-[50px] resize-none px-3 py-2 text-sm border rounded-md",
          isLoading && "opacity-10"
        )}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={2}
      />

      <button
        type="submit"
        disabled={isLoading || input.trim().length === 0}
        className={cn("bg-primary text-black px-2 py-2 rounded-full", isLoading || input.trim().length === 0 && "opacity-50")}
        aria-label="Send"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </form>
  );
}

