import { Button } from "@/components/ui/button";
import { Copy, Pencil } from "lucide-react";

interface Props {
  onCopy: () => void;
  onEdit: () => void;
}

export function TranscriptBlockActions({
  onCopy,
  onEdit,
}: Props) {
  return (
    <div className="flex ">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-accent"
        onClick={onCopy}
        title="Copy block text"
      >
        <Copy className="w-4 h-4" /> 
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-accent"
        onClick={onEdit}
        title="Edit block"
      >
        <Pencil className="w-4 h-4" /> 
      </Button>
      {/* Add more buttons here as needed */}
    </div>
  );
}
