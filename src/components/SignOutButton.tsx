import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resetItems } from "@/lib/storage";

export function SignOutButton() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    if (busy) return;
    setBusy(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    resetItems();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <Button variant="plain" size="natural"
      onClick={handleSignOut}
      disabled={busy}
      aria-label={t.account.signOutAria}
      className="flex h-9 items-center gap-1.5 border border-border px-2.5 text-muted-foreground transition active:bg-muted disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" strokeWidth={2.4} />
      <span className="label-kicker">{t.account.signOut}</span>
    </Button>
  );
}
