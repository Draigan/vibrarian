import { MessageCircle } from "lucide-react";
import { useChat } from "@/context/ChatContext";

type Props = {
  collapsed: boolean;
};


export function ChatSideHistory({ collapsed }: Props) {
  const { sessions, sessionId, sessionsDataLoading: loading, switchSession  } = useChat();

  return (
    <div
      className={`
        flex flex-col h-full
        transition-all duration-300
        ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
      style={{ transitionProperty: "opacity, transform" }}
    >
      {/* Title - fixed at the top */}
      <div className="px-3 py-2 border-b border-border text-sm font-semibold shrink-0">
        Chats
      </div>

      {/* Scrollable session list */}
      <div className="h-full overflow-y-auto">
        {loading && (
          <div className="px-3 py-2 text-xs text-muted-foreground">Loading…</div>
        )}

        {sessions.map((s: { id: string; title?: string }) => (
          <button
            key={s.id}
            onClick={() => switchSession(s.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent ${
              s.id === sessionId ? "bg-accent font-medium" : ""
            }`}
          >
            <MessageCircle size={16} />
            <span className="truncate">{s.title || "Untitled Chat"}</span>
          </button>
        ))}

        {!loading && sessions.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No chats yet
          </div>
        )}
      </div>
    </div>
  );
}

