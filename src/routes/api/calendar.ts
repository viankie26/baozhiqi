import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { buildCalendar, validCalendarDate, type CalendarEntry } from "@/lib/calendar-data";

const entrySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(1000),
  date: z.string().refine(validCalendarDate, "Invalid date"),
  category: z.string().max(50).optional(),
  note: z.string().max(10000).optional(),
});

function calendarResponse(entries: CalendarEntry[]) {
  return new Response(buildCalendar(entries), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="expiry-reminders.ics"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const Route = createFileRoute("/api/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = entrySchema.safeParse({
          name: url.searchParams.get("name"),
          date: url.searchParams.get("date"),
          category: url.searchParams.get("category") ?? undefined,
          note: url.searchParams.get("note") ?? undefined,
        });
        if (!parsed.success) return new Response("Invalid parameters", { status: 400 });
        return calendarResponse([parsed.data]);
      },
      POST: async ({ request }) => {
        // Only formats the caller's supplied data; no account data is read/stored.
        const origin = request.headers.get("origin");
        if (!origin || origin !== new URL(request.url).origin) {
          return new Response("Forbidden", { status: 403 });
        }
        try {
          const form = await request.formData();
          const raw = form.get("items");
          if (typeof raw !== "string" || raw.length > 5_000_000) {
            return new Response("Invalid parameters", { status: 400 });
          }
          const parsed = z.array(entrySchema).min(1).max(10000).safeParse(JSON.parse(raw));
          if (!parsed.success) return new Response("Invalid parameters", { status: 400 });
          return calendarResponse(parsed.data);
        } catch {
          return new Response("Invalid parameters", { status: 400 });
        }
      },
    },
  },
});