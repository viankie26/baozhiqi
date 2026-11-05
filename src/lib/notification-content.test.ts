import { expect, test } from "vitest";
import { notificationContent } from "./notification-content";

test("uses the account's English notification preference", () => {
  expect(notificationContent(["Milk"], "en")).toEqual({
    title: "Minipiry · Expiry reminder", body: "Milk is expiring soon. Remember to use it.",
  });
});
test("uses the account's Chinese notification preference", () => {
  expect(notificationContent(["牛奶"], "zh")).toEqual({
    title: "超简到期 · 到期提醒", body: "牛奶 快到期了，记得尽快使用",
  });
});