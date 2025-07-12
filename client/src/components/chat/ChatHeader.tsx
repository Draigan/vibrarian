import { Button } from "@/components/ui/button";
import ChatHistory from "./ChatHistory";
import { Plus } from "lucide-react";
import { useChatSession } from "@/hooks/useChatSession";


export function ChatHeader({
  replaceMessages
}: any) {

  const { sessions, sessionId, setSessionId, loadSessions, loading } = useChatSession();
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
          replaceMessages={replaceMessages}
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
