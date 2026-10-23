import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently deletes the caller's account and every row they own. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: items } = await supabaseAdmin.from("items").select("id").eq("user_id", userId);
    const ids = (items ?? []).map((i) => i.id);
    if (ids.length) await supabaseAdmin.from("notification_log").delete().in("item_id", ids);
    await supabaseAdmin.from("items").delete().eq("user_id", userId);
    await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", userId);
    await supabaseAdmin.from("notification_settings").delete().eq("user_id", userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("注销失败，请稍后再试");
    return { ok: true };
  });
