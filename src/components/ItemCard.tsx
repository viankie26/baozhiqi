import { Link } from "@tanstack/react-router";
import { CATEGORY_LABEL, type Item } from "@/lib/types";
import { daysUntil, formatDate, urgencyOf, type Urgency } from "@/lib/date";

const tone: Record<Urgency, string> = {
  expired: "text-expired",
  soon: "text-soon",
  normal: "text-foreground",
};

const markBg: Record<Urgency, string> = {
  expired: "bg-expired text-primary-foreground",
  soon: "bg-soon text-primary-foreground",
  normal: "bg-foreground text-primary-foreground",
};

const statusLabel: Record<Urgency, string> = {
  expired: "EXPIRED",
  soon: "SOON",
  normal: "OK",
};

export function ItemCard({ item, muted }: { item: Item; muted?: boolean }) {
  const urgency = urgencyOf(item);
  const days = daysUntil(item.expiryDate);

  return (
    <Link
      to="/item/$id"
      params={{ id: item.id }}
      className={`group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-4 transition ${
        muted ? "opacity-55" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`label-kicker shrink-0 px-1.5 py-[3px] ${markBg[urgency]}`}
          >
            {statusLabel[urgency]}
          </span>
          <span className="label-kicker truncate text-muted-foreground">
            {CATEGORY_LABEL[item.category]}
          </span>
        </div>
        <p className="font-display mt-2 truncate text-[1.25rem] leading-none text-foreground">
          {item.name}
        </p>
        <p className="mt-1.5 truncate text-[0.8125rem] text-muted-foreground">
          {formatDate(item.expiryDate)}
          {item.note ? ` — ${item.note}` : ""}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <span
          className={`font-display block text-[2.5rem] leading-none tabular-nums ${tone[urgency]}`}
        >
          {Math.abs(days)}
        </span>
        <span className="label-kicker mt-1 block text-muted-foreground">
          {days < 0 ? "DAYS OVER" : days === 0 ? "TODAY" : "DAYS LEFT"}
        </span>
      </div>
    </Link>
  );
}
