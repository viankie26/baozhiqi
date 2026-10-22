import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { reminderWindow } from "@/lib/reminder-schedule";

export const Route = createFileRoute("/api/public/jobs/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const privateKey = process.env["VAPID_PRIVATE_KEY"];
        if (!privateKey) return new Response("Missing push key", { status: 500 });
        const { VAPID_PUBLIC_KEY } = await import("@/lib/reminder-schedule");
        const { buildPushPayload } = await import("@block65/webcrypto-web-push");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const vapid = { subject: "mailto:reminders@baozhiqi.app", publicKey: VAPID_PUBLIC_KEY, privateKey };

        const { data: settings } = await supabaseAdmin
          .from("notification_settings")
          .select("user_id,enabled,days_before,remind_hour,tz_offset_minutes")
          .eq("enabled", true);

        const now = Date.now();
        let sent = 0;
        for (const s of settings ?? []) {
          const win = reminderWindow(now, {
            enabled: s.enabled,
            daysBefore: s.days_before,
            remindHour: s.remind_hour,
            tzOffsetMinutes: s.tz_offset_minutes,
          });
          if (!win) continue;

          const { data: items } = await supabaseAdmin
            .from("items")
            .select("id,name,expiry_date")
            .eq("user_id", s.user_id)
            .eq("used_up", false)
            .gte("expiry_date", win.from)
            .lte("expiry_date", win.to);
          if (!items?.length) continue;

          const { data: logged } = await supabaseAdmin
            .from("notification_log")
            .select("item_id,expiry_date")
            .in("item_id", items.map((i) => i.id));
          const done = new Set((logged ?? []).map((l) => `${l.item_id}|${l.expiry_date}`));
          const fresh = items.filter((i) => !done.has(`${i.id}|${i.expiry_date}`));
          if (!fresh.length) continue;

          const { data: subs } = await supabaseAdmin
            .from("push_subscriptions")
            .select("id,endpoint,p256dh,auth")
            .eq("user_id", s.user_id);
          if (!subs?.length) continue;

          const names = fresh.slice(0, 3).map((i) => i.name).join("、");
          const body =
            fresh.length > 3 ? `${names} 等 ${fresh.length} 件物品快到期了` : `${names} 快到期了，记得尽快使用`;

          for (const sub of subs) {
            const payload = await buildPushPayload(
              { data: { title: "保质期提醒", body, url: "/", tag: `expiry-${win.today}` }, options: { ttl: 86400 } },
              { endpoint: sub.endpoint, expirationTime: null, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              vapid,
            );
            const res = await fetch(sub.endpoint, payload);
            if (res.status === 404 || res.status === 410) {
              await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
            } else if (res.ok) sent++;
          }
          await supabaseAdmin
            .from("notification_log")
            .upsert(fresh.map((i) => ({ item_id: i.id, expiry_date: i.expiry_date })));
        }
        return Response.json({ success: true, sent });
      },
    },
  },
});
