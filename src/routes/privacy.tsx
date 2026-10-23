import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "隐私政策 · 保质期记录" },
      { name: "description", content: "保质期记录应用如何收集、使用和删除你的数据。" },
      { property: "og:title", content: "隐私政策 · 保质期记录" },
      { property: "og:description", content: "保质期记录应用如何收集、使用和删除你的数据。" },
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
      "账号信息：注册时提供的邮箱地址，或通过谷歌登录时获得的邮箱。",
      "你主动录入的内容：物品名称、分类、保质期日期和备注。",
      "提醒设置：提前天数、提醒时间、时区，以及开启通知的设备推送地址。",
      "语音录入：使用语音添加时，识别出的文字会被发送用于解析物品名称和日期，不保存录音。",
    ],
  },
  {
    title: "二、信息的用途",
    body: [
      "仅用于为你保存和同步保质期记录、在到期前发送提醒。",
      "我们不会出售你的信息，也不会用于广告。",
    ],
  },
  {
    title: "三、存储与访问",
    body: [
      "数据保存在云端服务器，每条记录只与你的账号关联，其他用户无法查看。",
      "导出到系统日历时，数据只在你的设备上生成日历文件，不会被额外保存。",
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

function PrivacyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-10">
      <Link to="/auth" className="label-kicker text-muted-foreground">
        ← 返回
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-foreground">隐私政策</h1>
      <p className="mt-2 text-sm text-muted-foreground">生效日期：2026年10月24日</p>
      <div className="mt-8 flex flex-col gap-8">
        {SECTIONS.map((s) => (
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
    </div>
  );
}
