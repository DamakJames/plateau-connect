import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back");
      nav({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[var(--ochre)] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[var(--clay)] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--plateau-green)] opacity-15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <Logo size="md" />
          <h1 className="mt-6 bg-gradient-to-r from-[var(--clay)] via-primary to-[var(--ochre)] bg-clip-text font-serif text-3xl font-bold text-transparent">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your cultural journey</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-[var(--clay)] to-[var(--ochre)] text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-95"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
