
interface SessionType {
  id: string;
  title: string;
  created_at: string;
}

interface Props {
  sessions: SessionType[];
  sessionId: string | null;
  loading: boolean;
  handleSwitchSession: (id: string) => void;
}

export function ChatHeader({sessionId
}: Props) {

  return (
    <>
      <div className="flex justify-between w-full h-[57px]">
        {sessionId}
      </div>
    </>
  );
}
