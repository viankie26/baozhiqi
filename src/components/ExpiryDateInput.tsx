import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/date";
import { composeExpiryDate, splitExpiryDate } from "@/lib/expiry-input";

/**
 * Expiry date entry: 年 / 月 / 日 fields where the year only needs two digits
 * (26 → 2026), plus a full calendar picker that shows complete dates.
 */
export function ExpiryDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [open, setOpen] = useState(false);
  const lastEmitted = useRef<string | null>(null);

  // Sync fields when the value changes externally (initial edit value, resets).
  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = null;
    const parts = splitExpiryDate(value);
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
  }, [value]);

  function update(next: { year?: string; month?: string; day?: string }) {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const d = next.day ?? day;
    setYear(y);
    setMonth(m);
    setDay(d);
    const iso = composeExpiryDate(y, m, d);
    lastEmitted.current = iso ?? "";
    onChange(iso ?? "");
  }

  return (
    <div>
      <div className="flex items-end gap-5">
        <SegField label="年" hint="后两位">
          <input
            className={segInput}
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            placeholder="26"
            value={year}
            onChange={(e) => update({ year: e.target.value.replace(/\D/g, "") })}
          />
        </SegField>
        <SegField label="月">
          <input
            className={segInput}
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="9"
            value={month}
            onChange={(e) => update({ month: e.target.value.replace(/\D/g, "") })}
          />
        </SegField>
        <SegField label="日">
          <input
            className={segInput}
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            placeholder="15"
            value={day}
            onChange={(e) => update({ day: e.target.value.replace(/\D/g, "") })}
          />
        </SegField>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="打开日历选择完整日期"
              className="mb-1.5 ml-auto flex h-11 w-11 shrink-0 items-center justify-center border-2 border-foreground text-foreground transition active:bg-muted"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value ? new Date(`${value}T00:00:00`) : undefined}
              defaultMonth={value ? new Date(`${value}T00:00:00`) : undefined}
              onSelect={(date) => {
                if (!date) return;
                const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
                  date.getDate(),
                ).padStart(2, "0")}`;
                const parts = splitExpiryDate(iso);
                setYear(parts.year);
                setMonth(parts.month);
                setDay(parts.day);
                lastEmitted.current = iso;
                onChange(iso);
                setOpen(false);
              }}
              initialFocus
              className="pointer-events-auto p-3"
            />
          </PopoverContent>
        </Popover>
      </div>

      {value ? (
        <p className="label-kicker mt-3 text-muted-foreground">{formatDate(value)}</p>
      ) : (
        <p className="label-kicker mt-3 text-muted-foreground">年填后两位即可，如 26 = 2026</p>
      )}
    </div>
  );
}

const segInput =
  "w-full border-b-2 border-foreground bg-transparent px-0 py-2.5 text-center text-[1.0625rem] text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-expired";

function SegField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-16">
      {children}
      <p className="label-kicker mt-2 text-muted-foreground">
        {label}
        {hint ? ` ${hint}` : ""}
      </p>
    </div>
  );
}
