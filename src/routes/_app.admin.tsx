import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { requireAdmin } from "@/lib/require-admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Check, X, ShieldCheck, ShieldOff, Plus, Trash2, Loader2,
  Eye, EyeOff, Upload, Music, Youtube, ImageIcon, Pencil,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  beforeLoad: requireAdmin,
  component: AdminPage,
});

const SHOP_CATEGORIES = ["Attire", "Beads", "Accessories", "Fabric", "Jewelry", "Instruments", "Other"];

function AdminPage() {
  const { user, isAdmin } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    enabled: isAdmin,
    queryFn: async () => {
      const [pending, lgas, lessons, media, shop] = await Promise.all([
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("lgas").select("id", { count: "exact", head: true }),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("media").select("id", { count: "exact", head: true }),
        supabase.from("shop_items").select("id", { count: "exact", head: true }),
      ]);
      return {
        pending: pending.count ?? 0,
        lgas: lgas.count ?? 0,
        lessons: lessons.count ?? 0,
        media: media.count ?? 0,
        shop: shop.count ?? 0,
      };
    },
  });

  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="p-5">
        <Card className="p-6 text-center text-sm text-muted-foreground">Admin access required.</Card>
      </div>
    );
  }

  return (
    <div className="p-5 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          <ShieldCheck className="h-3 w-3" /> Admin
        </span>
      </div>
      <h1 className="mt-3 font-serif text-2xl font-bold">Dashboard</h1>
      <p className="text-xs text-muted-foreground">Plateau Cultural Archive — Content Management</p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <Stat label="Pending" value={counts?.pending ?? 0} accent="text-amber-600" />
        <Stat label="LGAs" value={counts?.lgas ?? 0} />
        <Stat label="Lessons" value={counts?.lessons ?? 0} />
        <Stat label="Media" value={counts?.media ?? 0} />
      </div>

      <Tabs defaultValue="submissions" className="mt-5">
        <TabsList className="flex w-full overflow-x-auto whitespace-nowrap rounded-full bg-muted p-1">
          <TabsTrigger value="submissions" className="flex-1 rounded-full text-xs">Submissions</TabsTrigger>
          <TabsTrigger value="lgas" className="flex-1 rounded-full text-xs">LGAs</TabsTrigger>
          <TabsTrigger value="dialects" className="flex-1 rounded-full text-xs">Dialects</TabsTrigger>
          <TabsTrigger value="stories" className="flex-1 rounded-full text-xs">Stories</TabsTrigger>
          <TabsTrigger value="proverbs" className="flex-1 rounded-full text-xs">Proverbs</TabsTrigger>
          <TabsTrigger value="shop" className="flex-1 rounded-full text-xs">Shop</TabsTrigger>
          <TabsTrigger value="media" className="flex-1 rounded-full text-xs">Media</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 rounded-full text-xs">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4"><SubmissionsTab /></TabsContent>
        <TabsContent value="lgas" className="mt-4"><LgasTab /></TabsContent>
        <TabsContent value="dialects" className="mt-4"><DialectsTab /></TabsContent>
        <TabsContent value="stories" className="mt-4"><StoriesTab /></TabsContent>
        <TabsContent value="proverbs" className="mt-4"><ProverbsTab /></TabsContent>
        <TabsContent value="shop" className="mt-4"><ShopTab /></TabsContent>
        <TabsContent value="media" className="mt-4"><MediaTab /></TabsContent>
        <TabsContent value="users" className="mt-4"><UsersTab currentUserId={user.id} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card className="p-2.5 text-center">
      <p className={`font-serif text-2xl font-bold ${accent ?? "text-primary"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </Card>
  );
}

/* ----------------------- Section header with + button ----------------------- */
function SectionHeader({
  title, count, onAdd, addLabel = "Add",
}: { title: string; count?: number; onAdd: () => void; addLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {count !== undefined ? `${count} ${title.toLowerCase()}` : title}
      </p>
      <Button size="sm" onClick={onAdd} className="h-8 rounded-full px-3 text-xs">
        <Plus className="mr-1 h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
      {children}
    </Card>
  );
}

/* ------------------------------ Submissions tab ----------------------------- */
function SubmissionsTab() {
  const qc = useQueryClient();
  const { data: pending } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("submissions")
        .select("id, kind, title, body, media_url, status, created_at, lgas(name), dialects(name), profiles:user_id(display_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data ?? [];
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

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{pending?.length ?? 0} pending</p>
      {pending && pending.length > 0 ? pending.map((s) => (
        <Card key={s.id} className="p-4">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.kind}</p>
          <p className="font-medium">{s.title}</p>
          {s.body && <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{s.body}</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            by {(s.profiles as { display_name?: string } | null)?.display_name ?? "Unknown"}
            {(s.lgas as { name?: string } | null)?.name && ` · ${(s.lgas as { name: string }).name}`}
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => decide.mutate({ id: s.id, status: "approved" })}>
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => decide.mutate({ id: s.id, status: "rejected" })}>
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        </Card>
      )) : <EmptyState>No pending submissions.</EmptyState>}
    </div>
  );
}

/* ---------------------------------- LGAs ----------------------------------- */
function LgasTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: lgas } = useQuery({
    queryKey: ["admin-lgas"],
    queryFn: async () => (await supabase.from("lgas").select("*").order("display_order")).data ?? [],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lgas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("LGA removed"); qc.invalidateQueries({ queryKey: ["admin-lgas"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <SectionHeader title="LGAs" count={lgas?.length} onAdd={() => setOpen((v) => !v)} addLabel={open ? "Close" : "Add LGA"} />
      {open && <LgaForm onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-lgas"] }); }} />}
      <div className="mt-3 space-y-2">
        {lgas && lgas.length > 0 ? lgas.map((l) => (
          <Card key={l.id} className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-serif text-sm font-bold text-primary">
              {l.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{l.name}</p>
              <p className="truncate text-xs text-muted-foreground">/{l.slug}</p>
            </div>
            <button onClick={() => confirm("Delete this LGA?") && remove.mutate(l.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        )) : <EmptyState>No LGAs yet.</EmptyState>}
      </div>
    </div>
  );
}

function LgaForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: "", slug: "", overview: "", cover_url: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("lgas").insert({
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      overview: form.overview || null,
      cover_url: form.cover_url || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("LGA added");
    onDone();
  };
  return (
    <Card className="p-4"><form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/\s+/g, "-") })} /></div>
      <div className="space-y-1.5"><Label>Slug</Label><Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Overview</Label><Textarea rows={3} value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Cover URL</Label><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></div>
      <Button type="submit" disabled={saving} className="w-full rounded-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save LGA</Button>
    </form></Card>
  );
}

/* -------------------------------- Dialects --------------------------------- */
function DialectsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["admin-dialects"],
    queryFn: async () => (await supabase.from("dialects").select("*, lgas(name)").order("name")).data ?? [],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("dialects").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Dialect removed"); qc.invalidateQueries({ queryKey: ["admin-dialects"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <SectionHeader title="Dialects" count={data?.length} onAdd={() => setOpen((v) => !v)} addLabel={open ? "Close" : "Add Dialect"} />
      {open && <DialectForm onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-dialects"] }); }} />}
      <div className="mt-3 space-y-2">
        {data && data.length > 0 ? data.map((d) => (
          <Card key={d.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{d.name}</p>
              <p className="truncate text-xs text-muted-foreground">{(d.lgas as { name?: string } | null)?.name ?? "—"}</p>
            </div>
            <button onClick={() => confirm("Delete?") && remove.mutate(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </Card>
        )) : <EmptyState>No dialects yet.</EmptyState>}
      </div>
    </div>
  );
}

function DialectForm({ onDone }: { onDone: () => void }) {
  const { data: lgas } = useQuery({ queryKey: ["lgas-min"], queryFn: async () => (await supabase.from("lgas").select("id, name").order("name")).data ?? [] });
  const [form, setForm] = useState({ name: "", slug: "", lga_id: "", description: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lga_id) return toast.error("Select an LGA");
    setSaving(true);
    const { error } = await supabase.from("dialects").insert({
      name: form.name.trim(),
      slug: (form.slug || form.name).trim().toLowerCase().replace(/\s+/g, "-"),
      lga_id: form.lga_id,
      description: form.description || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Dialect added"); onDone();
  };
  return (
    <Card className="p-4"><form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><Label>LGA</Label>
        <select required value={form.lga_id} onChange={(e) => setForm({ ...form, lga_id: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
          <option value="">— Select LGA —</option>
          {lgas?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <div className="space-y-1.5"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Slug (optional)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <Button type="submit" disabled={saving} className="w-full rounded-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Dialect</Button>
    </form></Card>
  );
}

/* --------------------------------- Stories --------------------------------- */
function StoriesTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: async () => (await supabase.from("stories").select("*, lgas(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("stories").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin-stories"] }); },
  });

  return (
    <div>
      <SectionHeader title="Stories" count={data?.length} onAdd={() => setOpen((v) => !v)} addLabel={open ? "Close" : "Add Story"} />
      {open && <StoryForm onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-stories"] }); }} />}
      <div className="mt-3 space-y-2">
        {data && data.length > 0 ? data.map((s) => (
          <Card key={s.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.title}</p>
              <p className="truncate text-xs text-muted-foreground">{(s.lgas as { name?: string } | null)?.name ?? "—"}</p>
            </div>
            <button onClick={() => confirm("Delete?") && remove.mutate(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </Card>
        )) : <EmptyState>No stories yet.</EmptyState>}
      </div>
    </div>
  );
}

function StoryForm({ onDone }: { onDone: () => void }) {
  const { data: lgas } = useQuery({ queryKey: ["lgas-min"], queryFn: async () => (await supabase.from("lgas").select("id, name").order("name")).data ?? [] });
  const [form, setForm] = useState({ title: "", body: "", lga_id: "", cover_url: "", audio_url: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lga_id) return toast.error("Select an LGA");
    setSaving(true);
    const { error } = await supabase.from("stories").insert({
      title: form.title.trim(),
      body: form.body,
      lga_id: form.lga_id,
      cover_url: form.cover_url || null,
      audio_url: form.audio_url || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Story added"); onDone();
  };
  return (
    <Card className="p-4"><form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><Label>LGA</Label>
        <select required value={form.lga_id} onChange={(e) => setForm({ ...form, lga_id: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
          <option value="">— Select LGA —</option>
          {lgas?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <div className="space-y-1.5"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Body</Label><Textarea required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Cover URL</Label><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Audio URL</Label><Input value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} /></div>
      <Button type="submit" disabled={saving} className="w-full rounded-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Story</Button>
    </form></Card>
  );
}

/* --------------------------------- Proverbs -------------------------------- */
function ProverbsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["admin-proverbs"],
    queryFn: async () => (await supabase.from("proverbs").select("*, lgas(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("proverbs").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin-proverbs"] }); },
  });
  return (
    <div>
      <SectionHeader title="Proverbs" count={data?.length} onAdd={() => setOpen((v) => !v)} addLabel={open ? "Close" : "Add Proverb"} />
      {open && <ProverbForm onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-proverbs"] }); }} />}
      <div className="mt-3 space-y-2">
        {data && data.length > 0 ? data.map((p) => (
          <Card key={p.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium italic">"{p.text}"</p>
              <button onClick={() => confirm("Delete?") && remove.mutate(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            {p.translation && <p className="mt-1 text-xs text-muted-foreground">{p.translation}</p>}
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{(p.lgas as { name?: string } | null)?.name ?? "—"}</p>
          </Card>
        )) : <EmptyState>No proverbs yet.</EmptyState>}
      </div>
    </div>
  );
}

function ProverbForm({ onDone }: { onDone: () => void }) {
  const { data: lgas } = useQuery({ queryKey: ["lgas-min"], queryFn: async () => (await supabase.from("lgas").select("id, name").order("name")).data ?? [] });
  const [form, setForm] = useState({ text: "", translation: "", meaning: "", lga_id: "", audio_url: "" });
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lga_id) return toast.error("Select an LGA");
    setSaving(true);
    const { error } = await supabase.from("proverbs").insert({
      text: form.text.trim(), translation: form.translation || null, meaning: form.meaning || null,
      lga_id: form.lga_id, audio_url: form.audio_url || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Proverb added"); onDone();
  };
  return (
    <Card className="p-4"><form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><Label>LGA</Label>
        <select required value={form.lga_id} onChange={(e) => setForm({ ...form, lga_id: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
          <option value="">— Select LGA —</option>
          {lgas?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <div className="space-y-1.5"><Label>Proverb</Label><Textarea required rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Translation</Label><Input value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Meaning</Label><Textarea rows={2} value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Audio URL</Label><Input value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} /></div>
      <Button type="submit" disabled={saving} className="w-full rounded-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Proverb</Button>
    </form></Card>
  );
}

/* ----------------------------------- Shop ---------------------------------- */
function ShopTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["admin-shop-items"],
    queryFn: async () => (await supabase.from("shop_items").select("*, lgas(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const togglePublish = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("shop_items").update({ is_published: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-shop-items"] }); qc.invalidateQueries({ queryKey: ["shop-items"] }); },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("shop_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Item removed"); qc.invalidateQueries({ queryKey: ["admin-shop-items"] }); qc.invalidateQueries({ queryKey: ["shop-items"] }); },
  });

  return (
    <div>
      <SectionHeader title="Shop items" count={data?.length} onAdd={() => setOpen((v) => !v)} addLabel={open ? "Close" : "Add Item"} />
      {open && <ShopItemForm onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-shop-items"] }); }} />}
      <div className="mt-3 flex items-center justify-end">
        <Link to="/admin/shop" className="text-xs text-primary underline">Open full Shop manager →</Link>
      </div>
      <div className="mt-2 space-y-2">
        {data && data.length > 0 ? data.map((it) => (
          <Card key={it.id} className="flex gap-3 p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {it.images?.[0] ? <img src={it.images[0]} alt={it.title} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{it.title}</p>
              <p className="text-xs text-muted-foreground">{it.category} · ₦{Number(it.price).toLocaleString()}</p>
              <div className="mt-1.5 flex gap-2">
                <button onClick={() => togglePublish.mutate({ id: it.id, value: !it.is_published })} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px]">
                  {it.is_published ? <><Eye className="h-3 w-3" /> Live</> : <><EyeOff className="h-3 w-3" /> Draft</>}
                </button>
                <button onClick={() => confirm("Delete?") && remove.mutate(it.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </Card>
        )) : <EmptyState>No items yet.</EmptyState>}
      </div>
    </div>
  );
}

function ShopItemForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const { data: lgas } = useQuery({ queryKey: ["lgas-min"], queryFn: async () => (await supabase.from("lgas").select("id, name").order("name")).data ?? [] });
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: SHOP_CATEGORIES[0], tribe: "",
    lga_id: "", price: "", stock: "0", whatsapp: "", is_published: true,
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const imageUrls: string[] = [];
      for (const f of files) {
        const path = `shop/${user!.id}/${Date.now()}-${f.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, f, { cacheControl: "3600" });
        if (upErr) throw upErr;
        imageUrls.push(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
      }
      const description = [form.description, form.whatsapp ? `\n\nWhatsApp: ${form.whatsapp}` : ""].join("").trim() || null;
      const { error } = await supabase.from("shop_items").insert({
        title: form.title.trim(), description,
        category: form.category, tribe: form.tribe || null,
        lga_id: form.lga_id || null, price: Number(form.price || 0), stock: Number(form.stock || 0),
        images: imageUrls, is_published: form.is_published, created_by: user!.id,
      });
      if (error) throw error;
      toast.success("Item added"); onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  };
  return (
    <Card className="p-4"><form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><Label>Item name *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5"><Label>Price (₦) *</Label><Input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Stock</Label><Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
      </div>
      <div className="space-y-1.5"><Label>Tribe / Origin (e.g. Berom)</Label><Input value={form.tribe} onChange={(e) => setForm({ ...form, tribe: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5"><Label>Category</Label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
            {SHOP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5"><Label>LGA</Label>
          <select value={form.lga_id} onChange={(e) => setForm({ ...form, lga_id: e.target.value })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
            <option value="">— None —</option>
            {lgas?.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5"><Label>WhatsApp number (e.g. 234801234567)</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Product images</Label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground hover:bg-muted/50">
          <Upload className="h-4 w-4" />
          {files.length === 0 ? "Browse" : `${files.length} selected`}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </label>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving} className="flex-1 rounded-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button>
        <Button type="button" variant="outline" onClick={onDone} className="flex-1 rounded-full">Cancel</Button>
      </div>
    </form></Card>
  );
}

/* ---------------------------------- Media ---------------------------------- */
function MediaTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-media-list"],
    queryFn: async () => (await supabase.from("media").select("*, lgas(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("media").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin-media-list"] }); qc.invalidateQueries({ queryKey: ["library-media"] }); },
  });
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} media files</p>
        <Link to="/admin/media" className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground">
          <Plus className="h-3.5 w-3.5" /> Add Media
        </Link>
      </div>
      <div className="space-y-2">
        {data && data.length > 0 ? data.map((m) => (
          <Card key={m.id} className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {m.kind === "video" ? <Youtube className="h-4 w-4" /> : m.kind === "audio" ? <Music className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.title}</p>
              <p className="truncate text-xs text-muted-foreground">{m.kind}{(m.lgas as { name?: string } | null)?.name ? ` · ${(m.lgas as { name: string }).name}` : ""}</p>
            </div>
            <button onClick={() => confirm("Delete?") && remove.mutate(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </Card>
        )) : <EmptyState>No media yet.</EmptyState>}
      </div>
    </div>
  );
}

/* ----------------------------------- Users --------------------------------- */
function UsersTab({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: rows } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      let query = supabase.from("profiles").select("id, display_name").order("created_at", { ascending: false }).limit(50);
      if (q.trim()) query = query.ilike("display_name", `%${q.trim()}%`);
      const { data: profiles, error } = await query;
      if (error) throw error;
      const ids = (profiles ?? []).map((p) => p.id);
      const { data: roleRows } = await supabase.from("user_roles").select("user_id, role").in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const byUser = new Map<string, string[]>();
      (roleRows ?? []).forEach((r) => { const arr = byUser.get(r.user_id) ?? []; arr.push(r.role); byUser.set(r.user_id, arr); });
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
    onSuccess: (_, vars) => { toast.success(`${vars.grant ? "Granted" : "Revoked"} ${vars.role}`); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by display name…" />
      <div className="mt-3 space-y-2">
        {rows && rows.length > 0 ? rows.map((p) => {
          const isAdminUser = p.roles.includes("admin");
          const isContrib = p.roles.includes("contributor");
          const isSelf = p.id === currentUserId;
          return (
            <Card key={p.id} className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">{(p.display_name ?? "?").slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.display_name ?? "Unnamed"} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}</p>
                <p className="text-[11px] text-muted-foreground">{isAdminUser ? "admin · " : ""}{isContrib ? "contributor" : "user"}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant={isContrib ? "secondary" : "outline"} onClick={() => setRole.mutate({ userId: p.id, role: "contributor", grant: !isContrib })} className="h-7 px-2 text-[11px]">{isContrib ? "Contrib ✓" : "Make contrib"}</Button>
                <Button size="sm" variant={isAdminUser ? "default" : "outline"} disabled={isSelf && isAdminUser} onClick={() => setRole.mutate({ userId: p.id, role: "admin", grant: !isAdminUser })} className="h-7 px-2 text-[11px]">
                  {isAdminUser ? <><ShieldOff className="mr-1 h-3 w-3" />Revoke</> : <><ShieldCheck className="mr-1 h-3 w-3" />Make admin</>}
                </Button>
              </div>
            </Card>
          );
        }) : <EmptyState>No users found.</EmptyState>}
      </div>
    </div>
  );
}
