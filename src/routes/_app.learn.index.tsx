import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, MessageCircle, ScrollText, Mic, Sparkles, PlayCircle, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/learn/")({
  component: LearnPage,
});

function LearnPage() {
  const { data: dialects } = useQuery({
    queryKey: ["all-dialects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("dialects")
        .select("id, slug, name, lgas(slug, name)")
        .order("name");
      return data ?? [];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["learn-counts"],
    queryFn: async () => {
      const [phrases, stories, proverbs, media] = await Promise.all([
        supabase.from("phrases").select("id", { count: "exact", head: true }),
        supabase.from("stories").select("id", { count: "exact", head: true }),
        supabase.from("proverbs").select("id", { count: "exact", head: true }),
        supabase.from("media").select("id", { count: "exact", head: true }).eq("kind", "video"),
      ]);
      return {
        phrases: phrases.count ?? 0,
        stories: stories.count ?? 0,
        proverbs: proverbs.count ?? 0,
        media: media.count ?? 0,
      };
    },
  });

  const categories = [
    {
      icon: BookOpen,
      title: "Words & Phrases",
      sub: "Learn vocabulary from 40+ dialects",
      count: counts?.phrases ?? 0,
      tone: "bg-secondary/30 text-primary",
    },
    {
      icon: Mic,
      title: "Sentences",
      sub: "Common phrases and greetings",
      count: counts?.phrases ?? 0,
      tone: "bg-accent/10 text-accent",
    },
    {
      icon: ScrollText,
      title: "Proverbs & Wisdom",
      sub: "Ancient sayings of the plateau peoples",
      count: counts?.proverbs ?? 0,
      tone: "bg-plateau-yellow/30 text-foreground",
    },
    {
      icon: MessageCircle,
      title: "Stories & History",
      sub: "Oral traditions and historical accounts",
      count: counts?.stories ?? 0,
      tone: "bg-destructive/10 text-destructive",
    },
    {
      icon: Sparkles,
      title: "Culture & Traditions",
      sub: "Festivals, attire, customs & more",
      count: counts?.media ?? 0,
      tone: "bg-plateau-green/15 text-plateau-green",
    },
    {
      icon: PlayCircle,
      title: "Video Tutorials",
      sub: "Watch and learn visually",
      count: counts?.media ?? 0,
      tone: "bg-clay/15 text-clay",
    },
  ];

  return (
    <div className="pb-6">
      <header className="bg-gradient-to-br from-primary to-clay px-5 pt-6 pb-6 text-primary-foreground">
        <h1 className="font-serif text-2xl font-bold">Learn</h1>
        <p className="mt-1 text-sm opacity-90">Discover Plateau's languages & culture</p>
      </header>

      <section className="space-y-2.5 px-5 pt-5">
        {categories.map((c) => (
          <div
            key={c.title}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{c.title}</p>
              <p className="truncate text-xs text-muted-foreground">{c.sub}</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {c.count}
            </span>
          </div>
        ))}
      </section>

      {dialects && dialects.length > 0 && (
        <section className="px-5 pt-6">
          <h3 className="mb-3 font-serif text-base font-semibold">Dialects</h3>
          <div className="space-y-2">
            {dialects.map((d) => {
              const lga = d.lgas as { slug: string; name: string } | null;
              return (
                <Link
                  key={d.id}
                  to="/learn/$lgaSlug/$dialectSlug"
                  params={{ lgaSlug: lga?.slug ?? "", dialectSlug: d.slug }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{lga?.name}</p>
                    <p className="font-serif text-base font-semibold">{d.name}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
