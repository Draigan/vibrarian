import { Button } from "@/components/ui/button";
import ChatHistory from "./ChatHistory";
import { Plus } from "lucide-react";


export function ChatHeader({
  handleSwitchSession,
  loading,
  sessions,
  sessionId,
}: any) {

  return (
    <>
      <div className="flex justify-between w-[760px]  h-[57px]">

        <div className="hidden chat:w-[760px]">
          <Button
            variant="outline"
            onClick={() => {
              handleSwitchSession("new");
            }}
            className="hover:!bg-accent border-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <ChatHistory
            sessions={sessions}
            sessionId={sessionId}
            handleSwitchSession={handleSwitchSession}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
}
