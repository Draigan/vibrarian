import { useState, type ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import { SidebarNavButton } from "./SidebarNavButton";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  MessageCircle,
  FileText,
  LogIn,
  LogOut,
} from "lucide-react";
import { useUserSettings } from "@/context/UserSettingsContext";
import { MobileMenu } from "@/components/MobileMenu";
import { ChatSideHistory } from "../chat/ChatSideHistory";
import { SidebarUserMenu } from "./SidebarUserMenu";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { logout } = useAuth();
  const { settings } = useUserSettings();
  const navigate = useNavigate();

  const [manuallyCollapsed, setManuallyCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const collapsed = manuallyCollapsed && !hovered;

  async function handleLogout() {
    await logout();
    navigate("/logout");
  }

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={20} />, show: true },
    {
      to: "/chat",
      label: "New Chat",
      icon: <MessageCircle size={20} />,
      show: !!settings.userName,
    },
    {
      to: "/transcripts",
      label: "Transcripts",
      icon: <FileText size={20} />,
      show: !!settings.userName,
    },
  ];

  return (
    <div className="w-screen h-screen bg-background text-foreground relative">
      <MobileMenu navLinks={navLinks} />

      {/* Sidebar */}
      <aside
        className={`
          hidden chat:flex chat:flex-col
          fixed top-0 left-0 h-full
          border-r border-border bg-card
          transition-all duration-300 ease-in-out
          ${collapsed ? "sm:w-12" : "sm:w-64"}
          z-50 p-0
        `}
        style={{ minWidth: 56, maxWidth: 256 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Logo/Header */}
        <div className="h-14 w-full flex items-center border-b border-border px-2">
          <img
            src="/vibrarian.jpg"
            alt="Logo"
            className="rounded-full object-cover border-2 border-primary bg-background w-8 h-8"
          />
          <span
            className={`
              ml-2 text-lg font-semibold text-primary whitespace-nowrap
              transition-opacity duration-300
              ${collapsed ? "opacity-0" : "opacity-100"}
            `}
            style={{ transitionDelay: collapsed ? "0ms" : "100ms" }}
          >
            Vibrarian
          </span>
        </div>

        {/* Top nav */}
        <nav className="flex flex-col w-full">
          {navLinks
            .filter((l) => l.show)
            .map((link) => (
              <SidebarNavButton
                key={link.to}
                to={link.to}
                icon={link.icon}
                collapsed={collapsed}
                as="link"
              >
                {link.label}
              </SidebarNavButton>
            ))}
        </nav>

        {/* Scrollable chat history */}
        <div className="flex-1 min-h-0 overflow-y-auto w-full">
          <ChatSideHistory collapsed={collapsed}/>
        </div>

        {/* Footer: User menu */}
        <SidebarUserMenu collapsed={collapsed} setCollapsed={setManuallyCollapsed} />

        <div className="w-full px-2 pb-2">
          <hr className="w-full border-t border-border mb-0" />
        </div>


        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          className="!absolute"
          style={{
            top: "50%",
            right: "-16px",
            transform: "translateY(-50%)",
            zIndex: 50,
            width: 32,
            height: 32,
            boxShadow: "0 2px 8px #0002",
          }}
          onClick={() => setManuallyCollapsed((c) => !c)}
          tabIndex={0}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </aside>

      {/* Main content */}
      <main className="w-full chat:pl-14 h-full overflow-auto">
        {children}
      </main>
    </div>
  );
}

