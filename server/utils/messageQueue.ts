// server/utils/messageQueue.ts
import { insertMessage } from "../db/chat.js";

type QueueItem = {
  token: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
};

const queue: QueueItem[] = [];

let processing = false;

export function storeMessage(item: QueueItem) {
  queue.push(item);
  processQueue();
}

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;
  const { token, sessionId, role, content } = queue.shift()!;
  try {
    await insertMessage(token, sessionId, role, content);
  } catch (err) {
    console.error("❌ Failed to insert message:", err);
  } finally {
    processing = false;
    processQueue();
  }
}
