import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Shield, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAdmin, isContributor, signOut, refreshRoles } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [lessons, attempts] = await Promise.all([
        supabase.from("lesson_progress").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("completed", true),
        supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return { lessonsCompleted: lessons.count ?? 0, quizAttempts: attempts.count ?? 0 };
    },
  });

  const requestContrib = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      // Self-grant contributor for MVP simplicity (admin-controlled in production via separate flow)
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "contributor" });
      if (error && !error.message.includes("duplicate")) throw error;
    },
    onSuccess: async () => {
      await refreshRoles();
      qc.invalidateQueries();
      toast.success("You're now a contributor — submit content from your profile.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const initials = (profile?.display_name ?? user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="p-5">
      <header className="mb-6 pt-2 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
          <AvatarFallback className="bg-primary text-primary-foreground font-serif text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-serif text-xl font-bold">{profile?.display_name || "Friend"}</h1>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <div className="mt-1 flex gap-1">
            {isAdmin && <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">Admin</span>}
            {isContributor && !isAdmin && <span className="rounded bg-secondary/40 px-2 py-0.5 text-[10px] font-medium">Contributor</span>}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="font-serif text-3xl font-bold text-primary">{stats?.lessonsCompleted ?? 0}</p>
          <p className="text-xs text-muted-foreground">Lessons completed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-serif text-3xl font-bold text-primary">{stats?.quizAttempts ?? 0}</p>
          <p className="text-xs text-muted-foreground">Quizzes taken</p>
        </Card>
      </div>

      <div className="mt-6 space-y-2">
        {!isContributor && (
          <Card className="p-4">
            <button onClick={() => requestContrib.mutate()} className="flex w-full items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/40 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Become a contributor</p>
                <p className="text-xs text-muted-foreground">Submit stories, proverbs, and media</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </Card>
        )}

        {isContributor && (
          <Link to="/contribute">
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/40 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Submit content</p>
                <p className="text-xs text-muted-foreground">Add to the archive</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin">
            <Card className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Admin dashboard</p>
                <p className="text-xs text-muted-foreground">Moderate and manage content</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        )}
      </div>

      <Button
        variant="outline"
        size="lg"
        className="mt-8 w-full rounded-full"
        onClick={async () => {
          await signOut();
          nav({ to: "/login" });
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
