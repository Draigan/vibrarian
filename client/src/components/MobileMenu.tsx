import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SidebarNavButton } from "@/components/layout/SidebarNavButton"

type NavLink = {
  to: string
  label: string
  icon: React.ReactNode
  show: boolean
}

interface MobileMenuProps {
  navLinks: NavLink[]
}

export function MobileMenu({ navLinks }: MobileMenuProps) {
  return (
    <div className="chat:hidden fixed top-2 left-2 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 max-w-[80%] p-0 flex flex-col">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Vibrarian</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {navLinks.filter(l => l.show).map(link => (
              <SidebarNavButton
                key={link.to}
                as="link"
                to={link.to}
                icon={link.icon}
                collapsed={false}
              >
                {link.label}
              </SidebarNavButton>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

