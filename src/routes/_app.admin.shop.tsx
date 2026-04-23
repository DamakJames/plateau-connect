import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Upload, Trash2, Eye, EyeOff, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/shop")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AdminShopPage,
});

const CATEGORIES = ["Attire", "Beads", "Accessories", "Fabric", "Jewelry", "Instruments", "Other"];

const itemSchema = z.object({
  title: z.string().trim().min(2, "Title too short").max(120),
  description: z.string().trim().max(2000).optional(),
  category: z.string().min(1, "Pick a category"),
  tribe: z.string().trim().max(80).optional(),
  lga_id: z.string().uuid().optional().or(z.literal("")),
  price: z.number().min(0).max(100_000_000),
  stock: z.number().int().min(0).max(100_000),
});

function AdminShopPage() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-shop-items"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_items")
        .select("*, lgas(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("shop_items").update({ is_published: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-shop-items"] });
      qc.invalidateQueries({ queryKey: ["shop-items"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item deleted");
      qc.invalidateQueries({ queryKey: ["admin-shop-items"] });
      qc.invalidateQueries({ queryKey: ["shop-items"] });
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
    <div className="p-5 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/admin" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="rounded-full">
          {showForm ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showForm ? "Close" : "New item"}
        </Button>
      </div>

      <h1 className="font-serif text-2xl font-bold">Shop manager</h1>
      <p className="text-sm text-muted-foreground">Upload products, set prices, publish or hide.</p>

      {showForm && (
        <div className="mt-5">
          <ItemForm
            onDone={() => {
              setShowForm(false);
              qc.invalidateQueries({ queryKey: ["admin-shop-items"] });
              qc.invalidateQueries({ queryKey: ["shop-items"] });
            }}
          />
        </div>
      )}

      <h2 className="mt-8 font-serif text-lg font-semibold">All items</h2>
      <div className="mt-3 space-y-3">
        {isLoading ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">Loading…</Card>
        ) : items && items.length > 0 ? (
          items.map((it) => (
            <Card key={it.id} className="overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {it.images?.[0] ? (
                    <img src={it.images[0]} alt={it.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium">{it.title}</p>
                    <p className="font-serif text-sm font-semibold text-primary">
                      ₦{Number(it.price).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {it.category}
                    {(it.lgas as any)?.name ? ` · ${(it.lgas as any).name}` : ""}
                    {it.tribe ? ` · ${it.tribe}` : ""}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => togglePublish.mutate({ id: it.id, value: !it.is_published })}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/70"
                    >
                      {it.is_published ? (
                        <>
                          <Eye className="h-3 w-3 text-[var(--plateau-green)]" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-muted-foreground" /> Draft
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this item?")) remove.mutate(it.id);
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No items yet. Add your first product.
          </Card>
        )}
      </div>
    </div>
  );
}

function ItemForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    tribe: "",
    lga_id: "",
    price: "" as string,
    stock: "0",
    is_published: true,
  });

  const { data: lgas } = useQuery({
    queryKey: ["lgas-min"],
    queryFn: async () => {
      const { data } = await supabase.from("lgas").select("id, name").order("name");
      return data ?? [];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = itemSchema.safeParse({
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setUploading(true);
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const path = `shop/${user!.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        imageUrls.push(pub.publicUrl);
      }
      const { error } = await supabase.from("shop_items").insert({
        title: parsed.data.title,
        description: parsed.data.description || null,
        category: parsed.data.category,
        tribe: parsed.data.tribe || null,
        lga_id: parsed.data.lga_id || null,
        price: parsed.data.price,
        stock: parsed.data.stock,
        images: imageUrls,
        is_published: form.is_published,
        created_by: user!.id,
      });
      if (error) throw error;
      toast.success("Item created");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tribe">Tribe</Label>
            <Input id="tribe" value={form.tribe} onChange={(e) => setForm({ ...form, tribe: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>LGA</Label>
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
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Images</Label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground hover:bg-muted/50">
            <Upload className="h-4 w-4" />
            {files.length === 0 ? "Tap to add images" : `${files.length} image${files.length > 1 ? "s" : ""} selected`}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          {files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {files.map((f, idx) => (
                <div key={idx} className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
          <div>
            <p className="text-sm font-medium">Publish immediately</p>
            <p className="text-xs text-muted-foreground">Visible to all shoppers</p>
          </div>
          <Switch
            checked={form.is_published}
            onCheckedChange={(v) => setForm({ ...form, is_published: v })}
          />
        </div>

        <Button type="submit" size="lg" disabled={uploading} className="w-full rounded-full">
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {uploading ? "Saving…" : "Save item"}
        </Button>
      </form>
    </Card>
  );
}
