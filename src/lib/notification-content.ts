import type { Lang } from "./i18n";

export function notificationContent(names: string[], language: Lang) {
  const listed = names.slice(0, 3).join(language === "zh" ? "、" : ", ");
  return language === "en"
    ? { title: "Minipiry · Expiry reminder", body: names.length > 3
        ? `${listed} and ${names.length - 3} more items are expiring soon.`
        : `${listed} ${names.length === 1 ? "is" : "are"} expiring soon. Remember to use ${names.length === 1 ? "it" : "them"}.` }
    : { title: "超简到期 · 到期提醒", body: names.length > 3
        ? `${listed} 等 ${names.length} 件物品快到期了`
        : `${listed} 快到期了，记得尽快使用` };
}