import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "登录 · 保质期记录" },
      {
        name: "description",
        content: "登录后即可把家中物品的保质期记录保存到云端，换手机也不会丢。",
      },
      { property: "og:title", content: "登录 · 保质期记录" },
      {
        property: "og:description",
        content: "登录后即可把家中物品的保质期记录保存到云端，换手机也不会丢。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

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
    if (mode === "signup") {
      if (password.length < 6) {
        toast.error("密码至少 6 位");
        return;
      }
      if (password !== password2) {
        toast.error("两次输入的密码不一致");
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
        if (!data.session) {
          setSentTo(email);
          toast.success("确认邮件已发送，请查收后点击链接");
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
      toast.error(err instanceof Error ? err.message : "操作失败，请重试");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (googleBusy) return;
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("谷歌登录失败，请重试");
        setGoogleBusy(false);
        return;
      }
      // 已登录或即将跳转：保持按钮 loading，交给 onAuthStateChange 直接进入主页
    } catch {
      toast.error("谷歌登录失败，请重试");
      setGoogleBusy(false);
    }
  }


  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
        <p className="label-kicker text-muted-foreground">EXPIRY LEDGER</p>
        <h1 className="font-display mt-2 text-[2.25rem] leading-none text-foreground">
          保质期记录
        </h1>
        <div className="mt-3 border-t-2 border-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          {mode === "signin"
            ? "登录后你的记录会保存在云端，换设备也能看到。"
            : "注册一个账号，记录只属于你自己。"}
        </p>

        {sentTo ? (
          <div className="mt-8 border border-border p-4">
            <p className="label-kicker text-muted-foreground">CHECK YOUR EMAIL</p>
            <p className="mt-2 text-sm text-foreground">
              我们已向 {sentTo} 发送了一封确认邮件，点击其中的链接后即可登录。
            </p>
            <button
              onClick={() => setSentTo(null)}
              className="label-kicker mt-4 underline underline-offset-4"
            >
              返回
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Field
                label="邮箱 / EMAIL"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
              <Field
                label="密码 / PASSWORD"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              {mode === "signup" && (
                <Field
                  label="确认密码 / CONFIRM PASSWORD"
                  type="password"
                  value={password2}
                  onChange={setPassword2}
                  autoComplete="new-password"
                />
              )}
              <button
                type="submit"
                disabled={busy || googleBusy}
                className="min-h-12 border-2 border-foreground bg-foreground text-background transition active:opacity-80 disabled:opacity-50"
              >
                <span className="label-kicker">
                  {busy
                    ? "处理中…"
                    : mode === "signin"
                      ? "登录 / SIGN IN"
                      : "注册 / SIGN UP"}
                </span>
              </button>
            </form>

            <button
              onClick={handleGoogle}
              disabled={busy || googleBusy}
              className="mt-3 min-h-12 border-2 border-foreground text-foreground transition active:bg-muted disabled:opacity-50"
            >
              <span className="label-kicker">
                {googleBusy ? "正在打开谷歌登录…" : "用谷歌账号继续 / GOOGLE"}
              </span>
            </button>

            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setPassword2("");
              }}
              className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
            >
              {mode === "signin" ? "还没有账号？去注册" : "已有账号？去登录"}
            </button>
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
