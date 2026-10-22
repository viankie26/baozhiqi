import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, type ReminderSettings } from "./reminder-schedule";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** iOS only allows web push when launched from the home screen. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function keyBytes(b64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("请先登录");
  return id;
}

export async function loadSettings(): Promise<ReminderSettings | null> {
  const uid = await userId();
  const { data } = await supabase
    .from("notification_settings")
    .select("enabled,days_before,remind_hour,tz_offset_minutes")
    .eq("user_id", uid)
    .maybeSingle();
  if (!data) return null;
  return {
    enabled: data.enabled,
    daysBefore: data.days_before,
    remindHour: data.remind_hour,
    tzOffsetMinutes: data.tz_offset_minutes,
  };
}

export async function saveSettings(s: Omit<ReminderSettings, "tzOffsetMinutes">) {
  const uid = await userId();
  const { error } = await supabase.from("notification_settings").upsert({
    user_id: uid,
    enabled: s.enabled,
    days_before: s.daysBefore,
    remind_hour: s.remindHour,
    tz_offset_minutes: -new Date().getTimezoneOffset(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error("保存失败，请重试");
}

/** Asks permission, subscribes this device and stores it for the account. */
export async function enableOnThisDevice() {
  if (!pushSupported()) throw new Error("此浏览器不支持通知");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("未允许通知，请在系统设置里打开");
  const reg = await navigator.serviceWorker.register("/push-sw.js");
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes(VAPID_PUBLIC_KEY),
    }));
  const json = sub.toJSON();
  const uid = await userId();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: uid,
      endpoint: sub.endpoint,
      p256dh: json.keys?.["p256dh"] ?? "",
      auth: json.keys?.["auth"] ?? "",
    },
    { onConflict: "endpoint" },
  );
  if (error) throw new Error("设备登记失败，请重试");
}

export async function deviceSubscribed(): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.getRegistration("/push-sw.js");
  return !!(await reg?.pushManager.getSubscription());
}
