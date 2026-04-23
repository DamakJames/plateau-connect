import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Search, Menu, Video, Headphones, Image as ImageIcon, Layers, PlayCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPlayer } from "@/components/MediaPlayer";

export const Route = createFileRoute("/_app/library")({
  component: LibraryPage,
});

const mediaTabs = [
  { id: "all", label: "All Media", icon: Layers },
  { id: "video", label: "Videos", icon: Video },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "image", label: "Photos", icon: ImageIcon },
] as const;

function LibraryPage() {
  const [tab, setTab] = useState<(typeof mediaTabs)[number]["id"]>("all");
  const [tribe, setTribe] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: media } = useQuery({
    queryKey: ["library-media"],
    queryFn: async () => {
      const { data } = await supabase
        .from("media")
        .select("id, title, kind, url, thumbnail_url, lgas(name, slug)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: lgas } = useQuery({
    queryKey: ["lgas-min"],
    queryFn: async () => {
      const { data } = await supabase.from("lgas").select("name, slug").order("name");
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return (media ?? []).filter((m) => {
      if (tab !== "all" && m.kind !== tab) return false;
      if (tribe !== "all" && (m.lgas as { slug: string } | null)?.slug !== tribe) return false;
      if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [media, tab, tribe, query]);

  return (
    <div className="pb-6">
      <header className="bg-gradient-to-br from-accent to-plateau-green px-5 pt-6 pb-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold">Library</h1>
          <button className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
            <Menu className="h-3.5 w-3.5" /> Browse
          </button>
        </div>
        <p className="mt-1 text-xs opacity-90">All Media · {filtered.length} items</p>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search library…"
            className="w-full rounded-full border border-white/30 bg-white/15 py-2.5 pl-10 pr-4 text-sm text-primary-foreground placeholder:text-primary-foreground/70 focus:bg-white/25 focus:outline-none"
          />
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mediaTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                tab === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setTribe("all")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium",
              tribe === "all"
                ? "border-clay bg-clay/10 text-clay"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            All Tribes
          </button>
          {(lgas ?? []).map((l) => (
            <button
              key={l.slug}
              onClick={() => setTribe(l.slug)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium",
                tribe === l.slug
                  ? "border-clay bg-clay/10 text-clay"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <section className="px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
            No items match your filters yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => setOpenId(m.id)}
                className="text-left overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-square bg-muted">
                  {m.thumbnail_url || m.kind === "image" ? (
                    <img
                      src={m.thumbnail_url ?? m.url}
                      alt={m.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <PlayCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                    {m.kind}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-1 text-xs font-medium">{m.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(m.lgas as { name: string } | null)?.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {openId && (() => {
        const item = (filtered ?? []).find((m) => m.id === openId);
        if (!item) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
            onClick={() => setOpenId(null)}
          >
            <div
              className="w-full max-w-md rounded-t-3xl bg-card p-4 shadow-2xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg font-bold leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.lgas as { name: string } | null)?.name ?? "Plateau"} · {item.kind}
                  </p>
                </div>
                <button
                  onClick={() => setOpenId(null)}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {item.kind === "image" ? (
                <img src={item.url} alt={item.title} className="w-full rounded-2xl" />
              ) : (
                <MediaPlayer kind={item.kind === "video" ? "video" : "audio"} src={item.url} />
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
