import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Volume2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/learn/$lgaSlug/$dialectSlug/")({
  component: DialectPage,
});

function DialectPage() {
  const { lgaSlug, dialectSlug } = Route.useParams();
  const [tab, setTab] = useState("lessons");

  const { data: dialect } = useQuery({
    queryKey: ["dialect", lgaSlug, dialectSlug],
    queryFn: async () => {
      const { data: lga } = await supabase.from("lgas").select("id, name, slug").eq("slug", lgaSlug).maybeSingle();
      if (!lga) return null;
      const { data } = await supabase.from("dialects").select("*").eq("lga_id", lga.id).eq("slug", dialectSlug).maybeSingle();
      return data ? { ...data, lga } : null;
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["lessons", dialect?.id],
    enabled: !!dialect,
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("*").eq("dialect_id", dialect!.id).order("position");
      return data ?? [];
    },
  });

  const { data: phrases } = useQuery({
    queryKey: ["phrases", dialect?.id],
    enabled: !!dialect,
    queryFn: async () => {
      const { data } = await supabase.from("phrases").select("*").eq("dialect_id", dialect!.id);
      return data ?? [];
    },
  });

  if (!dialect) return <div className="p-5">Loading…</div>;

  const grouped = (phrases ?? []).reduce<Record<string, typeof phrases>>((acc, p) => {
    const cat = p.category || "General";
    (acc[cat] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="relative bg-gradient-to-br from-primary to-accent p-5 pt-8 text-primary-foreground">
        <Link to="/learn" className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/20 backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-xs uppercase tracking-widest opacity-80">{dialect.lga.name}</p>
        <h1 className="font-serif text-3xl font-bold">{dialect.name}</h1>
        {dialect.description && <p className="mt-2 max-w-prose text-sm opacity-90">{dialect.description}</p>}
      </div>

      <div className="p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="phrases">Phrasebook</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-4 space-y-2">
            {lessons && lessons.length > 0 ? lessons.map((l, i) => (
              <Link key={l.id} to="/learn/$lgaSlug/$dialectSlug/lesson/$lessonId" params={{ lgaSlug, dialectSlug, lessonId: l.id }}>
                <Card className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/40 text-primary font-serif font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{l.title}</p>
                    {l.description && <p className="text-xs text-muted-foreground line-clamp-1">{l.description}</p>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              </Link>
            )) : (
              <Card className="border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                <BookOpen className="mx-auto mb-2 h-6 w-6 opacity-60" />
                No lessons yet — content coming soon.
              </Card>
            )}
          </TabsContent>

          <TabsContent value="phrases" className="mt-4 space-y-4">
            {Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([cat, list]) => (
              <div key={cat}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h3>
                <div className="space-y-2">
                  {list!.map((p) => (
                    <Card key={p.id} className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <p className="font-serif text-base font-semibold">{p.text}</p>
                        <p className="text-sm text-muted-foreground">{p.translation}</p>
                      </div>
                      {p.audio_url && (
                        <button
                          onClick={() => new Audio(p.audio_url!).play()}
                          className="ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )) : (
              <Card className="border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No phrases yet.
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
