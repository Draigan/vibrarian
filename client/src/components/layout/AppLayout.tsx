// AppLayout.tsx
import { ModeToggle } from "@/components/mode-toggle";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
        <h1 className="text-lg font-semibold">Vibrarian</h1>
        <ModeToggle />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 h-full border-r border-border bg-sidebar p-4 space-y-4">
          <h2 className="text-md font-medium">Sidebar</h2>
          <nav className="space-y-2">
            <a href="/" className="block text-muted-foreground hover:text-foreground">Home</a>
            <a href="/login" className="block text-muted-foreground hover:text-foreground">Login</a>
            <a href="/chat" className="block text-muted-foreground hover:text-foreground">Chat</a>
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 h-full overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

