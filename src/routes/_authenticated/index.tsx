import { useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useItems, deleteItem } from "@/lib/useItems";
import { ItemCard } from "@/components/ItemCard";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { urgencyOf } from "@/lib/date";
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

type Filter = "all" | "soon" | "expired";

function Index() {
  const { t } = useLang();
  const items = useItems();
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState(false);

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
            disabled={active.length === 0}
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
          {active.length > 0 && (
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

        {active.length === 0 ? (
          <EmptyState />
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
  return (
    <div className="py-20">
      <p className="font-display text-[2rem] leading-tight text-foreground">
        {t.home.emptyTitle}
      </p>
      <p className="mt-3 max-w-[18rem] text-sm text-muted-foreground">
        {t.home.emptyBody}
      </p>
    </div>
  );
}
