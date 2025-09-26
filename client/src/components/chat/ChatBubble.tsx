/** components/chat/ChatBubble.tsx
 *
 * Provides reusable building blocks for chat UI.
 * - ChatBubble: container for message row (sent vs received).
 * - ChatBubbleMessage: handles avatar + message state (pending, failed, aborted, sent).
 * - ChatBubbleAvatar: optional avatar image.
 * - ChatBubbleAction / ChatBubbleActionWrapper: hover actions for messages.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button, type ButtonProps } from "../ui/button";
import MessageLoading from "../ui/chat/message-loading";
import { Copy } from "lucide-react";

// ----------------------
// ChatBubble container
// ----------------------
const chatBubbleVariant = cva(
  "flex gap-2 max-w-[100%] items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  },
);

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariant> {}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, layout, children, ...props }, ref) => (
    <div
      className={cn(chatBubbleVariant({ variant, layout, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);
ChatBubble.displayName = "ChatBubble";

// ----------------------
// ChatBubbleAvatar
// ----------------------
interface ChatBubbleAvatarProps {
  src?: string;
  className?: string;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({ src, className }) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt="Avatar" />
  </Avatar>
);

// ----------------------
// ChatBubbleMessage
// ----------------------
const chatBubbleMessageVariants = cva("p-4", {
  variants: {
    variant: {
      received: "text-secondary-foreground rounded-r-lg rounded-tl-lg",
      sent: "bg-accent rounded-tr-lg rounded-l-lg rounded-br-lg",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
  status?: "pending" | "sent" | "failed" | "aborted";
  avatarSrc?: string;
  showAvatar?: boolean;
  onRetry?: () => void;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  (
    {
      className,
      variant,
      layout,
      isLoading = false,
      status,
      avatarSrc,
      showAvatar = true,
      onRetry,
      children,
      ...props
    },
  ) => {
    const [copied, setCopied] = React.useState(false);
    const msgRef = React.useRef<HTMLDivElement>(null);

    async function handleCopy() {
      let text = "";
      if (msgRef.current) {
        text = msgRef.current.innerText;
      }
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }

    return (
      <div className="flex gap-2 items-end flex-col">
        <div className="flex gap-2 items-end w-full">
          {/* Avatar on left for assistant */}
          {variant === "received" && showAvatar && avatarSrc && status !== "failed" && (
            <ChatBubbleAvatar src={avatarSrc} className="self-start" />
          )}

          <div
            className={cn(
              chatBubbleMessageVariants({ variant, layout, className }),
              "break-words max-w-full whitespace-pre-wrap",
              status === "aborted" && "opacity-60 italic",
              status === "failed" &&
                "rounded-3xl bg-red-500/10 text-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)] border border-red-500/40 m-1 p-2"
            )}
            ref={msgRef}
            {...props}
          >
            {isLoading || status === "pending" ? (
              <MessageLoading />
            ) : status === "aborted" ? (
              <span className="text-muted-foreground text-xs">✖ Response aborted</span>
            ) : status === "failed" ? (
              <div className="flex items-center justify-between gap-2 text-xs">
                ⚠ Failed to send
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-3 py-1 rounded-full bg-transparent text-red-500 border border-red-500/40 hover:bg-gray-500/20 shadow-[0_0_6px_rgba(239,68,68,0.4)] transition-all duration-200"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              children
            )}
          </div>
        </div>

        {/* Copy button only for assistant messages */}
        {variant === "received" && status === "sent" && (
          <div className="mt-1 self-start">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="h-6 text-xs px-2 py-0"
            >
              <Copy className="w-3 h-3 mr-1" />
              {copied ? "Copied!" : ""}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ----------------------
// ChatBubbleAction
// ----------------------
type ChatBubbleActionProps = ButtonProps & {
  icon: React.ReactNode;
};

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onClick,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}) => (
  <Button
    variant={variant}
    size={size}
    className={className}
    onClick={onClick}
    {...props}
  >
    {icon}
  </Button>
);

interface ChatBubbleActionWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  className?: string;
}

const ChatBubbleActionWrapper = React.forwardRef<
  HTMLDivElement,
  ChatBubbleActionWrapperProps
>(({ variant, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      variant === "sent"
        ? "-left-1 -translate-x-full flex-row-reverse"
        : "-right-1 translate-x-full",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";

// ----------------------
// Exports
// ----------------------
export {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
};

