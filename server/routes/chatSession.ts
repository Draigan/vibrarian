// routes/chatSession.ts
import express from "express";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { supabase } from "../db/supabase.js"; 

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

router.get("/chat-session/:id/messages", requireAuth, async (req, res) => {
  const sessionId = req.params.id;

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Failed to fetch messages:", error);
    return res.status(500).json({ error: "Could not fetch messages" });
  }

  return res.json({ messages: data });
});

export default router;
