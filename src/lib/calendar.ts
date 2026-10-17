import { CATEGORY_LABEL, type Item } from "./types";
import { calendarEntries } from "./calendar-data";

export function addAllToCalendar(items: Item[]): number {
  const entries = calendarEntries(items);
  if (entries.length === 0) return 0;
  // POST keeps names/notes out of the URL and avoids URL length limits.
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/calendar";
  form.hidden = true;
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "items";
  input.value = JSON.stringify(entries);
  form.append(input);
  document.body.append(form);
  form.submit();
  form.remove();
  return entries.length;
}

export function addToCalendar(item: Item) {
  // Calendar import behavior depends on the browser/system calendar.
  const params = new URLSearchParams({
    name: item.name,
    date: item.expiryDate,
    category: CATEGORY_LABEL[item.category],
  });
  if (item.note) params.set("note", item.note);
  window.location.href = `/api/calendar?${params.toString()}`;
}
