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
        kicker="ARCHIVE"
        subtitle={archived.length > 0 ? `${archived.length} 件已用完` : "已用完的物品"}
      />

      <main className="mx-auto max-w-md px-5">
        {archived.length === 0 ? (
          <div className="py-20">
            <p className="font-display text-[2rem] leading-tight text-foreground">
              暂 无 归 档
            </p>
            <p className="mt-3 max-w-[18rem] text-sm text-muted-foreground">
              在物品详情页点击「用完」，它就会被收进这里。
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {archived.map((it) => (
              <div key={it.id} className="animate-rise hair-b pb-3">
                <ItemCard item={it} muted />
                <div className="flex gap-2">
                  <button
                    className="label-kicker flex flex-1 items-center justify-center gap-1.5 border-2 border-foreground bg-foreground py-3 text-background transition active:opacity-80"
                    onClick={() => {
                      updateItem(it.id, { usedUp: false });
                      toast.success("已回退到在库");
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> 回退 UNDO
                  </button>
                  <button
                    className="label-kicker flex items-center justify-center gap-1.5 border-2 border-foreground px-4 py-3 text-foreground transition active:bg-muted"
                    onClick={() => {
                      deleteItem(it.id);
                      toast.success("已删除");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 删除
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
