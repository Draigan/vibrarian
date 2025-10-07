// server/utils/messageQueue.ts
import { insertMessage } from "../db/chat.js";
const queue = [];
let processing = false;
export function storeMessage(item) {
    queue.push(item);
    processQueue();
}
async function processQueue() {
    if (processing || queue.length === 0)
        return;
    processing = true;
    const { token, sessionId, role, content } = queue.shift();
    try {
        await insertMessage(token, sessionId, role, content);
    }
    catch (err) {
        console.error("❌ Failed to insert message:", err);
    }
    finally {
        processing = false;
        processQueue();
    }
}
