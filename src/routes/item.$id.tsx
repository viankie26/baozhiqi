import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Save, Trash2, CheckCircle2 } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/types";
import { deleteItem, updateItem, useItemById } from "@/lib/useItems";

export const Route = createFileRoute("/item/$id")({
  head: () => ({
    meta: [{ title: "物品详情 · 保质期记录" }],
  }),
  component: ItemDetailPage,
});

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-warm-bg px-4 text-center">
        <p className="text-muted-foreground">物品不存在或已删除</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
        >
          返回首页
        </button>
      </div>
    );
  }

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
    <div className="min-h-screen bg-warm-bg pb-32">
      <header className="px-4 pb-2 pt-12">
        <h1 className="text-2xl font-bold text-foreground">物品详情</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 pt-2">
        <Field label="物品名称">
          <input
            className="w-full rounded-xl border border-input bg-card px-3 py-3 text-foreground outline-none focus:border-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="分类">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs ${
                  category === c.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="过期日期">
          <input
            type="date"
            className="w-full rounded-xl border border-input bg-card px-3 py-3 text-foreground outline-none focus:border-primary"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </Field>
        <Field label="备注">
          <input
            className="w-full rounded-xl border border-input bg-card px-3 py-3 text-foreground outline-none focus:border-primary"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="数量、存放位置等"
          />
        </Field>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2">
          <button
            onClick={handleUsedUp}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 font-medium text-foreground"
          >
            <CheckCircle2 className="h-5 w-5 text-safe" /> 用完
          </button>
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground"
          >
            <Save className="h-5 w-5" /> 保存
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center rounded-2xl border border-border bg-card px-4 text-destructive"
            aria-label="删除"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
