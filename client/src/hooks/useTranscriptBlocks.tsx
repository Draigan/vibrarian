/** hooks/useTranscriptBlocks.ts
 *
 * Fetches transcript blocks for a given transcript ID from the backend API.
 * - Uses React Query for caching, re-fetching, and status tracking.
 * - Returns an array of TranscriptBlock objects.
 * - Only runs if a transcriptId is provided.
 */

import { useQuery } from "@tanstack/react-query";
import type { TranscriptBlock } from "@/types/transcript";

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
      const data: { blocks: TranscriptBlock[] } = await res.json();
      return data.blocks;
    },
    enabled: !!transcriptId, // Only runs if transcriptId is provided
  });
}

