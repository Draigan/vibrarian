import { useState, type ReactNode } from "react";
import { SidebarNavLinks } from "./SidebarNavLinks";
import { SidebarFooter } from "./SidebarFooter";
import { type UserSettings } from "@/types/user_settings";

type NavLink = {
  to: string;
  label: string;
  icon: ReactNode;
  show: boolean;
}

type SidebarProps = {
  navLinks: NavLink[];
  settings: UserSettings;
  handleLogout: () => void;
}
export function Sidebar({ navLinks, settings, handleLogout }: SidebarProps) {
  const [manuallyCollapsed, setManuallyCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const collapsed = manuallyCollapsed && !hovered;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full
        flex flex-col items-center border-r border-border bg-card
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-12" : "w-64"}
        z-50
        p-0
      `}
      style={{ minWidth: 56, maxWidth: 256 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo/Header */}
      <div
        className={`
          h-14 w-full flex items-center border-b border-border px-2
          transition-all duration-300 overflow-hidden
        `}
      >
        <img
          src="/vibrarian.jpg"
          alt="Logo"
          className={`rounded-full object-cover border-2 border-primary bg-background transition-all duration-300 w-8 h-8`}
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
      <SidebarNavLinks navLinks={navLinks} collapsed={collapsed} />
      <div className="flex-1" />
      <SidebarFooter settings={settings} collapsed={collapsed} handleLogout={handleLogout} />
      {/* Collapse/Expand Button */}
      <button
        className="absolute -right-3 top-16 bg-card border border-border rounded-full shadow p-1 z-50"
        onClick={() => setManuallyCollapsed((v) => !v)}
        tabIndex={0}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{ width: 24, height: 24 }}
      >
        {collapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        )}
      </button>
    </aside>
  );
}
