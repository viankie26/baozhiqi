import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mic, Loader2 } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { addItem } from "@/lib/storage";
import { startRecording, stopRecording } from "@/lib/voice";
import { localDateString } from "@/lib/date";

export const Route = createFileRoute("/_authenticated/add")({
  head: () => ({
    meta: [
      { title: "添加物品 · 保质期记录" },
      { name: "description", content: "语音或手动添加物品保质期。" },
      { property: "og:title", content: "添加物品 · 保质期记录" },
      { property: "og:description", content: "语音或手动添加物品保质期。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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

const inputClass =
  "w-full border-b-2 border-foreground bg-transparent px-0 py-2.5 text-[1.0625rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-expired";

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
        headers: {
          "Content-Type": "audio/wav",
          "x-client-date": localDateString(),
        },
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
      <PageHeader title="添加物品" kicker="NEW ENTRY" back />

      <main className="mx-auto max-w-md px-5">
        {/* Voice */}
        <button
          onClick={handleVoice}
          disabled={processing}
          className={`flex w-full items-center gap-4 border-b-2 border-foreground py-6 text-left transition disabled:opacity-60 ${
            recording ? "animate-pulse-ring bg-expired-soft" : ""
          }`}
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center ${
              recording ? "bg-expired text-primary-foreground" : "bg-foreground text-background"
            }`}
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </span>
          <span className="min-w-0">
            <span className="font-display block text-[1.25rem] leading-none text-foreground">
              {processing ? "识别中" : recording ? "正在录音" : "语音记录"}
            </span>
            <span className="label-kicker mt-2 block text-muted-foreground">
              {processing
                ? "PROCESSING"
                : recording
                  ? "TAP TO STOP"
                  : "TAP & SAY «牛奶 九月十五号过期»"}
            </span>
          </span>
        </button>

        {transcript ? (
          <p className="border-b border-border py-3 text-[0.8125rem] italic text-muted-foreground">
            “{transcript}”
          </p>
        ) : null}

        <div className="flex flex-col gap-6 pt-7">
          <Field label="物品名称 / NAME">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：牛奶"
            />
          </Field>

          <Field label="分类 / CATEGORY">
            <div className="grid grid-cols-4 border border-border">
              {CATEGORIES.map((c, i) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`label-kicker py-3.5 transition ${i > 0 ? "border-l border-border" : ""} ${
                    category === c.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="过期日期 / EXPIRY">
            <input
              type="date"
              className={inputClass}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </Field>

          <Field label="备注 / NOTE">
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="数量、存放位置等"
            />
          </Field>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-foreground bg-warm-bg px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
        <div className="mx-auto max-w-md">
          <button
            onClick={handleSave}
            className="label-kicker w-full bg-foreground py-4 text-background transition active:opacity-80"
          >
            保存入库 / SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label-kicker text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function isValidCategory(v: string): boolean {
  return v === "food" || v === "medicine" || v === "daily" || v === "other";
}
