/**
 * TranscriptDatePicker
 * --------------------
 * A popover calendar input for filtering transcripts by date.
 *
 * - Displays only dates present in `transcriptDates`
 * - Allows selecting a single date and clearing with an "X" button
 * - Calls `onChange` when a date is picked and closes the popover
 * - Calls `onClear` to reset the selection
 */

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date | undefined>(value ?? undefined)

  function isDateEnabled(date: Date) {
    return transcriptDates.some(
      (d) => d.toDateString() === date.toDateString()
    )
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal pr-10 ${className}`}
            style={{ minHeight: 40 }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "yyyy-MM-dd") : <span>Pick a date…</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
              setMonth(date);
            }}
            className="rounded-md"
            disabled={(date: Date) => !isDateEnabled(date)}
            month={month}
            onMonthChange={setMonth}
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
          tabIndex={-1}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

