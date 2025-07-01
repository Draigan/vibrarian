export default function TranscriptBlock({ block }: { block: any }) {
  return (
    <div className="rounded-lg p-4 bg-card shadow-sm flex flex-col gap-2">
      <div className="text-xs text-muted-foreground mb-1">
<span>{block.speaker}</span>        Start: {block.start}
      </div>
      <div className="whitespace-pre-line">
        {block.block ?? "(No content)"}
      </div>
    </div>
  );
}

