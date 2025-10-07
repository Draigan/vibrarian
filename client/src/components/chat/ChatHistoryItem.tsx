/** components/chat/ChatHistoryItem.tsx
 *
 * Represents a single chat session row inside ChatHistory.
 * - Shows title or "Untitled Chat".
 * - Highlights when active.
 * - Handles click to switch session.
 * - Shows a 3-dots hover dropdown menu (using shadcn/ui).
 * - Prevents sidebar collapsing when menu is open.
 */

import { MoreHorizontal, Pencil, Trash, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface Props {
  id: string;
  title?: string;
  active: boolean;
  isRenaming?: boolean;
  onClick: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  setSidebarLocked?: (locked: boolean) => void;
  onStartRename?: (id: string) => void;
  onCancelRename?: () => void;
}

export function ChatHistoryItem({
  id,
  title,
  active,
  isRenaming = false,
  onClick,
  onRename,
  onDelete,
  setSidebarLocked,
  onStartRename,
  onCancelRename,
}: Props) {
  const [open, setOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(title || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setRenameValue(title || "");
  }, [title]);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue.trim() !== title) {
      onRename?.(id, renameValue.trim());
    } else {
      onCancelRename?.();
    }
  };

  const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancelRename?.();
    }
  };

  return (
    <div
      className={`relative group flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent hover:rounded-full ${active ? "bg-accent font-medium" : ""
        }`}

      onClick={onClick}
    >
      {/* Left: Chat title or rename input */}
      <div className="flex items-center gap-2 flex-1 h-6">
        {isRenaming ? (
          <div className="flex items-center gap-1 w-full">
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              className="h-full text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 w-full"
              maxLength={255}
              onClick={(e) => e.stopPropagation()}
              style={{ lineHeight: '1.5rem' }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 opacity-70 hover:opacity-100 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleRenameSubmit();
              }}
            >
              <Check size={10} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 opacity-70 hover:opacity-100 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onCancelRename?.();
              }}
            >
              <X size={10} />
            </Button>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 w-full text-left truncate"
          >
            <span className="truncate" style={{ lineHeight: '1.5rem' }}>{title || "Untitled Chat"}</span>
          </button>
        )}
      </div>

      {/* Right: Menu trigger (only show when not renaming) */}
      {!isRenaming && (
        <div
          className={`
            ml-2 transition-opacity duration-200
            ${open ? "opacity-100" : "opacity-0 group-hover:opacity-100 "}
          `}
        >
          <DropdownMenu
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              setSidebarLocked?.(val);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={4}>
              <DropdownMenuItem
                onClick={() => onStartRename?.(id)}
                className="flex items-center gap-2"
              >
                <Pencil size={14} /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(id)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <Trash size={14} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
