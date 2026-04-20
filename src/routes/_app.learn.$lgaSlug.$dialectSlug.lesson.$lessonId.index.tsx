import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, BrainCircuit } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/learn/$lgaSlug/$dialectSlug/lesson/$lessonId/")({
  component: LessonPlayer,
});

function LessonPlayer() {
  const { lgaSlug, dialectSlug, lessonId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();

  const { data: lesson } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
      return data;
    },
  });
  const { data: items } = useQuery({
    queryKey: ["lesson-items", lessonId],
    queryFn: async () => {
      const { data } = await supabase.from("lesson_items").select("*").eq("lesson_id", lessonId).order("position");
      return data ?? [];
    },
  });
  const { data: quiz } = useQuery({
    queryKey: ["lesson-quiz", lessonId],
    queryFn: async () => {
      const { data } = await supabase.from("quizzes").select("*").eq("lesson_id", lessonId).maybeSingle();
      return data;
    },
  });
  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", user?.id, lessonId],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("lesson_progress").select("*").eq("user_id", user!.id).eq("lesson_id", lessonId).maybeSingle();
      return data;
    },
  });

  // Auto-touch progress on view
  useEffect(() => {
    if (!user) return;
    supabase.from("lesson_progress").upsert(
      { user_id: user.id, lesson_id: lessonId, last_viewed_at: new Date().toISOString(), completed: progress?.completed ?? false },
      { onConflict: "user_id,lesson_id" },
    ).then(() => {});
  }, [user, lessonId, progress?.completed]);

  const complete = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("lesson_progress").upsert(
        { user_id: user.id, lesson_id: lessonId, completed: true, last_viewed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lesson completed");
      qc.invalidateQueries({ queryKey: ["lesson-progress"] });
      qc.invalidateQueries({ queryKey: ["continue"] });
    },
  });

  if (!lesson) return <div className="p-5">Loading…</div>;

  return (
    <div className="p-5">
      <Link to="/learn/$lgaSlug/$dialectSlug" params={{ lgaSlug, dialectSlug }} className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="font-serif text-2xl font-bold">{lesson.title}</h1>
      {lesson.description && <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>}

      <div className="mt-6 space-y-4">
        {items && items.length > 0 ? items.map((it) => (
          <Card key={it.id} className="p-4">
            {it.kind === "text" && <p className="leading-relaxed">{it.body}</p>}
            {it.kind === "audio" && it.media_url && (
              <>
                {it.body && <p className="mb-2">{it.body}</p>}
                <audio controls src={it.media_url} className="w-full" />
              </>
            )}
            {it.kind === "video" && it.media_url && (
              <>
                {it.body && <p className="mb-2">{it.body}</p>}
                <video controls src={it.media_url} className="w-full rounded" />
              </>
            )}
            {it.kind === "image" && it.media_url && (
              <img src={it.media_url} alt={it.body ?? ""} className="w-full rounded" />
            )}
          </Card>
        )) : (
          <Card className="border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No lesson content yet.
          </Card>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <Button
          size="lg"
          className="w-full rounded-full"
          variant={progress?.completed ? "secondary" : "default"}
          onClick={() => complete.mutate()}
          disabled={complete.isPending}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {progress?.completed ? "Completed" : "Mark as complete"}
        </Button>

        {quiz && (
          <Button
            size="lg"
            variant="outline"
            className="w-full rounded-full"
            onClick={() => nav({ to: "/learn/$lgaSlug/$dialectSlug/lesson/$lessonId/quiz", params: { lgaSlug, dialectSlug, lessonId } })}
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            Take the quiz
          </Button>
        )}
      </div>
    </div>
  );
}
