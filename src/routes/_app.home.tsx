import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Compass, GraduationCap, BookMarked, Upload, Info, ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const tiles = [
  {
    to: "/explore" as const,
    title: "Explore",
    sub: "LGAs · Tribes · Dialects",
    icon: Compass,
    bg: "bg-card",
    iconBg: "bg-primary/15 text-primary",
  },
  {
    to: "/learn" as const,
    title: "Learn",
    sub: "Words · Stories · Culture",
    icon: GraduationCap,
    bg: "bg-clay text-primary-foreground",
    iconBg: "bg-white/20 text-white",
  },
  {
    to: "/library" as const,
    title: "Library",
    sub: "Videos · Audio · Photos",
    icon: BookMarked,
    bg: "bg-plateau-green text-primary-foreground",
    iconBg: "bg-white/20 text-white",
  },
  {
    to: "/contribute" as const,
    title: "Contribute",
    sub: "Share your heritage",
    icon: Upload,
    bg: "bg-card",
    iconBg: "bg-accent/15 text-accent",
  },
  {
    to: "/about" as const,
    title: "About",
    sub: "Mission · Partnership",
    icon: Info,
    bg: "bg-destructive text-destructive-foreground",
    iconBg: "bg-white/20 text-white",
  },
];

function HomePage() {
  const { data: phrase } = useQuery({
    queryKey: ["word-of-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("phrases")
        .select("text, translation, category, dialects(name)")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  return (
    <div className="pb-6">
      <HeroCarousel />

      <section className="px-5 pt-6">
        <h3 className="mb-3 font-serif text-base font-semibold tracking-tight">
          Where would you like to go?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {tiles.slice(0, 4).map((t) => (
            <TileLink key={t.title} {...t} />
          ))}
          <div className="col-span-2">
            <TileLink {...tiles[4]} wide />
          </div>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-serif text-base font-semibold tracking-tight">Word of the Day</h3>
          <Link to="/learn" className="text-xs font-medium text-primary">
            Learn More
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-clay to-primary p-5 text-primary-foreground shadow-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-90">
            {(phrase?.dialects as { name: string } | null)?.name ?? "Ngas"}
          </p>
          <p className="mt-1 font-serif text-4xl font-bold">{phrase?.text ?? "Tat"}</p>
          <p className="mt-2 text-sm opacity-90">
            /{phrase?.translation ?? "father"}/
          </p>
          <p className="mt-1 text-xs opacity-80">
            {phrase?.category ?? "Family · Greetings"}
          </p>
        </div>
      </section>
    </div>
  );
}

function TileLink({
  to,
  title,
  sub,
  icon: Icon,
  bg,
  iconBg,
  wide,
}: {
  to: "/explore" | "/learn" | "/library" | "/contribute" | "/about";
  title: string;
  sub: string;
  icon: typeof Compass;
  bg: string;
  iconBg: string;
  wide?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group block rounded-2xl border border-border/60 ${bg} p-4 shadow-sm transition hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <ChevronRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5" />
      </div>
      <p className={`mt-3 font-serif font-bold ${wide ? "text-lg" : "text-base"}`}>{title}</p>
      <p className="mt-0.5 text-[11px] opacity-80">{sub}</p>
    </Link>
  );
}
