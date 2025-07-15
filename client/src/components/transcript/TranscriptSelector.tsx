import { useState, useMemo } from "react";
import { TranscriptDatePicker } from "@/components/transcript/TranscriptDatePicker";
import { parseISO, isSameDay, format } from "date-fns";

export interface Transcript {
  id: string | number;
  title?: string;
  date: string;
  [key: string]: any;
}

export interface TranscriptSelectorProps {
  transcripts?: Transcript[];
  selectedId?: Transcript["id"];
  onSelect?: (t: Transcript) => void;
  className?: string;
}

export default function TranscriptSelector({
  transcripts = [],
  selectedId,
  onSelect,
  className = "",
}: TranscriptSelectorProps) {
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);

  const transcriptDates = useMemo<Date[]>(
    () =>
      Array.from(
        new Set(transcripts.map((t) => t.date).filter(Boolean))
      )
        .map((d) => parseISO(d as string))
        .filter((d) => !isNaN(d.getTime())),
    [transcripts]
  );

  const filtered = useMemo<Transcript[]>(() => {
    let list = transcripts;
    if (pickedDate) {
      list = list.filter((t) => {
        const tDate = t.date ? parseISO(t.date) : undefined;
        return tDate && isSameDay(tDate, pickedDate);
      });
    }
    return list;
  }, [transcripts, pickedDate]);

  return (
    <div className={`flex flex-col h-full w-[260px] bg-card border-r ${className}`}>
      <div className="h-14 w-full flex justify-center items-end px-2">
        <span className="text-lg font-semibold text-primary">Transcripts</span>
      </div>
      <div className="p-4 border-b border-border flex flex-col gap-2">
        <TranscriptDatePicker
          transcriptDates={transcriptDates}
          value={pickedDate}
          onChange={setPickedDate}
          onClear={() => setPickedDate(undefined)}
        />
      </div>
      <div className="flex-1 overflow-auto flex flex-col gap-1 px-2 py-4">
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No transcripts found
          </div>
        )}
        {filtered.map((t) => {
          let formattedDate = "";
          if (t.date) {
            try {
              formattedDate = format(parseISO(t.date), "MMM d, yyyy");
            } catch {
              formattedDate = t.date;
            }
          }
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect?.(t)}
              tabIndex={0}
              aria-selected={isSelected}
              className={`
                w-full flex items-center px-4 py-2 rounded-lg
                font-medium transition-colors duration-150
                text-left
                ${isSelected
                  ? "bg-accent text-primary"
                  : "hover:bg-accent hover:text-primary text-foreground"}
                outline-none focus-visible:ring-2 focus-visible:ring-accent
                shadow-none border-0
              `}
              style={{ minHeight: 40 }}
            >
              <span className="truncate">{formattedDate}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

