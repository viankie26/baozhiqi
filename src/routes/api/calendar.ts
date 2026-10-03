import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().max(50).optional(),
  note: z.string().max(500).optional(),
});

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function ymd(dateStr: string, offsetDays = 0): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

export const Route = createFileRoute("/api/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          name: url.searchParams.get("name"),
          date: url.searchParams.get("date"),
          category: url.searchParams.get("category") ?? undefined,
          note: url.searchParams.get("note") ?? undefined,
        });
        if (!parsed.success) {
          return new Response("Invalid parameters", { status: 400 });
        }
        const { name, date, category, note } = parsed.data;

        const desc = [category ? `分类：${category}` : "", note ? `备注：${note}` : ""]
          .filter(Boolean)
          .join("\n");
        const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Expiry Ledger//CN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "BEGIN:VEVENT",
          `UID:${crypto.randomUUID()}@expiry-ledger`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${ymd(date)}`,
          `DTEND;VALUE=DATE:${ymd(date, 1)}`,
          `SUMMARY:${esc(`[到期提醒] ${name}`)}`,
          `DESCRIPTION:${esc(desc)}`,
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          `DESCRIPTION:${esc(`${name} 明天到期`)}`,
          "TRIGGER:-PT15H",
          "END:VALARM",
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          `DESCRIPTION:${esc(`${name} 今天到期`)}`,
          "TRIGGER:PT9H",
          "END:VALARM",
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n");

        // inline + text/calendar：iOS Safari 识别后直接弹「添加到日历」确认框
        return new Response(ics, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `inline; filename="reminder.ics"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
