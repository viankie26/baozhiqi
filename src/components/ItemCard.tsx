import { Link } from "@tanstack/react-router";
import { CATEGORY_EMOJI, CATEGORY_LABEL, type Item } from "@/lib/types";
import {
  daysUntil,
  formatDate,
  progressOf,
  urgencyOf,
  type Urgency,
} from "@/lib/date";

const rail: Record<Urgency, string> = {
  expired: "bg-expired",
  soon: "bg-soon",
  normal: "bg-safe",
};

const tone: Record<Urgency, string> = {
  expired: "text-expired",
  soon: "text-soon",
  normal: "text-safe",
};

const chip: Record<Urgency, string> = {
  expired: "bg-expired-soft text-expired",
  soon: "bg-soon-soft text-soon",
  normal: "bg-safe-soft text-safe",
};

const statusLabel: Record<Urgency, string> = {
  expired: "已过期",
  soon: "临期",
  normal: "正常",
};

export function ItemCard({ item, muted }: { item: Item; muted?: boolean }) {
  const urgency = urgencyOf(item);
  const days = daysUntil(item.expiryDate);
  const progress = progressOf(item);

  return (
    <Link
      to="/item/$id"
      params={{ id: item.id }}
      className={`card-elevated relative flex items-stretch gap-3 overflow-hidden rounded-2xl p-3 pl-4 transition duration-200 active:scale-[0.985] ${
        muted ? "opacity-70" : ""
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${rail[urgency]}`} />

      <div className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-2xl bg-muted text-[1.375rem]">
        {CATEGORY_EMOJI[item.category]}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[0.9375rem] font-semibold text-foreground">
            {item.name}
          </p>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium ${chip[urgency]}`}
          >
            {statusLabel[urgency]}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {CATEGORY_LABEL[item.category]} · {formatDate(item.expiryDate)}
          {item.note ? ` · ${item.note}` : ""}
        </p>
        <div className="mt-0.5 h-1 w-full max-w-[9rem] overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${rail[urgency]} transition-[width] duration-500`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center pl-1">
        <span className={`text-xl font-bold leading-none tabular-nums ${tone[urgency]}`}>
          {Math.abs(days)}
        </span>
        <span className="mt-1 text-[0.6875rem] text-muted-foreground">
          {days < 0 ? "天前过期" : days === 0 ? "今天到期" : "天后到期"}
        </span>
      </div>
    </Link>
  );
}
