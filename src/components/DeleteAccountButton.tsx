import { useLang } from "@/lib/i18n";
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
  const { t } = useLang();
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
      toast.success(t.account.done);
      void navigate({ to: "/auth", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.account.fail);
      setBusy(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="label-kicker w-full border border-destructive py-3 text-destructive">
          {t.account.deleteBtn}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.account.confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.account.confirmBody}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{t.account.cancel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
            className="bg-destructive text-destructive-foreground"
          >
            {busy ? t.account.deleting : t.account.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
