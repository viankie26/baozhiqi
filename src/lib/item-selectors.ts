import { urgencyOf } from "./date";
import type { Category, Item } from "./types";

export type ItemFilter = "all" | "soon" | "expired";

/** Platform-independent list calculations; preserve the incoming record order. */
export function selectHomeItems(
  items: readonly Item[],
  options: { query?: string; category?: Category | "all"; filter?: ItemFilter } = {},
  now: Date = new Date(),
) {
  const { query = "", category = "all", filter = "all" } = options;
  const allActive = items.filter((item) => !item.usedUp);
  const q = query.trim().toLowerCase();
  const active = allActive.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (!q || item.name.toLowerCase().includes(q) || (item.note ?? "").toLowerCase().includes(q)),
  );
  const expired: Item[] = [];
  const soon: Item[] = [];
  const normal: Item[] = [];
  const groups = { expired, soon, normal };
  for (const item of active) groups[urgencyOf(item, now)].push(item);
  return {
    allActive,
    active,
    ...groups,
    alertCount: expired.length + soon.length,
    showExpired: filter === "all" || filter === "expired",
    showSoon: filter === "all" || filter === "soon",
    showNormal: filter === "all",
  };
}

export function selectArchivedItems(items: readonly Item[]): Item[] {
  return items.filter((item) => item.usedUp);
}