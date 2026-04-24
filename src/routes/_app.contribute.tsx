import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
import { ArrowLeft, BookText, Quote, MessageSquare, Lightbulb, AlertCircle, Music } from "lucide-react";

export const Route = createFileRoute("/_app/contribute")({
  component: ContributePage,
});

const KINDS = [
  { value: "phrase", label: "Word / Phrase", icon: MessageSquare, hint: "Add a word or expression in your dialect." },
  { value: "story", label: "Story", icon: BookText, hint: "Folklore, oral history, personal accounts." },
  { value: "proverb", label: "Proverb", icon: Quote, hint: "Wisdom passed down through generations." },
  { value: "media", label: "Audio / Video", icon: Music, hint: "Songs, recitations, recordings." },
  { value: "lesson", label: "Correction", icon: AlertCircle, hint: "Fix a translation or improve content." },
] as const;

const schema = z.object({
  kind: z.enum(["story", "proverb", "phrase", "lesson", "media"]),
  lga_id: z.string().uuid().optional().nullable(),
  dialect_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(2, "Add a short title").max(150),
  body: z.string().trim().max(5000).optional(),
  is_suggestion: z.boolean().optional(),
});

function ContributePage() {
  const { user, session } = useAuth();
  const nav = useNavigate();
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("phrase");
  const [form, setForm] = useState({ lga_id: "", dialect_id: "", title: "", body: "", suggestion: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: lgas } = useQuery({
    queryKey: ["lgas-for-form"],
    queryFn: async () => (await supabase.from("lgas").select("id, name").order("name")).data ?? [],
  });
  const { data: dialects } = useQuery({
    queryKey: ["dialects-for-form", form.lga_id],
    enabled: !!form.lga_id,
    queryFn: async () =>
      (await supabase.from("dialects").select("id, name").eq("lga_id", form.lga_id)).data ?? [],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please sign in to submit");
      nav({ to: "/login" });
      return;
    }
    const finalBody = [form.body, form.suggestion ? `\n\nSuggestion / note:\n${form.suggestion}` : ""]
      .join("")
      .trim();

    const parsed = schema.safeParse({
      kind,
      lga_id: form.lga_id || null,
      dialect_id: form.dialect_id || null,
      title: form.title,
      body: finalBody || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setUploading(true);
    try {
      let media_url: string | null = null;
      if (file && user) {
        const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
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
      toast.success("Thank you! Your contribution is in review.");
      setForm({ lga_id: "", dialect_id: "", title: "", body: "", suggestion: "" });
      setFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setUploading(false);
    }
  };

  const active = KINDS.find((k) => k.value === kind)!;

  return (
    <div className="pb-10">
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--plateau-green)] via-primary to-[var(--ochre)] px-5 pb-8 pt-6 text-primary-foreground">
        <Link to="/home" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
          <Lightbulb className="h-3.5 w-3.5" /> Community contribution
        </div>
        <h1 className="mt-2 font-serif text-2xl font-bold">Share your heritage</h1>
        <p className="mt-1 text-sm opacity-90">
          Submit words, stories, proverbs, recordings, corrections or suggestions.
        </p>
      </div>

      <div className="px-5 pt-6">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">What are you contributing?</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {KINDS.map((k) => {
            const Icon = k.icon;
            const isActive = kind === k.value;
            return (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind(k.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {k.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{active.hint}</p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4 px-5">
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
          <Label htmlFor="title">Title / Word</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">{kind === "phrase" ? "Translation & meaning" : "Content"}</Label>
          <Textarea id="body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5} maxLength={5000} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suggestion">Suggestion or note (optional)</Label>
          <Textarea
            id="suggestion"
            placeholder="Anything else the editors should know?"
            value={form.suggestion}
            onChange={(e) => setForm({ ...form, suggestion: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Attach audio, video or image (optional)</Label>
          <Input id="file" type="file" accept="audio/*,video/*,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <Card className="border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
          {session
            ? "Your submission will be reviewed by an editor before publishing."
            : "You'll be asked to sign in to send your contribution."}
        </Card>

        <Button type="submit" size="lg" className="w-full rounded-full bg-gradient-to-r from-[var(--clay)] via-primary to-[var(--ochre)] text-primary-foreground" disabled={uploading}>
          {uploading ? "Sending…" : "Submit contribution"}
        </Button>
      </form>
    </div>
  );
}
