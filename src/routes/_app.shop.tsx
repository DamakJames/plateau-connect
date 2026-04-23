import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Search, PackageOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/shop")({
  component: ShopPage,
});

const categories = ["All", "Attire", "Beads", "Accessories", "Fabric", "Jewelry", "Instruments", "Other"] as const;

function ShopPage() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: ["shop-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_items")
        .select("id, title, description, category, tribe, price, currency, images, lgas(name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((it) => {
      const matchesCat = active === "All" || it.category === active;
      if (!matchesCat) return false;
      if (!q) return true;
      const hay = `${it.title} ${it.description ?? ""} ${it.tribe ?? ""} ${(it.lgas as any)?.name ?? ""} ${it.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, active, query]);

  return (
    <div className="pb-6">
      <header className="bg-gradient-to-br from-primary via-[var(--clay)] to-[var(--ochre)] px-5 pt-6 pb-6 text-primary-foreground">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <h1 className="font-serif text-2xl font-bold">Cultural Shop</h1>
        </div>
        <p className="mt-1 text-sm opacity-90">Traditional attire, beads & cultural items from Plateau</p>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, tribe, LGA…"
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

      {isLoading ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <PackageOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium">
            {query || active !== "All" ? "No items match" : "No items available yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {query || active !== "All" ? "Try a different search or category" : "Check back soon"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          {filtered.map((it) => (
            <article
              key={it.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {it.images?.[0] ? (
                  <img
                    src={it.images[0]}
                    alt={it.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <PackageOpen className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{it.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {it.category}
                  {(it.lgas as any)?.name ? ` · ${(it.lgas as any).name}` : ""}
                </p>
                <p className="mt-1 font-serif text-sm font-bold text-primary">
                  ₦{Number(it.price).toLocaleString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
