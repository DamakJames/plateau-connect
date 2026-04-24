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
import { ArrowLeft, Upload, Trash2, Youtube, Music, ImageIcon, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/media")({
  beforeLoad: requireAdmin,
  component: AdminMediaPage,
});

const KINDS = ["audio", "video", "image"] as const;
type Kind = (typeof KINDS)[number];

const schema = z.object({
  kind: z.enum(KINDS),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  lga_id: z.string().uuid().optional().or(z.literal("")),
  url: z.string().trim().min(4),
  thumbnail_url: z.string().trim().optional(),
});

function AdminMediaPage() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-media"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("*, lgas(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Media removed");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      qc.invalidateQueries({ queryKey: ["library-media"] });
    },
  });

  if (!user) return null;
  if (!isAdmin)
    return (
      <div className="p-5">
        <Card className="p-6 text-center text-sm text-muted-foreground">Admin access required.</Card>
      </div>
    );

  return (
    <div className="p-5 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="rounded-full">
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? "Close" : "New media"}
        </Button>
      </div>

      <h1 className="font-serif text-2xl font-bold">Media manager</h1>
      <p className="text-sm text-muted-foreground">
        Upload audio & images directly. For video, paste a YouTube URL.
      </p>

      {showForm && (
        <div className="mt-5">
          <MediaForm onDone={() => setShowForm(false)} />
        </div>
      )}

      <h2 className="mt-8 font-serif text-lg font-semibold">All media</h2>
      <div className="mt-3 space-y-3">
        {isLoading ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">Loading…</Card>
        ) : items && items.length > 0 ? (
          items.map((m) => (
            <Card key={m.id} className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {m.kind === "video" ? <Youtube className="h-5 w-5" /> : m.kind === "audio" ? <Music className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.kind}
                  {(m.lgas as { name: string } | null)?.name ? ` · ${(m.lgas as { name: string }).name}` : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this media?")) remove.mutate(m.id);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))
        ) : (
          <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No media yet.
          </Card>
        )}
      </div>
    </div>
  );
}

function MediaForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>("video");
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    lga_id: "",
    url: "",
  });

  const { data: lgas } = useQuery({
    queryKey: ["lgas-min"],
    queryFn: async () => (await supabase.from("lgas").select("id, name").order("name")).data ?? [],
  });

  const uploadFile = async (f: File, prefix: string) => {
    const path = `${prefix}/${user!.id}/${Date.now()}-${f.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, f, { cacheControl: "3600" });
    if (error) throw error;
    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let url = form.url.trim();
      let thumbnail_url: string | undefined;

      if (kind === "audio" || kind === "image") {
        if (!file) throw new Error(`Please choose a${kind === "audio" ? "n audio" : "n image"} file`);
        url = await uploadFile(file, kind);
      } else if (kind === "video") {
        if (!url) throw new Error("Paste a YouTube URL");
      }

      if (thumb) thumbnail_url = await uploadFile(thumb, "thumbs");

      const parsed = schema.safeParse({ ...form, kind, url, thumbnail_url });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);

      const { error } = await supabase.from("media").insert({
        kind: parsed.data.kind,
        title: parsed.data.title,
        description: parsed.data.description || null,
        lga_id: parsed.data.lga_id || null,
        url: parsed.data.url,
        thumbnail_url: thumbnail_url ?? null,
      });
      if (error) throw error;
      toast.success("Media added");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      qc.invalidateQueries({ queryKey: ["library-media"] });
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKind(k);
                setFile(null);
                setForm((f) => ({ ...f, url: "" }));
              }}
              className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium capitalize transition ${
                kind === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 text-muted-foreground"
              }`}
            >
              {k === "video" ? <Youtube className="h-4 w-4" /> : k === "audio" ? <Music className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
              {k}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>LGA (optional)</Label>
          <select
            value={form.lga_id}
            onChange={(e) => setForm({ ...form, lga_id: e.target.value })}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">— None —</option>
            {lgas?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {kind === "video" ? (
          <div className="space-y-2">
            <Label htmlFor="ytb">YouTube URL</Label>
            <Input
              id="ytb"
              placeholder="https://www.youtube.com/watch?v=…"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label>{kind === "audio" ? "Audio file" : "Image file"}</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              {file ? file.name : `Tap to choose ${kind} file`}
              <input
                type="file"
                accept={kind === "audio" ? "audio/*" : "image/*"}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        )}

        {kind !== "image" && (
          <div className="space-y-2">
            <Label>Thumbnail (optional)</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground hover:bg-muted/50">
              <Upload className="h-3.5 w-3.5" />
              {thumb ? thumb.name : "Add cover image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumb(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        )}

        <Button type="submit" size="lg" disabled={saving} className="w-full rounded-full">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving…" : "Save media"}
        </Button>
      </form>
    </Card>
  );
}
