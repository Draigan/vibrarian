import { cn } from "@/lib/utils" 

export function SessionButton({
  id = "",
  title = "Untitled Session",
  timestamp = "now",
  messageCount = 0,
  isActive = false,
  onClick,
}: {
  id: string
  title?: string
  timestamp?: string
  messageCount?: number
  isActive?: boolean
  onClick?: () => void
}) {
  return (
    <div
      key={id}
      className={cn(
        "p-4 rounded-md cursor-pointer transition-colors",
        "hover:bg-muted/50",
        isActive && "bg-keymuted/40 font-medium"
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
