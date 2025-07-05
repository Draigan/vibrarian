import { Button } from "@/components/ui/button";
import ChatHistory from "./ChatHistory";
import { Plus } from "lucide-react";


export function ChatHeader({
  sessions,
  sessionId,
  setSessionId,
  loadSessions,
  loading,
}: any) {
  return (
<>
    <div className="flex justify-between w-[760px]  h-14">

      <Button
        variant="outline"
        onClick={() => {
          setSessionId("new");
          loadSessions();
        }}
        className="hover:!bg-accent border-0"
      >
  <Plus className="w-4 h-4" />
      </Button>
      <ChatHistory
        sessions={sessions}
        sessionId={sessionId}
        setSessionId={setSessionId}
        loadSessions={loadSessions}
        loading={loading}
      />
    </div>
    </>
  );
}
