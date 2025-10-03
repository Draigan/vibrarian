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
import { useState, useRef, useEffect } from "react";

type Props = {
  id: string;
  title?: string;
  active: boolean;
  onClick: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  setSidebarLocked?: (locked: boolean) => void;
};

export function ChatHistoryItem({
  id,
  title,
  active,
  onClick,
  onRename,
  onDelete,
  setSidebarLocked,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title || "Untitled Chat");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(title || "Untitled Chat");
    setSidebarLocked?.(true);
  };

  const handleSave = () => {
    if (editValue.trim() !== "") {
      onRename?.(id, editValue.trim());
    }
    setIsEditing(false);
    setOpen(false);
    setSidebarLocked?.(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setOpen(false);
    setSidebarLocked?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between w-full px-3 py-2 text-sm bg-accent rounded-full">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-sm"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={handleSave}
          >
            <Check size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={handleCancel}
          >
            <X size={12} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent hover:rounded-full ${
        active ? "bg-accent font-medium" : ""
      }`}
    >
      {/* Left: Chat title + icon */}
      <button
        onClick={onClick}
        className="flex items-center gap-2 flex-1 text-left truncate"
      >
        <span className="truncate">{title || "Untitled Chat"}</span>
      </button>

      {/* Right: Menu trigger */}
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
              onClick={handleRenameClick}
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
    </div>
  );
}

