import { useState, useMemo } from "react"
import { TranscriptDatePicker } from "@/components/transcript/TranscriptDatePicker"
import { parseISO, isSameDay, format } from "date-fns"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

export interface Transcript {
  id: string | number
  title?: string
  filename?: string
  date: string
  [key: string]: any
}

export interface TranscriptSelectorProps {
  transcripts?: Transcript[]
  selectedId?: Transcript["id"]
  onSelect?: (t: Transcript) => void
  className?: string
}

export default function TranscriptSelector({
  transcripts = [],
  selectedId,
  onSelect,
  className = "",
}: TranscriptSelectorProps) {
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined)

  const transcriptDates = useMemo<Date[]>(
    () =>
      Array.from(new Set(transcripts.map((t) => t.date).filter(Boolean)))
        .map((d) => parseISO(d as string))
        .filter((d) => !isNaN(d.getTime())),
    [transcripts]
  )

  const filtered = useMemo<Transcript[]>(() => {
    if (pickedDate) {
      return transcripts.filter((t) => {
        const tDate = t.date ? parseISO(t.date) : undefined
        return tDate && isSameDay(tDate, pickedDate)
      })
    }
    return transcripts
  }, [transcripts, pickedDate])

  const grouped = useMemo(() => {
    return filtered.reduce((acc, t) => {
      if (!t.date) return acc
      const dayKey = format(parseISO(t.date), "yyyy-MM-dd")
      if (!acc[dayKey]) acc[dayKey] = []
      acc[dayKey].push(t)
      return acc
    }, {} as Record<string, Transcript[]>)
  }, [filtered])

  return (
    <div
      className={`flex flex-col h-full w-[260px] bg-card border-r ${className}`}
    >
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
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No transcripts found
          </div>
        )}

        <Accordion type="multiple" className="w-full">
          {Object.entries(grouped).map(([day, list]) => {
            const label = format(parseISO(day), "MMM d, yyyy")
            const single = list.length === 1
            const groupSelected = list.some((t) => t.id === selectedId) // ✅ check if any transcript in this group is selected

            return (
              <AccordionItem key={day} value={day}>
                <AccordionTrigger
                  className={`${single ? "[&>svg]:hidden" : ""} ${
                    groupSelected ? "bg-accent text-primary" : ""
                  } px-2  rounded-none`}
                  onClick={(e) => {
                    if (single) {
                      e.preventDefault() // prevent accordion toggle
                      onSelect?.(list[0])
                    }
                  }}
                >
                  <div className="flex justify-between w-full">
                    <span>{label}</span>
                    {!single && (
                      <span className="text-sm text-muted-foreground">
                        {list.length} transcripts
                      </span>
                    )}
                  </div>
                </AccordionTrigger>

                {!single && (
                  <AccordionContent>
                    <div className="flex flex-col gap-1 mt-2">
                      {list.map((t, i) => {
                        const isSelected = selectedId === t.id
                        return (
                          <button
                            key={t.id}
                            onClick={() => onSelect?.(t)}
                            className={`w-full text-left px-3 py-2 ${
                              isSelected
                                ? "bg-accent text-primary"
                                : "hover:bg-accent hover:text-primary"
                            }`}
                          >
                            Transcript {i + 1}
                          </button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                )}
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}

