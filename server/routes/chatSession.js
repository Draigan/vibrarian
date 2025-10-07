// routes/chatSession.ts
import express from "express";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { supabase } from "../db/supabase.js";
const router = express.Router();
router.get("/chat-session", requireAuth, async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "Not authenticated" });
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
// Delete a chat session and all its messages
router.delete("/chat-session/:id", requireAuth, async (req, res) => {
    const sessionId = req.params.id;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "Not authenticated" });
    try {
        // First verify the session belongs to the user
        const { data: session, error: sessionError } = await supabase
            .from("chat_sessions")
            .select("id, user_id")
            .eq("id", sessionId)
            .eq("user_id", userId)
            .single();
        if (sessionError || !session) {
            return res.status(404).json({ error: "Session not found or access denied" });
        }
        // Delete all messages for this session first (due to foreign key constraints)
        const { error: messagesError } = await supabase
            .from("chat_messages")
            .delete()
            .eq("session_id", sessionId);
        if (messagesError) {
            console.error("❌ Failed to delete messages:", messagesError);
            return res.status(500).json({ error: "Failed to delete session messages" });
        }
        // Now delete the session
        const { error: deleteError } = await supabase
            .from("chat_sessions")
            .delete()
            .eq("id", sessionId)
            .eq("user_id", userId);
        if (deleteError) {
            console.error("❌ Failed to delete session:", deleteError);
            return res.status(500).json({ error: "Failed to delete session" });
        }
        return res.json({ success: true, message: "Session deleted successfully" });
    }
    catch (error) {
        console.error("❌ Error deleting session:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// Rename a chat session
router.put("/chat-session/:id/rename", requireAuth, async (req, res) => {
    const sessionId = req.params.id;
    const userId = req.user?.id;
    const { title } = req.body;
    if (!userId)
        return res.status(401).json({ error: "Not authenticated" });
    if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Title is required and must be a non-empty string" });
    }
    if (title.length > 255) {
        return res.status(400).json({ error: "Title must be less than 255 characters" });
    }
    try {
        // Update the session title, but only if it belongs to the user
        const { data, error } = await supabase
            .from("chat_sessions")
            .update({
            title: title.trim(),
            updated_at: new Date().toISOString()
        })
            .eq("id", sessionId)
            .eq("user_id", userId)
            .select("id, title, updated_at")
            .single();
        if (error) {
            console.error("❌ Failed to rename session:", error);
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Session not found or access denied" });
            }
            return res.status(500).json({ error: "Failed to rename session" });
        }
        if (!data) {
            return res.status(404).json({ error: "Session not found or access denied" });
        }
        return res.json({
            success: true,
            message: "Session renamed successfully",
            session: data
        });
    }
    catch (error) {
        console.error("❌ Error renaming session:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
