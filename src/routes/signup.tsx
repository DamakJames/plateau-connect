import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const schema = z.object({
  displayName: z.string().trim().min(2, "Name too short").max(60),
  email: z.string().trim().email(),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function SignupPage() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await signUp(parsed.data.email, parsed.data.password, parsed.data.displayName);
      toast.success("Account created");
      nav({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-[var(--ochre)] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[var(--plateau-green)] opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-[var(--clay)] opacity-20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <Logo size="md" />
          <h1 className="mt-6 bg-gradient-to-r from-[var(--clay)] via-primary to-[var(--plateau-green)] bg-clip-text font-serif text-3xl font-bold text-transparent">
            Join PLATO
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Become part of the living archive</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-[var(--clay)] via-primary to-[var(--ochre)] text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-95"
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
