// components/TranscriptSelector.tsx
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { TranscriptDatePicker } from "@/components/transcript/TranscriptDatePicker";

export default function TranscriptSelector({
  transcripts = [],
  selectedId,
  onSelect,
  className = "",
}) {
  const [search, setSearch] = useState("");
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);

  // All unique dates as JS Date objects
  const transcriptDates = useMemo(
    () =>
      Array.from(
        new Set(
          transcripts
            .map((t) => t.date)
            .filter(Boolean)
        )
      )
        .map((d) => new Date(d as string))
        .filter((d) => !isNaN(d.getTime())),
    [transcripts]
  );

  // Filter by search and/or pickedDate
  const filtered = useMemo(() => {
    let list = transcripts;
    if (pickedDate) {
      list = list.filter((t)=>{
        console.log(t.date )
        console.log("newdate : ", new Date(t.date));

        return t.date && new Date(t.date).toDateString() === pickedDate.toDateString()
      }
      );
    }
    if (search.trim()) {
      list = list.filter((t) => {
        const title = t.title || "";
        const date = t.date || "";
        return (
          title.toLowerCase().includes(search.toLowerCase()) ||
          date.toLowerCase().includes(search.toLowerCase())
        );
      });
    }
    return list;
  }, [transcripts, search, pickedDate]);

  return (
    <div className={`w-80 bg-background flex flex-col border-r h-[900px] ${className}`}>
      <div className="border-1 pl-10 flex items-center h-12">
      <h1 className="text-lg ">Transcripts
      </h1>
      </div>
      
      <div className="p-4 border-b flex flex-col gap-2">
        <TranscriptDatePicker
          transcriptDates={transcriptDates}
          value={pickedDate}
          onChange={setPickedDate}
          onClear={() => setPickedDate(undefined)}
        />
      </div>
      <div className="overflow-auto flex-1">
        <table className="min-w-full table-auto text-left border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs text-muted-foreground uppercase">
              <th className="pl-4 py-2">Title</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-muted-foreground py-8">
                  No transcripts found
                </td>
              </tr>
            )}
            {filtered.map((t) => (
              <tr
                key={t.id}
                className={`
                  transition
                  ${selectedId === t.id ? "bg-primary/10 font-medium" : "hover:bg-muted"}
                  rounded-xl
                  cursor-pointer
                `}
                onClick={() => onSelect?.(t)}
                tabIndex={0}
                role="button"
                aria-selected={selectedId === t.id}
              >
                <td className="pl-4 py-3 truncate max-w-[10rem]">
                  {t.title || <span className="italic text-muted-foreground">Untitled</span>}
                </td>
                <td className="py-3">
                  <Badge variant={selectedId === t.id ? "default" : "outline"}>{t.date}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

