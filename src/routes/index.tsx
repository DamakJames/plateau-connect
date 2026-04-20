import { createFileRoute, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // If onboarding done in localStorage, jump to home (or login)
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("plato.onboarded");
      if (done === "1") {
        const { data } = await supabase.auth.getSession();
        throw redirect({ to: data.session ? "/home" : "/login" });
      }
    }
  },
  component: SplashPage,
});

function SplashPage() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-between overflow-hidden bg-background px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-secondary blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="animate-in fade-in zoom-in duration-700">
          <Logo size="xl" />
        </div>
        <p className="mt-4 max-w-xs font-serif text-lg italic text-muted-foreground">
          Where Culture Lives On
        </p>
      </div>

      <div className="relative z-10 w-full space-y-3">
        <Button asChild size="lg" className="w-full rounded-full text-base shadow-lg">
          <Link to="/onboarding">Begin the journey</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Plateau Digital Cultural Archive
        </p>
      </div>
    </div>
  );
}
