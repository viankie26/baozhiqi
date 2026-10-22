import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "到期提醒 · 保质期记录" },
      { name: "description", content: "设置到期前几天、几点收到手机通知。" },
      { property: "og:title", content: "到期提醒 · 保质期记录" },
      { property: "og:description", content: "设置到期前几天、几点收到手机通知。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RemindersPage,
});

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function RemindersPage() {
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
    if (!pushSupported()) {
      setDevice(/iPhone|iPad/.test(navigator.userAgent) && !isStandalone() ? "needs-home" : "unsupported");
      return;
    }
    deviceSubscribed().then((on) => setDevice(on ? "on" : "off"));
  }, []);

  async function handleEnableDevice() {
    setBusy(true);
    try {
      await enableOnThisDevice();
      await saveSettings({ enabled: true, daysBefore, remindHour: hour });
      setEnabled(true);
      setDevice("on");
      toast.success("这台设备已开启通知");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "开启失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    setBusy(true);
    try {
      await saveSettings({ enabled, daysBefore, remindHour: hour });
      toast.success("提醒设置已保存");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <PageHeader title="到期提醒" kicker="NOTIFICATIONS" back />
      <main className="mx-auto flex max-w-md flex-col gap-7 px-5 pt-6">
        <section className="border-b-2 border-foreground pb-6">
          <p className="label-kicker text-muted-foreground">本设备 / THIS DEVICE</p>
          {device === "on" ? (
            <p className="mt-2 text-[1.0625rem] text-foreground">✓ 已开启，会在设定时间收到通知</p>
          ) : device === "needs-home" ? (
            <p className="mt-2 text-[0.9375rem] text-foreground">
              iPhone 需要先点 Safari 底部「分享」→「添加到主屏幕」，再从桌面图标打开本应用，才能开启通知。
            </p>
          ) : device === "unsupported" ? (
            <p className="mt-2 text-[0.9375rem] text-foreground">这个浏览器不支持通知，请换用手机桌面上的应用。</p>
          ) : (
            <button
              onClick={handleEnableDevice}
              disabled={busy || device === "unknown"}
              className="label-kicker mt-3 flex w-full items-center justify-center gap-2 bg-foreground py-4 text-background disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              在这台设备开启通知
            </button>
          )}
        </section>

        <label className="flex items-center justify-between">
          <span className="text-[1.0625rem] text-foreground">接收到期提醒</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 accent-foreground"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="label-kicker text-muted-foreground">提前几天 / DAYS BEFORE</span>
          <div className="flex flex-wrap gap-2">
            {DAYS_BEFORE_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDaysBefore(d)}
                className={`label-kicker border px-3 py-2 ${
                  daysBefore === d ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
                }`}
              >
                {daysLabel(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="label-kicker text-muted-foreground">提醒时间 / TIME</span>
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
          每件物品只提醒一次：在到期前 {daysBefore} 天内的每天 {String(hour).padStart(2, "0")}:00 左右检查，有新进入提醒范围的物品就通知你。
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-foreground bg-warm-bg px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleSave}
            disabled={busy}
            className="label-kicker w-full bg-foreground py-4 text-background disabled:opacity-60"
          >
            保存设置 / SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
