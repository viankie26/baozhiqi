import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, CheckCircle2 } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/types";
import { deleteItem, updateItem, useItemById } from "@/lib/useItems";
import { PageHeader } from "@/components/PageHeader";
import { daysUntil, formatDate, urgencyOf } from "@/lib/date";

export const Route = createFileRoute("/item/$id")({
  head: () => ({
    meta: [
      { title: "物品详情 · 保质期记录" },
      { name: "description", content: "查看和编辑物品的保质期、分类与备注。" },
      { property: "og:title", content: "物品详情 · 保质期记录" },
      {
        property: "og:description",
        content: "查看和编辑物品的保质期、分类与备注。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ItemDetailPage,
});

const inputClass =
  "w-full border-b-2 border-foreground bg-transparent px-0 py-2.5 text-[1.0625rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-expired";

function ItemDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const item = useItemById(id);
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<Category>(item?.category ?? "food");
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate ?? "");
  const [note, setNote] = useState(item?.note ?? "");

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-warm-bg px-6 text-center">
        <p className="font-display text-[1.5rem] text-foreground">物品不存在</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="label-kicker bg-foreground px-5 py-3 text-background"
        >
          返回首页
        </button>
      </div>
    );
  }

  const days = daysUntil(item.expiryDate);
  const urgency = urgencyOf(item);
  const dayTone =
    urgency === "expired"
      ? "text-expired"
      : urgency === "soon"
        ? "text-soon"
        : "text-foreground";

  function handleSave() {
    if (!name.trim()) {
      toast.error("请填写名称");
      return;
    }
    if (!expiryDate) {
      toast.error("请选择日期");
      return;
    }
    updateItem(id, {
      name: name.trim(),
      category,
      expiryDate,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    toast.success("已更新");
    navigate({ to: "/" });
  }

  function handleDelete() {
    deleteItem(id);
    toast.success("已删除");
    navigate({ to: "/" });
  }

  function handleUsedUp() {
    updateItem(id, { usedUp: true });
    toast.success("已标记为用完");
    navigate({ to: "/archive" });
  }

  return (
    <div className="min-h-screen bg-warm-bg pb-36">
      <PageHeader title={item.name} kicker="ITEM RECORD" back />

      <main className="mx-auto max-w-md px-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 border-b-2 border-foreground py-5">
          <span className={`font-display text-[3.5rem] leading-none tabular-nums ${dayTone}`}>
            {Math.abs(days)}
          </span>
          <span className="label-kicker pb-2 text-muted-foreground">
            {days < 0 ? "天前过期 / OVERDUE" : days === 0 ? "今天到期 / TODAY" : "天后到期 / LEFT"}
            <br />
            {formatDate(item.expiryDate)}
          </span>
        </div>

        <div className="flex flex-col gap-6 pt-7">
          <Field label="物品名称 / NAME">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="分类 / CATEGORY">
            <div className="grid grid-cols-4 border border-border">
              {CATEGORIES.map((c, i) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`label-kicker py-3.5 transition ${i > 0 ? "border-l border-border" : ""} ${
                    category === c.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="过期日期 / EXPIRY">
            <input
              type="date"
              className={inputClass}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </Field>
          <Field label="备注 / NOTE">
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="数量、存放位置等"
            />
          </Field>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-foreground bg-warm-bg px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
        <div className="mx-auto flex max-w-md gap-2">
          <button
            onClick={handleUsedUp}
            className="label-kicker flex flex-1 items-center justify-center gap-1.5 border-2 border-foreground py-3.5 text-foreground transition active:bg-muted"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> 用完
          </button>
          <button
            onClick={handleSave}
            className="label-kicker flex-[1.4] bg-foreground py-3.5 text-background transition active:opacity-80"
          >
            保存 / SAVE
          </button>
          <button
            onClick={handleDelete}
            className="flex min-h-11 items-center justify-center border-2 border-foreground px-4 text-foreground transition active:bg-muted"
            aria-label="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label-kicker text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
