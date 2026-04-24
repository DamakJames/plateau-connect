import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, GraduationCap, ShoppingBag, Menu, BookMarked, User, Upload, Info, Shield, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const primary = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
] as const;

export function BottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {primary.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + "/");
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium",
                open ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 rounded-t-3xl border-t border-border bg-card pb-8 pt-5 shadow-2xl animate-in slide-in-from-bottom">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
            <div className="flex items-center justify-between px-5">
              <h3 className="font-serif text-lg font-bold">More</h3>
              <button onClick={() => setOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 px-4">
              <SheetItem to="/library" label="Library" icon={BookMarked} onClick={() => setOpen(false)} />
              <SheetItem to="/contribute" label="Contribute" icon={Upload} onClick={() => setOpen(false)} />
              <SheetItem to="/profile" label="Profile" icon={User} onClick={() => setOpen(false)} />
              <SheetItem to="/about" label="About" icon={Info} onClick={() => setOpen(false)} />
              {isAdmin && <SheetItem to="/admin" label="Admin" icon={Shield} onClick={() => setOpen(false)} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SheetItem({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: "/library" | "/contribute" | "/profile" | "/about" | "/admin";
  label: string;
  icon: typeof Home;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-xs font-medium hover:bg-muted/60"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      {label}
    </Link>
  );
}
