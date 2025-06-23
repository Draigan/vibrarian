import express from "express";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { supabase } from "../db/supabase.js"; // service-level client

const router = express.Router();

router.get("/chat-session", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch sessions:", error);
    return res.status(500).json({ error: "Could not fetch sessions" });
  }

  return res.json({ sessions: data });
});

export default router;
