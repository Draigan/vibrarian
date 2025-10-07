/**
 * TranscriptBody
 * --------------
 * Displays the blocks of a transcript using Virtuoso for virtualized rendering.
 *
 * - Fetches blocks with `useTranscriptBlocks(transcriptId)`
 * - Shows loading/error/empty states
 * - Assigns each speaker a consistent color from a palette
 * - Tracks local edit state per block (start, change, save, cancel)
 * - Delegates block rendering to `TranscriptBlock`
 */

import { useEffect, useMemo, useState } from "react";
import { useTranscriptBlocks } from "@/hooks/useTranscriptBlocks";
import { useUpdateTranscriptBlock } from "@/hooks/useUpdateTranscriptBlock";
import TranscriptBlock from "./TranscriptBlock";
import type { TranscriptBlock as Block } from "@/types/transcript";
import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
} from "@virtuoso.dev/message-list";
import { Loader } from "../myui/Loader";

interface Props {
  transcriptId?: string;
}

// 1. Speaker colors palette
const SPEAKER_COLORS = [
  "#0ea5e9", "#f59e42", "#22c55e", "#a78bfa", "#f43f5e", "#eab308", "#6366f1", "#06b6d4",
  "#ec4899", "#a3e635", "#f472b6", "#fb7185", "#38bdf8", "#facc15", "#16a34a", "#f87171",
  "#0d9488", "#fcd34d", "#7c3aed", "#10b981", "#c026d3", "#fbbf24", "#57534e", "#fde68a"
];

export default function TranscriptBody({ transcriptId }: Props) {
  const { data: blocks = [], isLoading, error } = useTranscriptBlocks(transcriptId);
  const updateBlock = useUpdateTranscriptBlock(transcriptId);

  // Edit state: { [blockId]: { editing: bool, draft: string } }
  const [editState, setEditState] = useState<{
    [id: number]: { editing: boolean; draft: string };
  }>({});

  useEffect(() => {
    setEditState({}); // clear on transcript change
  }, [transcriptId]);

  // speaker→color mapping
  const speakerColorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!blocks) return map;
    let colorIdx = 0;
    for (const block of blocks) {
      const speaker = block.speaker || "Unknown";
      if (!map.has(speaker)) {
        map.set(speaker, SPEAKER_COLORS[colorIdx % SPEAKER_COLORS.length]);
        colorIdx++;
      }
    }
    return map;
  }, [blocks]);

  if (!transcriptId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader />
        <div>
          <h4 className="text-2xl">Choose from transcripts</h4>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading transcript...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Error loading transcript.
      </div>
    );
  }
  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        This transcript is empty.
      </div>
    );
  }

  // Handler creators
  const handleStartEdit = (id: number, initial: string) => {
    setEditState((s) => ({
      ...s,
      [id]: { editing: true, draft: initial },
    }));
  };

  const handleChangeDraft = (id: number, val: string) => {
    setEditState((s) => ({
      ...s,
      [id]: { ...s[id], draft: val },
    }));
  };

  const handleSave = (id: number) => {
    const draftText = editState[id]?.draft;
    if (draftText !== undefined) {
      updateBlock.mutate({ blockId: id, text: draftText });
    }
    setEditState((s) => ({
      ...s,
      [id]: { ...s[id], editing: false },
    }));
  };

  const handleCancel = (id: number, original: string) => {
    setEditState((s) => ({
      ...s,
      [id]: { editing: false, draft: original },
    }));
  };

  return (
    <VirtuosoMessageListLicense licenseKey={""}>
      <VirtuosoMessageList<Block, null>
        key={transcriptId}
        style={{ height: "100vh", width: "100%" }}
        computeItemKey={({ data }) => data.id}
        initialData={blocks}
        ItemContent={({ data }) => (
          <TranscriptBlock
            block={data}
            color={speakerColorMap.get(data.speaker || "Unknown") || "#888"}
            editing={!!editState[data.id]?.editing}
            draft={editState[data.id]?.draft ?? data.block}
            onStartEdit={() => handleStartEdit(data.id, data.block)}
            onChangeDraft={(val) => handleChangeDraft(data.id, val)}
            onSave={() => handleSave(data.id)}
            onCancel={() => handleCancel(data.id, data.block)}
          />
        )}
        className="p-4"
      />
    </VirtuosoMessageListLicense>
  );
}
