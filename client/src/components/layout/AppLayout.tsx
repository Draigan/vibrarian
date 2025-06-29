import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  MessageCircle,
  FileText,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showCollapsedLogo, setShowCollapsedLogo] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (collapsed) {
      timeout = setTimeout(() => setShowCollapsedLogo(true), 350);
    } else {
      setShowCollapsedLogo(false);
    }
    return () => clearTimeout(timeout);
  }, [collapsed]);

  async function handleLogout() {
    await logout();
    navigate("/logout");
  }

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={20} />, show: true },
    { to: "/chat", label: "Chat", icon: <MessageCircle size={20} />, show: !!user },
    { to: "/transcripts", label: "Transcripts", icon: <FileText size={20} />, show: !!user },
  ];

  return (
    <div className="w-screen h-screen flex bg-background text-foreground">
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 56 : 256,
          boxShadow: collapsed ? "0 0 8px 0 #00000022" : "none",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 32 }}
        className="relative h-full border-r border-border bg-sidebar flex flex-col p-0 overflow-visible" // <-- overflow-visible!
        style={{ minWidth: 56, maxWidth: 256 }}
      >
        {/* Header with animated logo/title OR mini logo */}
        <div
          className={`h-14 flex items-center border-b border-border bg-card px-2 sm:px-6 relative`}
          style={{ width: "100%" }}
        >
          <div
            className={`flex items-center h-full w-full transition-all duration-300 
            ${collapsed ? "justify-center" : "justify-start pl-3"}`}
            style={{ minWidth: 0 }}
          >
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="logo-expanded"
                  className="flex items-center"
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                >
                  <img
                    src="/vibrarian.jpg"
                    alt="Logo"
                    className="rounded-full object-cover border-2 border-primary bg-background"
                    style={{
                      width: 40,
                      height: 40,
                      minWidth: 40,
                      minHeight: 40,
                      maxWidth: 40,
                      maxHeight: 40,
                      display: "block",
                    }}
                  />
                  <span className="ml-2 text-lg font-semibold text-primary whitespace-nowrap">
                    Vibrarian
                  </span>
                </motion.div>
              ) : showCollapsedLogo ? (
                <motion.div
                  key="logo-collapsed"
                  className="flex items-center justify-center w-full"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.27 }}
                >
                  <img
                    src="/vibrarian.jpg"
                    alt="Logo"
                    className="rounded-full object-cover border-2 border-primary bg-background mx-auto"
                    style={{
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      minHeight: 32,
                      maxWidth: 32,
                      maxHeight: 32,
                      display: "block",
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 flex flex-col items-center relative w-full">
          <div className={`w-full ${collapsed ? "pt-4" : "p-4 space-y-4"}`}>
            <nav className="flex flex-col gap-2">
              {navLinks.filter((l) => l.show).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center rounded-md py-2 px-2 hover:bg-accent hover:text-accent-foreground transition-colors`}
                  title={collapsed ? link.label : undefined}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: 32, minWidth: 32, height: 32 }}
                  >
                    {link.icon}
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.17 }}
                        className="truncate ml-3"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
            </nav>
          </div>
        </div>


        {/* Avatar/account menu absolutely at the bottom */}
        <div className="flex flex-col items-center w-full mb-4 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full border bg-card hover:bg-accent transition focus:outline-none"
                aria-label={user ? "Account menu" : "Login menu"}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="User avatar"
                    className="rounded-full w-8 h-8 object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" sideOffset={8} className="w-44">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-row">
                      <span className="font-medium text-sm truncate">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/login" className="flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Divider + ModeToggle above avatar */}
        <div className="px-2 w-full">
          <hr className="w-full border-t border-border mb-3" />
          <div className="flex justify-center pb-2">
            <ModeToggle />
          </div>
        </div>
        {/* Collapse/Expand Button floating on right border */}
        <Button
          variant="ghost"
          size="icon"
          className="!absolute"
          style={{
            top: "30%",
            right: "-16px",
            transform: "translateY(-50%)",
            zIndex: 50,
            width: 32,
            height: 32,
            boxShadow: "0 2px 8px #0002",
            border: "1px solid var(--border)",
            background: "var(--background)",
          }}
          onClick={() => setCollapsed((c) => !c)}
          tabIndex={0}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 h-full overflow-auto p-6">{children}</main>
    </div>
  );
}
//
