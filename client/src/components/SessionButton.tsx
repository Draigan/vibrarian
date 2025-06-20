import { cn } from "@/lib/utils" // Optional, or use plain className

export function SessionButton({
  title = "Untitled Session",
  timestamp = new Date(),
  messageCount = 0,
  isActive = false,
  onClick,
}: {
  title?: string
  timestamp?: Date
  messageCount?: number
  isActive?: boolean
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-md cursor-pointer transition-colors",
        "hover:bg-muted/50",
        isActive && "bg-muted/40 font-medium"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          {timestamp.toLocaleString()}
        </span>
        <div className="flex justify-between items-center">
          <span className="text-sm text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">{messageCount} messages</span>
        </div>
      </div>
    </div>
  )
}
