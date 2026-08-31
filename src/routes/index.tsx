import { createFileRoute } from "@tanstack/react-router";
import { useItems, updateItem, deleteItem } from "@/lib/useItems";
import { ItemCard } from "@/components/ItemCard";
import { BottomNav } from "@/components/BottomNav";
import { urgencyOf } from "@/lib/date";
import type { Item } from "@/lib/types";
import { AlertTriangle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "保质期记录" },
      {
        name: "description",
        content: "简便记录物品保质期，支持语音添加，到期自动提醒。",
      },
      { property: "og:title", content: "保质期记录" },
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

function Index() {
  const items = useItems();
  const active = items.filter((it) => !it.usedUp);
  const expired = active.filter((it) => urgencyOf(it) === "expired");
  const soon = active.filter((it) => urgencyOf(it) === "soon");
  const normal = active.filter((it) => urgencyOf(it) === "normal");

  const soonCount = expired.length + soon.length;

  return (
    <div className="min-h-screen bg-warm-bg pb-28">
      <header className="px-4 pb-2 pt-12">
        <h1 className="text-2xl font-bold text-foreground">保质期记录</h1>
        <p className="text-sm text-muted-foreground">
          {active.length > 0 ? `共 ${active.length} 件物品` : "还没有记录"}
        </p>
      </header>

      {soonCount > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-expired)]/10 px-4 py-3 text-[var(--color-expired)]">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">
              {soonCount} 件物品{expired.length > 0 ? "已过期" : "即将过期"}
              ，请尽快处理
            </span>
          </div>
        </div>
      )}

      {active.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {expired.length > 0 && (
            <Section title="已过期">
              {expired.map((it) => (
                <ExpiringRow key={it.id} item={it} />
              ))}
            </Section>
          )}
          {soon.length > 0 && (
            <Section title="即将过期">
              {soon.map((it) => (
                <ExpiringRow key={it.id} item={it} />
              ))}
            </Section>
          )}
          {normal.length > 0 && (
            <Section title="正常">
              {normal.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </Section>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function ExpiringRow({ item }: { item: Item }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <ItemCard item={item} />
      </div>
      <button
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-destructive"
        aria-label="删除"
        onClick={() => deleteItem(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
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
