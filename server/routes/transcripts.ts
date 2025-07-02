import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { supabase } from "../db/supabase.js";
import { logger } from "../index.js";

const router = express.Router();

// /transcripts route: uses service role key client
router.get("/transcripts", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id;
  logger.info(`[TRANSCRIPTS] GET /transcripts requested by user: ${userId}`);

  if (!userId) {
    logger.warn("[TRANSCRIPTS] No userId found in request");
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Create the Supabase service client just for this request
  const serviceSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await serviceSupabase
    .from("owm_lr_transcripts")
    .select("*")
    // .eq("user_id", userId) // Uncomment if you want to filter
    .order("created_at", { ascending: false });

  if (error) {
    logger.error(`❌ Failed to fetch transcripts for user ${userId}: ${error.message}`, { error });
    return res.status(500).json({ error: "Could not fetch transcripts" });
  }

  logger.info(`[TRANSCRIPTS] Fetched ${data?.length ?? 0} transcripts for user ${userId}`);
  return res.json({ transcripts: data });
});

// /transcripts/:id/blocks route: uses regular supabase client
router.get("/transcripts/:id/blocks", requireAuth, async (req, res) => {
  const transcriptId = req.params.id;
  const userId = (req as any).user?.id;
  logger.info(`[TRANSCRIPTS] GET /transcripts/${transcriptId}/blocks requested by user: ${userId}`);

  const { data, error } = await supabase
    .from("owm_tscrpt_blk_store")
    .select("*")
    .eq("transcript_id", transcriptId)
    .order("start", { ascending: true });

  if (error) {
    logger.error(`❌ Failed to fetch blocks for transcript ${transcriptId}: ${error.message}`, { error });
    return res.status(500).json({ error: "Could not fetch transcript blocks" });
  }

  logger.info(`[TRANSCRIPTS] Fetched ${data?.length ?? 0} blocks for transcript ${transcriptId}`);
  return res.json({ blocks: data });
});

export default router;

