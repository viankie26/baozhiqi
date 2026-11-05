import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex gap-2" role="group" aria-label="语言 / Language">
      {(["zh", "en"] as const).map((value) => (
        <Button key={value} type="button" variant={lang === value ? "default" : "outline"}
          aria-pressed={lang === value} onClick={() => setLang(value)} className="rounded-none">
          {value === "zh" ? "中文" : "English"}
        </Button>
      ))}
    </div>
  );
}