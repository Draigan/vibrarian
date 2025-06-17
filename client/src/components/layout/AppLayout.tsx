// AppLayout.tsx
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log("user :", user);
  function handleLogout() {
    navigate("/logout");
  }
  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <img src="/vibrarian.jpg" alt="Logo" className="h-8 w-8 rounded-full border-2 border border-primary" />
          <h1 className="text-lg font-semibold text-primary">Vibrarian</h1>
        </div>
        <div>
          {user?.email}
        </div>
        <ModeToggle />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 h-full border-r border-border bg-sidebar p-4 space-y-4">
          <h2 className="text-md font-medium">Navigation</h2>
          <nav className="space-y-2">
            <Link to="/" className="block text-muted-foreground hover:text-foreground">Home</Link>
            <Link to="/login" className="block text-muted-foreground hover:text-foreground">Login</Link>
            <Link to="/chat" className="block text-muted-foreground hover:text-foreground">Chat</Link>
          </nav>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </aside>

        {/* Page content */}
        <main className="flex-1 h-full overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

