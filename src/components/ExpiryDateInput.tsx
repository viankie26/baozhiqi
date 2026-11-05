import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { zhCN, enUS } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate, localDateString } from "@/lib/date";
import {
  DATE_PRESETS,
  composeExpiryDate,
  offsetExpiryDate,
  splitExpiryDate,
} from "@/lib/expiry-input";

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
  const { t, lang } = useLang();
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

  // Write a finished date back into the three fields and up to the parent.
  function applyIso(iso: string) {
    const parts = splitExpiryDate(iso);
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
    lastEmitted.current = iso;
    onChange(iso);
  }

  return (
    <div>
      <div className="flex items-end gap-5">
        <SegField label={t.dateInput.year} hint={t.dateInput.yearHintShort}>
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
        <SegField label={t.dateInput.month}>
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
        <SegField label={t.dateInput.day}>
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
            <Button variant="plain" size="natural"
              type="button"
              aria-label={t.dateInput.openCal}
              className="mb-1.5 ml-auto flex h-11 w-11 shrink-0 items-center justify-center border-2 border-foreground text-foreground transition active:bg-muted"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              locale={lang === "zh" ? zhCN : enUS}
              mode="single"
              selected={value ? new Date(`${value}T00:00:00`) : undefined}
              {...(value ? { defaultMonth: new Date(`${value}T00:00:00`) } : {})}
              onSelect={(date) => {
                if (!date) return;
                applyIso(localDateString(date));
                setOpen(false);
              }}
              initialFocus
              className="pointer-events-auto p-3"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {DATE_PRESETS.map((preset) => {
          const target = offsetExpiryDate(preset.id);
          const active = value === target;
          return (
            <Button variant="plain" size="natural"
              key={preset.id}
              type="button"
              aria-label={t.dateInput.presetAria(preset[lang])}
              onClick={() => applyIso(target)}
              className={`label-kicker min-h-11 border px-3.5 transition active:opacity-70 ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground"
              }`}
            >
              {preset[lang]}
            </Button>
          );
        })}
      </div>

      {value ? (
        <p className="label-kicker mt-3 text-muted-foreground">{formatDate(value, lang)}</p>
      ) : (
        <p className="label-kicker mt-3 text-muted-foreground">{t.dateInput.yearHint}</p>
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
