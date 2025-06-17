//import * as React from "react";
//import { Textarea } from "@/components/ui/textarea";
//import { cn } from "@/lib/utils";
//
//interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{}
//
//const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
//  ({ className, ...props }, ref) => (
//    <Textarea
//      autoComplete="off"
//      ref={ref}
//      name="message"
//      className={cn(
//        "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
//        className,
//      )}
//      {...props}
//    />
//  ),
//);
//ChatInput.displayName = "ChatInput";
//
//export { ChatInput };

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end w-full">
      <Textarea
        className={cn(
          "flex-1 min-h-[50px] resize-none px-3 py-2 text-sm border rounded-md",
          isLoading && "opacity-50"
        )}
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message..."
        rows={2}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        {isLoading ? "..." : "Send"}
      </button>
      {isLoading && (
        <button
          type="button"
          onClick={stop}
          className="text-sm text-red-500 ml-2"
        >
          Stop
        </button>
      )}
    </form>
  );
}
