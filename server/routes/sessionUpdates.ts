import express from "express";
import { requireAuth } from "../middleware/authMiddleWare.js";
import { supabase } from "../db/supabase.js";

const router = express.Router();

// Store active SSE connections
const connections = new Map<string, { res: express.Response; userId: string }>();

// Server-Sent Events endpoint for real-time session updates
router.get("/session-updates", requireAuth, async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true',
  });

  // Generate unique connection ID
  const connectionId = `${userId}-${Date.now()}`;
  
  // Store the connection
  connections.set(connectionId, { res, userId });
  
  console.log(`📡 SSE connection established for user ${userId} (${connectionId})`);

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ 
    type: 'connected', 
    message: 'Session updates stream connected' 
  })}\n\n`);

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
    } catch (error) {
      console.log(`💔 Heartbeat failed for ${connectionId}, cleaning up`);
      clearInterval(heartbeat);
      connections.delete(connectionId);
    }
  }, 30000); // 30 second heartbeat

  // Handle client disconnect
  req.on('close', () => {
    console.log(`🔌 SSE connection closed for user ${userId} (${connectionId})`);
    clearInterval(heartbeat);
    connections.delete(connectionId);
  });

  req.on('error', (error) => {
    console.error(`❌ SSE connection error for ${connectionId}:`, error);
    clearInterval(heartbeat);
    connections.delete(connectionId);
  });
});

// Function to broadcast session updates to all connected clients for a specific user
export function broadcastSessionUpdate(userId: string, sessionData: any) {
  console.log(`📢 Broadcasting session update for user ${userId}:`, sessionData);
  
  for (const [connectionId, connection] of connections) {
    if (connection.userId === userId) {
      try {
        connection.res.write(`data: ${JSON.stringify({
          type: 'session_updated',
          session: sessionData
        })}\n\n`);
      } catch (error) {
        console.error(`Failed to send update to ${connectionId}:`, error);
        connections.delete(connectionId);
      }
    }
  }
}

// Set up Supabase real-time subscription for chat_sessions table
const channel = supabase
  .channel('chat_sessions_changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'chat_sessions'
    },
    (payload) => {
      console.log('🔄 Chat session updated:', payload);
      const sessionData = payload.new;
      if (sessionData?.user_id) {
        broadcastSessionUpdate(sessionData.user_id, sessionData);
      }
    }
  )
  .subscribe();

console.log('🎧 Supabase real-time listener for chat_sessions established');

export default router;