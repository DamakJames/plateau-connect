import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/learn/$lgaSlug/$dialectSlug/lesson/$lessonId/quiz")({
  component: QuizRunner,
});

interface QuizQuestion {
  id: string;
  prompt: string;
  position: number;
  quiz_options: { id: string; label: string; is_correct: boolean }[];
}

function QuizRunner() {
  const { lgaSlug, dialectSlug, lessonId } = Route.useParams();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{ score: number; total: number } | null>(null);

  const { data: quiz } = useQuery({
    queryKey: ["quiz-full", lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("id, title, quiz_questions(id, prompt, position, quiz_options(id, label, is_correct))")
        .eq("lesson_id", lessonId)
        .maybeSingle();
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (vars: { score: number; total: number; quizId: string }) => {
      if (!user) return;
      await supabase.from("quiz_attempts").insert({ user_id: user.id, quiz_id: vars.quizId, score: vars.score, total: vars.total });
    },
  });

  const submit = () => {
    if (!quiz) return;
    const qs = (quiz.quiz_questions ?? []) as unknown as QuizQuestion[];
    let score = 0;
    qs.forEach((q) => {
      const chosen = answers[q.id];
      const correct = q.quiz_options.find((o) => o.is_correct);
      if (chosen && correct && chosen === correct.id) score++;
    });
    setSubmitted({ score, total: qs.length });
    save.mutate({ score, total: qs.length, quizId: quiz.id });
  };

  if (!quiz) return <div className="p-5">No quiz available.</div>;
  const qs = (quiz.quiz_questions ?? []) as unknown as QuizQuestion[];
  qs.sort((a, b) => a.position - b.position);

  if (submitted) {
    const pct = Math.round((submitted.score / Math.max(submitted.total, 1)) * 100);
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
        <Trophy className="mb-4 h-16 w-16 text-primary" />
        <h1 className="font-serif text-3xl font-bold">Well done!</h1>
        <p className="mt-2 text-muted-foreground">You scored</p>
        <p className="font-serif text-6xl font-black text-primary">{submitted.score}/{submitted.total}</p>
        <p className="mt-1 text-sm text-muted-foreground">{pct}%</p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Button onClick={() => { setAnswers({}); setSubmitted(null); }} variant="outline" className="rounded-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/learn/$lgaSlug/$dialectSlug" params={{ lgaSlug, dialectSlug }}>Back to dialect</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <Link to="/learn/$lgaSlug/$dialectSlug/lesson/$lessonId" params={{ lgaSlug, dialectSlug, lessonId }} className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="font-serif text-2xl font-bold">{quiz.title}</h1>

      <div className="mt-6 space-y-5">
        {qs.map((q, qi) => (
          <Card key={q.id} className="p-4">
            <p className="mb-3 font-medium"><span className="text-muted-foreground">Q{qi + 1}.</span> {q.prompt}</p>
            <div className="space-y-2">
              {q.quiz_options.map((o) => {
                const selected = answers[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left text-sm transition",
                      selected ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Button size="lg" className="mt-6 w-full rounded-full" onClick={submit} disabled={Object.keys(answers).length < qs.length}>
        Submit answers
      </Button>
    </div>
  );
}
