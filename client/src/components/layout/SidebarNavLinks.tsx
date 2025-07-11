import { SidebarNavButton } from "./SidebarNavButton";

export function SidebarNavLinks({ navLinks, collapsed }) {
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
