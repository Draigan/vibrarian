import { Button } from "@/components/ui/button";
import ChatHistory from "./ChatHistory";

export function ChatHeader({
  sessions,
  sessionId,
  setSessionId,
  loadSessions,
  loading,
}: any) {
  return (
    <div className="flex justify-between px-4 py-2 border-b">
      <ChatHistory
        sessions={sessions}
        sessionId={sessionId}
        setSessionId={setSessionId}
        loadSessions={loadSessions}
        loading={loading}
      />
      <Button
        variant="outline"
        onClick={() => {
          setSessionId(null);
          loadSessions();
        }}
        className="hover:!bg-primary hover:text-primary-foreground border-primary"
      >
        + New Chat
      </Button>
    </div>
  );
}
