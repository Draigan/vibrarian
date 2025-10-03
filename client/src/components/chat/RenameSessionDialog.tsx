import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onConfirm: (newTitle: string) => void;
  isLoading?: boolean;
}

export function RenameSessionDialog({ 
  open, 
  onOpenChange, 
  currentTitle, 
  onConfirm, 
  isLoading = false 
}: Props) {
  const [title, setTitle] = useState(currentTitle || "");

  const handleConfirm = () => {
    if (title.trim()) {
      onConfirm(title.trim());
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(currentTitle || "");
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Rename Chat Session</SheetTitle>
          <SheetDescription>
            Enter a new name for this chat session.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <Label htmlFor="session-title">Session Name</Label>
          <Input
            id="session-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter session name..."
            maxLength={255}
            className="mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleConfirm();
              }
            }}
          />
        </div>

        <SheetFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}