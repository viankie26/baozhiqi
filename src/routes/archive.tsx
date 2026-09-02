import { createFileRoute } from "@tanstack/react-router";
import { useItems, updateItem, deleteItem } from "@/lib/useItems";
import { ItemCard } from "@/components/ItemCard";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "归档 · 保质期记录" },
      { name: "description", content: "查看已用完的物品，可一键回退到在库列表。" },
      { property: "og:title", content: "归档 · 保质期记录" },
      {
        property: "og:description",
        content: "查看已用完的物品，可一键回退到在库列表。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const items = useItems();
  const archived = items.filter((it) => it.usedUp);

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <PageHeader
        title="归档"
        subtitle={archived.length > 0 ? `${archived.length} 件已用完` : "已用完的物品"}
      />

      <main className="mx-auto max-w-md px-4 pt-4">
        {archived.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl">
              🗂️
            </div>
            <p className="text-muted-foreground">还没有归档的物品</p>
            <p className="text-sm text-muted-foreground/70">
              在详情页点击「用完」即可归档
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {archived.map((it) => (
              <div key={it.id} className="animate-rise flex flex-col gap-2">
                <ItemCard item={it} muted />
                <div className="flex gap-2">
                  <button
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-[0.8125rem] font-semibold text-primary-foreground transition active:scale-[0.98]"
                    onClick={() => {
                      updateItem(it.id, { usedUp: false });
                      toast.success("已回退到在库");
                    }}
                  >
                    <RotateCcw className="h-4 w-4" /> 回退
                  </button>
                  <button
                    className="card-elevated flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[0.8125rem] font-medium text-destructive transition active:scale-[0.98]"
                    onClick={() => {
                      deleteItem(it.id);
                      toast.success("已删除");
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> 删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
