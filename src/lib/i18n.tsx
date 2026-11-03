import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "zh" | "en";

const STORAGE_KEY = "minipiry-lang";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** Stored choice wins; otherwise follow the device language (default English). */
export function detectLang(): Lang {
  if (!isBrowser()) return "zh";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "zh" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

/** Non-React getter for modules (push, calendar) that need the active language. */
export function currentLang(): Lang {
  return detectLang();
}

const dict = {
  zh: {
    appName: "超简到期",
    brandKicker: "MINIPIRY",
    nav: {
      stock: "在库 / STOCK",
      archive: "归档 / ARCHIVE",
      addAria: "添加物品",
      backAria: "返回",
    },
    home: {
      title: "超简到期",
      statStock: "在库 STOCK",
      statSoon: "临期 SOON",
      statOver: "过期 OVER",
      alertNeed: (n: number) => `⚠ ${n} 件需要处理`,
      addAll: "全部添加到日历",
      countSuffix: (n: number) => `（${n} 件）`,
      calFail: "日历提醒生成失败，请重试",
      tabAll: "全部",
      tabSoon: "临期",
      tabExpired: "过期",
      edit: "编辑",
      done: "完成",
      secOverdue: "已过期 / OVERDUE",
      secSoon: "即将过期 / DUE SOON",
      secOk: "正常 / IN DATE",
      noSoon: "暂无临期物品",
      noExpired: "暂无已过期物品",
      emptyTitle: "空 空 如 也",
      emptyBody: "点击底部的加号，用一句话记录第一件物品的保质期。",
      deleted: "已删除",
      deleteAria: (name: string) => `删除${name}`,
      bellAria: "到期提醒设置",
    },
    card: {
      daysOver: "天前过期",
      today: "今天到期",
      daysLeft: "天后到期",
    },
    add: {
      title: "添加物品",
      kicker: "NEW ENTRY",
      voice: "语音记录",
      recording: "正在录音",
      processing: "识别中",
      tapToStop: "TAP TO STOP",
      tapSay: "TAP & SAY «牛奶 九月十五号过期»",
      fieldName: "物品名称 / NAME",
      namePh: "如：牛奶",
      fieldCategory: "分类 / CATEGORY",
      fieldExpiry: "过期日期 / EXPIRY",
      fieldNote: "备注 / NOTE",
      notePh: "数量、存放位置等",
      save: "保存入库 / SAVE",
      needName: "请填写物品名称",
      needDate: "请选择过期日期",
      added: "已添加",
      voiceFail: "语音识别失败",
      voiceEmpty: "录音为空，请重试",
      recognized: "已识别，请确认后保存",
    },
    detail: {
      kicker: "ITEM RECORD",
      notFound: "物品不存在",
      backHome: "返回首页",
      daysOver: "天前过期 / OVERDUE",
      todayExp: "今天到期 / TODAY",
      daysLeft: "天后到期 / LEFT",
      syncCal: "同步到系统日历 / CALENDAR",
      calReady: "已生成日历提醒，请在弹窗中添加",
      fieldName: "物品名称 / NAME",
      fieldCategory: "分类 / CATEGORY",
      fieldExpiry: "过期日期 / EXPIRY",
      fieldNote: "备注 / NOTE",
      notePh: "数量、存放位置等",
      usedUp: "用完",
      save: "保存 / SAVE",
      deleteAria: "删除",
      needName: "请填写名称",
      needDate: "请选择日期",
      updated: "已更新",
      deleted: "已删除",
      markedUsed: "已标记为用完",
    },
    archive: {
      title: "归档",
      kicker: "ARCHIVE",
      subtitleCount: (n: number) => `${n} 件已用完`,
      subtitleEmpty: "已用完的物品",
      emptyTitle: "暂 无 归 档",
      emptyBody: "在物品详情页点击「用完」，它就会被收进这里。",
      undo: "回退 UNDO",
      restored: "已回退到在库",
      del: "删除",
      deleted: "已删除",
    },
    reminders: {
      title: "到期提醒",
      kicker: "NOTIFICATIONS",
      thisDevice: "本设备 / THIS DEVICE",
      deviceOn: "✓ 已开启，会在设定时间收到通知",
      needsHome:
        "iPhone 需要先点 Safari 底部「分享」→「添加到主屏幕」，再从桌面图标打开本应用，才能开启通知。",
      unsupported: "这个浏览器不支持通知，请换用手机桌面上的应用。",
      enableBtn: "在这台设备开启通知",
      enabledToast: "这台设备已开启通知",
      enableFail: "开启失败",
      receive: "接收到期提醒",
      daysBefore: "提前几天 / DAYS BEFORE",
      time: "提醒时间 / TIME",
      explain: (days: number, hour: string) =>
        `每件物品只提醒一次：在到期前 ${days} 天内的每天 ${hour} 左右检查，有新进入提醒范围的物品就通知你。`,
      saved: "提醒设置已保存",
      saveFail: "保存失败",
      save: "保存设置 / SAVE",
      account: "账号 / ACCOUNT",
      privacy: "查看隐私政策",
      language: "语言 / LANGUAGE",
    },
    auth: {
      kicker: "MINIPIRY",
      title: "超简到期",
      signinSub: "登录后你的记录会保存在云端，换设备也能看到。",
      signupSub: "注册一个账号，记录只属于你自己。",
      email: "邮箱 / EMAIL",
      password: "密码 / PASSWORD",
      confirmPassword: "确认密码 / CONFIRM PASSWORD",
      challenge: (a: number, b: number) => `验证：${a} + ${b} = ?`,
      busy: "处理中…",
      signin: "登录 / SIGN IN",
      signup: "注册 / SIGN UP",
      apple: "通过 Apple 登录 / APPLE",
      appleBusy: "正在打开苹果登录…",
      google: "用谷歌账号继续 / GOOGLE",
      googleBusy: "正在打开谷歌登录…",
      toSignup: "还没有账号？去注册",
      toSignin: "已有账号？去登录",
      privacyPre: "登录或注册即表示你已阅读并同意",
      privacyLink: "《隐私政策》",
      emailSentTitle: "CHECK YOUR EMAIL",
      emailSent: (email: string) =>
        `我们已向 ${email} 发送了一封确认邮件，点击其中的链接后即可登录。`,
      back: "返回",
      tooFast: (mins: number) => `操作过于频繁，请 ${mins} 分钟后再试`,
      botFail: "注册失败，请重试",
      slowDown: "请慢一点，稍后再试一次",
      wrongAnswer: "验证题答案不正确",
      pwShort: "密码至少 6 位",
      pwMismatch: "两次输入的密码不一致",
      emailSentToast: "确认邮件已发送，请查收后点击链接",
      fail: "操作失败，请重试",
      oauthFail: (label: string) => `${label}登录失败，请重试`,
      appleLabel: "苹果",
      googleLabel: "谷歌",
    },
    account: {
      deleteBtn: "注销账号 / DELETE ACCOUNT",
      confirmTitle: "确定永久注销账号？",
      confirmBody: "此操作不可恢复，将永久删除该账号下所有物品记录、提醒设置和登录信息。",
      cancel: "取消",
      confirm: "永久注销",
      deleting: "正在注销…",
      done: "账号已注销，所有数据已删除",
      fail: "注销失败，请稍后再试",
      signOut: "退出",
      signOutAria: "退出登录",
    },
    dateInput: {
      year: "年",
      month: "月",
      day: "日",
      yearHintShort: "后两位",
      openCal: "打开日历选择完整日期",
      yearHint: "年填后两位即可，如 26 = 2026",
      presetAria: (label: string) => `过期日期设为${label}`,
    },
    categories: { food: "食品", medicine: "药品", daily: "日化", other: "其他" },
    push: {
      needLogin: "请先登录",
      unsupported: "此浏览器不支持通知",
      noPermission: "未允许通知，请在系统设置里打开",
      registerFail: "设备登记失败，请重试",
      saveFail: "保存失败，请重试",
    },
    calendar: {
      summary: (name: string) => `[到期提醒] ${name}`,
      categoryLine: (cat: string) => `分类：${cat}`,
      noteLine: (note: string) => `备注：${note}`,
      alarmTomorrow: (name: string) => `${name} 明天到期`,
      alarmToday: (name: string) => `${name} 今天到期`,
    },
  },
  en: {
    appName: "Minipiry",
    brandKicker: "MINIPIRY",
    nav: {
      stock: "Stock",
      archive: "Archive",
      addAria: "Add item",
      backAria: "Back",
    },
    home: {
      title: "Minipiry",
      statStock: "IN STOCK",
      statSoon: "DUE SOON",
      statOver: "EXPIRED",
      alertNeed: (n: number) => `⚠ ${n} item${n > 1 ? "s" : ""} need${n > 1 ? "" : "s"} attention`,
      addAll: "Add all to calendar",
      countSuffix: (n: number) => ` (${n})`,
      calFail: "Couldn't build the calendar file, please try again",
      tabAll: "All",
      tabSoon: "Soon",
      tabExpired: "Expired",
      edit: "Edit",
      done: "Done",
      secOverdue: "OVERDUE",
      secSoon: "DUE SOON",
      secOk: "IN DATE",
      noSoon: "Nothing expiring soon",
      noExpired: "No expired items",
      emptyTitle: "All clear",
      emptyBody: "Tap the plus below and log your first item's expiry date in one sentence.",
      deleted: "Deleted",
      deleteAria: (name: string) => `Delete ${name}`,
      bellAria: "Expiry reminder settings",
    },
    card: {
      daysOver: "DAYS OVER",
      today: "TODAY",
      daysLeft: "DAYS LEFT",
    },
    add: {
      title: "Add item",
      kicker: "NEW ENTRY",
      voice: "Voice entry",
      recording: "Recording",
      processing: "Recognizing",
      tapToStop: "TAP TO STOP",
      tapSay: 'TAP & SAY "milk expires next Friday"',
      fieldName: "NAME",
      namePh: "e.g. Milk",
      fieldCategory: "CATEGORY",
      fieldExpiry: "EXPIRY DATE",
      fieldNote: "NOTE",
      notePh: "Quantity, location…",
      save: "SAVE",
      needName: "Please enter a name",
      needDate: "Please pick an expiry date",
      added: "Added",
      voiceFail: "Voice recognition failed",
      voiceEmpty: "Recording was empty, please try again",
      recognized: "Recognized — confirm and save",
    },
    detail: {
      kicker: "ITEM RECORD",
      notFound: "Item not found",
      backHome: "Back home",
      daysOver: "DAYS OVERDUE",
      todayExp: "EXPIRES TODAY",
      daysLeft: "DAYS LEFT",
      syncCal: "ADD TO CALENDAR",
      calReady: "Calendar file ready — confirm in the dialog",
      fieldName: "NAME",
      fieldCategory: "CATEGORY",
      fieldExpiry: "EXPIRY DATE",
      fieldNote: "NOTE",
      notePh: "Quantity, location…",
      usedUp: "Used up",
      save: "SAVE",
      deleteAria: "Delete",
      needName: "Please enter a name",
      needDate: "Please pick a date",
      updated: "Updated",
      deleted: "Deleted",
      markedUsed: "Marked as used up",
    },
    archive: {
      title: "Archive",
      kicker: "ARCHIVE",
      subtitleCount: (n: number) => `${n} used up`,
      subtitleEmpty: "Used-up items",
      emptyTitle: "Nothing archived",
      emptyBody: "Tap “Used up” on an item's detail page and it will be kept here.",
      undo: "RESTORE",
      restored: "Moved back to stock",
      del: "Delete",
      deleted: "Deleted",
    },
    reminders: {
      title: "Reminders",
      kicker: "NOTIFICATIONS",
      thisDevice: "THIS DEVICE",
      deviceOn: "✓ Enabled — you'll be notified at the set time",
      needsHome:
        "On iPhone, tap “Share” in Safari → “Add to Home Screen”, then open the app from its icon to enable notifications.",
      unsupported: "This browser doesn't support notifications. Please use the app on your home screen.",
      enableBtn: "Enable notifications on this device",
      enabledToast: "Notifications enabled on this device",
      enableFail: "Couldn't enable",
      receive: "Expiry reminders",
      daysBefore: "DAYS BEFORE",
      time: "TIME",
      explain: (days: number, hour: string) =>
        `Each item notifies only once: we check around ${hour} every day within ${days} day${days === 1 ? "" : "s"} before expiry.`,
      saved: "Reminder settings saved",
      saveFail: "Couldn't save",
      save: "SAVE SETTINGS",
      account: "ACCOUNT",
      privacy: "Privacy policy",
      language: "LANGUAGE",
    },
    auth: {
      kicker: "MINIPIRY",
      title: "Minipiry",
      signinSub: "Sign in to keep your records in the cloud and on every device.",
      signupSub: "Create an account — your records belong to you alone.",
      email: "EMAIL",
      password: "PASSWORD",
      confirmPassword: "CONFIRM PASSWORD",
      challenge: (a: number, b: number) => `Verify: ${a} + ${b} = ?`,
      busy: "Working…",
      signin: "SIGN IN",
      signup: "SIGN UP",
      apple: "Continue with Apple",
      appleBusy: "Opening Apple sign-in…",
      google: "Continue with Google",
      googleBusy: "Opening Google sign-in…",
      toSignup: "No account yet? Sign up",
      toSignin: "Have an account? Sign in",
      privacyPre: "By signing in you agree to the",
      privacyLink: "Privacy Policy",
      emailSentTitle: "CHECK YOUR EMAIL",
      emailSent: (email: string) =>
        `We sent a confirmation email to ${email}. Tap the link inside to sign in.`,
      back: "Back",
      tooFast: (mins: number) => `Too many attempts — try again in ${mins} min`,
      botFail: "Sign-up failed, please try again",
      slowDown: "Please slow down and try again",
      wrongAnswer: "Wrong answer to the verification question",
      pwShort: "Password needs at least 6 characters",
      pwMismatch: "Passwords don't match",
      emailSentToast: "Confirmation email sent — check your inbox",
      fail: "Something went wrong, please try again",
      oauthFail: (label: string) => `${label} sign-in failed, please try again`,
      appleLabel: "Apple",
      googleLabel: "Google",
    },
    account: {
      deleteBtn: "DELETE ACCOUNT",
      confirmTitle: "Permanently delete your account?",
      confirmBody:
        "This cannot be undone. All items, reminder settings and sign-in data for this account will be permanently deleted.",
      cancel: "Cancel",
      confirm: "Delete forever",
      deleting: "Deleting…",
      done: "Account deleted — all data removed",
      fail: "Couldn't delete the account, please try again later",
      signOut: "Sign out",
      signOutAria: "Sign out",
    },
    dateInput: {
      year: "Year",
      month: "Month",
      day: "Day",
      yearHintShort: "2 digits",
      openCal: "Open the calendar to pick a full date",
      yearHint: "Two-digit year works: 26 = 2026",
      presetAria: (label: string) => `Set expiry to ${label}`,
    },
    categories: { food: "Food", medicine: "Medicine", daily: "Personal care", other: "Other" },
    push: {
      needLogin: "Please sign in first",
      unsupported: "This browser doesn't support notifications",
      noPermission: "Notifications not allowed — enable them in system settings",
      registerFail: "Couldn't register this device, please try again",
      saveFail: "Couldn't save, please try again",
    },
    calendar: {
      summary: (name: string) => `[Expiry] ${name}`,
      categoryLine: (cat: string) => `Category: ${cat}`,
      noteLine: (note: string) => `Note: ${note}`,
      alarmTomorrow: (name: string) => `${name} expires tomorrow`,
      alarmToday: (name: string) => `${name} expires today`,
    },
  },
} as const;

export type Dict = (typeof dict)["zh"];

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "zh",
  setLang: () => {},
  t: dict.zh,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang());

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = dict[lang].appName;
    const meta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (meta) meta.setAttribute("content", dict[lang].appName);
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: dict[lang] as Dict }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
