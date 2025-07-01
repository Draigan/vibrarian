// routes/transcripts.ts
import express from "express";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { supabase } from "../db/supabase.js";

const router = express.Router();

router.get("/transcripts", requireAuth, async (req, res) => {
   const userId = (req as any).user?.id;
   if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await supabase
    .from("owm_lr_transcripts")
    .select("*")
    // .eq("user_id", userId) // Uncomment to filter by user
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch transcripts:", error);
    return res.status(500).json({ error: "Could not fetch transcripts" });
  }

  return res.json({ transcripts: data });
});

// Get all blocks for a transcript
router.get("/transcripts/:id/blocks", requireAuth, async (req, res) => {
  const transcriptId = req.params.id;
  const { data, error } = await supabase
    .from("owm_tscrpt_blk_store")
    .select("*")
    .eq("transcript_id", transcriptId)
    .order("start", { ascending: true });
  if (error) {
    console.error("❌ Failed to fetch transcript blocks:", error);
    return res.status(500).json({ error: "Could not fetch transcript blocks" });
  }
  return res.json({ blocks: data });
});

export default router;
