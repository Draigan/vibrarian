import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const userMessage = req.body.messages?.[req.body.messages.length - 1]?.content || "";

  try {
    // Send message to n8n
    const response = await fetch("http://localhost:5678/webhook/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();

    // Return plain JSON response
    res.json({
      id: uuidv4(),
      role: "assistant",
      content: data.reply || "Something went wrong.",
      parts: [{ type: "text", text: data.reply || "Something went wrong." }],
    });
  } catch (err) {
    console.error("Error forwarding to n8n:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;

