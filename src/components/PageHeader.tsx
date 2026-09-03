import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
  kicker,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  kicker?: string;
}) {
  return (
    <header className="sticky top-0 z-30 bg-warm-bg">
      <div className="mx-auto max-w-md px-5 pb-3 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {back ? (
                <Link
                  to="/"
                  aria-label="返回"
                  className="-ml-1 flex h-7 w-7 shrink-0 items-center justify-center text-foreground transition active:translate-x-[-2px]"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              ) : null}
              <span className="label-kicker truncate text-muted-foreground">
                {kicker ?? "EXPIRY LEDGER"}
              </span>
            </div>
            <h1 className="font-display mt-1.5 truncate text-[1.75rem] leading-none text-foreground">
              {title}
            </h1>
          </div>
          {right}
        </div>
        {subtitle ? (
          <p className="mt-2 truncate text-[0.8125rem] text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="mx-auto max-w-md px-5">
        <div className="border-t-2 border-foreground" />
      </div>
    </header>
  );
}
