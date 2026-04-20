import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/contribute")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: ContributePage,
});

const schema = z.object({
  kind: z.enum(["story", "proverb", "phrase", "lesson", "media"]),
  lga_id: z.string().uuid().optional().nullable(),
  dialect_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(2).max(150),
  body: z.string().trim().max(5000).optional(),
});

function ContributePage() {
  const { user, isContributor } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ kind: "story" as const, lga_id: "", dialect_id: "", title: "", body: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: lgas } = useQuery({
    queryKey: ["lgas-for-form"],
    queryFn: async () => (await supabase.from("lgas").select("id, name").order("name")).data ?? [],
  });
  const { data: dialects } = useQuery({
    queryKey: ["dialects-for-form", form.lga_id],
    enabled: !!form.lga_id,
    queryFn: async () => (await supabase.from("dialects").select("id, name").eq("lga_id", form.lga_id)).data ?? [],
  });

  if (!isContributor) {
    return (
      <div className="p-5">
        <Card className="p-6 text-center text-sm text-muted-foreground">
          You need contributor access. Visit your profile to request it.
        </Card>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      kind: form.kind,
      lga_id: form.lga_id || null,
      dialect_id: form.dialect_id || null,
      title: form.title,
      body: form.body || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setUploading(true);
    try {
      let media_url: string | null = null;
      if (file && user) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("submissions").upload(path, file);
        if (upErr) throw upErr;
        media_url = path;
      }
      const { error } = await supabase.from("submissions").insert({
        user_id: user!.id,
        kind: parsed.data.kind,
        lga_id: parsed.data.lga_id,
        dialect_id: parsed.data.dialect_id,
        title: parsed.data.title,
        body: parsed.data.body ?? null,
        media_url,
      });
      if (error) throw error;
      toast.success("Submission sent for review");
      nav({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-5">
      <Link to="/profile" className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="font-serif text-2xl font-bold">Submit content</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your submission will be reviewed by an admin.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as typeof form.kind })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="proverb">Proverb</SelectItem>
              <SelectItem value="phrase">Phrase</SelectItem>
              <SelectItem value="lesson">Lesson</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>LGA</Label>
          <Select value={form.lga_id} onValueChange={(v) => setForm({ ...form, lga_id: v, dialect_id: "" })}>
            <SelectTrigger><SelectValue placeholder="Select LGA" /></SelectTrigger>
            <SelectContent>
              {lgas?.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {dialects && dialects.length > 0 && (
          <div className="space-y-2">
            <Label>Dialect (optional)</Label>
            <Select value={form.dialect_id} onValueChange={(v) => setForm({ ...form, dialect_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select dialect" /></SelectTrigger>
              <SelectContent>
                {dialects.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Text body (optional)</Label>
          <Textarea id="body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} maxLength={5000} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Attach audio, video or image (optional)</Label>
          <Input id="file" type="file" accept="audio/*,video/*,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={uploading}>
          {uploading ? "Submitting…" : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
