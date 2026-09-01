import { Link, useLocation } from "@tanstack/react-router";
import { Home, Plus, Archive } from "lucide-react";

export function BottomNav() {
  const pathname = useLocation().pathname;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="border-t border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-8 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
          <TabLink
            to="/"
            active={pathname === "/"}
            icon={<Home className="h-[1.15rem] w-[1.15rem]" />}
            label="首页"
          />
          <Link
            to="/add"
            aria-label="添加物品"
            className="-mt-8 flex h-15 w-15 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)] ring-4 ring-warm-bg transition active:scale-95"
            style={{ height: "3.5rem", width: "3.5rem" }}
          >
            <Plus className="h-7 w-7" strokeWidth={2.4} />
          </Link>
          <TabLink
            to="/archive"
            active={pathname === "/archive"}
            icon={<Archive className="h-[1.15rem] w-[1.15rem]" />}
            label="归档"
          />
        </div>
      </div>
    </nav>
  );
}

function TabLink({
  to,
  active,
  icon,
  label,
}: {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={`flex w-16 flex-col items-center gap-1 py-1 transition ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className={`text-[0.6875rem] ${active ? "font-semibold" : ""}`}>
        {label}
      </span>
    </Link>
  );
}
