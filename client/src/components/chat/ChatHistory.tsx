/** components/chat/ChatHistory.tsx
 *
 * Sidebar list of chat sessions.
 * - Displays a scrollable list of ChatHistoryItem components.
 * - Shows loading state and empty state.
 * - Collapses/expands smoothly based on sidebar state.
 */

import { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { RenameSessionDialog } from "./RenameSessionDialog";
import { useChatSessionActions } from "@/hooks/useChatSessionActions";

type Props = {
  collapsed: boolean;
  setSidebarLocked: (locked: boolean) => void;
};

export function ChatHistory({ collapsed, setSidebarLocked }: Props) {
  const {
    sessions,
    sessionId,
    sessionsDataLoading: loading,
    switchSession,
  } = useChat();

  const { deleteSession, renameSession, isRenaming } = useChatSessionActions();
  
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    sessionId: string;
    currentTitle: string;
  }>({
    open: false,
    sessionId: "",
    currentTitle: "",
  });

  return (
    <div
      className={`
        flex flex-col h-full
        transition-all duration-300
        ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
      style={{ transitionProperty: "opacity, transform" }}
    >
      {/* Title */}
      <div className="px-3 py-2 border-b border-border text-sm font-semibold shrink-0">
        Chats
      </div>

      {/* Scrollable list */}
      <div className="h-full overflow-y-auto">
        {loading && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Loading…
          </div>
        )}

        {sessions.map((s: { id: string; title?: string }) => (
          <ChatHistoryItem
            key={s.id}
            id={s.id}
            title={s.title}
            active={s.id === sessionId}
            onClick={() => switchSession(s.id)}
            onRename={(id) => {
              const session = sessions.find((sess) => sess.id === id);
              setRenameDialog({
                open: true,
                sessionId: id,
                currentTitle: session?.title || "",
              });
            }}
            onDelete={(id) => {
              if (window.confirm("Are you sure you want to delete this chat session? This action cannot be undone.")) {
                deleteSession(id);
              }
            }}
            setSidebarLocked={setSidebarLocked}
          />
        ))}

        {!loading && sessions.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No chats yet
          </div>
        )}
      </div>

      <RenameSessionDialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog(prev => ({ ...prev, open }))}
        currentTitle={renameDialog.currentTitle}
        onConfirm={(newTitle) => {
          renameSession({ sessionId: renameDialog.sessionId, title: newTitle });
          setRenameDialog(prev => ({ ...prev, open: false }));
        }}
        isLoading={isRenaming}
      />
    </div>
  );
}

