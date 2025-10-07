// chatRenamerPoller.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const N8N_ENDPOINT = process.env.N8N_ENDPOINT;
const N8N_ENDPOINT_TEST = process.env.N8N_ENDPOINT_TEST; // fixed bug: was using N8N_ENDPOINT
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, serviceRoleKey);
const POLL_INTERVAL = 5000; // ms
async function processSessions() {
    console.log(`[${new Date().toISOString()}] Polling for sessions needing names...`);
    try {
        const { data: sessions, error: sessionErr } = await supabase
            .from("chat_sessions")
            .select("id, user_id")
            .eq("needs_name", true);
        if (sessionErr) {
            console.error("Error fetching sessions:", sessionErr);
            return;
        }
        if (!sessions || sessions.length === 0) {
            console.log("Found 0 sessions needing names.");
            return;
        }
        console.log(`Found ${sessions.length} session(s) needing names:`, sessions.map(s => s.id));
        for (const session of sessions) {
            console.log(`Processing session: ${session.id}`);
            const { data: messages, error: msgErr } = await supabase
                .from("chat_messages")
                .select("role, content") // ✅ include role
                .eq("session_id", session.id)
                .order("created_at", { ascending: true })
                .limit(3);
            if (msgErr) {
                console.error(`Error fetching messages for session ${session.id}:`, msgErr);
                continue;
            }
            const chatContents = messages?.map(m => ({
                role: m.role,
                content: m.content,
            })) ?? [];
            const payload = {
                session_id: session.id,
                messages: chatContents,
            };
            console.log("Forwarding session to n8n:", JSON.stringify(payload, null, 2));
            try {
                const res = await fetch(`${N8N_ENDPOINT}/chat-namer`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                console.log(`n8n webhook response status for session ${session.id}:`, res.status);
            }
            catch (err) {
                console.error(`Failed to forward session ${session.id} to n8n:`, err);
            }
        }
    }
    catch (err) {
        console.error("Error in processSessions:", err);
    }
}
setInterval(processSessions, POLL_INTERVAL);
console.log(`Polling chat_sessions every ${POLL_INTERVAL / 1000}s...`);
