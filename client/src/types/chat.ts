// src/types/chat.ts
export type ChatMessage = {
  id: string;                       
  session_id: string;                
  role: "user" | "assistant";       
  content: string;                  
  created_at: string;              
  key?: string;                    
  status?: "pending" | "sent" | "failed" | "aborted";
};
