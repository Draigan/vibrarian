// routes/userSettings.ts
import express from "express";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { supabase } from "../db/supabase.js"; 

const router = express.Router();

router.get("/user-settings", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await supabase
    .from("user_settings")
    .select("theme")
    .eq("user_id", userId)

  if (error) {
    console.error("❌ Failed to fetch user settings:", error);
    return res.status(500).json({ error: "Could not fetch user settings" });
  }

  return res.json({ sessions: data });
});

router.patch("/user-settings", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id;
  const { theme } = req.body;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { data, error } = await supabase
    .from("user_settings")
    .update({ theme })
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("❌ Failed to update user settings:", error);
    return res.status(500).json({ error: "Could not update user settings" });
  }

  return res.json({ settings: data[0] });
});


export default router;
