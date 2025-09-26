/** components/transcript/TranscriptBlock.tsx
 *
 * Renders a single transcript block with speaker info, timestamp, and editable text.
 * - Shows edit/copy actions only when hovering over the block.
 * - Supports editing mode with save/cancel handlers.
 * - Displays a "Copied!" message when text is copied.
 * - Adds a colored border on the left to visually distinguish the speaker.
 */

import { TranscriptBlockActions } from "./TranscriptBlockActions";
import TranscriptBlockText from "./TranscriptBlockText";
import { useState } from "react";
import type { TranscriptBlock } from "@/types/transcript";

interface TranscriptBlockProps {
  block: TranscriptBlock;
  color: string;
  editing: boolean;
  draft: string;
  onStartEdit: () => void;
  onChangeDraft: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function TranscriptBlock({
  block,
  color,
  editing,
  draft,
  onStartEdit,
  onChangeDraft,
  onSave,
  onCancel,
}: TranscriptBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (draft) {
      navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div
      className="max-w-275 rounded-lg p-4 bg-accent mb-3 shadow-sm flex flex-col gap-2 relative group"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color }}>
            {block.speaker}
          </span>
          <span className="opacity-60">Start: {block.start}</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <TranscriptBlockActions onCopy={handleCopy} onEdit={onStartEdit} />
        </div>
      </div>
      <TranscriptBlockText
        value={draft}
        editing={editing}
        onChange={onChangeDraft}
        onSave={onSave}
        onCancel={onCancel}
      />
      {copied && (
        <span className="text-xs text-green-600 mt-1">Copied!</span>
      )}
    </div>
  );
}

