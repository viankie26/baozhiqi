import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useLang } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "登录 · Minipiry · 超简到期" },
      {
        name: "description",
        content: "登录后即可把家中物品的Minipiry · 超简到期保存到云端，换手机也不会丢。",
      },
      { property: "og:title", content: "登录 · Minipiry · 超简到期" },
      {
        property: "og:description",
        content: "登录后即可把家中物品的Minipiry · 超简到期保存到云端，换手机也不会丢。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

const COOLDOWN_KEY = "expiry-tracker-signup-guard";
const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 5 * 60 * 1000;

function newChallenge() {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 2 + Math.floor(Math.random() * 8);
  return { a, b, answer: a + b };
}

function readGuard(): { count: number; until: number } {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return { count: 0, until: 0 };
    const parsed = JSON.parse(raw) as { count?: number; until?: number };
    return { count: parsed.count ?? 0, until: parsed.until ?? 0 };
  } catch {
    return { count: 0, until: 0 };
  }
}

function writeGuard(value: { count: number; until: number }) {
  try {
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState<false | "google" | "apple">(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // 反机器人：蜜罐字段 + 最短填写时间 + 算术验证 + 本机冷却
  const [honeypot, setHoneypot] = useState("");
  const [challenge, setChallenge] = useState(() => newChallenge());
  const [challengeInput, setChallengeInput] = useState("");
  const [formOpenedAt] = useState(() => Date.now());
  const [lockedUntil, setLockedUntil] = useState(0);

  useEffect(() => {
    const guard = readGuard();
    if (guard.until > Date.now()) setLockedUntil(guard.until);
  }, []);


  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) void navigate({ to: "/", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void navigate({ to: "/", replace: true });
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (lockedUntil > Date.now()) {
      const mins = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60000));
      toast.error(t.auth.tooFast(mins));
      return;
    }
    if (mode === "signup") {
      // 蜜罐：真人看不到这个输入框，只有自动脚本会填
      if (honeypot.trim() !== "") {
        toast.error(t.auth.botFail);
        return;
      }
      // 填写太快说明是脚本
      if (Date.now() - formOpenedAt < 2500) {
        toast.error(t.auth.slowDown);
        return;
      }
      if (Number(challengeInput.trim()) !== challenge.answer) {
        toast.error(t.auth.wrongAnswer);
        setChallenge(newChallenge());
        setChallengeInput("");
        return;
      }
      if (password.length < 6) {
        toast.error(t.auth.pwShort);
        return;
      }
      if (password !== password2) {
        toast.error(t.auth.pwMismatch);
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // 本机注册次数限制
        const guard = readGuard();
        const count = guard.count + 1;
        const until = count >= MAX_ATTEMPTS ? Date.now() + COOLDOWN_MS : 0;
        writeGuard({ count, until });
        if (until) setLockedUntil(until);
        if (!data.session) {
          setSentTo(email);
          toast.success(t.auth.emailSentToast);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.auth.fail);
      if (mode === "signup") {
        setChallenge(newChallenge());
        setChallengeInput("");
      }
    } finally {
      setBusy(false);
    }
  }


  async function handleOAuth(provider: "google" | "apple") {
    if (googleBusy) return;
    setGoogleBusy(provider);
    const label = provider === "apple" ? t.auth.appleLabel : t.auth.googleLabel;
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(t.auth.oauthFail(label));
        setGoogleBusy(false);
        return;
      }
      // 已登录或即将跳转：保持按钮 loading，交给 onAuthStateChange 直接进入主页
    } catch {
      toast.error(t.auth.oauthFail(label));
      setGoogleBusy(false);
    }
  }


  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
        <div className="mb-6"><LanguageSwitch /></div>
        <p className="label-kicker text-muted-foreground">{t.auth.kicker}</p>
        <h1 className="font-display mt-2 text-[2.25rem] leading-none text-foreground">
          {t.auth.title}
        </h1>
        <div className="mt-3 border-t-2 border-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          {mode === "signin"
            ? t.auth.signinSub
            : t.auth.signupSub}
        </p>

        {sentTo ? (
          <div className="mt-8 border border-border p-4">
            <p className="label-kicker text-muted-foreground">{t.auth.emailSentTitle}</p>
            <p className="mt-2 text-sm text-foreground">
              {t.auth.emailSent(sentTo)}
            </p>
            <Button variant="plain" size="natural"
              onClick={() => setSentTo(null)}
              className="label-kicker mt-4 underline underline-offset-4"
            >
              {t.auth.back}
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Field
                label={t.auth.email}
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
              <Field
                label={t.auth.password}
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              {mode === "signup" && (
                <>
                  <Field
                    label={t.auth.confirmPassword}
                    type="password"
                    value={password2}
                    onChange={setPassword2}
                    autoComplete="new-password"
                  />
                  <Field
                    label={t.auth.challenge(challenge.a, challenge.b)}
                    type="text"
                    value={challengeInput}
                    onChange={setChallengeInput}
                    autoComplete="off"
                  />
                  {/* 蜜罐字段：对真人隐藏 */}
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                  />
                </>
              )}

              <Button variant="plain" size="natural"
                type="submit"
                disabled={busy || !!googleBusy}
                className="min-h-12 border-2 border-foreground bg-foreground text-background transition active:opacity-80 disabled:opacity-50"
              >
                <span className="label-kicker">
                  {busy
                    ? t.auth.busy
                    : mode === "signin"
                      ? t.auth.signin
                      : t.auth.signup}
                </span>
              </Button>
            </form>

            <Button variant="plain" size="natural"
              onClick={() => handleOAuth("apple")}
              disabled={busy || !!googleBusy}
              className="mt-3 min-h-12 border-2 border-foreground bg-foreground text-background transition active:opacity-80 disabled:opacity-50"
            >
              <span className="label-kicker">
                {googleBusy === "apple" ? t.auth.appleBusy : t.auth.apple}
              </span>
            </Button>

            <Button variant="plain" size="natural"
              onClick={() => handleOAuth("google")}
              disabled={busy || !!googleBusy}
              className="mt-3 min-h-12 border-2 border-foreground text-foreground transition active:bg-muted disabled:opacity-50"
            >
              <span className="label-kicker">
                {googleBusy === "google" ? t.auth.googleBusy : t.auth.google}
              </span>
            </Button>

            <Button variant="plain" size="natural"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setPassword2("");
              }}
              className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
            >
              {mode === "signin" ? t.auth.toSignup : t.auth.toSignin}
            </Button>
            <p className="mt-6 text-xs text-muted-foreground">
              {t.auth.privacyPre}{" "}
              <Link to="/privacy" className="underline underline-offset-4">{t.auth.privacyLink}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-kicker text-muted-foreground">{label}</span>
      <input
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 border border-border bg-background px-3 text-base text-foreground outline-none focus:border-foreground"
      />
    </label>
  );
}
