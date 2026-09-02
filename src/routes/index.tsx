import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useItems, deleteItem } from "@/lib/useItems";
import { ItemCard } from "@/components/ItemCard";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { urgencyOf } from "@/lib/date";
import type { Item } from "@/lib/types";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "保质期记录 · 家中物品到期一目了然" },
      {
        name: "description",
        content: "简便记录物品保质期，支持语音添加，到期自动提醒。",
      },
      { property: "og:title", content: "保质期记录 · 家中物品到期一目了然" },
      {
        property: "og:description",
        content: "简便记录物品保质期，支持语音添加，到期自动提醒。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Filter = "all" | "soon" | "expired";

function Index() {
  const items = useItems();
  const [filter, setFilter] = useState<Filter>("all");

  const active = items.filter((it) => !it.usedUp);
  const expired = active.filter((it) => urgencyOf(it) === "expired");
  const soon = active.filter((it) => urgencyOf(it) === "soon");
  const normal = active.filter((it) => urgencyOf(it) === "normal");
  const alertCount = expired.length + soon.length;

  const showExpired = filter === "all" || filter === "expired";
  const showSoon = filter === "all" || filter === "soon";
  const showNormal = filter === "all";

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <PageHeader
        title="保质期记录"
        subtitle={active.length > 0 ? `在库 ${active.length} 件物品` : "还没有记录"}
      />

      <main className="mx-auto max-w-md px-4">
        <section className="animate-rise mt-4 grid grid-cols-3 gap-2">
          <Stat label="在库" value={active.length} tone="text-foreground" />
          <Stat label="临期" value={soon.length} tone="text-soon" />
          <Stat label="已过期" value={expired.length} tone="text-expired" />
        </section>

        {alertCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-expired-soft px-4 py-3 text-expired">
            <AlertTriangle className="h-[1.15rem] w-[1.15rem] shrink-0" />
            <span className="text-[0.8125rem] font-medium">
              {alertCount} 件物品{expired.length > 0 ? "已过期或临期" : "即将过期"}，请尽快处理
            </span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            全部
          </Chip>
          <Chip active={filter === "soon"} onClick={() => setFilter("soon")}>
            临期 {soon.length}
          </Chip>
          <Chip active={filter === "expired"} onClick={() => setFilter("expired")}>
            已过期 {expired.length}
          </Chip>
        </div>

        {active.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {showExpired && expired.length > 0 && (
              <Section title="已过期">
                {expired.map((it) => (
                  <ExpiringRow key={it.id} item={it} />
                ))}
              </Section>
            )}
            {showSoon && soon.length > 0 && (
              <Section title="即将过期">
                {soon.map((it) => (
                  <ExpiringRow key={it.id} item={it} />
                ))}
              </Section>
            )}
            {showNormal && normal.length > 0 && (
              <Section title="正常">
                {normal.map((it) => (
                  <ItemCard key={it.id} item={it} />
                ))}
              </Section>
            )}
            {filter === "soon" && soon.length === 0 && <NoMatch text="暂无临期物品" />}
            {filter === "expired" && expired.length === 0 && (
              <NoMatch text="暂无已过期物品" />
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="card-elevated rounded-2xl px-3 py-3 text-center">
      <p className={`text-xl font-bold tabular-nums ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">{label}</p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition active:scale-95 ${
        active
          ? "bg-primary text-primary-foreground"
          : "card-elevated text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ExpiringRow({ item }: { item: Item }) {
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <ItemCard item={item} />
      </div>
      <button
        className="card-elevated flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-destructive transition active:scale-95"
        aria-label="删除"
        onClick={() => {
          deleteItem(item.id);
          toast.success("已删除");
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <h2 className="px-1 text-[0.6875rem] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function NoMatch({ text }: { text: string }) {
  return (
    <p className="py-14 text-center text-sm text-muted-foreground">{text}</p>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl">
        📅
      </div>
      <p className="text-muted-foreground">还没有记录任何物品</p>
      <p className="text-sm text-muted-foreground/70">
        点击下方的 ＋ 按钮，语音或手动添加
      </p>
    </div>
  );
}
