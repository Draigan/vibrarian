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
import { DeleteSessionDialog } from "./DeleteSessionDialog";
import { useChatSessionActions } from "@/hooks/useChatSessionActions";

type Props = {
  collapsed: boolean;
  setUserMenuOpen: (open: boolean) => void;
  setThemeDropdownOpen: (open: boolean) => void;
};

export function ChatHistory({ collapsed, setUserMenuOpen, setThemeDropdownOpen }: Props) {
  const {
    sessions,
    sessionId,
    sessionsDataLoading: loading,
    switchSession,
  } = useChat();

  const { deleteSession, renameSession, isDeleting } = useChatSessionActions();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    sessionId: string;
    chatTitle: string;
  }>({
    open: false,
    sessionId: "",
    chatTitle: "",
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
            onRename={(id, newTitle) => {
              renameSession({ sessionId: id, title: newTitle });
            }}
            onDelete={(id) => {
              const session = sessions.find((sess) => sess.id === id);
              setDeleteDialog({
                open: true,
                sessionId: id,
                chatTitle: session?.title || "Untitled Chat",
              });
            }}
            setSidebarLocked={(locked) => {
              // When chat history dropdown is open, we lock the sidebar by setting user menu state
              setUserMenuOpen(locked);
            }}
          />
        ))}

        {!loading && sessions.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            No chats yet
          </div>
        )}
      </div>

      <DeleteSessionDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={() => deleteSession(deleteDialog.sessionId)}
        chatTitle={deleteDialog.chatTitle}
      />
    </div>
  );
}

