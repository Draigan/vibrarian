import express from "express";
import { Buffer } from "node:buffer";
import { requireAuth } from "../middleware/authMiddleWare.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import { writeFile } from "node:fs/promises";
import path from "node:path";
dotenv.config({ override: true });
const router = express.Router();
const DEFAULT_TRANSCRIPTION_MODEL = process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";
const openaiClient = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID,
        project: process.env.OPENAI_PROJECT_ID,
    })
    : null;
router.post("/transcribe", requireAuth, async (req, res) => {
    try {
        if (!openaiClient) {
            return res
                .status(500)
                .json({ error: "Voice transcription is not configured." });
        }
        const { audio, mimeType } = req.body ?? {};
        if (typeof audio !== "string" || audio.trim().length === 0) {
            return res.status(400).json({ error: "Missing audio payload." });
        }
        try {
            const base64 = audio.replace(/^data:audio\/\w+;base64,/, "");
            const audioBuffer = Buffer.from(base64, "base64");
            if (!audioBuffer || audioBuffer.length === 0) {
                return res.status(400).json({ error: "Invalid audio payload." });
            }
            const normalizedMime = typeof mimeType === "string" && mimeType.length > 0
                ? mimeType
                : "audio/webm";
            const extension = normalizedMime.split("/")[1]?.split(";")[0]?.trim() || "webm";
            console.log("Audio buffer bytes:", audioBuffer.length);
            console.log("Normalized mime type:", normalizedMime);
            const file = await OpenAI.toFile(audioBuffer, `clip.${extension}`, {
                type: normalizedMime,
            });
            console.log("Attempting transcription with key suffix:", process.env.OPENAI_API_KEY?.slice(-6));
            console.log("Attempting transcription with project:", process.env.OPENAI_PROJECT_ID);
            try {
                const debugPath = path.resolve(`logs/latest-clip.${extension === "ogg" ? "ogg" : extension}`);
                await writeFile(debugPath, audioBuffer);
                console.log("Wrote debug clip to", debugPath);
            }
            catch (writeError) {
                console.warn("Unable to persist debug clip:", writeError);
            }
            const data = await openaiClient.audio.transcriptions.create({
                file,
                model: DEFAULT_TRANSCRIPTION_MODEL,
                temperature: 0,
            });
            let text = "";
            if (typeof data.text === "string" && data.text.trim().length > 0) {
                text = data.text.trim();
            }
            else if (Array.isArray(data?.segments) && data.segments.length > 0) {
                text = data.segments
                    .map((segment) => (segment?.text || "").trim())
                    .filter((segmentText) => segmentText.length > 0)
                    .join(" ")
                    .trim();
            }
            console.log("Transcription request using key suffix:", process.env.OPENAI_API_KEY?.slice(-6));
            console.log("Transcription request using project:", process.env.OPENAI_PROJECT_ID);
            console.log("Raw transcription text:", data.text);
            if ("segments" in data && Array.isArray(data?.segments)) {
                console.log("Raw transcription segments:", JSON.stringify(data.segments.slice(0, 5)));
            }
            return res.json({ text });
        }
        catch (error) {
            console.error("Failed to process audio payload", error);
            return res.status(500).json({ error: "Failed to transcribe audio clip." });
        }
    }
    catch (error) {
        console.error("Transcription route error", error);
        return res.status(500).json({ error: "Failed to transcribe audio clip." });
    }
});
export default router;
