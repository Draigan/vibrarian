import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

export function TranscriptDatePicker({
  transcriptDates = [],
  value,
  onChange,
  onClear,
  className = "",
}) {
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
        <PopoverContent side="bottom" align="end" className="p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            className="rounded-md"
            disabled={(date) => !isDateEnabled(date)}
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

