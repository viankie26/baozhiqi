import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useItems, deleteItem } from "@/lib/useItems";
import { ItemCard } from "@/components/ItemCard";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { urgencyOf } from "@/lib/date";
import type { Item } from "@/lib/types";
import { Trash2 } from "lucide-react";
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

  const today = new Date();
  const dateline = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <PageHeader title="保质期记录" kicker={`EXPIRY LEDGER · ${dateline}`} />

      <main className="mx-auto max-w-md px-5">
        {/* Numbers strip */}
        <section className="animate-rise grid grid-cols-3 border-b-2 border-foreground">
          <Stat label="在库 STOCK" value={active.length} tone="text-foreground" />
          <Stat
            label="临期 SOON"
            value={soon.length}
            tone="text-soon"
            divider
          />
          <Stat
            label="过期 OVER"
            value={expired.length}
            tone="text-expired"
            divider
          />
        </section>

        {alertCount > 0 && (
          <p className="label-kicker bg-foreground px-3 py-2.5 text-background">
            ⚠ {alertCount} 件需要处理
          </p>
        )}

        {/* Filter tabs */}
        <div className="flex gap-5 border-b border-border py-3">
          <Tab active={filter === "all"} onClick={() => setFilter("all")}>
            全部
          </Tab>
          <Tab active={filter === "soon"} onClick={() => setFilter("soon")}>
            临期 {soon.length}
          </Tab>
          <Tab active={filter === "expired"} onClick={() => setFilter("expired")}>
            过期 {expired.length}
          </Tab>
        </div>

        {active.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col">
            {showExpired && expired.length > 0 && (
              <Section title="已过期 / OVERDUE">
                {expired.map((it) => (
                  <ExpiringRow key={it.id} item={it} />
                ))}
              </Section>
            )}
            {showSoon && soon.length > 0 && (
              <Section title="即将过期 / DUE SOON">
                {soon.map((it) => (
                  <ExpiringRow key={it.id} item={it} />
                ))}
              </Section>
            )}
            {showNormal && normal.length > 0 && (
              <Section title="正常 / IN DATE">
                {normal.map((it) => (
                  <div key={it.id} className="hair-b">
                    <ItemCard item={it} />
                  </div>
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
  divider,
}: {
  label: string;
  value: number;
  tone: string;
  divider?: boolean;
}) {
  return (
    <div className={`py-4 ${divider ? "border-l border-border pl-3" : "pr-3"}`}>
      <p className={`font-display text-[2rem] leading-none tabular-nums ${tone}`}>
        {value}
      </p>
      <p className="label-kicker mt-2 text-muted-foreground">{label}</p>
    </div>
  );
}

function Tab({
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
      className={`label-kicker pb-1 transition ${
        active
          ? "border-b-2 border-foreground text-foreground"
          : "border-b-2 border-transparent text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ExpiringRow({ item }: { item: Item }) {
  return (
    <div className="hair-b grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <div className="min-w-0">
        <ItemCard item={item} />
      </div>
      <button
        className="flex h-11 w-11 shrink-0 items-center justify-center border border-border text-muted-foreground transition active:bg-muted"
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
    <div className="flex flex-col">
      <h2 className="label-kicker sticky top-[7.5rem] z-10 bg-warm-bg py-3 text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function NoMatch({ text }: { text: string }) {
  return <p className="py-16 text-center text-sm text-muted-foreground">{text}</p>;
}

function EmptyState() {
  return (
    <div className="py-20">
      <p className="font-display text-[2rem] leading-tight text-foreground">
        空 空 如 也
      </p>
      <p className="mt-3 max-w-[18rem] text-sm text-muted-foreground">
        点击底部的加号，用一句话记录第一件物品的保质期。
      </p>
    </div>
  );
}
