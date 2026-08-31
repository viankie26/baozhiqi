import { Link } from "@tanstack/react-router";
import { CATEGORY_EMOJI, type Item } from "@/lib/types";
import { daysUntil, formatDate, remainingLabel, urgencyOf, type Urgency } from "@/lib/date";

const urgencyColor: Record<Urgency, string> = {
  expired: "var(--color-expired)",
  soon: "var(--color-soon)",
  normal: "var(--color-safe)",
};

const urgencyBar: Record<Urgency, string> = {
  expired: "bg-[var(--color-expired)]",
  soon: "bg-[var(--color-soon)]",
  normal: "bg-[var(--color-safe)]",
};

export function ItemCard({ item }: { item: Item }) {
  const urgency = urgencyOf(item);
  const days = daysUntil(item.expiryDate);

  return (
    <Link
      to="/item/$id"
      params={{ id: item.id }}
      className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 pr-4 shadow-sm transition active:scale-[0.99]"
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${urgencyBar[urgency]}`} />
      <div className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
        {CATEGORY_EMOJI[item.category]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground">{formatDate(item.expiryDate)}</p>
        {item.note ? (
          <p className="truncate text-xs text-muted-foreground/80">{item.note}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        <span
          className="text-sm font-semibold"
          style={{ color: urgencyColor[urgency] }}
        >
          {remainingLabel(item)}
        </span>
        {days >= 0 && days <= 30 && (
          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${urgencyBar[urgency]}`}
              style={{ width: `${Math.min(100, 100 - days * (100 / 30))}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
