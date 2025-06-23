import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { SessionButton } from "./SessionButton";
import { useChatSession } from "@/hooks/useChatSession";
import { LoadingSpinner } from "./ui/loading-spinner";

export default function ChatHistory() {
  const { sessions, loadSessions, loading } = useChatSession();

  return (
    <Sheet onOpenChange={(open) => {
      if (open) loadSessions();
    }}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="hover:!bg-primary hover:text-primary-foreground border-primary"
        >
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
            sessions.map((item) => {
              const formatted = new Date(item.created_at).toLocaleString();
              return (
                <SessionButton
                  key={item.id}
                  title={item.title}
                  timestamp={formatted}
                  messageCount={5}
                  isActive={false}
                  onClick={() => console.log("Selected session")}
                />
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

