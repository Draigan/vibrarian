import { useState } from "react";
import { Calendar } from "@/components/ui/calendar"
import { useTranscripts } from "@/hooks/useTranscripts";

export default function TranscriptCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const {data} = useTranscripts();
  console.log(data)

  return (
    <div className="p-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </div>
  )
}
