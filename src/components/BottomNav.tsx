import { Link, useLocation } from "@tanstack/react-router";
import { Home, Plus, Archive } from "lucide-react";

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-end justify-around px-4 pb-[env(safe-area-inset-bottom)] pt-1.5">
        <TabLink
          to="/"
          active={pathname === "/"}
          icon={<Home className="h-5 w-5" />}
          label="首页"
        />
        <Link
          to="/add"
          className="-mt-6 flex flex-col items-center gap-1"
          aria-label="添加物品"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
            <Plus className="h-7 w-7" />
          </span>
        </Link>
        <TabLink
          to="/archive"
          active={pathname === "/archive"}
          icon={<Archive className="h-5 w-5" />}
          label="归档"
        />
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
      className="flex w-20 flex-col items-center gap-1 py-1"
    >
      <span
        className={
          active ? "text-primary" : "text-muted-foreground"
        }
      >
        {icon}
      </span>
      <span
        className={
          active
            ? "text-[11px] font-medium text-primary"
            : "text-[11px] text-muted-foreground"
        }
      >
        {label}
      </span>
    </Link>
  );
}
