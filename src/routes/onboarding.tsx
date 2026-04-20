import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mountain, Languages, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const slides = [
  {
    icon: Mountain,
    title: "Discover your culture",
    body: "Explore the heritage of all 17 Local Government Areas of Plateau State.",
    tone: "bg-primary/10 text-primary",
  },
  {
    icon: Languages,
    title: "Learn your language",
    body: "Lessons, phrasebooks and audio from the dialects that define us.",
    tone: "bg-secondary/40 text-secondary-foreground",
  },
  {
    icon: Compass,
    title: "Explore Plateau",
    body: "Stories, proverbs, music and media — curated and contributed by the community.",
    tone: "bg-accent/15 text-accent",
  },
] as const;

function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const slide = slides[i];
  const Icon = slide.icon;

  const next = () => {
    if (i < slides.length - 1) setI(i + 1);
    else {
      localStorage.setItem("plato.onboarded", "1");
      nav({ to: "/login" });
    }
  };
  const skip = () => {
    localStorage.setItem("plato.onboarded", "1");
    nav({ to: "/login" });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-6 py-10">
      <div className="flex items-center justify-between">
        <span className="font-serif text-xl font-black text-primary">PLATO</span>
        <button onClick={skip} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className={cn("mb-10 flex h-32 w-32 items-center justify-center rounded-full", slide.tone)}>
          <Icon className="h-14 w-14" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl font-bold leading-tight">{slide.title}</h1>
        <p className="mt-4 max-w-xs text-base text-muted-foreground">{slide.body}</p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === i ? "w-8 bg-primary" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>

      <Button size="lg" className="w-full rounded-full" onClick={next}>
        {i < slides.length - 1 ? "Next" : "Get started"}
      </Button>
    </div>
  );
}
