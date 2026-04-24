import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();

  const { data: pending } = useQuery({
    queryKey: ["admin-pending"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("submissions")
        .select("id, kind, title, body, media_url, status, created_at, lgas(name), dialects(name), profiles:user_id(display_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    enabled: isAdmin,
    queryFn: async () => {
      const [u, l, d, s] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("dialects").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return { users: u.count, lessons: l.count, dialects: d.count, pending: s.count };
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(`Submission ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
    },
  });

  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="p-5">
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Admin access required.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5">
      <Link to="/profile" className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="font-serif text-2xl font-bold">Admin dashboard</h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Users" value={counts?.users ?? 0} />
        <Stat label="Pending" value={counts?.pending ?? 0} />
        <Stat label="Lessons" value={counts?.lessons ?? 0} />
        <Stat label="Dialects" value={counts?.dialects ?? 0} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          to="/admin/shop"
          className="rounded-2xl bg-gradient-to-br from-primary to-[var(--ochre)] p-4 text-primary-foreground shadow-sm"
        >
          <p className="font-serif text-lg font-bold">Shop manager</p>
          <p className="mt-1 text-xs opacity-90">Upload products, set prices, publish</p>
        </Link>
        <Link
          to="/admin/media"
          className="rounded-2xl bg-gradient-to-br from-[var(--plateau-green)] to-[var(--ochre)] p-4 text-primary-foreground shadow-sm"
        >
          <p className="font-serif text-lg font-bold">Media manager</p>
          <p className="mt-1 text-xs opacity-90">Audio, images & YouTube videos</p>
        </Link>
      </div>

      <h2 className="mt-8 font-serif text-lg font-semibold">Moderation queue</h2>
      <div className="mt-3 space-y-3">
        {pending && pending.length > 0 ? pending.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.kind}</p>
                <p className="font-medium">{s.title}</p>
                {s.body && <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{s.body}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  by {(s.profiles as any)?.display_name ?? "Unknown"}
                  {(s.lgas as any)?.name && ` · ${(s.lgas as any).name}`}
                  {(s.dialects as any)?.name && ` · ${(s.dialects as any).name}`}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => decide.mutate({ id: s.id, status: "approved" })}>
                <Check className="mr-1 h-4 w-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => decide.mutate({ id: s.id, status: "rejected" })}>
                <X className="mr-1 h-4 w-4" /> Reject
              </Button>
            </div>
          </Card>
        )) : (
          <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No pending submissions.
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 text-center">
      <p className="font-serif text-3xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
