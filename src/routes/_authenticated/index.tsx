import { useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useItems, deleteItem, addItem, loadItems } from "@/lib/useItems";
import { CATEGORIES, type Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search, WifiOff, RefreshCw } from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { selectHomeItems, type ItemFilter } from "@/lib/item-selectors";
import type { Item } from "@/lib/types";
import { CalendarPlus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { addAllToCalendar } from "@/lib/calendar";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Minipiry · 超简到期 · 家中物品到期一目了然" },
      {
        name: "description",
        content: "简便记录物品保质期，支持语音添加，到期自动提醒。",
      },
      { property: "og:title", content: "Minipiry · 超简到期 · 家中物品到期一目了然" },
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
  const { t } = useLang();
  const items = useItems();
  const [filter, setFilter] = useState<ItemFilter>("all");
  const [editing, setEditing] = useState(false);
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const online = useOnline();
  const pull = usePullToRefresh(async () => {
    await loadItems(true);
    toast.success(t.home.refreshed);
  });

  const { allActive, active, expired, soon, normal, alertCount, showExpired, showSoon, showNormal } =
    selectHomeItems(items, { query, category: cat, filter });

  const today = new Date();
  const dateline = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <PageHeader
        title={t.home.title}
        kicker={`MINIPIRY · ${dateline}`}
        right={
          <div className="flex items-center gap-2">
            <Link
              to="/reminders"
              aria-label={t.home.bellAria}
              className="flex h-9 w-9 items-center justify-center border-2 border-foreground text-foreground transition active:bg-muted"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <SignOutButton />
          </div>
        }
      />

      <main className="mx-auto max-w-md px-5">
        {pull > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" style={{ height: pull }}>
            <RefreshCw className="h-3.5 w-3.5" style={{ transform: `rotate(${pull * 4}deg)` }} />
            {pull >= 60 ? t.home.pullRefresh : ""}
          </div>
        )}
        {!online && (
          <div className="mt-3 flex items-center gap-2 border-2 border-expired/40 px-3 py-2 text-sm text-expired">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span className="flex-1">{t.home.offline}</span>
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => window.location.reload()}>
              {t.home.retry}
            </Button>
          </div>
        )}
        {/* Numbers strip */}
        <section className="animate-rise grid grid-cols-3 border-b-2 border-foreground">
          <Stat label={t.home.statStock} value={active.length} tone="text-foreground" />
          <Stat
            label={t.home.statSoon}
            value={soon.length}
            tone="text-soon"
            divider
          />
          <Stat
            label={t.home.statOver}
            value={expired.length}
            tone="text-expired"
            divider
          />
        </section>

        {alertCount > 0 && (
          <p className="label-kicker bg-foreground px-3 py-2.5 text-background">
            {t.home.alertNeed(alertCount)}
          </p>
        )}

        <div className="border-b border-border py-3">
          <Button
            variant="outline"
            className="w-full rounded-none"
            disabled={allActive.length === 0}
            onClick={() => {
              try {
                addAllToCalendar(items);
              } catch {
                toast.error(t.home.calFail);
              }
            }}
          >
            <CalendarPlus />
            {t.home.addAll}{active.length > 0 ? t.home.countSuffix(active.length) : ""}
          </Button>
        </div>

        {allActive.length > 0 && (
          <div className="space-y-3 border-b border-border py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.search}
                aria-label={t.home.search}
                className="rounded-none pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {([{ value: "all" as const, label: t.home.catAll, emoji: "" }, ...CATEGORIES.map((c) => ({ value: c.value, label: lang === "en" ? c.en : c.zh, emoji: c.emoji }))]).map((c) => (
                <Button
                  key={c.value}
                  variant={cat === c.value ? "default" : "outline"}
                  size="sm"
                  className="shrink-0 rounded-full"
                  aria-pressed={cat === c.value}
                  onClick={() => setCat(c.value)}
                >
                  {c.emoji} {c.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-5 border-b border-border py-3">
          <Tab active={filter === "all"} onClick={() => setFilter("all")}>
            {t.home.tabAll}
          </Tab>
          <Tab active={filter === "soon"} onClick={() => setFilter("soon")}>
            {t.home.tabSoon} {soon.length}
          </Tab>
          <Tab active={filter === "expired"} onClick={() => setFilter("expired")}>
            {t.home.tabExpired} {expired.length}
          </Tab>
          {allActive.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto shrink-0 rounded-none"
              aria-pressed={editing}
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? <X /> : <Pencil />}
              {editing ? t.home.done : t.home.edit}
            </Button>
          )}
        </div>

        {allActive.length === 0 ? (
          <EmptyState />
        ) : active.length === 0 ? (
          <NoMatch text={t.home.noResult} />
        ) : (
          <div className="flex flex-col">
            {showExpired && expired.length > 0 && (
              <Section title={t.home.secOverdue}>
                {expired.map((it) => (
                  <ExpiringRow key={it.id} item={it} editing={editing} />
                ))}
              </Section>
            )}
            {showSoon && soon.length > 0 && (
              <Section title={t.home.secSoon}>
                {soon.map((it) => (
                  <ExpiringRow key={it.id} item={it} editing={editing} />
                ))}
              </Section>
            )}
            {showNormal && normal.length > 0 && (
              <Section title={t.home.secOk}>
                {normal.map((it) => (
                  <ExpiringRow key={it.id} item={it} editing={editing} />
                ))}
              </Section>
            )}
            {filter === "soon" && soon.length === 0 && <NoMatch text={t.home.noSoon} />}
            {filter === "expired" && expired.length === 0 && (
              <NoMatch text={t.home.noExpired} />
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
    <Button variant="plain" size="natural"
      onClick={onClick}
      className={`label-kicker pb-1 transition ${
        active
          ? "border-b-2 border-foreground text-foreground"
          : "border-b-2 border-transparent text-muted-foreground"
      }`}
    >
      {children}
    </Button>
  );
}

function ExpiringRow({ item, editing }: { item: Item; editing: boolean }) {
  const { t } = useLang();
  return (
    <div
      className={`hair-b grid items-center transition ${
        editing
          ? "grid-cols-[minmax(0,1fr)_2.75rem] gap-1 bg-foreground/[0.06]"
          : "grid-cols-[minmax(0,1fr)]"
      }`}
    >
      <div className="min-w-0">
        <ItemCard item={item} />
      </div>
      {editing && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-end">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-none border-expired/40 text-expired"
                aria-label={t.home.deleteAria(item.name)}
                onClick={() => {
                  deleteItem(item.id);
                  toast.success(t.home.deleted);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
        </div>
      )}
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
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  return (
    <div className="py-20">
      <p className="font-display text-[2rem] leading-tight text-foreground">
        {t.home.emptyTitle}
      </p>
      <p className="mt-3 max-w-[18rem] text-sm text-muted-foreground">
        {t.home.emptyBody}
      </p>
      <Button
        variant="outline"
        className="mt-6 rounded-none"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const offsets = [-1, 2, 20, 90, 5, 365];
          const cats: Category[] = ["food", "food", "medicine", "daily", "food", "other"];
          await Promise.all(
            t.home.sampleNames.map((name, i) => {
              const d = new Date();
              d.setDate(d.getDate() + (offsets[i] ?? 30));
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              return addItem({ name, category: cats[i] ?? "other", expiryDate: iso });
            }),
          );
          setBusy(false);
          toast.success(t.home.sampleDone);
        }}
      >
        {t.home.sampleBtn}
      </Button>
    </div>
  );
}

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

/** Touch pull-down at page top; returns current pull distance in px. */
function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pull, setPull] = useState(0);
  const start = useRef<number | null>(null);
  const dist = useRef(0);
  const cb = useRef(onRefresh);
  cb.current = onRefresh;
  useEffect(() => {
    const down = (e: TouchEvent) => {
      start.current = window.scrollY <= 0 ? (e.touches[0]?.clientY ?? 0) : null;
    };
    const move = (e: TouchEvent) => {
      if (start.current === null) return;
      const d = Math.max(0, Math.min(90, ((e.touches[0]?.clientY ?? start.current) - start.current) * 0.5));
      dist.current = d;
      setPull(d);
    };
    const up = () => {
      if (dist.current >= 60) void cb.current();
      start.current = null;
      dist.current = 0;
      setPull(0);
    };
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, []);
  return pull;
}
