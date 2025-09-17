import { useQuery } from "@tanstack/react-query";
import type { Transcript } from "@/types/transcript";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useTranscripts() {
  return useQuery({
    queryKey: ["transcripts"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/transcripts`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transcripts");
      const data: {transcripts: Transcript[]} = await res.json();
      return data.transcripts;
    },
  });
}
