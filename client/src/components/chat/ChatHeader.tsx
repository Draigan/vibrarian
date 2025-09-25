import { Button } from "@/components/ui/button";
import ChatHistory from "./ChatHistory";
import { Plus } from "lucide-react";


type Props = {
  sessions: SessionType[];
  sessionId: string | null;
  loading: boolean;
  handleSwitchSession: (id: string) => void;
}

type SessionType = {
  id: string;
  title: string;
  created_at: string;
};

export function ChatHeader({
  handleSwitchSession,
  loading,
  sessions,
  sessionId,
}: Props) {

  return (
    <>
      <div className="flex justify-between w-[760px]  h-[57px]">

        <div className="chat:w-[760px] flex justify-end">
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
