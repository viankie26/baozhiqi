import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { dict, type Dict, type Lang } from "./i18n-dict";
export { dict, type Dict, type Lang };

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


const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "zh",
  setLang: () => {},
  t: dict.zh,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");
  const [ready, setReady] = useState(false);

  useEffect(() => { setLangState(detectLang()); setReady(true); }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    const manifest = document.querySelector('link[rel="manifest"]');
    if (manifest) manifest.setAttribute("href", lang === "zh" ? "/manifest-zh.webmanifest" : "/manifest.webmanifest");
    const meta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (meta) meta.setAttribute("content", dict[lang].appName);
  }, [lang]);

  useEffect(() => {
    if (!ready) return;
    const sync = () => {
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          void import("./push").then(({ saveNotificationLanguage }) => saveNotificationLanguage(lang)).catch(() => {});
        }
      });
    };
    sync();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setTimeout(sync, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [lang, ready]);

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
