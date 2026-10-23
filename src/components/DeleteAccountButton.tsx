import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { resetItems } from "@/lib/storage";
import { deleteMyAccount } from "@/lib/account.functions";

export function DeleteAccountButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const del = useServerFn(deleteMyAccount);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await del();
      queryClient.clear();
      await supabase.auth.signOut();
      resetItems();
      toast.success("账号已注销，所有数据已删除");
      void navigate({ to: "/auth", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "注销失败，请稍后再试");
      setBusy(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="label-kicker w-full border border-destructive py-3 text-destructive">
          注销账号 / DELETE ACCOUNT
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定永久注销账号？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作不可恢复，将永久删除该账号下所有物品记录、提醒设置和登录信息。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>取消</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            className="bg-destructive text-destructive-foreground"
          >
            {busy ? "正在注销…" : "永久注销"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
