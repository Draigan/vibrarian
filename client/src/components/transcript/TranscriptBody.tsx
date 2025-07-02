import { useTranscriptBlocks } from "@/hooks/useTranscriptBlocks";
import TranscriptBlock from "./TranscriptBlock";
import { Virtuoso } from "react-virtuoso";

export default function TranscriptBody({ transcriptId }: { transcriptId: string }) {
  const { data: blocks, isLoading, error } = useTranscriptBlocks(transcriptId);

  if (!transcriptId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a transcript to view its content.
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

  // Height of the whole scroll area
  const CONTAINER_HEIGHT = 800; // px

  return (
    <div className="flex-1 h-full overflow-auto">
      <Virtuoso
        style={{ height: CONTAINER_HEIGHT, width: "100%" }}
        totalCount={blocks.length}
        itemContent={index => (
          <div key={blocks[index].id}>
            <TranscriptBlock block={blocks[index]} />
          </div>
        )}
        className="p-4"
      />
    </div>
  );
}
