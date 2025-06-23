// server/utils/messageQueue.ts
import { insertMessage } from "../db/chat.js";

type QueueItem = {
  token: string;
  sessionId: string;
  sender: "user" | "assistant";
  content: string;
};

const queue: QueueItem[] = [];

let processing = false;

export function enqueueMessage(item: QueueItem) {
  queue.push(item);
  processQueue();
}

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;
  const { token, sessionId, sender, content } = queue.shift()!;
  try {
    await insertMessage(token, sessionId, sender, content);
  } catch (err) {
    console.error("❌ Failed to insert message:", err);
  } finally {
    processing = false;
    processQueue();
  }
}
