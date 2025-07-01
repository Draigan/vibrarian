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
<>
    <div className="flex bg-accent border-1  rounded-t-2xl justify-between px-4 py-2">

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
        className="hover:!bg-accent border-primary"
      >
        + New Chat
      </Button>
    </div>
    </>
  );
}
