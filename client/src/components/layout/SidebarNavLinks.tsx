import { type ReactNode } from "react";
import { SidebarNavButton } from "./SidebarNavButton";

interface NavLink {
  to: string;
  label: string;
  icon: ReactNode;
  show: boolean;
}

interface Props {
  navLinks: NavLink[];
  collapsed?: boolean;
}

export function SidebarNavLinks({ navLinks, collapsed = false }: Props) {
  return (
    <nav className="flex flex-col w-full">
      {navLinks.filter((l) => l.show).map((link) => (
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
  );
}
