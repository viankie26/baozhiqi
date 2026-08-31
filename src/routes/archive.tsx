import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "归档 · 保质期记录" },
      { name: "description", content: "已用完和已删除的物品归档。" },
    ],
  }),
  component: ArchivePage,
});

import { useItems, updateItem, deleteItem } from "@/lib/useItems";
import { ItemCard } from "@/components/ItemCard";
import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

function ArchivePage() {
  const items = useItems();
  const { deleteItem, updateItem } = { deleteItem, updateItem };
  const archived = items.filter((it) => it.usedUp);

  return (
    <div className="min-h-screen bg-warm-bg pb-28">
      <header className="px-4 pb-2 pt-12">
        <h1 className="text-2xl font-bold text-foreground">归档</h1>
        <p className="text-sm text-muted-foreground">已用完的物品</p>
      </header>

      {archived.length === 0 ? (
        <div className="px-4 py-16 text-center text-muted-foreground">
          还没有归档的物品
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {archived.map((it) => (
            <div key={it.id} className="flex items-center gap-2">
              <div className="flex-1 opacity-60">
                <ItemCard item={it} />
              </div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground"
                aria-label="恢复"
                onClick={() => {
                  updateItem(it.id, { usedUp: false });
                  toast.success("已恢复");
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-destructive"
                aria-label="删除"
                onClick={() => {
                  deleteItem(it.id);
                  toast.success("已删除");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
