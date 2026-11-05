import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mic, Loader2 } from "lucide-react";
import { CATEGORIES, PRESET_ITEMS, type Category } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { ExpiryDateInput } from "@/components/ExpiryDateInput";
import { addItem } from "@/lib/storage";
import { startRecording, stopRecording } from "@/lib/voice";
import { localDateString } from "@/lib/date";

export const Route = createFileRoute("/_authenticated/add")({
  head: () => ({
    meta: [
      { title: "添加物品 · Minipiry · 超简到期" },
      { name: "description", content: "语音或手动添加物品保质期。" },
      { property: "og:title", content: "添加物品 · Minipiry · 超简到期" },
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
  const { t, lang } = useLang();
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
          "x-client-language": lang,
        },
        body: blob,
      });
      const data = (await res.json()) as VoiceResult;
      if (!res.ok || data.error) {
        toast.error(data.error ?? t.add.voiceFail);
        return;
      }
      if (data.transcript) setTranscript(data.transcript);
      if (data.name) setName(data.name);
      if (data.expiryDate) setExpiryDate(data.expiryDate);
      if (data.category && isValidCategory(data.category)) {
        setCategory(data.category as Category);
      }
      if (data.note) setNote(data.note);
      toast.success(t.add.recognized);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t.add.voiceFail;
      if (msg === "empty") toast.error(t.add.voiceEmpty);
      else toast.error(msg);
      setRecording(false);
    } finally {
      setProcessing(false);
    }
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error(t.add.needName);
      return;
    }
    if (!expiryDate) {
      toast.error(t.add.needDate);
      return;
    }
    addItem({
      name: name.trim(),
      category,
      expiryDate,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    toast.success(t.add.added);
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-warm-bg pb-32">
      <PageHeader title={t.add.title} kicker={t.add.kicker} back />

      <main className="mx-auto max-w-md px-5">
        {/* Voice */}
        <Button variant="plain" size="natural"
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
              {processing ? t.add.processing : recording ? t.add.recording : t.add.voice}
            </span>
            <span className="label-kicker mt-2 block text-muted-foreground">
              {processing
                ? "PROCESSING"
                : recording
                  ? t.add.tapToStop
                  : t.add.tapSay}
            </span>
          </span>
        </Button>

        {transcript ? (
          <p className="border-b border-border py-3 text-[0.8125rem] italic text-muted-foreground">
            “{transcript}”
          </p>
        ) : null}

        <div className="flex flex-col gap-6 pt-7">
          <Field label={t.add.fieldName}>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.add.namePh}
            />
          </Field>

          <Field label={t.add.fieldCategory}>
            <div className="grid grid-cols-4 border border-border">
              {CATEGORIES.map((c, i) => (
                <Button variant="plain" size="natural"
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`label-kicker py-3.5 transition ${i > 0 ? "border-l border-border" : ""} ${
                    category === c.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground"
                  }`}
                >
                  {c[lang]}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESET_ITEMS[lang][category].map((preset) => {
                const active = name === preset;
                return (
                  <Button variant="plain" size="natural"
                    key={preset}
                    type="button"
                    onClick={() => setName(active ? "" : preset)}
                    className={`label-kicker border px-3 py-2 transition active:opacity-70 ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {preset}
                  </Button>
                );
              })}
            </div>
          </Field>

          <Field label={t.add.fieldExpiry}>
            <ExpiryDateInput value={expiryDate} onChange={setExpiryDate} />
          </Field>

          <Field label={t.add.fieldNote}>
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.add.notePh}
            />
          </Field>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-foreground bg-warm-bg px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
        <div className="mx-auto max-w-md">
          <Button variant="plain" size="natural"
            onClick={handleSave}
            className="label-kicker w-full bg-foreground py-4 text-background transition active:opacity-80"
          >
            {t.add.save}
          </Button>
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
