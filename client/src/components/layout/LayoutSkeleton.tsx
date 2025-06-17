import { Skeleton } from "@/components/ui/skeleton";

export default function LayoutSkeleton() {
  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-10" />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 h-full border-r border-border bg-sidebar p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-full" />
        </aside>

        {/* Page content */}
        <main className="flex-1 h-full overflow-auto p-6 space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </main>
      </div>
    </div>
  );
}
