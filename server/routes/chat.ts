import express from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/authMiddleWare.js";
const router = express.Router();

// NOTE: Refactor requireAuth so its not in every call
router.post("/chat", requireAuth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Invalid message format." });
    }

    console.log(req.body);
    const userMessage = message?.content || "";
    console.log("User: ",userMessage);
    // Forward the message to n8n
    const n8nResponse = await fetch("http://localhost:5678/webhook/n8n-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      throw new Error(`n8n error: ${text}`);
    }

    const data = await n8nResponse.json();

    const reply = data.reply || "No response from n8n.";
    console.log("AI: ",reply);
    return res.json({
      id: crypto.randomUUID(),
      role: "assistant",
      content: reply,
      parts: [{ type: "text", text: reply }],
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
