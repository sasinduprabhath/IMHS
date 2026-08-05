"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value?: string;
  onChange?: (isoString: string) => void;
  className?: string;
}

export default function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [hour, setHour] = React.useState("12")
  const [minute, setMinute] = React.useState("00")
  const [ampm, setAmpm] = React.useState("PM")

  // Final combined DateTime
  const selectedDateTime = React.useMemo(() => {
    if (!date) return null
    const d = new Date(date)
    let h = parseInt(hour)
    if (ampm === "PM" && h < 12) h += 12
    if (ampm === "AM" && h === 12) h = 0
    d.setHours(h, parseInt(minute), 0, 0)
    return d
  }, [date, hour, minute, ampm])

  React.useEffect(() => {
    if (selectedDateTime && onChange) {
      const year = selectedDateTime.getFullYear();
      const month = String(selectedDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDateTime.getDate()).padStart(2, '0');
      const hours = String(selectedDateTime.getHours()).padStart(2, '0');
      const minutes = String(selectedDateTime.getMinutes()).padStart(2, '0');
      onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [selectedDateTime, onChange]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal bg-slate-50 border-slate-200 rounded-xl text-xs py-2.5", !date && "text-slate-400")}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#0E57A4]" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-fit z-[100]" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
        </PopoverContent>
      </Popover>

      {/* Time Picker */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-slate-500 shrink-0" />
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const h = i + 1
              return (
                <SelectItem key={h} value={h.toString().padStart(2, "0")}>
                  {h.toString().padStart(2, "0")}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <span className="font-bold text-slate-400">:</span>

        <Select value={minute} onValueChange={setMinute}>
          <SelectTrigger className="w-[75px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["00", "15", "30", "45"].map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ampm} onValueChange={setAmpm}>
          <SelectTrigger className="w-[75px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Result */}
      <p className="text-[11px] font-mono text-slate-500">
        Selected:{" "}
        {selectedDateTime
          ? format(selectedDateTime, "PPP p")
          : "No date & time selected"}
      </p>
    </div>
  )
}
