import { useState } from "react";
import { SidebarNavButton } from "@/components/layout/SidebarNavButton";
import {
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserSettings } from "@/context/UserSettingsContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function SidebarUserMenu({ collapsed }: Props) {
  const { logout } = useAuth();
  const { settings } = useUserSettings();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
  }

  if (!settings.userName) return null;

  return (
    <div className="w-full border-t border-border">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center px-2 py-3 hover:bg-accent transition-colors">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={""} />
              <AvatarFallback>
                {settings.userName?.[0]?.toUpperCase() || <User size={16} />}
              </AvatarFallback>
            </Avatar>
            <span
              className={`
        ml-2 text-sm font-medium truncate transition-all duration-300
        ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
      `}
            >
              {settings.userName}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-56 p-1">
          {/* Icon tray */}
          <div className="w-full space-evenly p-3"> 
            <ModeToggle />
            </div>


          {/* Logout */}
          <SidebarNavButton
            as="button"
            icon={<LogOut size={18} />}
            onClick={handleLogout}
          >
            Sign Out
          </SidebarNavButton>
        </PopoverContent>
      </Popover>
    </div>
  );
}

