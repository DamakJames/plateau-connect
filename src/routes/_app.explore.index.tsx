import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/_app/explore/")({
  component: ExplorePage,
});

function ExplorePage() {
  const { data: lgas, isLoading } = useQuery({
    queryKey: ["lgas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lgas")
        .select("id, slug, name, overview, cover_url, dialects(count)")
        .order("display_order");
      return data ?? [];
    },
  });

  return (
    <div className="p-5">
      <header className="mb-5 pt-2">
        <h1 className="font-serif text-2xl font-bold">Explore Plateau</h1>
        <p className="mt-1 text-sm text-muted-foreground">17 Local Government Areas. One rich heritage.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {lgas?.map((lga) => {
            const count = (lga.dialects as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <Link key={lga.id} to="/explore/$slug" params={{ slug: lga.slug }}>
                <Card className="group flex h-36 flex-col justify-end overflow-hidden border-0 p-3 text-primary-foreground shadow-sm transition hover:shadow-md"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.55 0.15 ${30 + (lga.display_order ?? 0) * 8}), oklch(0.42 0.08 145))`,
                  }}
                >
                  <MapPin className="mb-auto h-5 w-5 opacity-70" />
                  <div>
                    <p className="font-serif text-base font-bold leading-tight">{lga.name}</p>
                    <p className="mt-0.5 text-[10px] opacity-80">
                      {count > 0 ? `${count} dialect${count > 1 ? "s" : ""}` : "Coming soon"}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
