import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mic, Loader2, Save } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/types";
import { addItem } from "@/lib/storage";
import { startRecording, stopRecording } from "@/lib/voice";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "添加物品 · 保质期记录" },
      { name: "description", content: "语音或手动添加物品保质期。" },
    ],
  }),
  component: AddPage,
});

interface VoiceResult {
  transcript?: string;
  name?: string | null;
  expiryDate?: string | null;
  category?: string;
  note?: string;
  error?: string;
}

function AddPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [expiryDate, setExpiryDate] = useState("");
  const [note, setNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");

  async function handleVoice() {
    if (processing) return;
    try {
      if (!recording) {
        await startRecording();
        setRecording(true);
        return;
      }
      setRecording(false);
      setProcessing(true);
      const blob = await stopRecording();
      const res = await fetch("/api/voice-add", {
        method: "POST",
        headers: { "Content-Type": "audio/wav" },
        body: blob,
      });
      const data = (await res.json()) as VoiceResult;
      if (!res.ok || data.error) {
        toast.error(data.error ?? "语音识别失败");
        return;
      }
      if (data.transcript) setTranscript(data.transcript);
      if (data.name) setName(data.name);
      if (data.expiryDate) setExpiryDate(data.expiryDate);
      if (data.category && isValidCategory(data.category)) {
        setCategory(data.category as Category);
      }
      if (data.note) setNote(data.note);
      toast.success("已识别，请确认后保存");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "录音失败";
      if (msg === "empty") toast.error("录音为空，请重试");
      else toast.error(msg);
      setRecording(false);
    } finally {
      setProcessing(false);
    }
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error("请填写物品名称");
      return;
    }
    if (!expiryDate) {
      toast.error("请选择过期日期");
      return;
    }
    addItem({
      name: name.trim(),
      category,
      expiryDate,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    toast.success("已添加");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <header className="px-4 pb-2 pt-12">
        <h1 className="text-2xl font-bold text-foreground">添加物品</h1>
        <p className="text-sm text-muted-foreground">长按麦克风说话，或手动填写</p>
      </header>

      {/* Voice button */}
      <div className="px-4 py-4">
        <button
          onClick={handleVoice}
          disabled={processing}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-5 shadow-sm transition active:scale-[0.99] disabled:opacity-60"
        >
          {processing ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Mic
              className={`h-6 w-6 ${recording ? "text-destructive" : "text-primary"}`}
            />
          )}
          <span className="font-medium text-foreground">
            {processing
              ? "识别中…"
              : recording
                ? "正在录音，再次点击结束"
                : "点击说话添加"}
          </span>
        </button>
        {transcript ? (
          <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            “{transcript}”
          </p>
        ) : null}
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 px-4">
        <Field label="物品名称">
          <input
            className="w-full rounded-xl border border-input bg-card px-3 py-3 text-foreground outline-none focus:border-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：牛奶"
          />
        </Field>

        <Field label="分类">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs ${
                  category === c.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="过期日期">
          <input
            type="date"
            className="w-full rounded-xl border border-input bg-card px-3 py-3 text-foreground outline-none focus:border-primary"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </Field>

        <Field label="备注（可选）">
          <input
            className="w-full rounded-xl border border-input bg-card px-3 py-3 text-foreground outline-none focus:border-primary"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="数量、存放位置等"
          />
        </Field>
      </div>

      {/* Save */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg active:scale-[0.99]"
          >
            <Save className="h-5 w-5" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function isValidCategory(v: string): boolean {
  return v === "food" || v === "medicine" || v === "daily" || v === "other";
}
