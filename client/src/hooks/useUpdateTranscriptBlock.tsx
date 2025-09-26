/** hooks/useUpdateTranscriptBlock.ts
 *
 * Provides a mutation hook to update a specific transcript block by ID.
 * - Calls the backend API to persist text changes.
 * - Uses React Query's mutation lifecycle for optimistic updates, error rollback, and cache invalidation.
 * - Keeps transcript blocks in sync by updating the query cache and refetching after completion.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useUpdateTranscriptBlock(transcriptId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blockId, text }: { blockId: number; text: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/transcripts/blocks/${blockId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to update transcript block");
      return res.json(); // { block: { ... } }
    },

    // 🔮 Optimistic update
    onMutate: async ({ blockId, text }) => {
      await queryClient.cancelQueries({
        queryKey: ["transcript-blocks", transcriptId],
      });

      const prev = queryClient.getQueryData<any[]>([
        "transcript-blocks",
        transcriptId,
      ]);

      queryClient.setQueryData<any[]>(
        ["transcript-blocks", transcriptId],
        (old = []) =>
          old.map((b) =>
            b.id === blockId ? { ...b, block: text } : b
          )
      );

      return { prev };
    },

    // ❌ Rollback on error
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(
          ["transcript-blocks", transcriptId],
          ctx.prev
        );
      }
    },

    // 🔄 Always refetch to stay in sync
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transcript-blocks", transcriptId],
      });
    },
  });
}


