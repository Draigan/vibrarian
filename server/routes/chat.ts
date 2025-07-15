import express from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { storeMessage } from "../utils/messageQueue.js";
const router = express.Router();

router.post("/send-message", requireAuth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Invalid message format." });
    }

    console.log(req.body);
    const sb_token = req.cookies.sb_token;
    const userMessage = message?.content || "";
    try {
      storeMessage({ token: sb_token, sessionId, role: "user", content: userMessage });
    } catch (err) {
      console.error("❌ Failed to insert user message:", userMessage);
      console.error(err);
    }
    console.log("User: ", userMessage);
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


    try {
      storeMessage({ token: sb_token, sessionId, role: "assistant", content: reply });
    } catch (err) {
      console.error("❌ Failed to insert assistant message:", userMessage);
      console.error(err);
    }
    console.log("Assistant: ", reply);
    return res.json({
      id: crypto.randomUUID(),
      role: "assistant",
      content: reply,
      parts: [{ type: "text", text: reply }],
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    // AuthApiError (real auth error) triggers logout, but AuthRetryableFetchError does NOT
    if (
      error.name === "AuthApiError" ||
      error.status === 401 ||
      error.status === 403
    ) {
      return res.status(200).json({ logout: true, error: error });
    } else if(error.status === 503) {
      // Network/undici/fetch error: don't log out!
      return res.status(503).json({ error: error, logout: false });
    }
  }
  return res.status(500).json({ error: "Internal server error" });
});

export default router;
