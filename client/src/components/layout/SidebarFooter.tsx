import { SidebarNavButton } from "./SidebarNavButton";
import { ModeToggle } from "@/components/mode-toggle";
import { LogIn, LogOut } from "lucide-react";
import type { UserSettings } from "@/types/user_settings";

interface Props {
  settings: UserSettings;
  collapsed: boolean;
  handleLogout: () => void;
}

export function SidebarFooter({ settings, collapsed, handleLogout }: Props) {
  return (
    <div className="w-full flex flex-col gap-2 pb-2">
      {settings.userName ? (
        <SidebarNavButton
          as="button"
          onClick={handleLogout}
          icon={<LogOut size={20} />}
          collapsed={collapsed}
        >
          Sign Out
        </SidebarNavButton>
      ) : (
        <SidebarNavButton
          as="link"
          to="/login"
          icon={<LogIn size={20} />}
          collapsed={collapsed}
        >
          Sign In
        </SidebarNavButton>
      )}
      <div className="flex justify-center w-full pt-2">
        <ModeToggle />
      </div>
    </div>
  );
}
