import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/LanguageSwitch";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "隐私政策 · Minipiry · 超简到期" },
      { name: "description", content: "Minipiry · 超简到期应用如何收集、使用和删除你的数据。" },
      { property: "og:title", content: "隐私政策 · Minipiry · 超简到期" },
      { property: "og:description", content: "Minipiry · 超简到期应用如何收集、使用和删除你的数据。" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "一、我们收集的信息",
    body: [
      "账号信息：注册时提供的邮箱地址，或通过 Google 或 Apple 登录时获得的账号信息。",
      "你主动录入的内容：物品名称、分类、保质期日期和备注。",
      "提醒设置：提前天数、提醒时间、时区、语言，以及开启通知的设备推送地址。",
      "语音录入：使用语音添加时，录音会发送给语音识别服务，识别出的文字用于解析物品名称和日期；本应用不持久保存录音。",
    ],
  },
  {
    title: "二、信息的用途",
    body: [
      "仅用于为你保存和同步Minipiry · 超简到期、在到期前发送提醒。",
      "我们不会出售你的信息，也不会用于广告。",
    ],
  },
  {
    title: "三、存储与访问",
    body: [
      "数据保存在云端服务器，每条记录只与你的账号关联，其他用户无法查看。",
      "导出到系统日历时，所选记录会发送到本站生成日历文件，不会额外持久保存导出内容。",
    ],
  },
  {
    title: "四、权限说明",
    body: [
      "通知权限：仅在你主动开启后用于到期提醒，可随时在系统设置中关闭。",
      "麦克风权限：仅在你使用语音添加时使用。",
    ],
  },
  {
    title: "五、你的权利与账号注销",
    body: [
      "你可以随时编辑或删除任何记录。",
      "在「提醒设置」页面底部可一键注销账号，注销后你的所有记录、提醒设置和账号信息将被永久删除，无法恢复。",
    ],
  },
  {
    title: "六、政策更新与联系",
    body: ["本政策如有更新，将在此页面公布。", "如有疑问或需要帮助，请发送邮件至 hi@viankie.com，我们会尽快回复。"],
  },
];

const EN_SECTIONS: { title: string; body: string[] }[] = [
  { title: "1. Information we collect", body: [
    "Account information: the email you provide at registration, or account information received when signing in with Google or Apple.",
    "Content you enter: item names, categories, expiry dates and notes.",
    "Reminder preferences: days before expiry, reminder time, time zone, language and device push subscription addresses.",
    "Voice entry: audio is sent to a speech recognition service, and its transcript is used to extract item names and dates. This app does not persist recordings.",
  ] },
  { title: "2. How we use information", body: [
    "We use this information to save and sync your expiry records and send reminders.",
    "We do not sell your information or use it for advertising.",
  ] },
  { title: "3. Storage and access", body: [
    "Records are stored in the cloud and associated with your account. Other users cannot view your records.",
    "Calendar exports send the selected records to this site's formatter to generate a calendar file. Export contents are not additionally persisted.",
  ] },
  { title: "4. Permissions", body: [
    "Notifications are used for expiry reminders only after you enable them. You can turn them off in your device settings.",
    "Microphone access is used only when you choose voice entry.",
  ] },
  { title: "5. Your rights and account deletion", body: [
    "You can edit or delete any record at any time.",
    "You can delete your account at the bottom of the Reminders page. This permanently deletes your records, reminder preferences and account information and cannot be undone.",
  ] },
  { title: "6. Updates and contact", body: [
    "Updates to this policy will be published on this page.",
    "For questions or help, email hi@viankie.com.",
  ] },
];

function PrivacyPage() {
  const { lang, t } = useLang();
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-10">
      <div className="mb-6"><LanguageSwitch /></div>
      <Link to="/auth" className="label-kicker text-muted-foreground">
        ← {t.nav.backAria}
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-foreground">{lang === "zh" ? "超简到期 · 隐私政策" : "Minipiry · Privacy Policy"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{lang === "zh" ? "更新日期：2026年11月4日" : "Updated: November 4, 2026"}</p>
      <div className="mt-8 flex flex-col gap-8">
        {(lang === "zh" ? SECTIONS : EN_SECTIONS).map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[0.9375rem] leading-relaxed text-foreground">
              {s.body.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <a href="mailto:hi@viankie.com" className="mt-8 inline-block text-sm underline underline-offset-4">hi@viankie.com</a>
    </div>
  );
}
