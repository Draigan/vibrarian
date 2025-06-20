import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button"

export default function HamburgerMenu() {
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
          <nav className="mt-4 flex flex-col gap-2">
            <a href="/dashboard" className="text-sm hover:text-primary">Dashboard</a>
            <a href="/settings" className="text-sm hover:text-primary">Settings</a>
            <a href="/profile" className="text-sm hover:text-primary">Profile</a>
            <a href="/logout" className="text-sm hover:text-destructive">Logout</a>
          </nav>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
