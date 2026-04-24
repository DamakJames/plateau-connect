import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { requireAdmin } from "@/lib/require-admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: requireAdmin,
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

      <AdminUsers currentUserId={user.id} />

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

function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: rows } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, display_name")
        .order("created_at", { ascending: false })
        .limit(50);
      if (q.trim()) query = query.ilike("display_name", `%${q.trim()}%`);
      const { data: profiles, error } = await query;
      if (error) throw error;
      const ids = (profiles ?? []).map((p) => p.id);
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const byUser = new Map<string, string[]>();
      (roleRows ?? []).forEach((r) => {
        const arr = byUser.get(r.user_id) ?? [];
        arr.push(r.role);
        byUser.set(r.user_id, arr);
      });
      return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role, grant }: { userId: string; role: "admin" | "contributor"; grant: boolean }) => {
      if (grant) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error && !`${error.message}`.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      toast.success(`${vars.grant ? "Granted" : "Revoked"} ${vars.role}`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-counts"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold">Admins & contributors</h2>
        <UserPlus className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground">Promote trusted users to admin or contributor.</p>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by display name…"
        className="mt-3"
      />
      <div className="mt-3 space-y-2">
        {rows && rows.length > 0 ? rows.map((p) => {
          const isAdminUser = p.roles.includes("admin");
          const isContrib = p.roles.includes("contributor");
          const isSelf = p.id === currentUserId;
          return (
            <Card key={p.id} className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
                {(p.display_name ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {p.display_name ?? "Unnamed"} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isAdminUser ? "admin · " : ""}{isContrib ? "contributor" : "user"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={isContrib ? "secondary" : "outline"}
                  onClick={() => setRole.mutate({ userId: p.id, role: "contributor", grant: !isContrib })}
                  className="h-7 px-2 text-[11px]"
                >
                  {isContrib ? "Contrib ✓" : "Make contrib"}
                </Button>
                <Button
                  size="sm"
                  variant={isAdminUser ? "default" : "outline"}
                  disabled={isSelf && isAdminUser}
                  onClick={() => setRole.mutate({ userId: p.id, role: "admin", grant: !isAdminUser })}
                  className="h-7 px-2 text-[11px]"
                >
                  {isAdminUser ? <><ShieldOff className="mr-1 h-3 w-3" />Revoke</> : <><ShieldCheck className="mr-1 h-3 w-3" />Make admin</>}
                </Button>
              </div>
            </Card>
          );
        }) : (
          <Card className="border-dashed bg-muted/30 p-6 text-center text-xs text-muted-foreground">
            No users found.
          </Card>
        )}
      </div>
    </section>
  );
}
