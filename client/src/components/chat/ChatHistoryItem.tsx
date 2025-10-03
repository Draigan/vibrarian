/** components/chat/ChatHistoryItem.tsx
 *
 * Represents a single chat session row inside ChatHistory.
 * - Shows title or "Untitled Chat".
 * - Highlights when active.
 * - Handles click to switch session.
 * - Shows a 3-dots hover dropdown menu (using shadcn/ui).
 * - Prevents sidebar collapsing when menu is open.
 */

import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

type Props = {
  id: string;
  title?: string;
  active: boolean;
  onClick: () => void;
  onRename?: (id: string) => void;
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
              onClick={() => onRename?.(id)}
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

