import { Link, useLocation } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export function BottomNav() {
  const pathname = useLocation().pathname;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground bg-warm-bg">
      <div className="mx-auto grid max-w-md grid-cols-[1fr_auto_1fr] items-stretch pb-[env(safe-area-inset-bottom)]">
        <TabLink to="/" active={pathname === "/"} label="在库 / STOCK" />
        <Link
          to="/add"
          aria-label="添加物品"
          className="flex min-h-11 w-16 items-center justify-center border-x border-border bg-foreground text-background transition active:opacity-80"
        >
          <Plus className="h-6 w-6" strokeWidth={2.6} />
        </Link>
        <TabLink
          to="/archive"
          active={pathname === "/archive"}
          label="归档 / ARCHIVE"
        />
      </div>
    </nav>
  );
}

function TabLink({
  to,
  active,
  label,
}: {
  to: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={`label-kicker flex min-h-11 items-center justify-center px-2 py-4 text-center transition ${
        active ? "text-foreground underline underline-offset-4" : "text-muted-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
