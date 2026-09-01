import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-warm-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        {back ? (
          <Link
            to="/"
            aria-label="返回"
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition active:scale-95 active:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.375rem] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[0.8125rem] text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {right}
      </div>
    </header>
  );
}
