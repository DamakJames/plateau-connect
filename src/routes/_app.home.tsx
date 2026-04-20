import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ChevronRight, BookOpen, Music2, Quote, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const { data: featured } = useQuery({
    queryKey: ["lga-featured"],
    queryFn: async () => {
      const { data } = await supabase.from("lgas").select("*").order("display_order").limit(1).maybeSingle();
      return data;
    },
  });
  const { data: latestStories } = useQuery({
    queryKey: ["latest-stories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("stories")
        .select("id, title, lga_id, lgas(name, slug)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: continueLesson } = useQuery({
    queryKey: ["continue", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, last_viewed_at, lessons(id, title, dialect_id, dialects(name, slug, lgas(slug)))")
        .eq("user_id", user!.id)
        .order("last_viewed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  return (
    <div className="space-y-6 p-5">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Sannu da zuwa</p>
          <h1 className="font-serif text-2xl font-bold">Welcome to PLATO</h1>
        </div>
      </header>

      {featured && (
        <Link to="/explore/$slug" params={{ slug: featured.slug }} className="block">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent p-6 text-primary-foreground shadow-lg">
            <p className="text-xs font-medium uppercase tracking-widest opacity-80">Featured LGA</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">{featured.name}</h2>
            <p className="mt-2 line-clamp-2 text-sm opacity-90">{featured.overview}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
              Explore <ChevronRight className="h-4 w-4" />
            </span>
          </Card>
        </Link>
      )}

      {continueLesson?.lessons && (
        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold">Continue learning</h3>
          <Link
            to="/learn/$lgaSlug/$dialectSlug/lesson/$lessonId"
            params={{
              lgaSlug: (continueLesson.lessons as any).dialects.lgas.slug,
              dialectSlug: (continueLesson.lessons as any).dialects.slug,
              lessonId: continueLesson.lesson_id,
            }}
          >
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/40 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{(continueLesson.lessons as any).dialects.name}</p>
                <p className="font-medium">{(continueLesson.lessons as any).title}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        </section>
      )}

      <section>
        <h3 className="mb-3 font-serif text-lg font-semibold">Browse by category</h3>
        <div className="grid grid-cols-2 gap-3">
          <CategoryTile to="/learn" icon={Languages} label="Languages" tone="bg-primary/10 text-primary" />
          <CategoryTile to="/library" icon={BookOpen} label="Stories" tone="bg-secondary/40 text-secondary-foreground" />
          <CategoryTile to="/library" icon={Quote} label="Proverbs" tone="bg-accent/10 text-accent" />
          <CategoryTile to="/library" icon={Music2} label="Media" tone="bg-muted text-foreground" />
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-lg font-semibold">Latest stories</h3>
        {latestStories && latestStories.length > 0 ? (
          <div className="space-y-2">
            {latestStories.map((s) => (
              <Card key={s.id} className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {(s.lgas as { name: string } | null)?.name ?? "Plateau"}
                </p>
                <p className="mt-1 font-medium">{s.title}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyHint label="Stories will appear here as they're added." />
        )}
      </section>
    </div>
  );
}

function CategoryTile({ to, icon: Icon, label, tone }: { to: "/learn" | "/library"; icon: typeof BookOpen; label: string; tone: string }) {
  return (
    <Link to={to} className="block">
      <Card className="flex flex-col items-start gap-2 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-medium">{label}</p>
      </Card>
    </Link>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <Card className="border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
      {label}
    </Card>
  );
}
