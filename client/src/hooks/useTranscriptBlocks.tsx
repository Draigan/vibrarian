// hooks/useTranscriptBlocks.ts
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useTranscriptBlocks(transcriptId?: string) {
  return useQuery({
    queryKey: ["transcript-blocks", transcriptId],
    queryFn: async () => {
      if (!transcriptId) return [];
      const res = await fetch(`${API_BASE_URL}/api/transcripts/${transcriptId}/blocks`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transcript blocks");
      const data = await res.json();
      return data.blocks;
    },
    enabled: !!transcriptId, // Only runs if transcriptId is provided
  });
}
