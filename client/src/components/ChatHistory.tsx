import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { SessionButton } from "./SessionButton";
import { LoadingSpinner } from "./ui/loading-spinner";

type SessionType = {
  id: string;
  title: string;
  created_at: string;
};

type Props = {
  sessions: SessionType[];
  sessionId: string | null;
  setSessionId: (id:string) => void;
  loadSessions: () => void;
  loading: boolean;
}

export default function ChatHistory({ sessions, sessionId, setSessionId, loadSessions, loading }: Props) {
  const [open, setOpen] = useState(false);

  function handleSessionChange(id: string) {
    setSessionId(id);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) loadSessions();
    }}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="hover:!bg-primary hover:text-primary-foreground border-primary" >
          View Chat History
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Chat History</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            sessions.map((item: SessionType) => {
              const formatted = new Date(item.created_at).toLocaleString();
              return (
                <SessionButton
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  timestamp={formatted}
                  messageCount={5}
                  isActive={item.id === sessionId}
                  onClick={() => handleSessionChange(item.id)}
                />
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
