import { CATEGORY_LABEL, type Item } from "./types";

export function addToCalendar(item: Item) {
  // iOS 只对 http(s) 链接且 Content-Type 为 text/calendar 的内容弹「添加到日历」，
  // blob:/data: 链接一律被当成文件保存。因此跳转到服务器提供的日历链接。
  const params = new URLSearchParams({
    name: item.name,
    date: item.expiryDate,
    category: CATEGORY_LABEL[item.category],
  });
  if (item.note) params.set("note", item.note);
  window.location.href = `/api/calendar?${params.toString()}`;
}
