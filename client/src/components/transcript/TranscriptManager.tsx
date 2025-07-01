import { useState } from "react";
import { useTranscripts } from "@/hooks/useTranscripts";
import  TranscriptSelector  from "@/components/transcript/TranscriptSelector";
import TranscriptBody from "./TranscriptBody";

export default function TranscriptManager() {
  const { data: transcripts, isLoading } = useTranscripts();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <div>Loading…</div>;

  return (
    <div className="flex h-full bg-background rounded-xl overflow-hidden border shadow">
      <TranscriptSelector
        transcripts={transcripts || []}
        selectedId={selected?.id}
        onSelect={setSelected}
      />
      <div className="flex-1 border-1 p-6">

        <TranscriptBody transcriptId={selected?.id} />
      </div>
    </div>
  );
}
