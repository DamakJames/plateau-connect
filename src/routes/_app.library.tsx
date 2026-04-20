import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BookmarkX } from "lucide-react";

export const Route = createFileRoute("/_app/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("bookmarks");

  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("bookmarks").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: completed } = useQuery({
    queryKey: ["completed-lessons", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, lessons(title, dialects(name))")
        .eq("user_id", user!.id)
        .eq("completed", true);
      return data ?? [];
    },
  });

  return (
    <div className="p-5">
      <header className="mb-5 pt-2">
        <h1 className="font-serif text-2xl font-bold">Your library</h1>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="bookmarks" className="mt-4 space-y-2">
          {bookmarks && bookmarks.length > 0 ? bookmarks.map((b) => (
            <Card key={b.id} className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{b.content_type}</p>
              <p className="font-mono text-xs text-muted-foreground">{b.content_id.slice(0, 8)}…</p>
            </Card>
          )) : (
            <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              <BookmarkX className="mx-auto mb-2 h-6 w-6 opacity-60" />
              No bookmarks yet.
            </Card>
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4 space-y-2">
          {completed && completed.length > 0 ? completed.map((c) => (
            <Card key={c.lesson_id} className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {(c.lessons as any)?.dialects?.name}
              </p>
              <p className="font-medium">{(c.lessons as any)?.title}</p>
            </Card>
          )) : (
            <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              You haven't completed any lessons yet.
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
