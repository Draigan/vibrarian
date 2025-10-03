import { useState } from "react";
import { SidebarNavButton } from "@/components/layout/SidebarNavButton";
import {
  LogOut,
  User,
  PanelLeftOpen,
  PanelLeftClose,
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
import { Button } from "@/components/ui/button";

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  setUserMenuOpen: (open: boolean) => void;
  setThemeDropdownOpen: (open: boolean) => void;
  sidebarAlwaysOpen?: boolean;
  setSidebarAlwaysOpen?: (open: boolean) => void;
}

export function SidebarUserMenu({
  collapsed,
  setUserMenuOpen,
  setThemeDropdownOpen,
  sidebarAlwaysOpen = false,
  setSidebarAlwaysOpen
}: Props) {
  const { logout } = useAuth();
  const { settings } = useUserSettings();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
  }

  const handleUserMenuOpenChange = (val: boolean) => {
    setOpen(val);
    setUserMenuOpen(val);
  };

  const handleThemeDropdownOpenChange = (val: boolean) => {
    setThemeDropdownOpen(val);
  };

  if (!settings.userName) return null;

  return (
    <div className="w-full border-t border-border">
      <Popover
        open={open}
        onOpenChange={handleUserMenuOpenChange}
      >
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
          <div className="flex justify-center gap-2 p-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarAlwaysOpen?.(!sidebarAlwaysOpen)}
              className="h-8 w-8"
              title={sidebarAlwaysOpen ? "Collapse sidebar on hover" : "Keep sidebar always open"}
            >
              {sidebarAlwaysOpen ? (
                <PanelLeftClose size={16} />
              ) : (
                <PanelLeftOpen size={16} />
              )}
            </Button>
            <ModeToggle onOpenChange={handleThemeDropdownOpenChange} />
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

