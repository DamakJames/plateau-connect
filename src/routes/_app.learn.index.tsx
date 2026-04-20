import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/learn/")({
  component: LearnPage,
});

function LearnPage() {
  const { data: dialects, isLoading } = useQuery({
    queryKey: ["all-dialects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("dialects")
        .select("id, slug, name, description, lgas(slug, name)")
        .order("name");
      return data ?? [];
    },
  });

  return (
    <div className="p-5">
      <header className="mb-5 pt-2">
        <h1 className="font-serif text-2xl font-bold">Learn a dialect</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lessons, phrasebooks and quizzes</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : dialects && dialects.length > 0 ? (
        <div className="space-y-2">
          {dialects.map((d) => {
            const lga = d.lgas as { slug: string; name: string } | null;
            return (
              <Link key={d.id} to="/learn/$lgaSlug/$dialectSlug" params={{ lgaSlug: lga?.slug ?? "", dialectSlug: d.slug }}>
                <Card className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{lga?.name}</p>
                    <p className="font-serif text-lg font-semibold">{d.name}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No dialects available yet. Check back soon — admins are curating content for all 17 LGAs.
        </Card>
      )}
    </div>
  );
}
