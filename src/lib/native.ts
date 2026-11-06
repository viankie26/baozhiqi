import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

/** True inside the App Store iOS shell (not Safari / home-screen web app). */
export function isNativeApp(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

/** Light tap feedback; no-op on the web. */
export async function haptic(kind: "light" | "success" | "warning" = "light") {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "light") await Haptics.impact({ style: ImpactStyle.Light });
    else await Haptics.notification({ type: kind === "success" ? NotificationType.Success : NotificationType.Warning });
  } catch {
    /* ignore */
  }
}

/** Requests iOS notification permission, registers with APNs and stores the device token. */
export async function enableNativePush(userId: string): Promise<"granted" | "denied"> {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== "granted") return "denied";
  const token = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 15000);
    PushNotifications.addListener("registration", (t) => { clearTimeout(timer); resolve(t.value); });
    PushNotifications.addListener("registrationError", (e) => { clearTimeout(timer); reject(new Error(e.error)); });
    PushNotifications.register();
  });
  await PushNotifications.removeAllListeners();
  await supabase.from("native_push_tokens").delete().eq("token", token);
  const { error } = await supabase
    .from("native_push_tokens")
    .insert({ user_id: userId, token, platform: "ios" });
  if (error) throw error;
  return "granted";
}

export async function nativePushGranted(): Promise<boolean> {
  if (!isNativeApp()) return false;
  const { PushNotifications } = await import("@capacitor/push-notifications");
  return (await PushNotifications.checkPermissions()).receive === "granted";
}
