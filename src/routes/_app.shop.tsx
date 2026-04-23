import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Search, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/shop")({
  component: ShopPage,
});

const categories = ["All", "Attire", "Accessories", "Fabric", "Jewelry", "Beads", "Instruments", "Other"] as const;

function ShopPage() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  return (
    <div className="pb-6">
      <header className="bg-gradient-to-br from-primary to-clay px-5 pt-6 pb-6 text-primary-foreground">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h1 className="font-serif text-2xl font-bold">Cultural Shop</h1>
        </div>
        <p className="mt-1 text-sm opacity-90">Traditional attire & cultural items from Plateau State</p>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items or tribe…"
            className="w-full rounded-full border border-white/30 bg-white/15 py-2.5 pl-10 pr-4 text-sm text-primary-foreground placeholder:text-primary-foreground/70 focus:bg-white/25 focus:outline-none"
          />
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition",
                active === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <PackageOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 font-medium">No items available yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Check back soon or contact admin</p>
      </div>
    </div>
  );
}
