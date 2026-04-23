import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import landscape from "@/assets/hero-landscape.jpg";
import culture from "@/assets/hero-culture.jpg";
import language from "@/assets/hero-language.jpg";
import shop from "@/assets/hero-shop.jpg";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  tagline: string;
  cta: string;
  to: "/explore" | "/learn" | "/library" | "/shop";
  accent: string;
};

const slides: Slide[] = [
  {
    image: landscape,
    eyebrow: "Welcome to",
    title: "Plateau Cultural Archive",
    tagline: "Celebrating Plateau's dialects, stories and people across all 17 LGAs.",
    cta: "Explore LGAs",
    to: "/explore",
    accent: "from-primary/85 via-primary/55 to-transparent",
  },
  {
    image: language,
    eyebrow: "Speak the land",
    title: "Learn 40+ Living Dialects",
    tagline: "Words, phrases and proverbs voiced by elders — preserved for the next generation.",
    cta: "Start Learning",
    to: "/learn",
    accent: "from-accent/85 via-accent/55 to-transparent",
  },
  {
    image: culture,
    eyebrow: "Living traditions",
    title: "Stories, Music & Festivals",
    tagline: "Oral histories, dances and rhythms from every corner of the Plateau.",
    cta: "Open Library",
    to: "/library",
    accent: "from-clay/85 via-clay/55 to-transparent",
  },
  {
    image: shop,
    eyebrow: "Cultural marketplace",
    title: "Attire, Beads & Crafts",
    tagline: "Shop authentic traditional pieces handmade by Plateau artisans.",
    cta: "Visit the Shop",
    to: "/shop",
    accent: "from-plateau-green/85 via-plateau-green/55 to-transparent",
  },
];

const INTERVAL = 7000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-[340px] w-full overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.title}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <img
            src={s.image}
            alt=""
            className={cn(
              "h-full w-full object-cover transition-transform ease-linear",
              i === index ? "scale-110 duration-[7000ms]" : "scale-100 duration-0",
            )}
            loading={i === 0 ? "eager" : "lazy"}
            width={1280}
            height={1280}
          />
          <div className={cn("absolute inset-0 bg-gradient-to-t", s.accent)} />
          <div className="absolute inset-x-0 bottom-0 p-5 pb-10 text-primary-foreground">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-90">
              {s.eyebrow}
            </p>
            <h2 className="mt-1 font-serif text-3xl leading-tight font-bold drop-shadow-sm">
              {s.title}
            </h2>
            <p className="mt-2 max-w-[88%] text-sm leading-relaxed opacity-95">
              {s.tagline}
            </p>
            <Link
              to={s.to}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-plateau-yellow px-4 py-2 text-xs font-semibold text-foreground shadow-md transition hover:brightness-105"
            >
              {s.cta} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
