import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link as RLink } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/explore/$slug")({
  component: LgaDetail,
});

function Empty({ label }: { label: string }) {
  return (
    <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">{label}</Card>
  );
}

function LgaDetail() {
  const { slug } = Route.useParams();
  const [tab, setTab] = useState("overview");

  const { data: lga, isLoading } = useQuery({
    queryKey: ["lga", slug],
    queryFn: async () => {
      const { data } = await supabase.from("lgas").select("*").eq("slug", slug).maybeSingle();
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: dialects } = useQuery({
    queryKey: ["dialects", lga?.id],
    enabled: !!lga,
    queryFn: async () => {
      const { data } = await supabase.from("dialects").select("*").eq("lga_id", lga!.id);
      return data ?? [];
    },
  });
  const { data: stories } = useQuery({
    queryKey: ["lga-stories", lga?.id],
    enabled: !!lga,
    queryFn: async () => {
      const { data } = await supabase.from("stories").select("*").eq("lga_id", lga!.id);
      return data ?? [];
    },
  });
  const { data: proverbs } = useQuery({
    queryKey: ["lga-proverbs", lga?.id],
    enabled: !!lga,
    queryFn: async () => {
      const { data } = await supabase.from("proverbs").select("*").eq("lga_id", lga!.id);
      return data ?? [];
    },
  });
  const { data: media } = useQuery({
    queryKey: ["lga-media", lga?.id],
    enabled: !!lga,
    queryFn: async () => {
      const { data } = await supabase.from("media").select("*").eq("lga_id", lga!.id);
      return data ?? [];
    },
  });

  if (isLoading || !lga) return <div className="p-5">Loading…</div>;

  return (
    <div>
      <div
        className="relative h-56 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.55 0.15 ${30 + (lga.display_order ?? 0) * 8}), oklch(0.42 0.08 145))`,
        }}
      >
        <Link to="/explore" className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-80">Plateau State</p>
          <h1 className="font-serif text-3xl font-bold">{lga.name}</h1>
        </div>
      </div>

      <div className="p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dialects">Dialects</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="proverbs">Proverbs</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <p className="leading-relaxed text-foreground/90">{lga.overview || "Overview coming soon."}</p>
          </TabsContent>

          <TabsContent value="dialects" className="mt-4 space-y-2">
            {dialects && dialects.length > 0 ? dialects.map((d) => (
              <RLink key={d.id} to="/learn/$lgaSlug/$dialectSlug" params={{ lgaSlug: lga.slug, dialectSlug: d.slug }}>
                <Card className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    {d.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{d.description}</p>}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              </RLink>
            )) : <Empty label="No dialects yet — content coming soon." />}
          </TabsContent>

          <TabsContent value="stories" className="mt-4 space-y-2">
            {stories && stories.length > 0 ? stories.map((s) => (
              <Card key={s.id} className="p-4">
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.body}</p>
              </Card>
            )) : <Empty label="No stories yet — content coming soon." />}
          </TabsContent>

          <TabsContent value="proverbs" className="mt-4 space-y-2">
            {proverbs && proverbs.length > 0 ? proverbs.map((p) => (
              <Card key={p.id} className="p-4">
                <p className="font-serif italic">"{p.text}"</p>
                {p.translation && <p className="mt-1 text-sm text-muted-foreground">{p.translation}</p>}
                {p.meaning && <p className="mt-2 text-xs text-muted-foreground">{p.meaning}</p>}
              </Card>
            )) : <Empty label="No proverbs yet — content coming soon." />}
          </TabsContent>

          <TabsContent value="media" className="mt-4 space-y-2">
            {media && media.length > 0 ? media.map((m) => (
              <Card key={m.id} className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.kind}</p>
                <p className="mt-1 font-medium">{m.title}</p>
                {m.kind === "audio" && <audio controls src={m.url} className="mt-2 w-full" />}
                {m.kind === "video" && <video controls src={m.url} className="mt-2 w-full rounded" />}
                {m.kind === "image" && <img src={m.url} alt={m.title} className="mt-2 w-full rounded" />}
              </Card>
            )) : <Empty label="No media yet — content coming soon." />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
