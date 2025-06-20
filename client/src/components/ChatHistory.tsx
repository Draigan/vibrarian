import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { SessionButton } from "./SessionButton"

export default function ChatHistory() {
  return (
    <Sheet>
      <SheetTrigger>
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
    <SessionButton
      title="Chat with Support"
      timestamp={new Date()}
      messageCount={5}
      isActive={true}
      onClick={() => console.log("Selected session")}
    />
    <SessionButton
      title="Chat with Support"
      timestamp={new Date()}
      messageCount={5}
      isActive={false}
      onClick={() => console.log("Selected session")}
    />
    <SessionButton
      title="Chat with Support"
      timestamp={new Date()}
      messageCount={5}
      isActive={false}
      onClick={() => console.log("Selected session")}
    />
  </div>
      </SheetContent>
    </Sheet>
  )
}
