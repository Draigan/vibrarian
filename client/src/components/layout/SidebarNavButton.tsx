import  { type ReactNode, type ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { useChat } from "@/context/ChatContext";

type SidebarNavButtonProps =
  | ({
      as?: "link";
      to: string;
      icon: ReactNode;
      children: ReactNode;
      collapsed?: boolean;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({
      as: "button";
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
      icon: ReactNode;
      children: ReactNode;
      collapsed?: boolean;
    } & ButtonHTMLAttributes<HTMLButtonElement>);

export function SidebarNavButton(props: SidebarNavButtonProps) {
  const {
    as = "link",
    icon,
    children,
    collapsed,
    ...rest
  } = props;

  const isNewChat = (children as string) === "New Chat";

  const {switchSession} = useChat();

  const className = `
    group flex items-center w-full rounded-md px-2 h-12 mb-1
    hover:bg-accent hover:text-accent-foreground
    transition-colors duration-300 
  `;

  const labelClass = `
    truncate ml-3
    transition-opacity duration-300
    ${collapsed ? "opacity-0 pointer-events-none select-none" : "opacity-100"}
    overflow-hidden whitespace-nowrap
  `;

  if (as === "button") {
    const { onClick, ...btnRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
     <div className="px-2 py-1"> 
      <button
        onClick={onClick}
        className={className}
        {...btnRest}
        title={collapsed ? (children as string) : undefined}
        type="button"
      >
        <span className="w-8 h-8 flex items-center">{icon}</span>
        <span
          className={labelClass}
          aria-hidden={collapsed ? "true" : undefined}
          style={{
            transitionDelay: collapsed ? "0ms" : "100ms",
          }}
        >
          {children}
        </span>
      </button>
      </div>
    );
  }

  // as === "link"
  const { to, ...linkRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };
  return (
     <div className="px-2 py-1" onClick={()=> switchSession("new")}> 
    <Link
      to={to}
      className={className}
      {...linkRest}
      title={collapsed ? (children as string) : undefined}
    >
      <span className="w-8 h-8 flex items-center">{icon}</span>
      <span
        className={labelClass}
        aria-hidden={collapsed ? "true" : undefined}
        style={{
          transitionDelay: collapsed ? "0ms" : "100ms",
        }}
      >
        {children}
      </span>
    </Link>
    </div>
  );
}

