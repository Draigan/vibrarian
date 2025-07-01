import { useTranscriptBlocks } from "@/hooks/useTranscriptBlocks";
import TranscriptBlock from "./TranscriptBlock";
import { FixedSizeList as List } from "react-window";

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

  // Height and block height (adjust as needed)
  const CONTAINER_HEIGHT = 800; // px
  const BLOCK_HEIGHT = 120; // px

  return (
    <div className="flex-1 h-full overflow-auto">
      <List
        height={CONTAINER_HEIGHT}
        itemCount={blocks.length}
        itemSize={BLOCK_HEIGHT}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style} key={blocks[index].id}>
            <TranscriptBlock block={blocks[index]} />
          </div>
        )}
      </List>
    </div>
  );
}

