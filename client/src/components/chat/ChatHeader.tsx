

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
}: Props) {

  return (
    <>
      <div className="flex justify-between w-full h-[57px]">

      </div>
    </>
  );
}
