import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLang } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DAYS_BEFORE_OPTIONS, daysLabel } from "@/lib/reminder-schedule";
import {
  deviceSubscribed,
  enableOnThisDevice,
  isStandalone,
  loadSettings,
  pushSupported,
  saveSettings,
} from "@/lib/push";
import { isNativeApp, enableNativePush, nativePushGranted, haptic } from "@/lib/native";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "到期提醒 · Minipiry · 超简到期" },
      { name: "description", content: "设置到期前几天、几点收到手机通知。" },
      { property: "og:title", content: "到期提醒 · Minipiry · 超简到期" },
      { property: "og:description", content: "设置到期前几天、几点收到手机通知。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RemindersPage,
});

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function RemindersPage() {
  const { t, lang } = useLang();
  const [enabled, setEnabled] = useState(true);
  const [daysBefore, setDaysBefore] = useState(3);
  const [hour, setHour] = useState(9);
  const [device, setDevice] = useState<"unknown" | "on" | "off" | "unsupported" | "needs-home">("unknown");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        if (s) {
          setEnabled(s.enabled);
          setDaysBefore(s.daysBefore);
          setHour(s.remindHour);
        }
      })
      .catch(() => {});
    if (isNativeApp()) {
      nativePushGranted().then((on) => setDevice(on ? "on" : "off"));
      return;
    }
    if (!pushSupported()) {
      setDevice(/iPhone|iPad/.test(navigator.userAgent) && !isStandalone() ? "needs-home" : "unsupported");
      return;
    }
    deviceSubscribed().then((on) => setDevice(on ? "on" : "off"));
  }, []);

  async function handleEnableDevice() {
    setBusy(true);
    try {
      if (isNativeApp()) {
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user.id;
        if (!uid) throw new Error(t.reminders.enableFail);
        if ((await enableNativePush(uid)) !== "granted") throw new Error(t.reminders.enableFail);
      } else {
        await enableOnThisDevice();
      }
      await saveSettings({ enabled: true, daysBefore, remindHour: hour });
      setEnabled(true);
      setDevice("on");
      void haptic("success");
      toast.success(t.reminders.enabledToast);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.reminders.enableFail);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    setBusy(true);
    try {
      await saveSettings({ enabled, daysBefore, remindHour: hour });
      toast.success(t.reminders.saved);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.reminders.saveFail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <PageHeader title={t.reminders.title} kicker={t.reminders.kicker} back />
      <main className="mx-auto flex max-w-md flex-col gap-7 px-5 pt-6">
        <section className="border-b border-border pb-5">
          <p className="label-kicker mb-3 text-muted-foreground">{t.reminders.language}</p>
          <LanguageSwitch />
        </section>
        <section className="border-b-2 border-foreground pb-6">
          <p className="label-kicker text-muted-foreground">{t.reminders.thisDevice}</p>
          {device === "on" ? (
            <p className="mt-2 text-[1.0625rem] text-foreground">{t.reminders.deviceOn}</p>
          ) : device === "needs-home" ? (
            <p className="mt-2 text-[0.9375rem] text-foreground">
              {t.reminders.needsHome}
            </p>
          ) : device === "unsupported" ? (
            <p className="mt-2 text-[0.9375rem] text-foreground">{t.reminders.unsupported}</p>
          ) : (
            <Button variant="plain" size="natural"
              onClick={handleEnableDevice}
              disabled={busy || device === "unknown"}
              className="label-kicker mt-3 flex w-full items-center justify-center gap-2 bg-foreground py-4 text-background disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t.reminders.enableBtn}
            </Button>
          )}
        </section>

        <label className="flex items-center justify-between">
          <span className="text-[1.0625rem] text-foreground">{t.reminders.receive}</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 accent-foreground"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="label-kicker text-muted-foreground">{t.reminders.daysBefore}</span>
          <div className="flex flex-wrap gap-2">
            {DAYS_BEFORE_OPTIONS.map((d) => (
              <Button variant="plain" size="natural"
                key={d}
                onClick={() => setDaysBefore(d)}
                className={`label-kicker border px-3 py-2 ${
                  daysBefore === d ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
                }`}
              >
                {daysLabel(d, lang)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="label-kicker text-muted-foreground">{t.reminders.time}</span>
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="w-full border-b-2 border-foreground bg-transparent py-2.5 text-[1.0625rem] text-foreground outline-none"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>

        <p className="text-[0.8125rem] text-muted-foreground">
          {t.reminders.explain(daysBefore, `${String(hour).padStart(2, "0")}:00`)}
        </p>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 pb-24">
          <span className="label-kicker text-muted-foreground">{t.reminders.account}</span>
          <Link to="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
            {t.reminders.privacy}
          </Link>
          <DeleteAccountButton />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-foreground bg-warm-bg px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
        <div className="mx-auto max-w-md">
          <Button variant="plain" size="natural"
            onClick={handleSave}
            disabled={busy}
            className="label-kicker w-full bg-foreground py-4 text-background disabled:opacity-60"
          >
            {t.reminders.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
