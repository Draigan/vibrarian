//import { TriangleAlert } from "lucide-react";
//
//type Message = {
//  id: string;
//  role: "user" | "assistant";
//  sender: "user" | "assistant";
//  content: string;
//  created_at: string;
//  status?: "pending" | "failed" | "sent";
//};
//
//interface ChatBubbleProps {
//  message: Message;
//  handleRetry: (msg: Message) => void;
//}
//
//const AVATAR_USER = "/images/user-avatar.png";
//const AVATAR_ASSISTANT = "/vibrarian.jpg";
//
//export function ChatBubble({ message, handleRetry }: ChatBubbleProps) {
//  const isUser = message.role === "user";
//
//  return (
//    <div className={`flex items-end gap-2 w-full ${isUser ? "justify-end" : "justify-start"}`}>
//      {/* Avatar (assistant only, left side) */}
//      {!isUser && (
//        <img
//          src={AVATAR_ASSISTANT}
//          alt="AI"
//          className="w-8 h-8 rounded-full border border-primary bg-background"
//        />
//      )}
//
//      {/* Bubble */}
//      <div
//        className={`
//          max-w-[70%] px-4 py-3 rounded-2xl shadow
//          ${isUser
//            ? "bg-primary text-primary-foreground self-end"
//            : "bg-card text-foreground self-start"}
//          relative
//        `}
//      >
//        <div className="whitespace-pre-line">
//
//          {message.content}
//        </div>
//        <div className="text-xs text-muted-foreground mt-2 text-right">
//          {new Date(message.created_at).toLocaleTimeString()}
//        </div>
//        {/* Error/retry UI */}
//        {message.status === "failed" && (
//          <span className="ml-2 flex items-center gap-1 text-red-500 text-xs">
//            <TriangleAlert className="w-4 h-4" />
//            Failed to send
//            <button
//              className="ml-1 underline"
//              onClick={() => handleRetry(message)}
//              title="Retry"
//            >
//              Retry
//            </button>
//          </span>
//        )}
//      </div>
//
//      {/* Avatar (user, right side) */}
//      {isUser && (
//        <img
//          src={AVATAR_USER}
//          alt="You"
//          className="w-8 h-8 rounded-full border border-primary bg-background"
//        />
//      )}
//    </div>
//  );
//}
//
//export default ChatBubble;
