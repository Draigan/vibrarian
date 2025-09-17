import { TranscriptBlockActions } from "./TranscriptBlockActions";
import TranscriptBlockText from "./TranscriptBlockText";
import { useState } from "react";
import type { TranscriptBlock } from "@/types/transcript";


// Props for TranscriptBlock
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
      className="w-275 rounded-lg p-4 bg-accent mb-3 shadow-sm flex flex-col gap-2 relative"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color }}>
            {block.speaker}
          </span>
          <span className="opacity-60">Start: {block.start}</span>
        </div>
        <TranscriptBlockActions
          onCopy={handleCopy}
          onEdit={onStartEdit}
        />
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

