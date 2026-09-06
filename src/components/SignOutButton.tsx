import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resetItems } from "@/lib/storage";

export function SignOutButton() {
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
    <button
      onClick={handleSignOut}
      disabled={busy}
      aria-label="退出登录"
      className="flex h-9 items-center gap-1.5 border border-border px-2.5 text-muted-foreground transition active:bg-muted disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" strokeWidth={2.4} />
      <span className="label-kicker">退出</span>
    </button>
  );
}
