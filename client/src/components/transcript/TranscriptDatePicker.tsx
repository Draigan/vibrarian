import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

// Add this at the top of your file (or export from a types file if you like)
export interface TranscriptDatePickerProps {
  transcriptDates: Date[];
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onClear?: () => void;
  className?: string;
}

export function TranscriptDatePicker({
  transcriptDates = [],
  value,
  onChange,
  onClear,
  className = "",
}: TranscriptDatePickerProps) {
  function isDateEnabled(date: Date) {
    return transcriptDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  }

  return (
    <div className="relative w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal pr-10 ${className}`}
            style={{ minHeight: 40 }} // Ensures X always fits
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "yyyy-MM-dd") : <span>Pick a date…</span>}
            {/* Spacer so text doesn't cover X */}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            className="rounded-md"
            disabled={(date: Date) => !isDateEnabled(date)}
            month={value ?? undefined}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onClear}
          aria-label="Clear date filter"
          className="absolute top-1/2 right-2 -translate-y-1/2 z-10"
          tabIndex={-1} // Prevent accidental focus
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

